"use client";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, MapPin } from "lucide-react";
import { useState } from "react";
import { usersApi } from "@/lib/api";

const CATEGORIES = ["THEFT","ASSAULT","BURGLARY","ROBBERY","VANDALISM","MOTOR VEHICLE THEFT","NARCOTICS"];

interface Alert { id:string; name:string; city:string; district:string; categories:string[]; threshold:number; window_days:number; is_active:boolean; }

const DEMO: Alert[] = [
  { id:"1", name:"Loop Theft Watch",    city:"chicago", district:"Loop",      categories:["THEFT"],          threshold:10, window_days:7, is_active:true },
  { id:"2", name:"Citywide Assault",    city:"chicago", district:"All",       categories:["ASSAULT"],        threshold:25, window_days:7, is_active:true },
  { id:"3", name:"West Side Monitor",   city:"chicago", district:"Near West", categories:["ROBBERY","THEFT"],threshold:8,  window_days:3, is_active:false },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(DEMO);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:"", city:"chicago", district:"All", categories:[] as string[], threshold:10, window_days:7 });

  const toggle = (id:string) => setAlerts(a=>a.map(x=>x.id===id ? {...x, is_active:!x.is_active} : x));
  const remove = (id:string) => setAlerts(a=>a.filter(x=>x.id!==id));

  const toggleCat = (cat:string) => setForm(f=>({ ...f, categories: f.categories.includes(cat) ? f.categories.filter(c=>c!==cat) : [...f.categories, cat] }));

  const create = () => {
    if (!form.name || form.categories.length===0) return;
    const newAlert: Alert = { ...form, id: Date.now().toString(), is_active:true };
    setAlerts(a=>[...a, newAlert]);
    setShowModal(false);
    setForm({ name:"", city:"chicago", district:"All", categories:[], threshold:10, window_days:7 });
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:"var(--font-heading)", fontSize:"1.5rem", fontWeight:700 }}>Alert Rules</h1>
          <p style={{ color:"var(--color-text-muted)", fontSize:"0.875rem" }}>Get notified when crime spikes in your tracked areas</p>
        </div>
        <button id="create-alert-btn" onClick={()=>setShowModal(true)} className="btn btn-primary" style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Plus className="h-4 w-4"/> Create Alert
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.map(alert=>(
          <motion.div key={alert.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="card"
            style={{ borderColor: alert.is_active ? "rgba(0,212,255,0.2)" : "var(--color-border)", opacity: alert.is_active ? 1 : 0.6 }}>
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="h-4 w-4" style={{ color: alert.is_active ? "var(--color-accent-primary)" : "var(--color-text-muted)" }}/>
                  <span style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>{alert.name}</span>
                  <span className={`badge ${alert.is_active ? "badge-safe" : "badge-neutral"}`}>
                    {alert.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3" style={{ fontSize:"0.8125rem", color:"var(--color-text-muted)" }}>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/>{alert.city} • {alert.district}</span>
                  <span>When &gt; {alert.threshold} incidents in {alert.window_days}d</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {alert.categories.map(c=>(
                    <span key={c} className="badge badge-neutral" style={{ fontSize:"0.75rem" }}>{c}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={()=>toggle(alert.id)} id={`toggle-alert-${alert.id}`}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-accent-primary)" }}>
                  {alert.is_active ? <ToggleRight className="h-6 w-6"/> : <ToggleLeft className="h-6 w-6" style={{ color:"var(--color-text-muted)" }}/>}
                </button>
                <button onClick={()=>remove(alert.id)} id={`delete-alert-${alert.id}`}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"var(--color-text-muted)", padding:4 }}>
                  <Trash2 className="h-4 w-4"/>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {alerts.length===0 && (
          <div className="card text-center py-12" style={{ borderStyle:"dashed" }}>
            <Bell className="h-8 w-8 mx-auto mb-3" style={{ color:"var(--color-text-muted)" }}/>
            <p style={{ color:"var(--color-text-muted)" }}>No alert rules yet. Create one to get notified of spikes.</p>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, padding:16 }}>
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="card" style={{ width:"100%", maxWidth:480, borderColor:"rgba(0,212,255,0.2)" }}>
            <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"1.125rem", marginBottom:24 }}>Create Alert Rule</h2>
            <div className="space-y-4">
              <div>
                <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>Alert Name</label>
                <input id="alert-name-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                  placeholder="e.g. Loop Theft Watch" className="input" style={{ width:"100%", boxSizing:"border-box" }}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>City</label>
                  <select id="alert-city" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="input" style={{ width:"100%" }}>
                    {["chicago","nyc","la"].map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>District</label>
                  <input id="alert-district" value={form.district} onChange={e=>setForm({...form,district:e.target.value})} className="input" style={{ width:"100%" }}/>
                </div>
              </div>
              <div>
                <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:8 }}>Categories</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat=>(
                    <button key={cat} id={`cat-${cat}`} type="button" onClick={()=>toggleCat(cat)}
                      style={{ padding:"4px 12px", borderRadius:99, border:"1px solid", cursor:"pointer", fontSize:"0.8125rem", fontFamily:"var(--font-heading)",
                        borderColor: form.categories.includes(cat) ? "var(--color-accent-primary)" : "var(--color-border)",
                        background: form.categories.includes(cat) ? "rgba(0,212,255,0.12)" : "transparent",
                        color: form.categories.includes(cat) ? "var(--color-accent-primary)" : "var(--color-text-muted)" }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>Alert when &gt;</label>
                  <input id="alert-threshold" type="number" value={form.threshold} onChange={e=>setForm({...form,threshold:+e.target.value})}
                    className="input" style={{ width:"100%" }} min={1}/>
                </div>
                <div>
                  <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>Within (days)</label>
                  <select id="alert-window" value={form.window_days} onChange={e=>setForm({...form,window_days:+e.target.value})} className="input" style={{ width:"100%" }}>
                    {[1,3,7,14,30].map(d=><option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button id="cancel-alert" onClick={()=>setShowModal(false)} className="btn btn-ghost">Cancel</button>
              <button id="submit-alert" onClick={create} className="btn btn-primary">Create Alert</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
