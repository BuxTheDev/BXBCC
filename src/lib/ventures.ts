// Ventures are the spine of the navigation: "what am I working on, and where".
// Defined in code (not the DB) so a new venture is a config entry, not a migration.
// Each maps onto rows that already exist: pipelines by slug, entities by name, properties by use_tag.

export interface Venture {
  slug: string;
  name: string;
  short: string;
  /** one line: what this venture is */
  blurb: string;
  /** why it is on the list — shown on the venture page, not just the front */
  why: string;
  place: string;
  /** pipelines[].venture values that belong here */
  pipelineVenture: string[];
  /** entities[].name values that belong here */
  entityNames: string[];
  /** properties[].use_tags values that belong here */
  useTags: string[];
  /** fronts[].name values that belong here */
  frontNames: string[];
  incomeClass: "SI" | "LI" | "BOI" | "ABI" | "KBI";
  accent: string;
}

export const VENTURES: Venture[] = [
  {
    slug: "valley-of-grace",
    name: "Valley of Grace",
    short: "VoG",
    blurb: "Level 2 recovery residence, North Las Vegas",
    why: "Fulfillment first, income second — do not judge it against a BOI benchmark it was never meant to hit.",
    place: "North Las Vegas, NV",
    pipelineVenture: ["valley_of_grace"],
    entityNames: ["Valley of Grace Recovery Home LLC", "Snowbook Properties LLC"],
    useTags: ["valley_of_grace"],
    frontNames: ["Valley of Grace launch"],
    incomeClass: "BOI",
    accent: "#34d399",
  },
  {
    slug: "cozii",
    name: "Cozii Housing",
    short: "Cozii",
    blurb: "Phoenix Metro mid-term furnished rentals",
    why: "Property management is the W2 replacement — the clearest path from labor income to business operating income.",
    place: "Phoenix Metro, AZ",
    pipelineVenture: ["cozii"],
    entityNames: ["BXB International"],
    useTags: ["cozii"],
    frontNames: ["Cozii owner acquisition", "ADU/casita buy-and-hold"],
    incomeClass: "BOI",
    accent: "#8b5cf6",
  },
  {
    slug: "terralift",
    name: "TerraLift & Salvo",
    short: "TerraLift",
    blurb: "Vacant land wholesaling across a 12-state buy-box, plus the Salvo offer engine",
    why: "Salvo is knowledge income that funds asset-backed income; the land deals are the proof it works.",
    place: "Remote / 12-state buy-box",
    pipelineVenture: ["terralift"],
    entityNames: ["TerraLift", "BrightPath Real Estate Solutions, LLC"],
    useTags: ["terralift"],
    frontNames: ["Salvo build & launch"],
    incomeClass: "KBI",
    accent: "#3b82f6",
  },
  {
    slug: "knowledge",
    name: "Knowledge Products",
    short: "Knowledge",
    blurb: "MTR toolkit and the nonprofit's financial-literacy courses",
    why: "Low-effort KBI that reuses assets Cozii already produced.",
    place: "Online",
    pipelineVenture: ["knowledge"],
    entityNames: ["Financial Literacy Nonprofit"],
    useTags: [],
    frontNames: ["MTR toolkit ($27 → $147)"],
    incomeClass: "KBI",
    accent: "#f472b6",
  },
];

export const getVenture = (slug: string) => VENTURES.find((v) => v.slug === slug);

/** Fronts that belong to no venture (personal: degree, career) show under "Personal". */
export const PERSONAL_FRONT_NAMES = ["Degree sprint", "Medical-device sales transition"];
