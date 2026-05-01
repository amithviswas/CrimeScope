"use client";

import Link from "next/link";
import { Shield, Github, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0e1a]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-[#00d4ff] font-bold text-base mb-3">
              <Shield size={18} />
              CrimeScope
            </Link>
            <p className="text-[#64748b] text-xs leading-relaxed">
              AI-powered urban safety intelligence. Crime data sourced from public government records.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Dashboard</Link></li>
              <li><Link href="/map" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Crime Map</Link></li>
              <li><Link href="/analytics" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Legal &amp; Support</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Terms of Service</Link></li>
              <li><Link href="/help" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Help &amp; FAQ</Link></li>
              <li><Link href="/contact" className="text-[#64748b] text-sm hover:text-[#00d4ff] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Data disclaimer */}
        <div className="border-t border-white/5 pt-6 mb-4">
          <p className="text-[#475569] text-xs leading-relaxed text-center max-w-2xl mx-auto">
            <strong className="text-[#64748b]">Data Disclaimer:</strong> Data sourced from public government records (Chicago Data Portal, NYC OpenData, LA GeoHub). CrimeScope does not guarantee accuracy or completeness. <strong>Not for law enforcement use.</strong>
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
          <p className="text-[#475569] text-xs">
            © {new Date().getFullYear()} CrimeScope. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:vibecodeproject2026@gmail.com"
              aria-label="Email support"
              className="text-[#475569] hover:text-[#00d4ff] transition-colors"
            >
              <Mail size={16} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-[#475569] hover:text-[#00d4ff] transition-colors"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
