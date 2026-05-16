import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

const builds = [
  ["../data/crop-growth-db.json", "../data/crop-growth-db.js", "CROP_GROWTH_DB"],
  ["../data/agro-region-db.json", "../data/agro-region-db.js", "AGRO_REGION_DB"],
  ["../data/management-plan-db.json", "../data/management-plan-db.js", "MANAGEMENT_PLAN_DB"]
];

for (const [jsonRel, jsRel, globalName] of builds) {
  const jsonPath = resolve(here, jsonRel);
  const jsPath = resolve(here, jsRel);
  const db = JSON.parse(readFileSync(jsonPath, "utf8"));
  const output = `window.${globalName} = ${JSON.stringify(db, null, 2)};\n`;
  writeFileSync(jsPath, output, "utf8");
  console.log(`Generated ${jsPath}`);
}
