"use client";
import { motion } from "framer-motion";
import { CreditCard, Key, LogOut, Shield, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { paymentsApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const TABS = [
  { id:"profile",  label:"Profile",      icon:User },
  { id:"security", label:"Security",     icon:Key },
  { id:"billing",  label:"Billing",      icon:CreditCard },
];

function PlanBadge({ plan }: { plan:string }) {
  const colors: Record<string,string> = { free:"badge-neutral", pro:"badge-info", enterprise:"badge-safe" };
  return <span className={`badge ${colors[plan]??""}`} style={{ fontFamily:"var(--font-heading)", fontWeight:600 }}>{plan.toUpperCase()}</span>;
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tab, setTab]           = useState("profile");
  const [name, setName]         = useState(user?.full_name ?? "");
  const [email, setEmail]       = useState(user?.email ?? "");
  const [pw, setPw]             = useState({ current:"", next:"", confirm:"" });
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);

  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.portal();
      window.location.href = res.data.portal_url;
    } catch { alert("Could not open billing portal. Please try again."); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); router.push("/login"); };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6 page-transition" style={{ maxWidth:720 }}>
      <h1 style={{ fontFamily:"var(--font-heading)", fontSize:"1.5rem", fontWeight:700 }}>Settings</h1>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background:"var(--color-bg-secondary)", display:"inline-flex" }}>
        {TABS.map(t=>(
          <button key={t.id} id={`settings-tab-${t.id}`} onClick={()=>setTab(t.id)}
            style={{ padding:"8px 16px", borderRadius:10, border:"none", cursor:"pointer",
              background: tab===t.id ? "var(--color-accent-primary)" : "transparent",
              color: tab===t.id ? "#0a0e1a" : "var(--color-text-secondary)",
              fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"0.875rem",
              display:"flex", alignItems:"center", gap:6 }}>
            <t.icon className="h-4 w-4"/>{t.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === "profile" && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="card space-y-6">
          <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"1.125rem" }}>Profile Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>Full Name</label>
              <input id="profile-name" value={name} onChange={e=>setName(e.target.value)} className="input" style={{ width:"100%", boxSizing:"border-box" }}/>
            </div>
            <div>
              <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>Email</label>
              <input id="profile-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} className="input" style={{ width:"100%", boxSizing:"border-box" }}/>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem" }}>Current plan:</span>
            <PlanBadge plan={user?.plan ?? "free"}/>
          </div>
          <button id="save-profile" onClick={save} className="btn btn-primary">
            {saved ? "✓ Saved" : "Save Changes"}
          </button>
        </motion.div>
      )}

      {/* Security */}
      {tab === "security" && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="card space-y-4">
            <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"1.125rem" }}>Change Password</h2>
            {[["Current password","current","password"],["New password","next","password"],["Confirm new password","confirm","password"]].map(([label,field])=>(
              <div key={field}>
                <label style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", display:"block", marginBottom:6 }}>{label}</label>
                <input id={`pw-${field}`} type="password" value={pw[field as keyof typeof pw]}
                  onChange={e=>setPw({...pw,[field]:e.target.value})}
                  className="input" style={{ width:"100%", boxSizing:"border-box" }}/>
              </div>
            ))}
            <button id="save-password" className="btn btn-primary">Update Password</button>
          </div>

          <div className="card" style={{ borderColor:"rgba(255,71,87,0.2)" }}>
            <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"1.125rem", marginBottom:8 }}>Danger Zone</h2>
            <p style={{ color:"var(--color-text-muted)", fontSize:"0.875rem", marginBottom:16 }}>Sign out of your CrimeScope account.</p>
            <button id="logout-btn" onClick={handleLogout} className="btn btn-danger flex items-center gap-2">
              <LogOut className="h-4 w-4"/> Sign Out
            </button>
          </div>
        </motion.div>
      )}

      {/* Billing */}
      {tab === "billing" && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4">
          <div className="card">
            <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"1.125rem", marginBottom:16 }}>Subscription</h2>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div>
                <p style={{ color:"var(--color-text-muted)", fontSize:"0.8125rem" }}>Current plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <PlanBadge plan={user?.plan ?? "free"}/>
                </div>
              </div>
              {user?.plan === "free" && (
                <a href="/pricing" className="btn btn-primary btn-sm">Upgrade to Pro →</a>
              )}
            </div>
            {user?.plan !== "free" && (
              <button id="manage-billing-btn" onClick={handlePortal} disabled={loading} className="btn btn-ghost"
                style={{ border:"1px solid var(--color-border)" }}>
                {loading ? "Loading…" : "Manage Billing →"}
              </button>
            )}
          </div>

          {user?.plan !== "free" && (
            <div className="card" style={{ borderColor:"rgba(255,71,87,0.2)" }}>
              <h3 style={{ fontFamily:"var(--font-heading)", fontWeight:600, marginBottom:8 }}>Cancel Subscription</h3>
              <p style={{ color:"var(--color-text-muted)", fontSize:"0.875rem", marginBottom:16 }}>
                Your plan will remain active until the end of the billing period.
              </p>
              <button id="cancel-subscription-btn" onClick={handlePortal}
                className="btn btn-danger">Cancel Subscription</button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
