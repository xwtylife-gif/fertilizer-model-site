import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(here, "../data/crop-growth-db.json");
const jsPath = resolve(here, "../data/crop-growth-db.js");
const db = JSON.parse(readFileSync(jsonPath, "utf8"));

const output = [
  "window.CROP_GROWTH_DB = ",
  JSON.stringify(db, null, 2),
  ";\n"
].join("");

writeFileSync(jsPath, output, "utf8");
console.log(`Generated ${jsPath}`);
