"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
          <Shield size={20} />
          CrimeScope
        </Link>
        <span className="text-[#475569] text-sm ml-2">/ Terms of Service</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-[#64748b] text-sm mb-10">Last updated: May 1, 2025</p>

        <Section title="1. Acceptance of Terms">
          <p>By creating a CrimeScope account or accessing any part of the service, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>CrimeScope is a public safety analytics platform that aggregates publicly available crime incident data from government sources and presents it through interactive maps, charts, and machine learning insights. CrimeScope is a data visualisation tool, <strong>not a law enforcement service</strong>.</p>
        </Section>

        <Section title="3. Data Disclaimer">
          <div className="border border-amber-500/30 bg-amber-500/10 rounded-lg p-4 text-amber-200 text-sm">
            <strong>Important:</strong> All crime data displayed on CrimeScope is sourced from public government records (Chicago Data Portal, NYC OpenData, LA GeoHub, etc.). CrimeScope does not guarantee the accuracy, completeness, or timeliness of this data. This platform is intended for research, journalism, and urban planning purposes only. <strong>It must not be used for law enforcement, profiling, or any purpose that may discriminate against individuals or communities.</strong>
          </div>
        </Section>

        <Section title="4. Acceptable Use Policy">
          <p>You agree NOT to:</p>
          <ul>
            <li>Use CrimeScope data to target, profile, surveil, or discriminate against any individual or group.</li>
            <li>Attempt to identify specific individuals from aggregate crime data.</li>
            <li>Scrape, bulk-download, or resell CrimeScope data without written permission.</li>
            <li>Reverse-engineer, decompile, or attempt to extract the source code.</li>
            <li>Use the service for any unlawful purpose.</li>
            <li>Share your account credentials with third parties.</li>
            <li>Use automated bots to access the API beyond your plan rate limits.</li>
          </ul>
        </Section>

        <Section title="5. Subscription Plans">
          <p><strong>Free Plan:</strong> Access to basic features with rate limits. No credit card required. Free forever.</p>
          <p className="mt-2"><strong>Pro Plan:</strong> Full access to analytics, ML predictions, anomaly detection, and export. Billed monthly or annually via Stripe.</p>
          <p className="mt-4">Subscriptions automatically renew at the end of each billing period. You may cancel at any time from Settings → Billing. After cancellation, your Pro access remains active until the end of the paid period, then downgrades to Free.</p>
        </Section>

        <Section title="6. Refund Policy">
          <p>We offer refunds within <strong>7 days</strong> of initial purchase if you have not used the Pro features. To request a refund, email <a href="mailto:vibecodeproject2026@gmail.com" className="text-[#00d4ff] hover:underline">vibecodeproject2026@gmail.com</a> with your account email and reason. Annual plan refunds are prorated for unused months.</p>
          <p className="mt-3">No refunds are issued for partial months on monthly plans.</p>
        </Section>

        <Section title="7. Account Termination">
          <p>We reserve the right to suspend or terminate accounts that violate the Acceptable Use Policy. You may delete your account at any time from Settings. Upon deletion, all personal data is removed within 30 days (see Privacy Policy).</p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>The CrimeScope platform, brand, UI, and ML models are proprietary. Crime incident data is sourced from public government datasets and remains in the public domain. You retain ownership of any alert rules, saved filters, or reports you create.</p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>CrimeScope is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, data accuracy, or fitness for any particular purpose. Use of the platform is at your own risk.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the fullest extent permitted by law, CrimeScope's total liability for any claim arising from use of the service shall not exceed the amount you paid in the 12 months preceding the claim, or $10 USD, whichever is greater.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These Terms are governed by the laws of India, without regard to conflict of law provisions. Any disputes shall be resolved in the courts of Bengaluru, Karnataka, India.</p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>We may update these Terms at any time. We will notify active users by email of material changes at least 14 days before they take effect. Continued use of the service after the effective date constitutes acceptance.</p>
        </Section>

        <Section title="13. Contact">
          <p>Questions about these Terms? Email <a href="mailto:vibecodeproject2026@gmail.com" className="text-[#00d4ff] hover:underline">vibecodeproject2026@gmail.com</a>.</p>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-[#00d4ff] mb-4">{title}</h2>
      <div className="text-[#94a3b8] leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

function SiteFooter() {
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
