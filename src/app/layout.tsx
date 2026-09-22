import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { isDemo } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "BXB Command Center", description: "Life OS + CRM" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="flex min-h-screen">
          <Sidebar demo={isDemo} />
          <main className="flex-1 overflow-x-hidden p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
