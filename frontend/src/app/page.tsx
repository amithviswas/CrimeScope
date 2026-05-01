"use client";

import Link from "next/link";
import { ArrowRight, BarChart2, Bell, Map, Shield, TrendingUp, Zap } from "lucide-react";

// ── CrimeScope Logo SVG ────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 2L4 7v9c0 7.18 5.14 13.89 12 15.93C23.86 29.89 29 23.18 29 16V7L16 2z"
        fill="none" stroke="#00d4ff" strokeWidth="1.5" />
      <polyline points="8,16 11,12 14,18 17,10 20,16 23,14"
        fill="none" stroke="#00d4ff" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass" id="main-nav">
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <LogoMark />
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
          CrimeScope
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        {[["Features", "#features"], ["Map", "#map-preview"], ["Pricing", "/pricing"]].map(([label, href]) => (
          <Link key={label} href={href} className="text-sm no-underline"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}>
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="btn btn-ghost btn-sm" id="nav-signin">Sign In</Link>
        <Link href="/signup" className="btn btn-primary btn-sm" id="nav-get-started">Get Started →</Link>
      </div>
    </nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{ background: "var(--color-bg-primary)" }}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
        backgroundSize: "48px 48px"
      }} />
      {/* Glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)" }} />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent-primary)" }} />
          <span className="text-sm" style={{ color: "var(--color-accent-primary)", fontFamily: "var(--font-body)" }}>
            Now tracking 50+ cities
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(2.5rem, 6vw, 3.5rem)", letterSpacing: "-0.02em", color: "var(--color-text-primary)", lineHeight: 1.1, marginBottom: "1.5rem" }}>
          Turn Public Safety Data into{" "}
          <span style={{ color: "var(--color-accent-primary)" }}>Actionable Intelligence</span>
        </h1>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "1.125rem", color: "var(--color-text-secondary)", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto 2.5rem" }}>
          Real-time crime analytics powered by ML — for city planners, researchers, and community leaders.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/signup" className="btn btn-primary btn-lg" id="hero-cta-start">
            Start Free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="btn btn-secondary btn-lg" id="hero-cta-demo">
            View Live Demo
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, var(--color-bg-primary), transparent)" }} />
    </section>
  );
}

// ── Stats Bar ───────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "3M+",    label: "Incidents Tracked" },
    { value: "50+",    label: "Cities Covered" },
    { value: "99.9%",  label: "Platform Uptime" },
    { value: "< 2s",   label: "ML Prediction Latency" },
  ];
  return (
    <section style={{ background: "var(--color-bg-secondary)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-layout mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="stat-number text-3xl mb-1" style={{ color: "var(--color-accent-primary)" }}>{value}</div>
            <div className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Map,       title: "Interactive Crime Maps",       desc: "Mapbox-powered heatmaps, cluster markers, and hotspot overlays updated in real time from city data portals." },
  { icon: BarChart2, title: "Deep Analytics",               desc: "Time patterns, district comparisons, category deep dives — sliceable by date, geography, and crime type." },
  { icon: Zap,       title: "ML Hotspot Prediction",        desc: "DBSCAN clustering and Prophet forecasting identify emerging risk zones before incidents spike." },
  { icon: Bell,      title: "Configurable Alerts",          desc: "Set thresholds per district and category. Get notified by email when anomalies exceed your defined limits." },
  { icon: TrendingUp,title: "Trend Forecasting",            desc: "7-day and 30-day predictions with confidence bands. Compare actuals vs forecasts by district and category." },
  { icon: Shield,    title: "Anomaly Detection",            desc: "Isolation Forest flags statistically unusual spikes in real time — before they become patterns." },
];

function Features() {
  return (
    <section id="features" className="py-24" style={{ background: "var(--color-bg-primary)" }}>
      <div className="max-w-layout mx-auto px-6">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "2.25rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            Everything you need to understand urban safety
          </h2>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "560px", margin: "0 auto" }}>
            From raw city data to ML-powered predictions — all in one platform.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card group">
              <div className="p-2.5 rounded-lg w-fit mb-4" style={{ background: "rgba(0,212,255,0.08)" }}>
                <Icon className="h-5 w-5" style={{ color: "var(--color-accent-primary)" }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.0625rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                {title}
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Map Preview placeholder ─────────────────────────────────────────────────
function MapPreview() {
  return (
    <section id="map-preview" style={{ background: "var(--color-bg-secondary)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-layout mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
            Interactive Crime Map
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>Explore real incident data across the city.</p>
        </div>
        <div className="rounded-card overflow-hidden relative" style={{ height: "420px", background: "var(--color-bg-tertiary)", border: "1px solid var(--color-border)" }}>
          {/* Map placeholder — replaced in Phase 5 with Mapbox */}
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
            <Map className="h-12 w-12" style={{ color: "var(--color-border)" }} />
            <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Interactive map loads in Phase 5
            </p>
            <Link href="/map" className="btn btn-secondary btn-sm" id="map-preview-cta">
              View Full Map →
            </Link>
          </div>
          {/* Decorative heatmap dots */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="absolute w-3 h-3 rounded-full opacity-30"
              style={{
                background: i % 3 === 0 ? "var(--color-accent-danger)" : i % 3 === 1 ? "var(--color-accent-warning)" : "var(--color-accent-primary)",
                left: `${10 + (i * 17) % 80}%`, top: `${15 + (i * 23) % 70}%`,
                filter: "blur(6px)",
              }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", title: "Data Ingestion",    desc: "We pull from 50+ city open data APIs daily — Chicago Data Portal, NYC OpenData, and more. Every incident, verified and geocoded." },
  { num: "02", title: "ML Processing",    desc: "DBSCAN clusters hotspots. Prophet forecasts trends. Isolation Forest flags anomalies. All models retrain automatically." },
  { num: "03", title: "Actionable Insight", desc: "See the results in real-time dashboards, interactive maps, and configurable alerts — so you act on facts, not guesses." },
];

function HowItWorks() {
  return (
    <section className="py-24" style={{ background: "var(--color-bg-primary)" }}>
      <div className="max-w-layout mx-auto px-6">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "2.25rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
            How CrimeScope Works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px" style={{ background: "var(--color-border)" }} />
          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 mb-6 stat-number text-xl"
                style={{ borderColor: "var(--color-accent-primary)", color: "var(--color-accent-primary)", background: "rgba(0,212,255,0.06)" }}>
                {num}
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>{title}</h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Dr. Sarah Mendez", role: "Urban Policy Researcher, UChicago", quote: "CrimeScope gives us the kind of granular temporal analysis that used to take weeks of manual data wrangling. The ML forecasting is genuinely useful for grant proposals." },
  { name: "Marcus Obi",       role: "Director of Analytics, Chicago PD", quote: "The hotspot prediction identified a cluster two weeks before we saw a spike in the reports. That kind of lead time changes how we allocate resources." },
  { name: "Priya Nair",       role: "Civic Data Journalist, The Tribune",  quote: "I use CrimeScope every time I need to verify a trend before publishing. The district comparison view and export feature save hours every week." },
];

function Testimonials() {
  return (
    <section className="py-24" style={{ background: "var(--color-bg-secondary)", borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-layout mx-auto px-6">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
            Used by researchers, planners, and journalists
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, quote }) => (
            <div key={name} className="card">
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                &ldquo;{quote}&rdquo;
              </p>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{name}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem", marginTop: "2px" }}>{role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Preview ──────────────────────────────────────────────────────────
const PLANS = [
  { name: "Free",       price: "$0",  period: "/mo", features: ["1 city", "90-day history", "Basic map", "Community support"], cta: "Get Started", href: "/signup", highlight: false },
  { name: "Pro",        price: "$29", period: "/mo", features: ["5 cities", "2-year history", "ML predictions", "5 alerts", "CSV/JSON exports", "Email support"], cta: "Start Pro", href: "/signup?plan=pro", highlight: true },
  { name: "Enterprise", price: "Custom", period: "", features: ["Unlimited cities", "5-year history", "All ML features", "Unlimited alerts", "API access", "Dedicated support"], cta: "Contact Us", href: "mailto:sales@crimescope.io", highlight: false },
];

function PricingPreview() {
  return (
    <section className="py-24" style={{ background: "var(--color-bg-primary)" }}>
      <div className="max-w-layout mx-auto px-6">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
            Simple, transparent pricing
          </h2>
          <Link href="/pricing" style={{ color: "var(--color-accent-primary)", fontSize: "0.9375rem" }}>
            See full comparison →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(({ name, price, period, features, cta, href, highlight }) => (
            <div key={name} className="card relative"
              style={highlight ? { borderColor: "var(--color-accent-primary)", boxShadow: "0 0 20px rgba(0,212,255,0.08)" } : {}}>
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-info px-4">Most Popular</span>
                </div>
              )}
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>{name}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="stat-number text-4xl" style={{ color: highlight ? "var(--color-accent-primary)" : "var(--color-text-primary)" }}>{price}</span>
                <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>{period}</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "var(--color-accent-safe)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={href} className={`btn w-full justify-center ${highlight ? "btn-primary" : "btn-secondary"}`}
                id={`pricing-cta-${name.toLowerCase()}`}>
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ background: "var(--color-bg-secondary)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}>
      <div className="max-w-layout mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            Turn open data into safer cities.
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>No credit card required. Free tier available.</p>
        </div>
        <Link href="/signup" className="btn btn-primary btn-lg flex-shrink-0" id="cta-banner-btn">
          Start for free today <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "var(--color-bg-primary)", borderTop: "1px solid var(--color-border)" }}>
      <div className="max-w-layout mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <LogoMark />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--color-text-primary)" }}>CrimeScope</span>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>Urban Safety Intelligence — Powered by Data.</p>
          </div>
          {[
            { title: "Product", links: [["Dashboard", "/dashboard"], ["Crime Map", "/map"], ["Analytics", "/analytics"], ["Pricing", "/pricing"]] },
            { title: "Resources", links: [["Documentation", "/docs"], ["API Reference", "/api"], ["Status", "/status"], ["Changelog", "/changelog"]] },
            { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/cookies"]] },
          ].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.875rem", color: "var(--color-text-primary)", marginBottom: "1rem" }}>{title}</div>
              <ul className="space-y-2">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="no-underline text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--color-border)" }}>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
            © 2024 CrimeScope. All rights reserved.
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
            Built with open government data.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Page Export ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main style={{ background: "var(--color-bg-primary)" }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <MapPreview />
      <HowItWorks />
      <Testimonials />
      <PricingPreview />
      <CTABanner />
      <Footer />
    </main>
  );
}
