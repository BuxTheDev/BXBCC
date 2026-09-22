"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { INCOME_TONE } from "@/components/ui";
import type { IncomeClass } from "@/lib/types";

const KEYS: IncomeClass[] = ["SI", "LI", "BOI", "ABI", "KBI"];
const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

export default function IncomeMix({ data }: { data: Array<{ month: string } & Record<IncomeClass, number>> }) {
  const rows = data.map(d => ({ ...d, label: new Date(d.month + "-15").toLocaleDateString("en-US", { month: "short" }) }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={48} />
          <Tooltip cursor={{ fill: "var(--surface-2)" }} formatter={(v) => fmt(Number(v))}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--fg)" }} />
          <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
          {KEYS.map(k => <Bar key={k} dataKey={k} stackId="a" fill={INCOME_TONE[k]} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
