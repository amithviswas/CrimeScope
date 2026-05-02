"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

// Types
interface HeatPoint { lat: number; lng: number; weight: number; }
interface MarkerPoint {
  lat: number; lng: number;
  category: string; description: string; occurred_at: string;
}

interface MapComponentProps {
  city: string;
  categories: string[];
  dateRange: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  THEFT:    "#00d4ff",
  ASSAULT:  "#ff4757",
  BURGLARY: "#ffa502",
  ROBBERY:  "#ff6b35",
  VANDALISM:"#a29bfe",
  HOMICIDE: "#ff0000",
  NARCOTICS:"#6c5ce7",
  FRAUD:    "#74b9ff",
  DEFAULT:  "#2ed573",
};

export default function LeafletMap({ city, categories, dateRange }: MapComponentProps) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletRef  = useRef<unknown>(null);
  const heatLayerRef = useRef<unknown>(null);
  const markersLayerRef = useRef<unknown>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [count, setCount]       = useState(0);

  // Load Leaflet only on client
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      // Load Leaflet CSS via a link element (avoids TS error from CSS module import)
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id   = "leaflet-css";
        link.rel  = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      // Fix default marker icon path in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [41.8781, -87.6298], // Chicago default
        zoom: 11,
        zoomControl: false,
      });

      // OpenStreetMap tiles — FREE, no token needed
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Custom zoom control (top-right)
      L.control.zoom({ position: "bottomright" }).addTo(map);

      leafletRef.current        = map;
      markersLayerRef.current   = L.layerGroup().addTo(map);
    };

    initMap();

    return () => {
      if (leafletRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leafletRef.current as any).remove();
        leafletRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data whenever filters change
  useEffect(() => {
    if (!leafletRef.current) {
      // Retry after map initialises
      const t = setTimeout(() => loadData(), 800);
      return () => clearTimeout(t);
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, categories, dateRange]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, string> = { city };
      if (categories.length) params.categories = categories.join(",");

      const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
      const days = daysMap[dateRange] || 30;
      const start = new Date(Date.now() - days * 86_400_000).toISOString().split("T")[0];
      params.start_date = start;

      const resp = await api.get("/crimes/heatmap", { params });

      // API returns GeoJSON FeatureCollection: {type, features: [{geometry:{coordinates:[lng,lat]}, properties}]}
      const features: Array<{ geometry: { coordinates: [number, number] }; properties: { category?: string } }> =
        resp.data?.features || [];
      const points: HeatPoint[] = features.map((f) => ({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        weight: 0.5,
      }));
      setCount(points.length);

      if (!leafletRef.current) return;
      const L = (await import("leaflet")).default;
      const map = leafletRef.current as L.Map;

      // Clear existing markers
      if (markersLayerRef.current) {
        (markersLayerRef.current as L.LayerGroup).clearLayers();
      }

      // Remove old heat layer
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current as L.Layer);
        heatLayerRef.current = null;
      }

      if (!points.length) {
        setLoading(false);
        return;
      }

      // Build heatmap with leaflet.heat
      try {
        const HeatLayer = (await import("leaflet.heat")).default;
        const heatData = points.map((p) => [p.lat, p.lng, p.weight ?? 0.5]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heat = (HeatLayer as any)(heatData, {
          radius: 18, blur: 20, maxZoom: 14,
          gradient: { 0.0: "#00d4ff", 0.3: "#74b9ff", 0.5: "#ffa502", 0.7: "#ff6b35", 1.0: "#ff4757" },
        });
        heat.addTo(map);
        heatLayerRef.current = heat;
      } catch {
        // Fallback: circle markers if leaflet.heat not available
        const markerLayer = markersLayerRef.current as L.LayerGroup;
        points.slice(0, 500).forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 5, fillColor: "#ff4757", color: "none", fillOpacity: 0.5,
          }).addTo(markerLayer);
        });
      }

      // Fit map to data bounds
      if (points.length > 0) {
        const latLngs = points.map((p) => L.latLng(p.lat, p.lng));
        map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 401) {
        setError("Sign in to view live crime data.");
      } else if (e.response?.status === 403) {
        setError("Heatmap data requires a Pro plan.");
      } else {
        setError("Failed to load crime data. Retrying...");
        setTimeout(loadData, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Map container */}
      <div ref={mapRef} style={{ position: "absolute", inset: 0, background: "#1a1a2e" }} />

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", background: "rgba(10,14,26,0.7)", backdropFilter: "blur(4px)", zIndex: 1000,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 40, height: 40, border: "3px solid rgba(0,212,255,0.2)",
              borderTop: "3px solid #00d4ff", borderRadius: "50%",
              animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: "#00d4ff", fontWeight: 600 }}>Loading crime data...</p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
          background: "rgba(239,68,68,0.9)", borderRadius: 8, padding: "8px 16px",
          color: "white", fontSize: "0.875rem", zIndex: 1000,
        }}>
          {error}
        </div>
      )}

      {/* Data badge */}
      {!loading && count > 0 && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,14,26,0.9)", border: "1px solid var(--color-border)",
          borderRadius: 12, padding: "8px 16px", backdropFilter: "blur(8px)", zIndex: 999,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ed573", display: "inline-block", boxShadow: "0 0 6px #2ed573" }} />
          <span style={{ color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 600 }}>
            {count.toLocaleString()} incidents • {city.charAt(0).toUpperCase() + city.slice(1)} • Live
          </span>
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 70, right: 56,
        background: "rgba(10,14,26,0.9)", border: "1px solid var(--color-border)",
        borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)", zIndex: 999,
      }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 8 }}>Risk Level</p>
        {[["#00d4ff", "Low"], ["#ffa502", "Medium"], ["#ff6b35", "High"], ["#ff4757", "Severe"]].map(([c, l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: c, display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
