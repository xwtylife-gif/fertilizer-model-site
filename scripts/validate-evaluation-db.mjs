import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const samplesPath = resolve(here, "../data/model-evaluation-samples.json");
const schemaPath = resolve(here, "../data/gpt55-review-schema.json");
const cropPath = resolve(here, "../data/crop-growth-db.json");
const regionPath = resolve(here, "../data/agro-region-db.json");

const errors = [];
const allowedModes = new Set(["dndc_primary_gpt_review", "hybrid", "gpt_direct_draft", "manual_expert_only"]);
const allowedStatuses = new Set(["not_reviewed", "gpt_reviewed", "human_reviewed", "accepted", "rejected"]);
const allowedRiskLevels = new Set(["low", "medium", "high"]);
const requiredOutputFields = [
  "phenology_result",
  "gdd_result",
  "water_balance_result",
  "nitrogen_demand_result",
  "fertilizer_schedule_result",
  "irrigation_schedule_result",
  "operation_calendar_result",
  "yield_prediction_result",
  "risk_assessment_result"
];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function readJson(path, label) {
  check(existsSync(path), `${label} does not exist: ${path}`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${label} is not valid JSON: ${error.message}`);
    return null;
  }
}

const samplesDb = readJson(samplesPath, "model evaluation samples");
const schema = readJson(schemaPath, "gpt55 review schema");
const cropDb = readJson(cropPath, "crop database");
const regionDb = readJson(regionPath, "region database");

const cropIds = new Set((cropDb?.crops || []).map((crop) => crop.id));
const regionIds = new Set((regionDb?.regions || []).map((region) => region.id));

check(schema?.purpose === "GPT-5.5 risk review and JSON patch suggestion contract", "gpt55-review-schema.json purpose is invalid");
check(Array.isArray(schema?.input_required) && schema.input_required.length >= 6, "gpt55-review-schema.json must include input_required");
check(schema?.output_schema?.module_reviews?.phenology, "gpt55-review-schema.json missing output_schema.module_reviews.phenology");
check(schema?.output_schema?.human_review_required === true, "gpt55-review-schema.json must require human review");

const samples = samplesDb?.samples;
check(Array.isArray(samples), "model-evaluation-samples.json must include samples array");
check((samples || []).length >= 20, `model-evaluation-samples.json must include at least 20 samples, got ${(samples || []).length}`);

const sampleIds = new Set();
for (const sample of samples || []) {
  check(sample.id && typeof sample.id === "string", "each sample must include id");
  check(!sampleIds.has(sample.id), `duplicate sample id: ${sample.id}`);
  sampleIds.add(sample.id);

  check(sample.crop_id && typeof sample.crop_id === "string", `${sample.id} must include crop_id`);
  if (sample.crop_id !== "orange") check(cropIds.has(sample.crop_id), `${sample.id} references unknown crop_id: ${sample.crop_id}`);
  check(sample.region_id && typeof sample.region_id === "string", `${sample.id} must include region_id`);
  check(regionIds.has(sample.region_id), `${sample.id} references unknown region_id: ${sample.region_id}`);
  check(sample.scenario && typeof sample.scenario === "string", `${sample.id} must include scenario`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(sample.start_date || ""), `${sample.id} must include legal start_date`);

  const output = sample.dndc_lite_output;
  check(output && typeof output === "object", `${sample.id} must include dndc_lite_output`);
  for (const field of requiredOutputFields) {
    check(output && Object.hasOwn(output, field), `${sample.id}.dndc_lite_output missing ${field}`);
  }

  const local = sample.local_validation_result;
  check(local && typeof local === "object", `${sample.id} must include local_validation_result`);
  check(Array.isArray(local?.red_flags), `${sample.id}.local_validation_result.red_flags must be an array`);
  check(allowedRiskLevels.has(local?.overall_risk_level), `${sample.id}.local_validation_result.overall_risk_level must be low|medium|high`);
  check(local?.human_review_required === true, `${sample.id}.local_validation_result must require human review`);

  check(sample.gpt55_review_contract?.review_status === "pending_review", `${sample.id} GPT contract must default to pending_review`);
  check(sample.gpt55_review_output === null, `${sample.id} gpt55_review_output must default to null`);

  const decision = sample.decision;
  check(decision && typeof decision === "object", `${sample.id} must include decision`);
  check(allowedModes.has(decision?.recommended_mode), `${sample.id}.decision.recommended_mode is invalid: ${decision?.recommended_mode}`);
  check(typeof decision?.can_use_dndc_lite === "boolean", `${sample.id}.decision.can_use_dndc_lite must be boolean`);
  check(Array.isArray(decision?.reuse_modules), `${sample.id}.decision.reuse_modules must be array`);
  check(Array.isArray(decision?.discard_modules), `${sample.id}.decision.discard_modules must be array`);
  check(Array.isArray(decision?.required_human_checks), `${sample.id}.decision.required_human_checks must be array`);

  check(allowedStatuses.has(sample.status), `${sample.id}.status is invalid: ${sample.status}`);
}

if (errors.length) {
  console.error("Evaluation database validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Evaluation validation passed: ${samples.length} samples, ${requiredOutputFields.length} DNDC-lite output modules, GPT-5.5 schema OK`);
