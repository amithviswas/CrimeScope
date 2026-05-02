"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HeatPoint { lat: number; lng: number; weight: number; }

interface GeoFeature {
  geometry: { coordinates: [number, number] };
  properties: { category?: string };
}

export interface MapFilters {
  city: string;
  categories: string[];
  startDate: string;
  endDate: string;
}

// City centres
const CITY_CENTRES: Record<string, [number, number]> = {
  chicago:     [41.8781, -87.6298],
  new_york:    [40.7128, -74.0060],
  los_angeles: [34.0522, -118.2437],
};

// ── Standalone axios instance (NO auth interceptor that redirects) ─────────────
// We bypass the global `api` client to avoid the 401→redirect loop.
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + "/api/v1";

const mapAxios = axios.create({
  baseURL:     BASE,
  timeout:     70_000,   // 70s — Render cold-start can take ~50s
  withCredentials: true,
  headers:     { "Content-Type": "application/json" },
});

// Inject Bearer token without the redirect-on-401 behaviour
mapAxios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Wake-up helper: pings /health until backend responds ─────────────────────
async function wakeBackend(
  onStatus: (msg: string) => void,
  signal: AbortSignal
): Promise<boolean> {
  const healthUrl = BASE.replace("/api/v1", "") + "/health";
  const start     = Date.now();
  let attempt     = 0;

  while (!signal.aborted && Date.now() - start < 60_000) {
    attempt++;
    onStatus(`Waking backend… attempt ${attempt} (${Math.round((Date.now() - start) / 1000)}s)`);
    try {
      await axios.get(healthUrl, { timeout: 8_000 });
      return true;
    } catch {
      // Backend not ready yet — wait 5s and try again
      await new Promise<void>((res) => setTimeout(res, 5_000));
    }
  }
  return false;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LeafletMap({ city, categories, startDate, endDate }: MapFilters) {
  const mapRef       = useRef<HTMLDivElement>(null);
  const leafletRef   = useRef<unknown>(null);
  const heatLayerRef = useRef<unknown>(null);
  const markersRef   = useRef<unknown>(null);
  const abortRef     = useRef<AbortController | null>(null);

  const [status, setStatus]   = useState<"loading" | "error" | "ok" | "empty">("loading");
  const [msg, setMsg]         = useState("Initialising map…");
  const [count, setCount]     = useState(0);
  const [errorText, setError] = useState("");

  // ── Init Leaflet ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

      if (!document.getElementById("leaflet-css")) {
        Object.assign(document.createElement("link"), {
          id: "leaflet-css", rel: "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
        });
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [41.8781, -87.6298], zoom: 11, zoomControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        subdomains: "abcd", maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      leafletRef.current = map;
      markersRef.current = L.layerGroup().addTo(map);
    };

    init();

    return () => {
      abortRef.current?.abort();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (leafletRef.current) (leafletRef.current as any).remove();
      leafletRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (!leafletRef.current) {
      setTimeout(loadData, 600);
      return;
    }

    setStatus("loading");
    setError("");
    setMsg("Connecting to backend…");

    try {
      // Step 1: try a lightweight ping to wake Render's free instance
      const healthUrl = BASE.replace("/api/v1", "") + "/health";
      let backendReady = false;
      try {
        await axios.get(healthUrl, { timeout: 8_000, signal: ctrl.signal });
        backendReady = true;
      } catch (pingErr) {
        if (axios.isCancel(pingErr)) return;   // aborted — do nothing
        // Backend cold — run wake-up loop
        setMsg("Backend is waking up (Render free tier)…");
        backendReady = await wakeBackend((m) => setMsg(m), ctrl.signal);
      }

      if (ctrl.signal.aborted) return;

      if (!backendReady) {
        setError("Backend did not respond in 60 s. Try clicking Retry.");
        setStatus("error");
        return;
      }

      // Step 2: fetch heatmap
      setMsg("Loading crime data…");
      const params: Record<string, string> = { city, limit: "2000" };
      if (categories.length) params.categories = categories.join(",");
      if (startDate)         params.start_date = startDate;
      if (endDate)           params.end_date   = endDate;

      const resp     = await mapAxios.get("/crimes/heatmap", { params, signal: ctrl.signal });
      const features: GeoFeature[] = resp.data?.features ?? [];
      const points: HeatPoint[]   = features.map((f) => ({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        weight: 0.6,
      }));

      if (ctrl.signal.aborted) return;

      setCount(points.length);

      const L   = (await import("leaflet")).default;
      const map = leafletRef.current as L.Map;

      // Clear old layers
      (markersRef.current as L.LayerGroup)?.clearLayers();
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current as L.Layer);
        heatLayerRef.current = null;
      }

      if (!points.length) {
        setStatus("empty");
        return;
      }

      // Centre map on selected city
      map.setView(CITY_CENTRES[city] ?? [41.8781, -87.6298], 11);

      // Draw heat layer
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { default: heat } = await import("leaflet.heat") as any;
        const layer = heat(
          points.map((p) => [p.lat, p.lng, p.weight]),
          { radius: 20, blur: 25, maxZoom: 14,
            gradient: { 0.0: "#00d4ff", 0.3: "#74b9ff", 0.5: "#ffa502", 0.75: "#ff6b35", 1.0: "#ff4757" } }
        );
        layer.addTo(map);
        heatLayerRef.current = layer;
      } catch {
        // Fallback to circle markers
        const g = markersRef.current as L.LayerGroup;
        points.slice(0, 800).forEach((p) =>
          L.circleMarker([p.lat, p.lng], {
            radius: 4, color: "none", fillColor: "#ff4757", fillOpacity: 0.45,
          }).addTo(g)
        );
      }

      // Fit bounds
      map.fitBounds(
        L.latLngBounds(points.map((p) => L.latLng(p.lat, p.lng))),
        { padding: [30, 30], maxZoom: 13 }
      );

      setStatus("ok");

    } catch (err: unknown) {
      if (axios.isCancel(err)) return;   // aborted — silently ignore
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Please sign in to view crime data.");
        } else if (err.response?.status === 403) {
          setError("Upgrade to Pro to view heatmap data.");
        } else {
          setError(`Network error: ${err.message}. Try Retry.`);
        }
      } else {
        setError("Unexpected error loading crime data.");
      }
      setStatus("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, categories, startDate, endDate]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Map canvas */}
      <div ref={mapRef} style={{ position: "absolute", inset: 0, background: "#1a1a2e" }} />

      {/* Loading overlay */}
      {status === "loading" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(10,14,26,0.7)",
          backdropFilter: "blur(4px)", zIndex: 1000,
        }}>
          <div style={{ textAlign: "center", maxWidth: 300 }}>
            <div style={{
              width: 44, height: 44, border: "3px solid rgba(0,212,255,0.15)",
              borderTop: "3px solid #00d4ff", borderRadius: "50%",
              animation: "leafspin 0.9s linear infinite", margin: "0 auto 16px",
            }} />
            <style>{`@keyframes leafspin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#00d4ff", fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>
              Loading Crime Map
            </p>
            <p style={{ color: "#8892b0", fontSize: "0.8125rem", lineHeight: 1.5 }}>{msg}</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {status === "error" && (
        <div style={{
          position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "rgba(20,5,5,0.97)", border: "1px solid #ff4757",
          borderRadius: 10, padding: "12px 20px", color: "#ff6b81",
          fontSize: "0.875rem", zIndex: 1000, textAlign: "center",
          backdropFilter: "blur(8px)", maxWidth: 380,
        }}>
          <span style={{ marginRight: 8 }}>⚠</span>{errorText}
          <button onClick={loadData} style={{
            marginLeft: 12, padding: "4px 12px", borderRadius: 6,
            border: "1px solid #ff4757", background: "rgba(255,71,87,0.15)",
            color: "#ff6b81", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
          }}>Retry</button>
        </div>
      )}

      {/* Live count badge */}
      {status === "ok" && count > 0 && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,14,26,0.92)", border: "1px solid rgba(0,212,255,0.25)",
          borderRadius: 12, padding: "8px 18px", backdropFilter: "blur(8px)", zIndex: 999,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#2ed573",
            display: "inline-block", boxShadow: "0 0 6px #2ed573",
          }} />
          <span style={{ color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
            {count.toLocaleString()} incidents
            &nbsp;•&nbsp;
            {city.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            &nbsp;• Live
          </span>
        </div>
      )}

      {/* No data */}
      {status === "empty" && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(10,14,26,0.92)", border: "1px solid var(--color-border)",
          borderRadius: 12, padding: "24px 32px", zIndex: 999, textAlign: "center",
        }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", marginBottom: 6 }}>
            No incidents found for selected filters.
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
            Try a wider date range or select a different city.
          </p>
        </div>
      )}

      {/* Risk legend */}
      <div style={{
        position: "absolute", bottom: 70, right: 60,
        background: "rgba(10,14,26,0.92)", border: "1px solid var(--color-border)",
        borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)", zIndex: 999,
      }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Risk Level
        </p>
        {[["#00d4ff","Low"],["#ffa502","Medium"],["#ff6b35","High"],["#ff4757","Severe"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: c, display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
