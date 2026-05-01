"use client";
import { motion } from "framer-motion";
import { Check, HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { paymentsApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const FAQS = [
  { q: "Can I change plans anytime?", a: "Yes. Upgrades take effect immediately. Downgrades apply at the end of your billing period." },
  { q: "Is there a free trial for Pro?", a: "Our Free plan is genuinely useful. We don't offer a time-limited trial but you can upgrade at any time." },
  { q: "How does the annual discount work?", a: "Annual billing saves 20% — equivalent to 2.4 months free. You're billed one lump sum per year." },
  { q: "What happens to my data if I cancel?", a: "Your account and saved alert rules remain for 30 days after cancellation. Crime data is public — re-subscribe any time." },
  { q: "Is there an API rate limit?", a: "Free: 100 req/day. Pro: 10,000 req/day. Enterprise: custom." },
  { q: "What payment methods do you accept?", a: "All major credit/debit cards via Stripe. Bank transfers available for Enterprise." },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const proPrice = billing === "monthly" ? 29 : Math.round(278 / 12);

  const handleUpgrade = async (plan: string) => {
    if (!user) { router.push("/signup?redirect=/pricing"); return; }
    if (plan === "enterprise") {
      const salesEmail = process.env.NEXT_PUBLIC_SALES_EMAIL;
      if (salesEmail) { window.location.href = `mailto:${salesEmail}`; }
      else { router.push("/contact?plan=enterprise"); }
      return;
    }
    setLoading(plan);
    try {
      const res = await paymentsApi.checkout({ plan, billing_cycle: billing });
      window.location.href = res.data.checkout_url;
    } catch { alert("Failed to start checkout. Please try again."); }
    finally { setLoading(null); }
  };

  const plans = [
    { id:"free", name:"Free", price:"$0", sub:"For researchers and curious citizens.", popular:false,
      color:"var(--color-border)", accent:"var(--color-text-primary)",
      features:["1,000 incidents/month","3 cities","Basic analytics","1 alert rule","CSV export (100 rows)"],
      cta: user?.plan === "free" ? "Current Plan" : "Get Started Free", href: user ? "/dashboard" : "/signup" },
    { id:"pro",  name:"Pro",  price:`$${proPrice}`, sub:"For planners, analysts and researchers.", popular:true,
      color:"var(--color-accent-primary)", accent:"var(--color-accent-primary)",
      features:["Unlimited incidents","All cities","ML hotspot detection","30-day forecasting","Anomaly alerts","5 alert rules","Export 50,000 rows","API access"],
      cta: user?.plan === "pro" ? "Current Plan" : "Start Pro →", href:null },
    { id:"enterprise", name:"Enterprise", price:"Custom", sub:"For government agencies.", popular:false,
      color:"rgba(124,58,237,0.5)", accent:"var(--color-accent-purple)",
      features:["Everything in Pro","Unlimited alerts","5-year data history","SLA guarantee","Custom ML training","SSO / SAML"],
      cta: "Contact Sales →", href:null },
  ];

  return (
    <div className="min-h-screen" style={{ background:"var(--color-bg-primary)", color:"var(--color-text-primary)" }}>
      <nav style={{ borderBottom:"1px solid var(--color-border)", padding:"0 24px" }}
           className="flex items-center justify-between h-16 max-w-6xl mx-auto">
        <Link href="/" style={{ fontFamily:"var(--font-heading)", fontWeight:700, fontSize:"1.25rem", color:"var(--color-accent-primary)" }}>CrimeScope</Link>
        <div className="flex gap-3">
          {user ? <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                : <><Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                    <Link href="/signup" className="btn btn-primary btn-sm">Get Started</Link></>}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center mb-12">
          <h1 style={{ fontFamily:"var(--font-heading)", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:700, letterSpacing:"-0.02em" }}>
            Straightforward Pricing
          </h1>
          <p style={{ color:"var(--color-text-secondary)", marginTop:"0.75rem", fontSize:"1.125rem" }}>
            Start free. Upgrade when you need deeper insights.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {["monthly","annual"].map(b => (
            <button key={b} id={`billing-${b}`}
              onClick={() => setBilling(b as "monthly"|"annual")}
              style={{ padding:"6px 20px", borderRadius:99, border:"1px solid var(--color-border)", cursor:"pointer",
                       background: billing===b ? "var(--color-accent-primary)" : "transparent",
                       color: billing===b ? "#0a0e1a" : "var(--color-text-secondary)",
                       fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"0.875rem" }}>
              {b === "annual" ? "Annual (20% off)" : "Monthly"}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{opacity:0,y:24}} animate={{opacity:1,y:0,transition:{delay:i*0.1}}}
              className="card flex flex-col relative"
              style={{ borderColor:plan.color, boxShadow: plan.popular ? "0 0 40px rgba(0,212,255,0.1)" : undefined }}>
              {plan.popular && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                  background:"var(--color-accent-primary)", color:"#0a0e1a", padding:"3px 16px",
                  borderRadius:99, fontSize:"0.75rem", fontWeight:700, fontFamily:"var(--font-heading)", whiteSpace:"nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <h2 style={{ fontFamily:"var(--font-heading)", fontWeight:600, fontSize:"1.125rem", color:plan.accent, marginBottom:8 }}>{plan.name}</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="stat-number" style={{ fontSize:"2.25rem" }}>{plan.price}</span>
                {plan.id !== "enterprise" && <span style={{ color:"var(--color-text-muted)" }}>/mo</span>}
              </div>
              {plan.id === "pro" && billing === "annual" && (
                <p style={{ color:"var(--color-accent-safe)", fontSize:"0.8125rem", marginBottom:8 }}>Billed $278/yr — save $70</p>
              )}
              <p style={{ color:"var(--color-text-secondary)", fontSize:"0.875rem", marginBottom:24 }}>{plan.sub}</p>
              <ul className="space-y-2 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color:plan.accent }} />
                    <span style={{ color:"var(--color-text-secondary)", fontSize:"0.9375rem" }}>{f}</span>
                  </li>
                ))}
              </ul>
              {plan.href
                ? <Link href={plan.href} id={`cta-${plan.id}`} className="btn btn-ghost w-full text-center"
                    style={{ border:"1px solid var(--color-border)" }}>{plan.cta}</Link>
                : <button id={`cta-${plan.id}`} disabled={!!loading || user?.plan === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                    className={plan.id === "pro" ? "btn btn-primary w-full" : "btn w-full"}
                    style={plan.id === "enterprise" ? { background:"rgba(124,58,237,0.15)", color:"var(--color-accent-purple)", border:"1px solid rgba(124,58,237,0.4)" } : { opacity: loading===plan.id ? 0.7 : 1 }}>
                    {loading === plan.id ? "Redirecting…" : plan.cta}
                  </button>
              }
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <motion.div key={i} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
              className="card">
              <div className="flex gap-3">
                <HelpCircle className="h-5 w-5 flex-shrink-0" style={{ color:"var(--color-accent-primary)" }} />
                <div>
                  <p style={{ fontFamily:"var(--font-heading)", fontWeight:600, marginBottom:6 }}>{faq.q}</p>
                  <p style={{ color:"var(--color-text-secondary)", fontSize:"0.9375rem", lineHeight:1.6 }}>{faq.a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
