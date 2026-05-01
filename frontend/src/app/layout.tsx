import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { CookieConsent } from "@/components/CookieConsent";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "CrimeScope — Urban Safety Intelligence",
    template: "%s | CrimeScope",
  },
  description:
    "CrimeScope is an AI-powered crime and public safety analytics platform. Real-time data ingestion, ML hotspot prediction, and interactive maps for city planners and researchers.",
  keywords: ["crime analytics", "public safety", "urban intelligence", "crime mapping", "data visualization", "machine learning"],
  authors: [{ name: "CrimeScope" }],
  creator: "CrimeScope",
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "CrimeScope — Urban Safety Intelligence",
    description: "Turn public safety data into actionable intelligence with AI-powered crime analytics.",
    siteName: "CrimeScope",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CrimeScope — Urban Safety Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CrimeScope — Urban Safety Intelligence",
    description: "Turn public safety data into actionable intelligence.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0e1a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning>
        <AuthProvider>
          <div id="app-root">
            {children}
          </div>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}

