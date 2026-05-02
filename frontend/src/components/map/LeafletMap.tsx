"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";
import axios from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

interface HeatPoint { lat: number; lng: number; weight: number; }

// GeoJSON Feature from /crimes/heatmap
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

// City centres for map centering
const CITY_CENTRES: Record<string, [number, number]> = {
  chicago:     [41.8781, -87.6298],
  new_york:    [40.7128, -74.0060],
  los_angeles: [34.0522, -118.2437],
  houston:     [29.7604, -95.3698],
  phoenix:     [33.4484, -112.0740],
};

export default function LeafletMap({ city, categories, startDate, endDate }: MapFilters) {
  const mapRef         = useRef<HTMLDivElement>(null);
  const leafletRef     = useRef<unknown>(null);
  const heatLayerRef   = useRef<unknown>(null);
  const markersRef     = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [count, setCount]     = useState(0);
  const [debugMsg, setDebugMsg] = useState("");

  // ── Initialise map once ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const init = async () => {
      const L = (await import("leaflet")).default;

      // Load CSS via <link> — avoids TypeScript module error
      if (!document.getElementById("leaflet-css")) {
        const link = Object.assign(document.createElement("link"), {
          id:   "leaflet-css",
          rel:  "stylesheet",
          href: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css",
        });
        document.head.appendChild(link);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { center: [41.8781, -87.6298], zoom: 11, zoomControl: false });

      // CartoDB Dark Matter — completely free, no token
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        subdomains:  "abcd",
        maxZoom:     19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      leafletRef.current  = map;
      markersRef.current  = L.layerGroup().addTo(map);
    };

    init();

    return () => {
      if (leafletRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leafletRef.current as any).remove();
        leafletRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load data whenever filters change ────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!leafletRef.current) {
      // Map not yet ready — wait and retry
      const t = setTimeout(loadData, 600);
      return () => clearTimeout(t);
    }

    setLoading(true);
    setError("");
    setDebugMsg("");

    try {
      const params: Record<string, string> = { city, limit: "2000" };
      if (categories.length)  params.categories  = categories.join(",");
      if (startDate)          params.start_date  = startDate;
      if (endDate)            params.end_date    = endDate;

      setDebugMsg(`Fetching: city=${city} start=${startDate || "none"} end=${endDate || "none"}`);

      const resp    = await api.get("/crimes/heatmap", { params });
      const features: GeoFeature[] = resp.data?.features || [];
      const points: HeatPoint[]   = features.map((f) => ({
        lat:    f.geometry.coordinates[1],
        lng:    f.geometry.coordinates[0],
        weight: 0.6,
      }));

      setCount(points.length);
      setDebugMsg("");

      const L   = (await import("leaflet")).default;
      const map = leafletRef.current as L.Map;

      // Clear old layers
      if (markersRef.current)  (markersRef.current as L.LayerGroup).clearLayers();
      if (heatLayerRef.current) { map.removeLayer(heatLayerRef.current as L.Layer); heatLayerRef.current = null; }

      if (!points.length) { setLoading(false); return; }

      // Re-centre map on selected city
      const centre = CITY_CENTRES[city] ?? [41.8781, -87.6298];
      map.setView(centre, 11);

      // Draw heat layer
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { default: heat } = await import("leaflet.heat") as any;
        const heatData = points.map((p) => [p.lat, p.lng, p.weight]);
        const layer = heat(heatData, {
          radius: 20, blur: 25, maxZoom: 14,
          gradient: { 0.0: "#00d4ff", 0.3: "#74b9ff", 0.5: "#ffa502", 0.75: "#ff6b35", 1.0: "#ff4757" },
        });
        layer.addTo(map);
        heatLayerRef.current = layer;
      } catch {
        // Fallback: plain circle markers
        const g = markersRef.current as L.LayerGroup;
        points.slice(0, 800).forEach((p) =>
          L.circleMarker([p.lat, p.lng], { radius: 4, color: "none", fillColor: "#ff4757", fillOpacity: 0.45 }).addTo(g)
        );
      }

      // Fit bounds
      const latLngs = points.map((p) => L.latLng(p.lat, p.lng));
      map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30], maxZoom: 13 });

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          setError("Sign in to access more data.");
        } else if (status === 403) {
          setError("Upgrade to Pro to view heatmap data.");
        } else if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") {
          setError("Backend is starting up (cold start ~50s). Please wait...");
          setTimeout(loadData, 8000);
        } else {
          setError(`Error ${status ?? "unknown"}: ${err.message}`);
        }
      } else {
        setError("Failed to load crime data.");
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, categories, startDate, endDate]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Map canvas */}
      <div ref={mapRef} style={{ position: "absolute", inset: 0, background: "#1a1a2e" }} />

      {/* Loading */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(10,14,26,0.65)", backdropFilter: "blur(4px)", zIndex: 1000,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 40, height: 40, border: "3px solid rgba(0,212,255,0.2)",
              borderTop: "3px solid #00d4ff", borderRadius: "50%",
              animation: "leafspin 0.8s linear infinite", margin: "0 auto 12px",
            }} />
            <style>{`@keyframes leafspin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#00d4ff", fontWeight: 600 }}>Loading crime data…</p>
            {debugMsg && <p style={{ color: "#8892b0", fontSize: "0.75rem", marginTop: 6 }}>{debugMsg}</p>}
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{
          position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "rgba(30,10,10,0.95)", border: "1px solid #ff4757",
          borderRadius: 10, padding: "10px 18px", color: "#ff6b81",
          fontSize: "0.875rem", zIndex: 1000, textAlign: "center",
          backdropFilter: "blur(6px)",
        }}>
          ⚠ {error}
          <button
            onClick={loadData}
            style={{
              marginLeft: 12, padding: "3px 10px", borderRadius: 6,
              border: "1px solid #ff4757", background: "transparent",
              color: "#ff6b81", cursor: "pointer", fontSize: "0.8rem",
            }}
          >Retry</button>
        </div>
      )}

      {/* Count badge */}
      {!loading && !error && count > 0 && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,14,26,0.92)", border: "1px solid rgba(0,212,255,0.25)",
          borderRadius: 12, padding: "8px 18px", backdropFilter: "blur(8px)", zIndex: 999,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ed573", display: "inline-block", boxShadow: "0 0 6px #2ed573" }} />
          <span style={{ color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
            {count.toLocaleString()} incidents • {city.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())} • Live
          </span>
        </div>
      )}

      {/* No data */}
      {!loading && !error && count === 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          background: "rgba(10,14,26,0.9)", border: "1px solid var(--color-border)",
          borderRadius: 12, padding: "20px 28px", zIndex: 999, textAlign: "center",
        }}>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
            No incidents found for selected filters.
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: 6 }}>
            Try a wider date range or different city.
          </p>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 70, right: 60,
        background: "rgba(10,14,26,0.9)", border: "1px solid var(--color-border)",
        borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)", zIndex: 999,
      }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.7rem", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Level</p>
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
