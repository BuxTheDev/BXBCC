import { VENTURES, type Venture } from "@/lib/ventures";
import { Badge } from "@/components/ui";

/** Fronts are mapped to a venture purely by name (ventures.ts owns the mapping). */
export function ventureForFrontName(name: string | null | undefined): Venture | undefined {
  if (!name) return undefined;
  return VENTURES.find((v) => v.frontNames.includes(name));
}

export function VentureChip({ frontName, venture }: { frontName?: string | null; venture?: Venture }) {
  const v = venture ?? ventureForFrontName(frontName);
  if (!v) return <Badge tone="outline">Personal</Badge>;
  return <Badge dot={v.accent}>{v.short}</Badge>;
}
