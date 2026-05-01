"use client";
import { motion } from "framer-motion";
import { Brain, Info, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analyticsApi, mlApi } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────
interface HourPoint  { hour: string; count: number; }
interface DayPoint   { day: string;  count: number; }
interface TrendPoint { day: string;  actual: number; forecast?: number; }

// ── Static fallbacks ─────────────────────────────────────────────────────────
const DAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const HOURS = Array.from({length:24},(_,i)=>i);
const FALLBACK_HOURLY: HourPoint[] = HOURS.map(h => ({ hour:`${h}:00`, count: Math.floor(20+Math.sin((h-8)*0.5)*30) }));
const FALLBACK_WEEKLY: DayPoint[]  = DAYS.map((d,i) => ({ day:d, count: Math.floor(80+Math.sin(i*0.9)*50) }));
const FALLBACK_TREND: TrendPoint[] = Array.from({length:30},(_,i)=>({
  day:`D${i+1}`,
  actual: Math.floor(120+Math.sin(i*0.4)*40),
  forecast: i > 21 ? Math.floor(115+Math.sin(i*0.4)*35) : undefined,
}));

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding:"10px 14px", minWidth:100 }}>
      <p style={{ color:"var(--color-text-muted)", fontSize:"0.75rem", marginBottom:4 }}>{label}</p>
      <p className="stat-number" style={{ color:"var(--color-accent-primary)", fontSize:"1.25rem" }}>{payload[0].value}</p>
    </div>
  );
}

// ── Analytics Page ────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [city, setCity]     = useState("chicago");
  const [period, setPeriod] = useState("30d");
  const [tab, setTab]       = useState<"patterns"|"trends"|"forecast">("patterns");
  const [loading, setLoading] = useState(false);

  const [hourly, setHourly]   = useState<HourPoint[]>(FALLBACK_HOURLY);
  const [weekly, setWeekly]   = useState<DayPoint[]>(FALLBACK_WEEKLY);
  const [trend, setTrend]     = useState<TrendPoint[]>(FALLBACK_TREND);
  const [peakHour, setPeakHour] = useState("10pm – 2am");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hourlyRes, weeklyRes, trendsRes, forecastRes] = await Promise.allSettled([
        analyticsApi.hourly({ city, period }),
        analyticsApi.weekly({ city, period }),
        analyticsApi.trends({ city, period }),
        mlApi.forecast({ city }),
      ]);

      if (hourlyRes.status === "fulfilled") {
        const raw = hourlyRes.value.data ?? [];
        if (raw.length > 0) {
          setHourly(raw.map((p: any) => ({ hour: `${p.hour ?? p.h}:00`, count: p.count ?? p.total ?? 0 })));
          const peak = raw.reduce((a: any, b: any) => (b.count > a.count ? b : a), raw[0]);
          setPeakHour(`Hour ${peak.hour ?? peak.h}`);
        }
      }

      if (weeklyRes.status === "fulfilled") {
        const raw = weeklyRes.value.data ?? [];
        if (raw.length > 0)
          setWeekly(raw.map((p: any) => ({ day: p.day_name ?? DAYS[p.day ?? 0], count: p.count ?? 0 })));
      }

      if (trendsRes.status === "fulfilled") {
        const raw = trendsRes.value.data?.trend ?? [];
        if (raw.length > 0) {
          const mapped: TrendPoint[] = raw.map((p: any, i: number) => ({
            day: `D${i+1}`,
            actual: p.count ?? p.total ?? 0,
          }));

          // overlay forecast on top of trends if available
          if (forecastRes.status === "fulfilled") {
            const fc = forecastRes.value.data?.forecast ?? [];
            fc.slice(0, 10).forEach((f: any, i: number) => {
              const idx = mapped.length - 10 + i;
              if (idx >= 0) mapped[idx].forecast = f.predicted ?? f.predicted_count ?? undefined;
            });
          }
          setTrend(mapped);
        }
      }
    } catch (_) {
      // keep fallbacks
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [city, period]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 style={{ fontFamily:"var(--font-heading)", fontSize:"1.5rem", fontWeight:700 }}>Analytics</h1>
          <p style={{ color:"var(--color-text-muted)", fontSize:"0.875rem" }}>Deep pattern analysis — Pro feature</p>
        </div>
        <div className="flex gap-2 items-center">
          <select id="analytics-city" value={city} onChange={e=>setCity(e.target.value)}
            className="input" style={{ padding:"8px 12px" }}>
            {["chicago","nyc","la"].map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
          </select>
          <select id="analytics-period" value={period} onChange={e=>setPeriod(e.target.value)}
            className="input" style={{ padding:"8px 12px" }}>
            {[["7d","Last 7 days"],["30d","Last 30 days"],["90d","Last 90 days"]].map(([v,l])=>(
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button id="analytics-refresh" onClick={fetchData}
            className="btn btn-ghost btn-sm" style={{ display:"flex", alignItems:"center", gap:6 }}>
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}/>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background:"var(--color-bg-secondary)", display:"inline-flex" }}>
        {[["patterns","Time Patterns"],["trends","Trends"],["forecast","Forecast (ML)"]].map(([t,l])=>(
          <button key={t} id={`tab-${t}`} onClick={()=>setTab(t as any)}
            style={{ padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"0.875rem",
              background: tab===t ? "var(--color-accent-primary)" : "transparent",
              color: tab===t ? "#0a0e1a" : "var(--color-text-secondary)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Patterns tab */}
      {tab === "patterns" && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
          {/* Hourly */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>Incidents by Hour of Day</h3>
                <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>Average daily distribution</p>
              </div>
              <div className="card" style={{ padding:"6px 12px", display:"inline-flex", gap:6, alignItems:"center", border:"1px solid rgba(0,212,255,0.2)" }}>
                <Info className="h-3 w-3" style={{ color:"var(--color-accent-primary)" }}/>
                <span style={{ fontSize:"0.8125rem", color:"var(--color-accent-primary)" }}>Peak: {peakHour}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourly} margin={{top:4,right:4,left:-20,bottom:0}}>
                <XAxis dataKey="hour" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}
                  tickFormatter={v=>v.replace(":00","")} interval={3}/>
                <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {hourly.map((_,i)=>(
                    <Cell key={i} fill={i>=22||i<=2?"#ff4757":i>=18?"#ffa502":"#00d4ff"} fillOpacity={0.8}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly */}
          <div className="card">
            <div className="mb-6">
              <h3 style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>Incidents by Day of Week</h3>
              <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>Average weekly pattern</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekly} margin={{top:4,right:4,left:-20,bottom:0}}>
                <XAxis dataKey="day" tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"#475569",fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="count" fill="#00d4ff" fillOpacity={0.75} radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Trends tab */}
      {tab === "trends" && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="card">
            <div className="mb-6">
              <h3 style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>Incident Trend</h3>
              <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>Daily incident count over selected period</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trend} margin={{top:4,right:4,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} interval={4}/>
                <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="actual" stroke="#00d4ff" strokeWidth={2} fill="url(#trendGrad)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Forecast tab */}
      {tab === "forecast" && (
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="card" style={{ borderColor:"rgba(124,58,237,0.3)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width:32, height:32, background:"rgba(124,58,237,0.2)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Brain className="h-4 w-4" style={{ color:"var(--color-accent-purple)" }}/>
              </div>
              <div>
                <h3 style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>30-Day ML Forecast</h3>
                <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>Prophet time-series model with 80% confidence band</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend} margin={{top:4,right:4,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} interval={4}/>
                <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <Tooltip content={<ChartTip/>}/>
                <Area type="monotone" dataKey="actual"   stroke="#00d4ff" strokeWidth={2} fill="url(#actualGrad)"   dot={false} name="Actual"/>
                <Area type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={2} fill="url(#forecastGrad)" dot={false} strokeDasharray="6 3" name="Forecast"/>
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <span style={{ width:20, height:2, background:"#00d4ff", display:"inline-block"}}/>
                <span style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ width:20, height:2, background:"#7c3aed", display:"inline-block", borderTop:"2px dashed #7c3aed"}}/>
                <span style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>ML Forecast</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
