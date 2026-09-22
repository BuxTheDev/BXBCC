"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/format";
import { VENTURES } from "@/lib/ventures";
import { LayoutGrid, Wallet, Users, CheckSquare, ChevronDown, Layers, Circle } from "lucide-react";

const primary = [
  { href: "/", label: "Today", icon: LayoutGrid },
  { href: "/money", label: "Money", icon: Wallet },
];
const secondary = [
  { href: "/people", label: "People", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

export default function Sidebar({ demo, openTasks }: { demo: boolean; openTasks?: number }) {
  const path = usePathname();
  const [venturesOpen, setVenturesOpen] = useState(true);
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  const item = (href: string, label: string, Icon: React.ComponentType<{ size?: number }>, badge?: number) => {
    const on = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition",
          on ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg-dim",
        )}
      >
        {on && <i className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-accent" />}
        <Icon size={16} />
        <span className="flex-1">{label}</span>
        {badge != null && badge > 0 && (
          <span className="tabular rounded-full bg-accent/20 px-1.5 py-0.5 text-[10.5px] font-semibold text-accent">{badge}</span>
        )}
      </Link>
    );
  };

  return (
    <aside className="sticky top-0 flex h-screen w-[228px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="hero-gradient flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold text-white">B</div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold leading-tight">Command Center</div>
          <div className="flex items-center gap-1.5 text-[10.5px] text-muted">
            <i className={cn("h-1.5 w-1.5 rounded-full", demo ? "bg-warn" : "bg-ok")} />
            {demo ? "Demo data" : "Live"}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
        <div className="space-y-0.5">{primary.map((i) => item(i.href, i.label, i.icon))}</div>

        <button
          onClick={() => setVenturesOpen((v) => !v)}
          className="mt-5 flex w-full items-center gap-1.5 px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-fg-dim"
        >
          Ventures
          <ChevronDown size={12} className={cn("transition-transform", !venturesOpen && "-rotate-90")} />
        </button>
        {venturesOpen && (
          <div className="space-y-0.5">
            {item("/ventures", "All ventures", Layers)}
            {VENTURES.map((v) => {
              const href = `/ventures/${v.slug}`;
              const on = path === href;
              return (
                <Link
                  key={v.slug}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-lg py-1.5 pl-[18px] pr-2.5 text-[13px] transition",
                    on ? "bg-surface-3 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg-dim",
                  )}
                >
                  {on && <i className="absolute left-0 top-1/2 h-3.5 w-[2.5px] -translate-y-1/2 rounded-r-full bg-accent" />}
                  <Circle size={7} fill={v.accent} color={v.accent} />
                  <span className="truncate">{v.short}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-5 px-2.5 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">Records</div>
        <div className="space-y-0.5">
          {item("/people", "People", Users)}
          {item("/tasks", "Tasks", CheckSquare, openTasks)}
        </div>
        {secondary.length === 0 && null}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold">BX</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium leading-tight">Bryan</div>
            <div className="text-[10.5px] text-muted">Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
