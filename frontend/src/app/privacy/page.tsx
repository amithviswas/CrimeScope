"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
          <Shield size={20} />
          CrimeScope
        </Link>
        <span className="text-[#475569] text-sm ml-2">/ Privacy Policy</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-[#64748b] text-sm mb-10">Last updated: May 1, 2025</p>

        <Section title="1. What We Collect">
          <p>When you use CrimeScope, we may collect the following information:</p>
          <ul>
            <li><strong>Account data:</strong> Email address, full name, and hashed password (or OAuth provider ID if you sign in with Google).</li>
            <li><strong>Usage analytics:</strong> Pages visited, features used, filters applied, and session duration — collected via PostHog only after you give consent.</li>
            <li><strong>Crime query history:</strong> City, date range, and category filters you apply within the app, stored to personalise your experience.</li>
            <li><strong>Payment data:</strong> Billing is handled entirely by Stripe. We never store raw card numbers. We receive only a Stripe customer ID and subscription status.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Data">
          <ul>
            <li>To authenticate you and maintain your session.</li>
            <li>To process subscription payments via Stripe.</li>
            <li>To send transactional emails (account verification, password reset) via Resend.</li>
            <li>To send anomaly alert emails you have explicitly subscribed to.</li>
            <li>To improve the product using aggregated, anonymised analytics.</li>
          </ul>
        </Section>

        <Section title="3. Third-Party Services">
          <p>CrimeScope uses the following third-party services, each governed by their own privacy policies:</p>
          <ul>
            <li><strong>Stripe</strong> — payment processing (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">stripe.com/privacy</a>)</li>
            <li><strong>Resend</strong> — transactional email (<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">resend.com/legal/privacy-policy</a>)</li>
            <li><strong>PostHog</strong> — product analytics, only after consent (<a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">posthog.com/privacy</a>)</li>
            <li><strong>Sentry</strong> — error monitoring (<a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">sentry.io/privacy</a>)</li>
            <li><strong>Mapbox</strong> — map tiles and geocoding (<a href="https://www.mapbox.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] hover:underline">mapbox.com/legal/privacy</a>)</li>
          </ul>
        </Section>

        <Section title="4. Data Retention">
          <ul>
            <li>Account data is retained as long as your account is active.</li>
            <li>If you delete your account, all personal data is deleted within 30 days.</li>
            <li>Analytics events are retained for 12 months then automatically deleted.</li>
            <li>Payment records are retained for 7 years as required by financial regulations.</li>
          </ul>
        </Section>

        <Section title="5. Your Rights (GDPR / CCPA)">
          <p>Depending on your location, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data.</li>
            <li><strong>Rectification:</strong> Correct inaccurate data.</li>
            <li><strong>Erasure:</strong> Request deletion of your account and associated data.</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format.</li>
            <li><strong>Opt-out:</strong> Withdraw consent for analytics at any time via the cookie banner.</li>
          </ul>
          <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:vibecodeproject2026@gmail.com" className="text-[#00d4ff] hover:underline">vibecodeproject2026@gmail.com</a>.</p>
        </Section>

        <Section title="6. Cookies">
          <p>We use the following cookies:</p>
          <ul>
            <li><strong>Session cookies</strong> (httpOnly, required) — authenticate your login session.</li>
            <li><strong>Analytics cookies</strong> (optional, PostHog) — only set after you accept the cookie consent banner.</li>
          </ul>
          <p className="mt-3">You may decline analytics cookies without affecting core functionality.</p>
        </Section>

        <Section title="7. Security">
          <p>Passwords are hashed with bcrypt. All API communication uses HTTPS. JWT tokens are stored in httpOnly cookies and are never accessible to JavaScript. We undergo no automated security scanning at this time but follow security best practices throughout the codebase.</p>
        </Section>

        <Section title="8. Contact">
          <p>For privacy-related questions or data requests, contact:<br />
            <a href="mailto:vibecodeproject2026@gmail.com" className="text-[#00d4ff] hover:underline">vibecodeproject2026@gmail.com</a>
          </p>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-[#00d4ff] mb-4">{title}</h2>
      <div className="text-[#94a3b8] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-[#00d4ff]">
        {children}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 mt-16 text-center text-[#475569] text-sm">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
        <Link href="/privacy" className="hover:text-[#00d4ff] transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-[#00d4ff] transition-colors">Terms of Service</Link>
        <Link href="/help" className="hover:text-[#00d4ff] transition-colors">Help</Link>
        <Link href="/pricing" className="hover:text-[#00d4ff] transition-colors">Pricing</Link>
      </div>
      <p>© {new Date().getFullYear()} CrimeScope. Crime data sourced from public government records.</p>
    </footer>
  );
}
