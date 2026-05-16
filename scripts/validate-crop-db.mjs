import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(here, "../data/crop-growth-db.json");
const db = JSON.parse(readFileSync(dbPath, "utf8"));

const requiredCropFields = db.validationRules.requiredCropFields;
const tolerance = 0.001;
const errors = [];
const warnings = [];

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function nearOne(value) {
  return Math.abs(value - 1) <= tolerance;
}

function check(condition, message) {
  if (!condition) errors.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

check(Array.isArray(db.crops), "crops must be an array");
check(db.crops.length === db.validationRules.requiredCropCount, `expected ${db.validationRules.requiredCropCount} crops, got ${db.crops.length}`);

const sourceIds = new Set(db.sources.map((source) => source.id));
const cropIds = new Set();

for (const crop of db.crops) {
  check(!cropIds.has(crop.id), `duplicate crop id: ${crop.id}`);
  cropIds.add(crop.id);

  for (const field of requiredCropFields) {
    check(Object.hasOwn(crop, field), `${crop.id} missing required field: ${field}`);
  }

  check(crop.thermal.baseTempC < crop.thermal.optTempC, `${crop.id} baseTempC must be lower than optTempC`);
  check(crop.thermal.optTempC < crop.thermal.maxTempC, `${crop.id} optTempC must be lower than maxTempC`);
  check(crop.thermal.totalGddC > 0, `${crop.id} totalGddC must be positive`);

  check(crop.water.seasonRequirementMm >= crop.water.validationRangeMm[0], `${crop.id} water requirement below validation range`);
  check(crop.water.seasonRequirementMm <= crop.water.validationRangeMm[1], `${crop.id} water requirement above validation range`);

  for (const nutrient of ["n", "p2o5", "k2o"]) {
    check(crop.nutrientDemandKgHa[nutrient] >= 0, `${crop.id} ${nutrient} demand must be non-negative`);
    warn(crop.nutrientDemandKgHa[nutrient] <= 650, `${crop.id} ${nutrient} demand is unusually high`);
  }

  check(crop.yieldPotentialKgHa > 0, `${crop.id} yieldPotentialKgHa must be positive`);

  const partitionTotal = Object.values(crop.biomassPartition).reduce((total, value) => total + value, 0);
  check(nearOne(partitionTotal), `${crop.id} biomassPartition must sum to 1.00, got ${partitionTotal.toFixed(3)}`);

  const stages = crop.stages || [];
  check(stages.length >= 4, `${crop.id} should have at least 4 growth stages`);
  for (const key of ["thermalShare", "nShare", "pShare", "kShare", "waterShare"]) {
    const value = sum(stages, key);
    check(nearOne(value), `${crop.id} stage ${key} must sum to 1.00, got ${value.toFixed(3)}`);
  }

  for (const stage of stages) {
    const range = stage.targetSoilWaterPctFieldCapacity;
    check(Array.isArray(range) && range.length === 2, `${crop.id}/${stage.id} must include target soil water range`);
    check(range[0] < range[1], `${crop.id}/${stage.id} soil water range must be ascending`);
    check(range[0] >= 40 && range[1] <= 100, `${crop.id}/${stage.id} soil water range outside 40-100% FC`);
  }

  const operations = crop.managementTemplates || {};
  for (const group of ["fertilization", "irrigation", "plantProtection", "fieldOperations"]) {
    check(Array.isArray(operations[group]) && operations[group].length > 0, `${crop.id} missing management template: ${group}`);
  }

  for (const sourceId of crop.sourceIds) {
    check(sourceIds.has(sourceId), `${crop.id} references unknown source: ${sourceId}`);
  }

  const soil = crop.soilPreference;
  check(soil.phMin < soil.phOptLow && soil.phOptLow <= soil.phOptHigh && soil.phOptHigh < soil.phMax, `${crop.id} invalid pH preference`);
  check(soil.salinityThresholdDsM > 0, `${crop.id} salinity threshold must be positive`);
}

if (warnings.length) {
  console.warn("Warnings:");
  for (const message of warnings) console.warn(`- ${message}`);
}

if (errors.length) {
  console.error("Validation failed:");
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`Validation passed: ${db.crops.length} crops, ${db.sources.length} sources, ${db.schemaVersion}`);
