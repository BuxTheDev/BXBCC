"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { INCOME_TONE } from "@/components/ui";
import type { IncomeClass } from "@/lib/types";

const KEYS: IncomeClass[] = ["SI", "LI", "BOI", "ABI", "KBI"];

const tick = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;
const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export default function IncomeMix({ data }: { data: Array<{ month: string } & Record<IncomeClass, number>> }) {
  const rows = data.map((d) => ({
    ...d,
    label: new Date(d.month + "-15T00:00:00").toLocaleDateString("en-US", { month: "short" }),
  }));

  return (
    <div style={{ height: 280 }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid stroke="#23262f" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7f8596" }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={tick}
            tick={{ fontSize: 11, fill: "#7f8596" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(v, name) => [money(Number(v)), String(name)]}
            contentStyle={{
              background: "#191c25",
              border: "1px solid #23262f",
              borderRadius: 10,
              color: "#e9eaef",
              fontSize: 12,
            }}
            labelStyle={{ color: "#b6bac6", marginBottom: 4 }}
            itemStyle={{ padding: 0 }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, color: "#7f8596", paddingTop: 8 }}
          />
          {KEYS.map((k) => (
            <Bar key={k} dataKey={k} stackId="income" fill={INCOME_TONE[k]} radius={k === "KBI" ? [3, 3, 0, 0] : undefined} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
