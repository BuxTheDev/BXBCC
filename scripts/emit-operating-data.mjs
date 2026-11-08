import { writeFileSync } from "node:fs";
import { coziiVog } from "../src/operating/cozii-vog.ts";

const banner = `/* Generated from src/operating/cozii-vog.ts. Run: node --experimental-strip-types scripts/emit-operating-data.mjs */
`;
const body = `${banner}const coziiVog = ${JSON.stringify(coziiVog, null, 2)};
globalThis.coziiVog = coziiVog;
`;
writeFileSync(new URL("../public/os/cozii-vog-data.js", import.meta.url), body);
