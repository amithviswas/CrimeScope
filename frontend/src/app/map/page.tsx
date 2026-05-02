"use client";

import dynamic from "next/dynamic";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { RiskBadge } from "@/components/ui/RiskBadge";

// Leaflet must be loaded client-side only (no SSR)
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div style={{
      position: "absolute", inset: 0, background: "#0d1321",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(0,212,255,0.2)",
          borderTop: "3px solid #00d4ff", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: "#00d4ff", fontWeight: 600 }}>Initialising map...</p>
      </div>
    </div>
  ),
});

const CATEGORIES = ["THEFT", "ASSAULT", "BURGLARY", "ROBBERY", "VANDALISM", "HOMICIDE", "NARCOTICS"];
const CITIES     = [
  { value: "chicago",     label: "Chicago, IL" },
  { value: "new_york",    label: "New York, NY" },
  { value: "los_angeles", label: "Los Angeles, CA" },
];

export default function MapPage() {
  const [panelOpen,  setPanelOpen]  = useState(true);
  const [selCats,    setSelCats]    = useState<string[]>([]);
  const [city,       setCity]       = useState("chicago");
  const [dateRange,  setDateRange]  = useState("30d");

  // Applied (committed) state — only updates when user clicks Apply
  const [appliedCats,      setAppliedCats]      = useState<string[]>([]);
  const [appliedCity,      setAppliedCity]      = useState("chicago");
  const [appliedDateRange, setAppliedDateRange] = useState("30d");

  const toggleCat = (cat: string) =>
    setSelCats(s => s.includes(cat) ? s.filter(c => c !== cat) : [...s, cat]);

  const applyFilters = () => {
    setAppliedCats([...selCats]);
    setAppliedCity(city);
    setAppliedDateRange(dateRange);
  };

  return (
    <div style={{ position: "relative", height: "calc(100vh - 64px)", display: "flex", overflow: "hidden" }}>

      {/* ── Left filter panel ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: panelOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: 320, background: "var(--color-bg-secondary)",
          borderRight: "1px solid var(--color-border)",
          display: "flex", flexDirection: "column",
          position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 20, overflow: "auto",
        }}
      >
        {/* Panel header */}
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter className="h-4 w-4" style={{ color: "var(--color-accent-primary)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>Filters</span>
          </div>
          <button id="toggle-panel" onClick={() => setPanelOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

          {/* City */}
          <div>
            <label style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", display: "block", marginBottom: 6 }}>City</label>
            <select id="map-city" value={city} onChange={e => setCity(e.target.value)} className="input" style={{ width: "100%" }}>
              {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", display: "block", marginBottom: 6 }}>Date Range</label>
            <select id="map-daterange" className="input" value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ width: "100%" }}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", display: "block", marginBottom: 8 }}>Categories</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATEGORIES.map(cat => (
                <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    id={`cat-${cat}`}
                    type="checkbox"
                    checked={selCats.includes(cat)}
                    onChange={() => toggleCat(cat)}
                    style={{ accentColor: "var(--color-accent-primary)", width: 16, height: 16 }}
                  />
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <button id="apply-filters" onClick={applyFilters} className="btn btn-primary w-full">
            Apply Filters
          </button>

          <hr style={{ borderColor: "var(--color-border)", margin: "4px 0" }} />

          {/* Attribution */}
          <div style={{
            padding: "8px 10px", borderRadius: 8,
            background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)",
          }}>
            <p style={{ color: "#00d4ff", fontSize: "0.75rem", fontWeight: 600, marginBottom: 4 }}>
              Live Data Source
            </p>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", lineHeight: 1.5 }}>
              Chicago Open Data Portal — real crime incidents updated daily. Powered by Leaflet & CartoDB.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Map area ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", marginLeft: panelOpen ? 320 : 0, transition: "margin 0.3s" }}>

        {/* Panel toggle when closed */}
        {!panelOpen && (
          <button id="open-panel" onClick={() => setPanelOpen(true)}
            style={{
              position: "absolute", top: 16, left: 16, zIndex: 20,
              background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)",
              borderRadius: 8, padding: "8px 12px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
            <Filter className="h-4 w-4" style={{ color: "var(--color-accent-primary)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
              Filters
            </span>
          </button>
        )}

        {/* Real Leaflet Map */}
        <LeafletMap
          city={appliedCity}
          categories={appliedCats}
          dateRange={appliedDateRange}
        />
      </div>
    </div>
  );
}
