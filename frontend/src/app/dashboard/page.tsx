"use client";

import { StatCard } from "@/components/ui/StatCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { formatCategory } from "@/lib/utils";
import { analyticsApi, crimesApi } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle,
  Map,
  RefreshCw,
  Shield,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  total_incidents: number;
  change_pct: number;
  most_common_category: string;
  most_common_pct: number;
  resolved_rate: number;
  resolved_change: number;
}

interface TrendPoint { day: string; count: number; }
interface CategoryItem { name: string; value: number; color: string; }
interface Incident {
  id: string; category: string; location_name: string;
  district: string; occurred_at: string; resolved: boolean;
}

const CAT_COLORS: Record<string, string> = {
  THEFT: "#00d4ff", ASSAULT: "#ff4757", BURGLARY: "#ffa502",
  ROBBERY: "#ff6b35", VANDALISM: "#7c3aed", OTHER: "#475569",
};

const FALLBACK_TREND = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  count: Math.floor(120 + Math.sin(i * 0.4) * 40),
}));

const FALLBACK_CATS: CategoryItem[] = [
  { name: "Theft", value: 34, color: "#00d4ff" },
  { name: "Assault", value: 22, color: "#ff4757" },
  { name: "Burglary", value: 18, color: "#ffa502" },
  { name: "Vandalism", value: 14, color: "#7c3aed" },
  { name: "Other", value: 12, color: "#475569" },
];

// ── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ resolved }: { resolved: boolean }) {
  return resolved
    ? <span className="badge badge-safe">Closed</span>
    : <span className="badge badge-danger">Open</span>;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: "10px 14px", minWidth: 120 }}>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem", marginBottom: 4 }}>{label}</p>
      <p className="stat-number" style={{ color: "var(--color-accent-primary)", fontSize: "1.25rem" }}>
        {payload[0].value}
      </p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Upgrade Banner Detector ──────────────────────────────────────────────────
// Isolated in its own component so useSearchParams is inside a Suspense boundary

function UpgradeBannerDetector({ onDetected }: { onDetected: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      onDetected();
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, onDetected]);
  return null;
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [city, setCity]           = useState("chicago");
  const [period, setPeriod]       = useState("30d");
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [trend, setTrend]         = useState<TrendPoint[]>(FALLBACK_TREND);
  const [categories, setCategories] = useState<CategoryItem[]>(FALLBACK_CATS);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [anomaly, setAnomaly]     = useState<string | null>(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);


  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch: dashboard stats, trends, category breakdown, recent incidents
      const [dashRes, trendsRes, catsRes, incRes] = await Promise.allSettled([
        analyticsApi.dashboard({ city, period }),
        analyticsApi.trends({ city, period }),
        analyticsApi.categoryBreak({ city, period }),
        crimesApi.list({ city, limit: 10, sort: "-occurred_at" }),
      ]);

      if (dashRes.status === "fulfilled") {
        const d = dashRes.value.data;
        setStats({
          total_incidents:       d.total_incidents    ?? 0,
          change_pct:            d.change_pct         ?? 0,
          most_common_category:  d.most_common_category ?? "N/A",
          most_common_pct:       d.most_common_pct    ?? 0,
          resolved_rate:         d.resolved_rate      ?? 0,
          resolved_change:       d.resolved_change    ?? 0,
        });
        if (d.top_anomaly) setAnomaly(d.top_anomaly);
      }

      if (trendsRes.status === "fulfilled") {
        const raw = trendsRes.value.data?.trend ?? [];
        setTrend(raw.map((p: any, i: number) => ({
          day: `D${i + 1}`,
          count: p.count ?? p.total ?? 0,
        })));
      }

      if (catsRes.status === "fulfilled") {
        const raw = catsRes.value.data ?? [];
        setCategories(raw.map((c: any) => ({
          name:  c.category ?? c.name,
          value: c.percentage ?? c.pct ?? c.count ?? 0,
          color: CAT_COLORS[c.category?.toUpperCase() ?? "OTHER"] ?? "#475569",
        })));
      }

      if (incRes.status === "fulfilled") {
        setIncidents(incRes.value.data?.items ?? incRes.value.data ?? []);
      }
    } catch (_) {
      // silently keep fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [city, period]);

  const displayStats = stats ?? {
    total_incidents: 4821, change_pct: -4.2,
    most_common_category: "Theft", most_common_pct: 34,
    resolved_rate: 34.2, resolved_change: 3.1,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 page-transition"
    >
      {/* Suspense-wrapped search params detector — must be in Suspense per Next.js 14 */}
      <Suspense fallback={null}>
        <UpgradeBannerDetector onDetected={() => setShowUpgradeBanner(true)} />
      </Suspense>

      {/* ── Header controls ─────────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <select id="dash-city" value={city} onChange={e => setCity(e.target.value)}
            className="input" style={{ padding: "7px 11px" }}>
            {["chicago","nyc","la"].map(c =>
              <option key={c} value={c}>{c.toUpperCase()}</option>
            )}
          </select>
          <select id="dash-period" value={period} onChange={e => setPeriod(e.target.value)}
            className="input" style={{ padding: "7px 11px" }}>
            {[["7d","Last 7 days"],["30d","Last 30 days"],["90d","Last 90 days"]].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </select>
        </div>
        <button id="dash-refresh" onClick={fetchData}
          className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </motion.div>

      {/* ── Upgrade Success Banner ───────────────────────────────────────── */}
      {showUpgradeBanner && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="card" id="upgrade-success-banner"
          style={{ borderColor: "rgba(0,212,255,0.4)", background: "rgba(0,212,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
          <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: "var(--color-accent-primary)" }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--color-accent-primary)" }}>
              Welcome to CrimeScope Pro! 🎉
            </p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
              ML hotspot detection, 30-day forecasts, and anomaly alerts are now unlocked.
            </p>
          </div>
          <button onClick={() => setShowUpgradeBanner(false)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "1.25rem", lineHeight: 1 }}
            aria-label="Dismiss">&times;</button>
        </motion.div>
      )}

      {/* ── Anomaly Alert (live) ─────────────────────────────────────────── */}
      {anomaly && (
        <motion.div variants={cardVariants}>
          <div className="alert-banner" id="anomaly-alert">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem" }}
              dangerouslySetInnerHTML={{ __html: anomaly }} />
            <Link href="/analytics" className="ml-auto btn btn-sm"
              style={{ background: "rgba(255,71,87,0.15)", color: "var(--color-accent-danger)", border: "1px solid rgba(255,71,87,0.3)" }}>
              View Analysis →
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Stat Cards Row ───────────────────────────────────────────────── */}
      <motion.div variants={cardVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={displayStats.total_incidents}
          change={displayStats.change_pct / 100}
          subtitle={`Last ${period === "7d" ? "7" : period === "30d" ? "30" : "90"} days`}
          icon={Activity}
          format="number"
        />
        <StatCard
          title="Change vs Prior Period"
          value={`${displayStats.change_pct > 0 ? "+" : ""}${displayStats.change_pct.toFixed(1)}%`}
          change={displayStats.change_pct / 100}
          subtitle="vs previous period"
          icon={TrendingDown}
        />
        <StatCard
          title="Most Common"
          value={displayStats.most_common_category}
          subtitle={`${displayStats.most_common_pct}% of incidents`}
          icon={Shield}
        />
        <StatCard
          title="Resolved Rate"
          value={displayStats.resolved_rate / 100}
          change={displayStats.resolved_change / 100}
          subtitle="of all incidents"
          icon={CheckCircle}
          format="percent"
        />
      </motion.div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Area chart — 60% */}
        <div className="card xl:col-span-3" id="incidents-trend-chart">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                Incidents Over Time
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: 2 }}>
                {period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : "Last 90 days"} — {city.toUpperCase()}
              </p>
            </div>
            <BarChart2 className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v, i) => (i % 5 === 0 ? v : "")} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#00d4ff" strokeWidth={2}
                fill="url(#cyanGrad)" dot={false} activeDot={{ r: 4, fill: "#00d4ff" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart — 40% */}
        <div className="card xl:col-span-2" id="category-breakdown-chart">
          <div className="mb-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)" }}>
              Category Breakdown
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: 2 }}>By incident type</p>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                  dataKey="value" paddingAngle={3}>
                  {categories.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {categories.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8125rem" }}>{name}</span>
                  </div>
                  <span className="stat-number text-sm" style={{ color: "var(--color-text-primary)" }}>{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Map Preview ─────────────────────────────────────────────────── */}
      <motion.div variants={cardVariants}>
        <div className="card" id="dashboard-map-preview">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)" }}>
              Crime Heatmap Preview
            </h3>
            <Link href="/map" className="btn btn-ghost btn-sm" id="view-full-map-link">
              View Full Map <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-card overflow-hidden relative"
            style={{ height: 200, background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}>
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
              <Map className="h-8 w-8" style={{ color: "var(--color-border)" }} />
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Open Crime Map for interactive heatmap</p>
            </div>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="absolute rounded-full opacity-25"
                style={{
                  width: 12 + (i % 4) * 6, height: 12 + (i % 4) * 6,
                  background: i % 3 === 0 ? "#ff4757" : i % 3 === 1 ? "#ffa502" : "#00d4ff",
                  left: `${8 + (i * 19) % 82}%`, top: `${12 + (i * 27) % 68}%`,
                  filter: "blur(8px)",
                }} />
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Recent Incidents Table ───────────────────────────────────────── */}
      <motion.div variants={cardVariants}>
        <div className="card" id="recent-incidents-table">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)" }}>
                Recent Incidents
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: 2 }}>
                Latest 10 incidents — {city.toUpperCase()}
              </p>
            </div>
            <Link href="/map" className="btn btn-ghost btn-sm">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>District</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.length > 0
                  ? incidents.map((inc, i) => (
                    <tr key={inc.id ?? i} className="cursor-pointer">
                      <td>
                        <span className="stat-number text-sm" style={{ color: "var(--color-text-muted)" }}>
                          {timeAgo(inc.occurred_at)}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-neutral" style={{ textTransform: "none", letterSpacing: 0 }}>
                          {formatCategory(inc.category)}
                        </span>
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        <span className="truncate block">{inc.location_name ?? "—"}</span>
                      </td>
                      <td>{inc.district ?? "—"}</td>
                      <td><StatusBadge resolved={inc.resolved} /></td>
                    </tr>
                  ))
                  : (
                    /* Fallback rows when API returns empty */
                    [
                      { id:"f1", time:"2h ago",  cat:"THEFT",    loc:"N Michigan Ave",   dist:"Loop",        res:false },
                      { id:"f2", time:"3h ago",  cat:"ASSAULT",  loc:"W Madison St",     dist:"Near West",   res:false },
                      { id:"f3", time:"5h ago",  cat:"BURGLARY", loc:"S State St",       dist:"South Loop",  res:true  },
                      { id:"f4", time:"8h ago",  cat:"ROBBERY",  loc:"E Cermak Rd",      dist:"Douglas",     res:false },
                    ].map(r => (
                      <tr key={r.id}>
                        <td><span className="stat-number text-sm" style={{ color: "var(--color-text-muted)" }}>{r.time}</span></td>
                        <td><span className="badge badge-neutral" style={{ textTransform:"none",letterSpacing:0 }}>{formatCategory(r.cat)}</span></td>
                        <td><span className="truncate block">{r.loc}</span></td>
                        <td>{r.dist}</td>
                        <td><StatusBadge resolved={r.res} /></td>
                      </tr>
                    ))
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
