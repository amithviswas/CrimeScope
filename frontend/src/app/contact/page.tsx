"use client";

import Link from "next/link";
import { Shield, Mail, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mailto fallback — works without a backend form endpoint
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailto = `mailto:vibecodeproject2026@gmail.com?subject=${encodeURIComponent(form.subject || "CrimeScope Contact")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 text-[#00d4ff] font-bold text-lg">
          <Shield size={20} />
          CrimeScope
        </Link>
        <span className="text-[#475569] text-sm ml-2">/ Contact</span>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <Mail size={40} className="text-[#00d4ff] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Get in Touch</h1>
          <p className="text-[#94a3b8]">
            Questions, feedback, or enterprise inquiries — we&apos;d love to hear from you.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-12 border border-green-500/30 bg-green-500/10 rounded-2xl">
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-white font-semibold text-xl mb-2">Your email client should open</h2>
            <p className="text-[#94a3b8] text-sm">
              If it didn&apos;t, email us directly at{" "}
              <a href="mailto:vibecodeproject2026@gmail.com" className="text-[#00d4ff] hover:underline">
                vibecodeproject2026@gmail.com
              </a>
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-6 text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00d4ff]/60 focus:bg-white/8 transition-all"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00d4ff]/60 focus:bg-white/8 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00d4ff]/60 focus:bg-white/8 transition-all"
                placeholder="Enterprise plan inquiry, bug report, feedback…"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-[#475569] focus:outline-none focus:border-[#00d4ff]/60 focus:bg-white/8 transition-all resize-none"
                placeholder="Tell us how we can help…"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#00d4ff] text-[#0a0e1a] font-bold py-3.5 rounded-xl hover:bg-[#00d4ff]/90 active:scale-[0.98] transition-all"
            >
              <Send size={16} />
              Send Message
            </button>
          </form>
        )}

        <p className="text-center text-[#475569] text-xs mt-8">
          We typically respond within 24 hours on business days.
        </p>
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
