import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { isDemo } from "@/lib/supabase";
import { getTasks } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "BXB Command Center", description: "Life OS + CRM" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let openTasks = 0;
  try {
    const tasks = await getTasks();
    openTasks = tasks.filter(t => (t.status === "todo" || t.status === "doing") && t.due_on && +new Date(t.due_on) <= Date.now()).length;
  } catch { openTasks = 0; }
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="flex min-h-screen">
          <Sidebar demo={isDemo} openTasks={openTasks} />
          <main className="min-w-0 flex-1 px-7 py-6">
            <div className="mx-auto w-full max-w-[1380px]">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
