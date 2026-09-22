"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import { LayoutDashboard, Compass, Building2, Landmark, Wallet, Target, Users, Handshake, KanbanSquare, CheckSquare, Home } from "lucide-react";

const groups = [
  { label: "Life", items: [
    { href: "/", label: "Command center", icon: LayoutDashboard },
    { href: "/fronts", label: "Fronts", icon: Compass },
    { href: "/goals", label: "Goals & plans", icon: Target },
    { href: "/entities", label: "Entity map", icon: Landmark },
    { href: "/assets", label: "Assets", icon: Building2 },
    { href: "/money", label: "Money", icon: Wallet },
  ]},
  { label: "Work", items: [
    { href: "/deals", label: "Pipelines", icon: KanbanSquare },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/organizations", label: "Organizations", icon: Handshake },
    { href: "/portfolio", label: "Portfolio & units", icon: Home },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
  ]},
];

export default function Sidebar({ demo }: { demo: boolean }) {
  const path = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-3">
      <div className="mb-4 px-2">
        <div className="text-base font-semibold">BXB Command Center</div>
        <div className="text-[11px] text-muted">{demo ? "Demo mode — no database connected" : "Connected"}</div>
      </div>
      {groups.map(g => (
        <div key={g.label} className="mb-4">
          <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted">{g.label}</div>
          {g.items.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm", active ? "bg-accent-soft text-accent font-medium" : "text-fg hover:bg-surface-2")}>
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
