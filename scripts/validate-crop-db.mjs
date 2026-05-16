import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(here, "../data/crop-growth-db.json");
const regionPath = resolve(here, "../data/agro-region-db.json");
const managementPath = resolve(here, "../data/management-plan-db.json");
const db = JSON.parse(readFileSync(dbPath, "utf8"));
const regionDb = JSON.parse(readFileSync(regionPath, "utf8"));
const managementDb = JSON.parse(readFileSync(managementPath, "utf8"));

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

const allSourceIds = new Set([
  ...db.sources.map((source) => source.id),
  ...regionDb.sources.map((source) => source.id)
]);
const regionIds = new Set(regionDb.regions.map((region) => region.id));
const fertilizerProductIds = new Set(managementDb.fertilizerProducts.map((product) => product.id));

check(regionDb.regions.length >= 1, "region database must include at least one region");
for (const region of regionDb.regions) {
  check(region.id && region.name, "each region must include id and name");
  check(region.climateNormal.monthlyTmeanC.length === 12, `${region.id} must include 12 monthly temperatures`);
  check(region.climateNormal.monthlyRainMm.length === 12, `${region.id} must include 12 monthly rainfall values`);
  check(region.climateNormal.monthlyEt0Mm.length === 12, `${region.id} must include 12 monthly ET0 values`);
  for (const sourceId of region.sourceIds) {
    check(allSourceIds.has(sourceId), `${region.id} references unknown source: ${sourceId}`);
  }
}

check(managementDb.plans.length >= 1, "management database must include at least one plan");
for (const plan of managementDb.plans) {
  const crop = db.crops.find((item) => item.id === plan.cropId);
  const stageIds = new Set((crop?.stages || []).map((stage) => stage.id));

  check(cropIds.has(plan.cropId), `${plan.id} references unknown crop: ${plan.cropId}`);
  check(regionIds.has(plan.regionId), `${plan.id} references unknown region: ${plan.regionId}`);
  check(plan.eventTemplates.length >= 8, `${plan.id} should include a full management calendar`);
  check(plan.gpt55Optimization?.model === "gpt-5.5", `${plan.id} must declare gpt-5.5 optimization profile`);
  for (const item of [...plan.nutrientBudgetKgMu.preferredSideDeep, ...plan.nutrientBudgetKgMu.traditionalSplit]) {
    check(fertilizerProductIds.has(item.productId), `${plan.id} references unknown fertilizer product: ${item.productId}`);
  }
  for (const event of plan.eventTemplates) {
    check(event.id && event.title && event.action, `${plan.id} has an incomplete event template`);
    check(event.timing?.type, `${plan.id}/${event.id} missing timing type`);
    if (["stageStart", "stageFraction"].includes(event.timing?.type)) {
      check(stageIds.has(event.timing.stageId), `${plan.id}/${event.id} references unknown stage: ${event.timing.stageId}`);
    }
    if (event.timing?.type === "stageFraction") {
      check(event.timing.fraction >= 0 && event.timing.fraction <= 1, `${plan.id}/${event.id} has invalid stage fraction`);
    }
    check(event.fertilizer && event.water && event.check, `${plan.id}/${event.id} must include fertilizer, water, and check text`);
  }
  for (const sourceId of plan.sourceIds) {
    check(allSourceIds.has(sourceId), `${plan.id} references unknown source: ${sourceId}`);
  }
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

console.log(`Validation passed: ${db.crops.length} crops, ${regionDb.regions.length} regions, ${managementDb.plans.length} management plans`);
