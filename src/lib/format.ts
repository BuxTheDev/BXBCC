export const usd = (n: number | null | undefined, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0, ...opts }).format(Number(n ?? 0));
export const usdCompact = (n: number | null | undefined) => usd(n, { notation: "compact", maximumFractionDigits: 1 });
export const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
export const dateShort = (s: string | null | undefined) => s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
export const daysBetween = (a: string | Date, b: string | Date = new Date()) => Math.floor((+new Date(b) - +new Date(a)) / 864e5);
export const cn = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");
