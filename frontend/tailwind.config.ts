import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── CrimeScope Brand Color System ─────────────────────────────────────
      colors: {
        // Backgrounds
        "bg-primary": "#0a0e1a",
        "bg-secondary": "#111827",
        "bg-tertiary": "#1a2235",
        "bg-sidebar": "#0d1321",
        border: "#1e2d45",

        // Accents
        "accent-primary": "#00d4ff",
        "accent-danger": "#ff4757",
        "accent-warning": "#ffa502",
        "accent-safe": "#2ed573",
        "accent-purple": "#7c3aed",
        "accent-orange": "#ff6b35",

        // Text
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
        "text-muted": "#475569",
      },

      // ── Font Families ──────────────────────────────────────────────────────
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        data: ["JetBrains Mono", "monospace"],
        mono: ["JetBrains Mono", "monospace"],
      },

      // ── Typography Scale ───────────────────────────────────────────────────
      fontSize: {
        "hero": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "page": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "section": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "card-title": ["1.125rem", { lineHeight: "1.4" }],
      },

      // ── Spacing additions ─────────────────────────────────────────────────
      spacing: {
        "sidebar": "240px",
        "sidebar-collapsed": "64px",
      },

      // ── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        card: "12px",
        btn: "8px",
        badge: "6px",
      },

      // ── Animations ─────────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-danger": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "pulse-danger": "pulse-danger 2s ease-in-out infinite",
        "fade-in": "fade-in 150ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
      },

      // ── Box Shadow ─────────────────────────────────────────────────────────
      boxShadow: {
        "card-hover": "0 0 20px rgba(0, 212, 255, 0.08)",
        "glow-cyan": "0 0 30px rgba(0, 212, 255, 0.15)",
        "glow-danger": "0 0 20px rgba(255, 71, 87, 0.2)",
      },

      // ── Max Width ──────────────────────────────────────────────────────────
      maxWidth: {
        layout: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
