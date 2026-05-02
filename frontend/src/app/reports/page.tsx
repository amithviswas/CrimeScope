"use client";

import { useState } from "react";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportFormat = "csv" | "json";
type ReportStatus = "idle" | "generating" | "ready" | "error";

const CITIES = ["chicago", "new_york", "los_angeles", "houston", "phoenix"];
const CATEGORIES = ["THEFT", "ASSAULT", "BURGLARY", "ROBBERY", "VANDALISM", "HOMICIDE", "FRAUD"];

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [city, setCity]           = useState("chicago");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [category, setCategory]   = useState("");
  const [format, setFormat]       = useState<ReportFormat>("csv");
  const [status, setStatus]       = useState<ReportStatus>("idle");
  const [error, setError]         = useState("");

  const handleGenerate = async () => {
    setStatus("generating");
    setError("");
    try {
      const params: Record<string, string> = { city, format };
      if (startDate) params.start_date = startDate;
      if (endDate)   params.end_date   = endDate;
      if (category)  params.category   = category;

      const response = await api.get("/crimes/export", {
        params,
        responseType: "blob",
      });

      // Trigger browser download
      const url      = window.URL.createObjectURL(new Blob([response.data]));
      const link     = document.createElement("a");
      const ext      = format === "json" ? "json" : "csv";
      link.href      = url;
      link.download  = `crimescope_${city}_report.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatus("ready");
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 403) {
        setError("Exporting reports requires a Pro or Enterprise plan. Upgrade to download data.");
      } else if (e.response?.status === 401) {
        setError("Please sign in to generate reports.");
      } else {
        setError("Failed to generate report. Please try again.");
      }
      setStatus("error");
    }
  };

  return (
    <div style={{ padding: "0 0 3rem" }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
          Reports
        </h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
          Generate and download crime incident data exports for any city and date range.
          <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem",
            background: "rgba(124,77,255,0.15)", color: "#a78bfa", fontWeight: 600 }}>
            Pro feature
          </span>
        </p>
      </div>

      {/* ── Generator Card ── */}
      <div style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "2rem",
        marginBottom: "2rem",
        maxWidth: 720,
      }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "1.5rem" }}>
          Configure Report
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {/* City */}
          <div>
            <label htmlFor="report-city" style={labelStyle}>City</label>
            <select id="report-city" value={city} onChange={e => setCity(e.target.value)} style={selectStyle}>
              {CITIES.map(c => (
                <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="report-category" style={labelStyle}>Category <span style={{ color: "var(--color-text-secondary)" }}>(optional)</span></label>
            <select id="report-category" value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
              <option value="">All categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="report-start" style={labelStyle}>Start Date</label>
            <input
              id="report-start"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="report-end" style={labelStyle}>End Date</label>
            <input
              id="report-end"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Format */}
          <div style={{ gridColumn: "span 2" }}>
            <label style={labelStyle}>Export Format</label>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              {(["csv", "json"] as ReportFormat[]).map(f => (
                <button
                  key={f}
                  id={`format-${f}`}
                  onClick={() => setFormat(f)}
                  style={{
                    padding: "0.5rem 1.5rem",
                    borderRadius: 8,
                    border: format === f ? "1.5px solid #00d4ff" : "1.5px solid var(--color-border)",
                    background: format === f ? "rgba(0,212,255,0.1)" : "transparent",
                    color: format === f ? "#00d4ff" : "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontWeight: format === f ? 600 : 400,
                    fontSize: "0.875rem",
                    transition: "all 0.15s",
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        {status === "error" && (
          <div style={{
            marginTop: "1.25rem",
            padding: "0.875rem 1rem",
            borderRadius: 8,
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171",
            fontSize: "0.875rem",
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {status === "ready" && (
          <div style={{
            marginTop: "1.25rem",
            padding: "0.875rem 1rem",
            borderRadius: 8,
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "#34d399",
            fontSize: "0.875rem",
          }}>
            ✓ Report downloaded successfully.
          </div>
        )}

        {/* CTA */}
        <button
          id="generate-report-btn"
          onClick={handleGenerate}
          disabled={status === "generating"}
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 2rem",
            borderRadius: 10,
            border: "none",
            background: status === "generating"
              ? "rgba(0,212,255,0.4)"
              : "linear-gradient(135deg, #00d4ff, #0096ff)",
            color: "#0a0e1a",
            fontWeight: 700,
            fontSize: "0.9375rem",
            cursor: status === "generating" ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "opacity 0.2s",
          }}
        >
          {status === "generating" ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray="50" strokeDashoffset="15" strokeLinecap="round" />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </svg>
              Generating…
            </>
          ) : "⬇ Download Report"}
        </button>
      </div>

      {/* ── Info Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", maxWidth: 720 }}>
        {[
          { icon: "📊", title: "CSV Export", desc: "Spreadsheet-compatible. Open in Excel, Google Sheets, or any BI tool." },
          { icon: "🔗", title: "JSON Export", desc: "Developer-friendly. Integrate with dashboards, maps, or custom workflows." },
          { icon: "🔒", title: "Pro Feature", desc: "Exports include up to 50,000 incidents. Upgrade to Pro for full access." },
        ].map(card => (
          <div key={card.title} style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: "1.25rem",
          }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{card.icon}</div>
            <div style={{ fontWeight: 600, color: "var(--color-text-primary)", fontSize: "0.9rem", marginBottom: "0.35rem" }}>{card.title}</div>
            <div style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  marginBottom: "0.375rem",
  letterSpacing: "0.03em",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  background: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
  fontSize: "0.9375rem",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  colorScheme: "dark",
};
