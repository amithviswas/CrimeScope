"use client";
import { motion } from "framer-motion";
import { Filter, Layers, Map as MapIcon, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { RiskBadge } from "@/components/ui/RiskBadge";

const CATEGORIES = ["THEFT","ASSAULT","BURGLARY","ROBBERY","VANDALISM"];

const HOTSPOTS = [
  { name:"Loop / Millennium Park",   score:8.4, count:142, lat:41.8827, lng:-87.6233 },
  { name:"Near North / River North", score:7.1, count:118, lat:41.8969, lng:-87.6320 },
  { name:"Near West Side",           score:6.8, count:97,  lat:41.8750, lng:-87.6730 },
  { name:"South Loop",               score:5.9, count:82,  lat:41.8664, lng:-87.6272 },
  { name:"Wicker Park",              score:5.2, count:74,  lat:41.9082, lng:-87.6782 },
];

export default function MapPage() {
  const [panelOpen, setPanelOpen]   = useState(true);
  const [selCats, setSelCats]       = useState<string[]>([]);
  const [city, setCity]             = useState("chicago");

  const toggleCat = (cat:string) =>
    setSelCats(s => s.includes(cat) ? s.filter(c=>c!==cat) : [...s, cat]);

  return (
    <div style={{ position:"relative", height:"calc(100vh - 64px)", display:"flex", overflow:"hidden" }}>
      {/* Left filter panel */}
      <motion.div
        initial={{ x: 0 }} animate={{ x: panelOpen ? 0 : -320 }}
        transition={{ type:"spring", stiffness:300, damping:30 }}
        style={{ width:320, background:"var(--color-bg-secondary)", borderRight:"1px solid var(--color-border)",
          display:"flex", flexDirection:"column", position:"absolute", left:0, top:0, bottom:0, zIndex:10, overflow:"auto" }}>
        {/* Panel header */}
        <div style={{ padding:"20px 20px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Filter className="h-4 w-4" style={{ color:"var(--color-accent-primary)" }}/>
            <span style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>Filters</span>
          </div>
          <button id="toggle-panel" onClick={()=>setPanelOpen(false)}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-muted)" }}>
            <X className="h-4 w-4"/>
          </button>
        </div>

        <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16, flex:1 }}>
          {/* City */}
          <div>
            <label style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem", display:"block", marginBottom:6 }}>City</label>
            <select id="map-city" value={city} onChange={e=>setCity(e.target.value)} className="input" style={{ width:"100%" }}>
              {["chicago","nyc","la"].map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Date range */}
          <div>
            <label style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem", display:"block", marginBottom:6 }}>Date Range</label>
            <select className="input" id="map-daterange" style={{ width:"100%" }}>
              {[["7d","Last 7 days"],["30d","Last 30 days"],["90d","Last 90 days"]].map(([v,l])=>(
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div>
            <label style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem", display:"block", marginBottom:8 }}>Categories</label>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {CATEGORIES.map(cat=>(
                <label key={cat} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                  <input id={`cat-${cat}`} type="checkbox" checked={selCats.includes(cat)} onChange={()=>toggleCat(cat)}
                    style={{ accentColor:"var(--color-accent-primary)", width:16, height:16 }}/>
                  <span style={{ color:"var(--color-text-secondary)", fontSize:"0.9375rem" }}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <button id="apply-filters" className="btn btn-primary w-full">Apply Filters</button>

          {/* Divider */}
          <hr style={{ borderColor:"var(--color-border)", margin:"8px 0" }}/>

          {/* Stats */}
          <div>
            <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem", marginBottom:12 }}>Current View</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[["Total Incidents","4,821"],["Top Category","Theft (34%)"],["Density","High"]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>{l}</span>
                  <span className="stat-number text-sm" style={{ color:"var(--color-text-primary)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hotspots */}
          <div>
            <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem", marginBottom:12 }}>Top Hotspots (Pro)</p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {HOTSPOTS.map((h,i)=>(
                <button key={h.name} id={`hotspot-${i}`}
                  style={{ background:"var(--color-bg-tertiary)", border:"1px solid var(--color-border)", borderRadius:10, padding:"10px 12px",
                    textAlign:"left", cursor:"pointer", width:"100%" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                    <div>
                      <span className="stat-number text-xs" style={{ color:"var(--color-text-muted)" }}>#{i+1} </span>
                      <span style={{ color:"var(--color-text-primary)", fontSize:"0.8125rem", fontWeight:500 }}>{h.name}</span>
                    </div>
                    <RiskBadge score={h.score}/>
                  </div>
                  <p style={{ color:"var(--color-text-muted)", fontSize:"0.75rem", marginTop:4 }}>{h.count} incidents</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Map area */}
      <div style={{ flex:1, position:"relative", marginLeft: panelOpen ? 320 : 0, transition:"margin 0.3s" }}>
        {/* Panel toggle when closed */}
        {!panelOpen && (
          <button id="open-panel" onClick={()=>setPanelOpen(true)}
            style={{ position:"absolute", top:16, left:16, zIndex:10, background:"var(--color-bg-secondary)",
              border:"1px solid var(--color-border)", borderRadius:8, padding:"8px 12px", cursor:"pointer",
              display:"flex", alignItems:"center", gap:6 }}>
            <Filter className="h-4 w-4" style={{ color:"var(--color-accent-primary)" }}/>
            <span style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"0.875rem", color:"var(--color-text-primary)" }}>Filters</span>
          </button>
        )}

        {/* Map placeholder with animated heatmap effect */}
        <div style={{ position:"absolute", inset:0, background:"#0d1321", overflow:"hidden" }}>
          {/* Grid lines simulating map */}
          <div style={{ position:"absolute", inset:0, opacity:0.15,
            backgroundImage:"linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)",
            backgroundSize:"60px 60px" }}/>

          {/* Heatmap blobs */}
          {HOTSPOTS.map((h, i) => (
            <motion.div key={i}
              animate={{ scale:[1, 1.15, 1], opacity:[0.3, 0.5, 0.3] }}
              transition={{ duration:3+i, repeat:Infinity, ease:"easeInOut" }}
              style={{
                position:"absolute",
                width: 80 + h.score*20, height: 80 + h.score*20,
                borderRadius:"50%",
                background: h.score >= 8 ? "radial-gradient(circle, rgba(255,71,87,0.8), transparent)"
                           : h.score >= 6 ? "radial-gradient(circle, rgba(255,165,2,0.7), transparent)"
                           : "radial-gradient(circle, rgba(0,212,255,0.6), transparent)",
                left:`${10 + i*18}%`, top:`${20 + (i%3)*25}%`,
                filter:"blur(20px)", pointerEvents:"none"
              }}/>
          ))}

          {/* Hotspot pins */}
          {HOTSPOTS.map((h,i)=>(
            <div key={i} style={{ position:"absolute", left:`${10+i*18}%`, top:`${20+(i%3)*25}%`,
              transform:"translate(-50%,-50%)" }}>
              <div style={{ background:"var(--color-bg-secondary)", border:`1px solid ${h.score>=8?"#ff4757":h.score>=6?"#ffa502":"#00d4ff"}`,
                borderRadius:8, padding:"6px 10px", whiteSpace:"nowrap", display:"flex", flexDirection:"column", gap:2 }}>
                <span style={{ fontFamily:"var(--font-heading)", fontSize:"0.75rem", fontWeight:600, color:"var(--color-text-primary)" }}>{h.name}</span>
                <span className="stat-number" style={{ fontSize:"0.7rem", color:"var(--color-text-muted)" }}>{h.count} incidents</span>
              </div>
              <div style={{ width:8, height:8, borderRadius:"50%", margin:"2px auto 0",
                background: h.score>=8?"#ff4757":h.score>=6?"#ffa502":"#00d4ff" }}/>
            </div>
          ))}

          {/* Center label */}
          <div style={{ position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)",
            background:"rgba(10,14,26,0.85)", border:"1px solid var(--color-border)",
            borderRadius:12, padding:"10px 20px", backdropFilter:"blur(8px)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <MapIcon className="h-4 w-4" style={{ color:"var(--color-accent-primary)" }}/>
              <span style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"0.875rem" }}>
                Live Crime Heatmap — {city.toUpperCase()}
              </span>
            </div>
            <p style={{ color:"var(--color-text-muted)", fontSize:"0.75rem", marginTop:4, textAlign:"center" }}>
              Connect Mapbox token to activate interactive map
            </p>
          </div>
        </div>

        {/* Map controls */}
        <div style={{ position:"absolute", bottom:80, right:16, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
          {[<ZoomIn key="in" className="h-4 w-4"/>, <ZoomOut key="out" className="h-4 w-4"/>, <Layers key="layers" className="h-4 w-4"/>].map((icon,i)=>(
            <button key={i} id={`map-control-${i}`}
              style={{ width:36, height:36, background:"var(--color-bg-secondary)", border:"1px solid var(--color-border)",
                borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--color-text-secondary)" }}>
              {icon}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position:"absolute", bottom:24, right:16, background:"rgba(10,14,26,0.85)",
          border:"1px solid var(--color-border)", borderRadius:10, padding:"10px 14px", backdropFilter:"blur(8px)", zIndex:10 }}>
          <p style={{ color:"var(--color-text-muted)", fontSize:"0.75rem", marginBottom:8 }}>Risk Level</p>
          {[["#2ed573","Low"],["#ffa502","Medium"],["#ff6b35","High"],["#ff4757","Severe"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ width:12, height:12, borderRadius:3, background:c, display:"inline-block" }}/>
              <span style={{ fontSize:"0.75rem", color:"var(--color-text-secondary)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
