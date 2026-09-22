export const usd = (n: number | null | undefined, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, ...opts }).format(Number(n ?? 0));
export const usdCompact = (n: number | null | undefined) => Math.abs(Number(n ?? 0)) < 1000 ? usd(n) : usd(n, { notation: "compact", maximumFractionDigits: 1 });
export const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
export const dateShort = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
export const daysBetween = (a: string | Date, b: string | Date = new Date()) => Math.floor((+new Date(b) - +new Date(a)) / 864e5);
export const cn = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");

export const initials = (s: string) => s.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]?.toUpperCase()).join("");
export const relTime = (iso: string) => {
  const d = Math.floor((Date.now() - +new Date(iso)) / 6e4);
  if (d < 1) return "now";
  if (d < 60) return `${d}m`;
  if (d < 1440) return `${Math.floor(d/60)}h`;
  return `${Math.floor(d/1440)}d`;
};
export const monthLabel = (ym: string) => new Date(ym + "-01T00:00:00").toLocaleDateString("en-US", { month: "short" });
