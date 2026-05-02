"use client";

import dynamic from "next/dynamic";
import { Filter, X, RefreshCw, Calendar } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { MapFilters } from "@/components/map/LeafletMap";

// Leaflet requires SSR disabled
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
        <p style={{ color: "#00d4ff", fontWeight: 600 }}>Initialising map…</p>
      </div>
    </div>
  ),
});

const CATEGORIES = ["THEFT", "ASSAULT", "BURGLARY", "ROBBERY", "VANDALISM", "HOMICIDE", "NARCOTICS", "FRAUD", "WEAPONS"];

const CITIES = [
  { value: "chicago",     label: "Chicago, IL",       seeded: true  },
  { value: "new_york",    label: "New York, NY",       seeded: true  },
  { value: "los_angeles", label: "Los Angeles, CA",    seeded: true  },
];

// Quick-select presets
const PRESETS: [string, string, string][] = [
  ["Last 7 days",   "7d",  ""],
  ["Last 30 days",  "30d", ""],
  ["Last 90 days",  "90d", ""],
  ["This year",     "1y",  ""],
  ["Custom range",  "custom", ""],
];

function toISODate(d: Date) { return d.toISOString().split("T")[0]; }

function presetDates(key: string): { start: string; end: string } {
  const now  = new Date();
  const end  = toISODate(now);
  const days: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  if (key === "custom") return { start: "", end: "" };
  const d = days[key] ?? 30;
  return { start: toISODate(new Date(Date.now() - d * 86_400_000)), end };
}

export default function MapPage() {
  const [panelOpen, setPanelOpen] = useState(true);

  // Draft filter state (uncommitted)
  const [city,       setCity]       = useState("chicago");
  const [selCats,    setSelCats]    = useState<string[]>([]);
  const [preset,     setPreset]     = useState("30d");
  const [customStart,setCustomStart]= useState("");
  const [customEnd,  setCustomEnd]  = useState("");

  // Applied state (committed when user clicks Apply)
  const [applied, setApplied] = useState<MapFilters>(() => {
    const { start, end } = presetDates("30d");
    return { city: "chicago", categories: [], startDate: start, endDate: end };
  });

  const toggleCat = (cat: string) =>
    setSelCats(s => s.includes(cat) ? s.filter(c => c !== cat) : [...s, cat]);

  const currentStart = preset === "custom" ? customStart : presetDates(preset).start;
  const currentEnd   = preset === "custom" ? customEnd   : presetDates(preset).end;

  const applyFilters = () => {
    setApplied({
      city,
      categories: [...selCats],
      startDate:  currentStart,
      endDate:    currentEnd,
    });
  };

  const resetFilters = () => {
    setCity("chicago"); setSelCats([]); setPreset("30d"); setCustomStart(""); setCustomEnd("");
    const { start, end } = presetDates("30d");
    setApplied({ city: "chicago", categories: [], startDate: start, endDate: end });
  };

  const hasChanges = useMemo(() =>
    city !== applied.city ||
    JSON.stringify(selCats.sort()) !== JSON.stringify([...applied.categories].sort()) ||
    currentStart !== applied.startDate ||
    currentEnd   !== applied.endDate,
  [city, selCats, currentStart, currentEnd, applied]);

  return (
    <div style={{ position: "relative", height: "calc(100vh - 64px)", display: "flex", overflow: "hidden" }}>

      {/* ── Filter panel ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ x: 0 }} animate={{ x: panelOpen ? 0 : -340 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          width: 320, background: "var(--color-bg-secondary)",
          borderRight: "1px solid var(--color-border)",
          display: "flex", flexDirection: "column",
          position: "absolute", left: 0, top: 0, bottom: 0, zIndex: 20, overflow: "auto",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter className="h-4 w-4" style={{ color: "var(--color-accent-primary)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem" }}>Map Filters</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={resetFilters} title="Reset filters"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 2 }}>
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setPanelOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>

          {/* ── City ── */}
          <div>
            <label style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>City</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {CITIES.map(c => (
                <button
                  key={c.value}
                  id={`city-${c.value}`}
                  onClick={() => setCity(c.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                    background: city === c.value ? "rgba(0,212,255,0.12)" : "var(--color-bg-tertiary)",
                    border: city === c.value ? "1px solid rgba(0,212,255,0.4)" : "1px solid var(--color-border)",
                    color: city === c.value ? "#00d4ff" : "var(--color-text-secondary)",
                    fontWeight: city === c.value ? 600 : 400,
                    fontSize: "0.875rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "all 0.15s",
                  }}
                >
                  {c.label}
                  {city === c.value && (
                    <span style={{ fontSize: "0.7rem", color: "#00d4ff", opacity: 0.7 }}>Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Date range ── */}
          <div>
            <label style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
              Date Range
            </label>
            {/* Preset chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {PRESETS.map(([label, key]) => (
                <button key={key} onClick={() => setPreset(key)}
                  style={{
                    padding: "5px 10px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer",
                    background: preset === key ? "rgba(0,212,255,0.15)" : "var(--color-bg-tertiary)",
                    border: preset === key ? "1px solid rgba(0,212,255,0.4)" : "1px solid var(--color-border)",
                    color: preset === key ? "#00d4ff" : "var(--color-text-muted)",
                    fontWeight: preset === key ? 600 : 400, transition: "all 0.15s",
                  }}
                >{label}</button>
              ))}
            </div>

            {/* Custom date pickers */}
            {preset === "custom" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <label style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block", marginBottom: 4 }}>
                    <Calendar className="h-3 w-3" style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                    From
                  </label>
                  <input
                    type="date"
                    id="date-start"
                    value={customStart}
                    max={customEnd || toISODate(new Date())}
                    onChange={e => setCustomStart(e.target.value)}
                    className="input"
                    style={{ width: "100%", colorScheme: "dark" }}
                  />
                </div>
                <div>
                  <label style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", display: "block", marginBottom: 4 }}>
                    <Calendar className="h-3 w-3" style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                    To
                  </label>
                  <input
                    type="date"
                    id="date-end"
                    value={customEnd}
                    min={customStart}
                    max={toISODate(new Date())}
                    onChange={e => setCustomEnd(e.target.value)}
                    className="input"
                    style={{ width: "100%", colorScheme: "dark" }}
                  />
                </div>
              </div>
            )}

            {/* Current range summary */}
            {preset !== "custom" && (
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginTop: 4 }}>
                {currentStart} → {currentEnd}
              </p>
            )}
          </div>

          {/* ── Categories ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Crime Type</label>
              {selCats.length > 0 && (
                <button onClick={() => setSelCats([])}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                  Clear all
                </button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {CATEGORIES.map(cat => (
                <label key={cat} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    id={`cat-${cat}`}
                    type="checkbox"
                    checked={selCats.includes(cat)}
                    onChange={() => toggleCat(cat)}
                    style={{ accentColor: "var(--color-accent-primary)", width: 15, height: 15, flexShrink: 0 }}
                  />
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Apply ── */}
          <div style={{ position: "sticky", bottom: 0, paddingTop: 8, background: "var(--color-bg-secondary)" }}>
            <button
              id="apply-filters"
              onClick={applyFilters}
              disabled={preset === "custom" && (!customStart || !customEnd)}
              className="btn btn-primary w-full"
              style={{
                opacity: (preset === "custom" && (!customStart || !customEnd)) ? 0.5 : 1,
                position: "relative",
              }}
            >
              {hasChanges && (
                <span style={{
                  position: "absolute", top: -4, right: -4, width: 10, height: 10,
                  borderRadius: "50%", background: "#ffa502",
                  boxShadow: "0 0 6px #ffa502",
                }} />
              )}
              Apply Filters
            </button>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", textAlign: "center", marginTop: 6 }}>
              Powered by Leaflet + CartoDB · Free &amp; open source
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Map area ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", marginLeft: panelOpen ? 320 : 0, transition: "margin 0.3s" }}>

        {!panelOpen && (
          <button id="open-panel" onClick={() => setPanelOpen(true)}
            style={{
              position: "absolute", top: 16, left: 16, zIndex: 20,
              background: "rgba(10,14,26,0.9)", border: "1px solid var(--color-border)",
              borderRadius: 8, padding: "8px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(6px)",
            }}>
            <Filter className="h-4 w-4" style={{ color: "var(--color-accent-primary)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
              Filters
            </span>
          </button>
        )}

        <LeafletMap {...applied} />
      </div>
    </div>
  );
}
