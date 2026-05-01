"use client";

import Link from "next/link";
import { Shield, ChevronDown, ChevronUp, Mail, ExternalLink } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Get Started Free' on the homepage or go to /signup. You can sign up with your email or continue with Google. Email verification is required before accessing the dashboard.",
      },
      {
        q: "Do I need to verify my email?",
        a: "Yes. After signup, we send a verification link to your email. Click it to activate your account. The link expires after 24 hours — request a new one from the login page if needed.",
      },
      {
        q: "Is there a free plan?",
        a: "Yes! The Free plan gives you access to crime data for 3 cities, basic analytics, and 1 alert rule with no credit card required. It's permanently free.",
      },
    ],
  },
  {
    category: "Data & Maps",
    items: [
      {
        q: "Where does the crime data come from?",
        a: "All data is sourced from official government open data portals: Chicago Data Portal, NYC OpenData, and the LA GeoHub. Data is refreshed periodically. We do not create or modify the underlying records.",
      },
      {
        q: "How current is the data?",
        a: "Data is ingested daily. There is typically a 24–72 hour lag between when an incident is reported and when it appears on CrimeScope, as this depends on when government agencies publish their feeds.",
      },
      {
        q: "Can I use CrimeScope data for law enforcement?",
        a: "No. CrimeScope is a research and awareness tool only. The data must not be used for law enforcement, predictive policing, profiling, or any purpose that could discriminate against individuals or communities.",
      },
      {
        q: "How accurate is the crime data?",
        a: "CrimeScope displays data as provided by government sources. We do not guarantee accuracy, completeness, or timeliness. Always cross-reference with official sources for critical decisions.",
      },
    ],
  },
  {
    category: "Subscriptions & Billing",
    items: [
      {
        q: "What does Pro include?",
        a: "Pro gives you access to all cities, unlimited data access (10,000 req/day), advanced analytics, ML hotspot predictions, anomaly detection, unlimited alert rules, and CSV/PDF export.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Cancel from Settings → Billing. You keep Pro access until the end of your billing period, then automatically move to the Free plan. No cancellation fees.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes — within 7 days of initial purchase if you haven't used Pro features. Email vibecodeproject2026@gmail.com. Annual plans are prorated for unused months.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. All payments are processed by Stripe — we never see or store your card number. Stripe is PCI DSS Level 1 certified.",
      },
    ],
  },
  {
    category: "Account & Privacy",
    items: [
      {
        q: "How do I reset my password?",
        a: "Go to /login and click 'Forgot password?'. Enter your email and we'll send a reset link valid for 15 minutes.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete Account. All personal data is removed within 30 days. This action is irreversible.",
      },
      {
        q: "What data does CrimeScope store about me?",
        a: "We store your email, name, and hashed password (or Google ID). We may store your crime query history to personalise your experience. See our Privacy Policy for full details.",
      },
    ],
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
          <Shield size={20} />
          CrimeScope
        </Link>
        <span className="text-[#475569] text-sm ml-2">/ Help & FAQ</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Help & FAQ</h1>
        <p className="text-[#94a3b8] mb-10">
          Can&apos;t find what you need? Email us at{" "}
          <a href="mailto:vibecodeproject2026@gmail.com" className="text-[#00d4ff] hover:underline">
            vibecodeproject2026@gmail.com
          </a>
        </p>

        {FAQS.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-lg font-semibold text-[#00d4ff] mb-4">{section.category}</h2>
            <div className="space-y-2">
              {section.items.map((faq) => {
                const id = `${section.category}-${faq.q}`;
                const isOpen = open === id;
                return (
                  <div key={id} className="border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpen(isOpen ? null : id)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left text-[#e2e8f0] hover:bg-white/5 transition-colors"
                    >
                      <span className="font-medium">{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-[#00d4ff] shrink-0" /> : <ChevronDown size={16} className="text-[#64748b] shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-[#94a3b8] text-sm leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-12 rounded-2xl border border-[#00d4ff]/20 bg-[#00d4ff]/5 p-8 text-center">
          <Mail size={32} className="text-[#00d4ff] mx-auto mb-3" />
          <h3 className="text-white font-semibold text-lg mb-2">Still need help?</h3>
          <p className="text-[#94a3b8] text-sm mb-4">Our team typically responds within 24 hours on business days.</p>
          <a
            href="mailto:vibecodeproject2026@gmail.com"
            className="inline-flex items-center gap-2 bg-[#00d4ff] text-[#0a0e1a] font-bold px-6 py-3 rounded-lg hover:bg-[#00d4ff]/90 transition-colors"
          >
            <Mail size={16} />
            Email Support
          </a>
          <div className="mt-4">
            <Link href="/contact" className="inline-flex items-center gap-1 text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">
              Or use our contact form <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 mt-8 text-center text-[#475569] text-sm">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
          <Link href="/privacy" className="hover:text-[#00d4ff] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#00d4ff] transition-colors">Terms of Service</Link>
          <Link href="/help" className="hover:text-[#00d4ff] transition-colors">Help</Link>
          <Link href="/pricing" className="hover:text-[#00d4ff] transition-colors">Pricing</Link>
        </div>
        <p>© {new Date().getFullYear()} CrimeScope. Crime data sourced from public government records.</p>
      </footer>
    </div>
  );
}
