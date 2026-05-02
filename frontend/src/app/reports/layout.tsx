import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export const metadata: Metadata = {
  title: "Reports | CrimeScope",
  description: "Generate and download crime incident reports for any city and date range.",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-primary)" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: "var(--sidebar-width)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
        id="dashboard-main"
      >
        <TopBar pageTitle="Reports" />
        <main className="flex-1 p-6" style={{ maxWidth: "1280px", width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
