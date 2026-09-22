import { Card, Stat, Table, Progress, INCOME_TONE } from "@/components/ui";
import IncomeMix from "@/components/charts/IncomeMix";
import { getNetWorth, getIncomeByClassT12, getIncomeSeries } from "@/lib/data";
import { usd, pct } from "@/lib/format";
import { INCOME_CLASS_LABEL, type IncomeClass } from "@/lib/types";

export const CLASSES: IncomeClass[] = ["SI", "LI", "BOI", "ABI", "KBI"];

/** Net worth, debt, cash and the ABI share of trailing-12 income. */
export async function PositionStats() {
  const [nw, t12] = await Promise.all([getNetWorth(), getIncomeByClassT12()]);
  const total = CLASSES.reduce((s, c) => s + t12[c], 0);
  const abiShare = total > 0 ? t12.ABI / total : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Net worth" value={usd(nw.net_worth)} sub="assets less debt" tone={nw.net_worth < 0 ? "bad" : undefined} />
      <Stat label="Total debt" value={usd(nw.total_debt)} sub="loans, mortgages and cards" tone={nw.total_debt > 0 ? "warn" : undefined} />
      <Stat label="Liquid cash" value={usd(nw.liquid_cash)} sub="checking and savings" />
      <Stat
        label="ABI share of T12"
        value={pct(abiShare)}
        sub={`${usd(t12.ABI)} of ${usd(total)}`}
        tone={abiShare >= 0.25 ? "ok" : "accent"}
      />
    </div>
  );
}

/** Stacked monthly income by class, trailing twelve months. */
export async function IncomeMixCard() {
  const series = await getIncomeSeries();
  return (
    <Card title="Income mix, trailing 12 months" sub="Monthly income stacked by class">
      <IncomeMix data={series} />
    </Card>
  );
}

/** Table of trailing-12 income per class with its share of the whole. */
export async function IncomeByClassCard() {
  const t12 = await getIncomeByClassT12();
  const total = CLASSES.reduce((s, c) => s + t12[c], 0);

  return (
    <Card title="Income by class" sub="Trailing twelve months">
      <Table head={["Class", "Meaning", "T12", "Share"]}>
        {CLASSES.map((c) => {
          const share = total > 0 ? t12[c] / total : 0;
          return (
            <tr key={c}>
              <td>
                <span className="flex items-center gap-2 font-medium">
                  <i className="h-2 w-2 rounded-full" style={{ background: INCOME_TONE[c] }} />
                  {c}
                </span>
              </td>
              <td className="text-[13px] text-muted">{INCOME_CLASS_LABEL[c]}</td>
              <td className="tabular">{usd(t12[c])}</td>
              <td>
                <div className="flex items-center gap-2.5">
                  <div className="w-24">
                    <Progress value={share} target={1} color={INCOME_TONE[c]} height={5} />
                  </div>
                  <span className="tabular text-[13px] text-fg-dim">{pct(share)}</span>
                </div>
              </td>
            </tr>
          );
        })}
        <tr className="font-semibold [&_td]:!border-t-2 [&_td]:!border-border">
          <td>Total</td>
          <td />
          <td className="tabular">{usd(total)}</td>
          <td />
        </tr>
      </Table>
    </Card>
  );
}
