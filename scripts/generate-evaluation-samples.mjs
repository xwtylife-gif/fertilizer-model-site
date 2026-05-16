import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, "../data/model-evaluation-samples.json");

const modes = {
  primary: "dndc_primary_gpt_review",
  hybrid: "hybrid",
  draft: "gpt_direct_draft",
  manual: "manual_expert_only"
};

const statusValues = {
  low: "low",
  medium: "medium",
  high: "high"
};

const baseDataGaps = ["缺少逐日实测气象", "缺少品种熟期参数"];
const severeDataGaps = ["缺少真实土壤检测", "缺少逐日气象", "缺少本地试验产量", "缺少品种参数"];

const scenarios = [
  {
    id: "eval-001",
    scenario: "湖北中稻推荐播栽窗口样本",
    start_date: "2026-05-20",
    soil_ph: 6.2,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-09-15",
    duration: 119,
    gdd: [1850, 1850, 0],
    yieldKgMu: 700,
    risk: statusValues.low,
    confidence: "medium",
    mode: modes.primary,
    dataGaps: ["缺少逐日实测气象", "缺少完整品种熟期参数"],
    redFlags: []
  },
  {
    id: "eval-002",
    scenario: "推荐窗口高产管理样本",
    start_date: "2026-06-01",
    soil_ph: 6.4,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "high",
    management: "high_yield",
    window: "recommended",
    harvest: "2026-09-24",
    duration: 116,
    gdd: [1850, 1850, 0],
    yieldKgMu: 742,
    risk: statusValues.low,
    confidence: "medium",
    mode: modes.primary,
    dataGaps: ["缺少逐日实测气象"],
    redFlags: []
  },
  {
    id: "eval-003",
    scenario: "推荐窗口低投入管理样本",
    start_date: "2026-06-10",
    soil_ph: 6.3,
    salinity: "normal",
    n: "low",
    water: "normal",
    yieldLevel: "medium",
    management: "low_input",
    window: "recommended",
    harvest: "2026-10-04",
    duration: 117,
    gdd: [1850, 1850, 0],
    yieldKgMu: 610,
    risk: statusValues.medium,
    confidence: "medium",
    mode: modes.hybrid,
    dataGaps: baseDataGaps,
    redFlags: ["氮供应不足时仍可能低估氮胁迫"]
  },
  {
    id: "eval-004",
    scenario: "推荐窗口偏酸水稻土样本",
    start_date: "2026-05-25",
    soil_ph: 5.1,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-09-20",
    duration: 119,
    gdd: [1850, 1850, 0],
    yieldKgMu: 650,
    risk: statusValues.medium,
    confidence: "medium",
    mode: modes.hybrid,
    dataGaps: baseDataGaps,
    redFlags: ["pH 偏酸，需要土壤检测和调理建议"]
  },
  {
    id: "eval-005",
    scenario: "推荐窗口偏碱田块样本",
    start_date: "2026-06-05",
    soil_ph: 7.9,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-09-29",
    duration: 117,
    gdd: [1850, 1850, 0],
    yieldKgMu: 640,
    risk: statusValues.medium,
    confidence: "medium",
    mode: modes.hybrid,
    dataGaps: baseDataGaps,
    redFlags: ["pH 偏碱，磷和微量元素有效性需要人工确认"]
  },
  {
    id: "eval-006",
    scenario: "推荐窗口盐分偏高样本",
    start_date: "2026-05-30",
    soil_ph: 6.5,
    salinity: "high",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-09-23",
    duration: 117,
    gdd: [1850, 1850, 0],
    yieldKgMu: 570,
    risk: statusValues.medium,
    confidence: "low",
    mode: modes.hybrid,
    dataGaps: [...baseDataGaps, "缺少 EC 实测值"],
    redFlags: ["盐分偏高，需先确认 EC 和洗盐排水条件"]
  },
  {
    id: "eval-007",
    scenario: "谨慎窗口早熟品种样本",
    start_date: "2026-06-25",
    soil_ph: 6.4,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "caution",
    harvest: "2026-10-16",
    duration: 114,
    gdd: [1850, 1850, 0],
    yieldKgMu: 640,
    risk: statusValues.medium,
    confidence: "medium",
    mode: modes.hybrid,
    dataGaps: baseDataGaps,
    redFlags: ["谨慎窗口，需要当地气象和早熟品种人工确认"]
  },
  {
    id: "eval-008",
    scenario: "谨慎窗口氮素不足样本",
    start_date: "2026-07-05",
    soil_ph: 6.1,
    salinity: "normal",
    n: "low",
    water: "normal",
    yieldLevel: "medium",
    management: "low_input",
    window: "caution",
    harvest: "2026-10-27",
    duration: 115,
    gdd: [1850, 1780, 70],
    yieldKgMu: 560,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.hybrid,
    dataGaps: severeDataGaps,
    redFlags: ["谨慎窗口叠加氮供应不足", "本地数据缺口较大，产量预测不可用"]
  },
  {
    id: "eval-009",
    scenario: "谨慎窗口雨水偏多样本",
    start_date: "2026-07-10",
    soil_ph: 6.4,
    salinity: "normal",
    n: "medium",
    water: "wet",
    yieldLevel: "medium",
    management: "conventional",
    window: "caution",
    harvest: "2026-11-01",
    duration: 115,
    gdd: [1850, 1735, 115],
    yieldKgMu: 520,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.manual,
    dataGaps: severeDataGaps,
    redFlags: ["雨水偏多却仍需检查灌溉安排", "接近安全收获上限，低温灌浆风险高"]
  },
  {
    id: "eval-010",
    scenario: "过晚播栽积温不足样本",
    start_date: "2026-07-20",
    soil_ph: 6.4,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "late",
    harvest: "晚于 2026-11-05",
    duration: 109,
    gdd: [1850, 1194, 656],
    yieldKgMu: 311,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.manual,
    dataGaps: severeDataGaps,
    redFlags: ["晚于本地高风险界限", "到安全收获上限仍缺少大量 GDD"]
  },
  {
    id: "eval-011",
    scenario: "极晚播栽不可成熟样本",
    start_date: "2026-08-01",
    soil_ph: 6.3,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "low",
    management: "low_input",
    window: "late",
    harvest: "晚于 2026-11-05",
    duration: 97,
    gdd: [1850, 930, 920],
    yieldKgMu: 250,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.manual,
    dataGaps: severeDataGaps,
    redFlags: ["积温严重不足", "不应给出生产执行方案"]
  },
  {
    id: "eval-012",
    scenario: "抽穗灌浆低温风险样本",
    start_date: "2026-07-12",
    soil_ph: 6.5,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "caution",
    harvest: "2026-11-04",
    duration: 116,
    gdd: [1850, 1705, 145],
    yieldKgMu: 500,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.manual,
    dataGaps: severeDataGaps,
    redFlags: ["抽穗灌浆期低温风险", "积温不足却不能给高产结论"]
  },
  {
    id: "eval-013",
    scenario: "干旱胁迫但播期适宜样本",
    start_date: "2026-05-18",
    soil_ph: 6.4,
    salinity: "normal",
    n: "medium",
    water: "dry",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-09-14",
    duration: 120,
    gdd: [1850, 1850, 0],
    yieldKgMu: 590,
    risk: statusValues.medium,
    confidence: "low",
    mode: modes.hybrid,
    dataGaps: ["缺少逐日降雨", "缺少田间水层记录"],
    redFlags: ["长期缺水场景必须提示水分胁迫"]
  },
  {
    id: "eval-014",
    scenario: "雨水偏多与渍涝风险样本",
    start_date: "2026-06-12",
    soil_ph: 6.6,
    salinity: "normal",
    n: "medium",
    water: "wet",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-10-06",
    duration: 117,
    gdd: [1850, 1850, 0],
    yieldKgMu: 610,
    risk: statusValues.medium,
    confidence: "low",
    mode: modes.hybrid,
    dataGaps: ["缺少逐日降雨", "缺少排水能力数据"],
    redFlags: ["雨水偏多时不能频繁建议灌溉"]
  },
  {
    id: "eval-015",
    scenario: "氮素过量倒伏风险样本",
    start_date: "2026-06-03",
    soil_ph: 6.4,
    salinity: "normal",
    n: "high",
    water: "normal",
    yieldLevel: "high",
    management: "high_yield",
    window: "recommended",
    harvest: "2026-09-27",
    duration: 117,
    gdd: [1850, 1850, 0],
    yieldKgMu: 680,
    risk: statusValues.medium,
    confidence: "medium",
    mode: modes.hybrid,
    dataGaps: baseDataGaps,
    redFlags: ["氮供应过量，需要提示倒伏、贪青和环境风险"]
  },
  {
    id: "eval-016",
    scenario: "氮素不足低产风险样本",
    start_date: "2026-06-08",
    soil_ph: 6.4,
    salinity: "normal",
    n: "low",
    water: "normal",
    yieldLevel: "low",
    management: "low_input",
    window: "recommended",
    harvest: "2026-10-02",
    duration: 117,
    gdd: [1850, 1850, 0],
    yieldKgMu: 540,
    risk: statusValues.medium,
    confidence: "medium",
    mode: modes.hybrid,
    dataGaps: ["缺少土壤碱解氮实测", "缺少叶色/叶片氮监测"],
    redFlags: ["氮供应不足时必须提示氮胁迫"]
  },
  {
    id: "eval-017",
    scenario: "缺少真实土壤检测样本",
    start_date: "2026-05-28",
    soil_ph: 6.4,
    salinity: "unknown",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "recommended",
    harvest: "2026-09-22",
    duration: 118,
    gdd: [1850, 1850, 0],
    yieldKgMu: 660,
    risk: statusValues.medium,
    confidence: "low",
    mode: modes.hybrid,
    dataGaps: ["缺少真实土壤检测", "缺少 EC 实测", "缺少本地试验产量"],
    redFlags: ["缺少真实土壤检测，不能给 high confidence"]
  },
  {
    id: "eval-018",
    scenario: "缺少本地试验产量样本",
    start_date: "2026-06-18",
    soil_ph: 6.5,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "high",
    management: "high_yield",
    window: "recommended",
    harvest: "2026-10-11",
    duration: 116,
    gdd: [1850, 1850, 0],
    yieldKgMu: 730,
    risk: statusValues.medium,
    confidence: "low",
    mode: modes.hybrid,
    dataGaps: ["缺少本地试验产量", "缺少品种参数"],
    redFlags: ["缺少本地试验产量，产量预测不能 high confidence"]
  },
  {
    id: "eval-019",
    scenario: "模块多数低分但基础数据尚可样本",
    start_date: "2026-07-08",
    soil_ph: 5.4,
    salinity: "high",
    n: "high",
    water: "wet",
    yieldLevel: "medium",
    management: "conventional",
    window: "caution",
    harvest: "2026-11-02",
    duration: 118,
    gdd: [1850, 1710, 140],
    yieldKgMu: 430,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.draft,
    dataGaps: ["缺少逐日气象", "缺少叶片检测"],
    redFlags: ["盐分、过量氮、渍涝和晚播风险叠加", "DNDC-lite 日程不宜直接使用"]
  },
  {
    id: "eval-020",
    scenario: "未来扩展柑橘不可复用水稻模型样本",
    crop_id: "orange",
    region_id: "hubei-jianghan",
    start_date: "2026-03-20",
    soil_ph: 6.0,
    salinity: "normal",
    n: "medium",
    water: "normal",
    yieldLevel: "medium",
    management: "conventional",
    window: "not_configured",
    harvest: "未配置",
    duration: 0,
    gdd: [0, 0, 0],
    yieldKgMu: 0,
    risk: statusValues.high,
    confidence: "low",
    mode: modes.manual,
    dataGaps: ["缺少柑橘作物参数", "缺少多年生物候模型", "缺少湖北柑橘区域校准", "缺少本地试验产量"],
    redFlags: ["不能直接照搬水稻模型到柑橘/橙子", "多年生果树需要单独参数和区域校准"]
  }
];

function makeChecklist(item) {
  const unitCheck = ["肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"];
  const dateCheck = isDate(item.start_date)
    ? [`播栽日期 ${item.start_date} 合法；窗口状态为 ${item.window}。`]
    : [`播栽日期 ${item.start_date} 非法。`];
  const gddCheck = [`GDD required/accumulated/missing = ${item.gdd.join("/")}; 不允许负积温。`];
  const waterCheck = [waterMessage(item.water)];
  const nitrogenCheck = [nitrogenMessage(item.n)];
  const fertilizerCheck = ["施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"];
  const riskCheck = item.redFlags.length ? item.redFlags : ["未发现严重规则冲突。"];
  const evidenceCheck = item.dataGaps.map((gap) => `data_gap: ${gap}`);

  return {
    unit_check: unitCheck,
    date_window_check: dateCheck,
    gdd_check: gddCheck,
    phenology_consistency_check: [item.gdd[2] > 0 ? "物候未完全完成，不能输出高可信收获方案。" : "物候阶段与 GDD 进度基本一致。"],
    water_balance_check: waterCheck,
    nitrogen_budget_check: nitrogenCheck,
    fertilizer_schedule_check: fertilizerCheck,
    risk_check: riskCheck,
    evidence_check: evidenceCheck,
    data_gaps: item.dataGaps,
    red_flags: item.redFlags,
    overall_risk_level: item.risk,
    human_review_required: true
  };
}

function makeOutput(item) {
  const [requiredGdd, accumulatedGdd, missingGdd] = item.gdd;
  const usableCalendar = item.window !== "late" && item.window !== "not_configured" && missingGdd === 0;
  return {
    phenology_result: {
      start_date: item.start_date,
      start_window: item.window,
      expected_harvest_date: item.harvest,
      duration_days: item.duration,
      phenology_status: missingGdd > 0 ? "incomplete_or_high_risk" : "complete_under_normals",
      note: item.window === "not_configured" ? "该作物没有区域物候参数，不能复用水稻模型。" : "基于月均气候插值的逐日 GDD 推算。"
    },
    gdd_result: {
      required_gdd_c: requiredGdd,
      accumulated_gdd_c: accumulatedGdd,
      missing_gdd_c: missingGdd,
      can_complete_before_harvest_limit: missingGdd === 0,
      unit: "degree-days"
    },
    water_balance_result: {
      water_condition: item.water,
      seasonal_water_budget_mm: item.water === "dry" ? 520 : item.water === "wet" ? 780 : 650,
      irrigation_logic: item.water === "wet" ? "reduce_irrigation_and_prioritize_drainage" : item.water === "dry" ? "increase_monitoring_and_shallow_irrigation" : "normal_awD_or_shallow_water",
      stress_risk: item.water === "normal" ? "low" : "medium"
    },
    nitrogen_demand_result: {
      nitrogen_supply_level: item.n,
      planned_n_kg_mu: item.n === "low" ? [8, 9] : item.n === "high" ? [13, 15] : [10.5, 12.5],
      stage_logic: "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
      stress_risk: item.n === "low" ? "nitrogen_deficit" : item.n === "high" ? "lodging_and_late_maturity" : "normal"
    },
    fertilizer_schedule_result: {
      has_dates: usableCalendar,
      unit: "kg/亩",
      required_events: item.crop_id === "orange" ? [] : ["基肥/侧深施", "分蘖肥", "穗肥/补钾", "叶面补肥可选"],
      reason_required: true,
      note: item.crop_id === "orange" ? "缺少柑橘肥料日程，必须新建果树模型。" : "水稻施肥日程应随物候节点移动。"
    },
    irrigation_schedule_result: {
      has_dates: usableCalendar,
      unit: "cm water layer or mm",
      key_rules: item.crop_id === "orange" ? [] : ["返青浅水", "够苗晒田", "孕穗稳水", "灌浆干湿交替", "收前排水"],
      note: item.water === "wet" ? "雨水偏多时需要减少灌溉，优先排水。" : "按阶段水层和土壤水状态触发。"
    },
    operation_calendar_result: {
      has_calendar: usableCalendar,
      event_count: usableCalendar ? 12 : 0,
      pending_review: true,
      note: "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
    },
    yield_prediction_result: {
      estimate_kg_mu: item.yieldKgMu,
      confidence_level: item.confidence,
      can_use_for_decision: item.confidence !== "low" && item.risk !== "high",
      warning: "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
    },
    risk_assessment_result: {
      overall_risk_level: item.risk,
      red_flags: item.redFlags,
      data_gaps: item.dataGaps,
      no_guaranteed_yield_claim: true
    }
  };
}

function makeDecision(item) {
  const reusable = item.crop_id === "orange"
    ? []
    : ["dates_if_window_valid", "gdd_progress", "nitrogen_demand_structure", "fertilizer_event_framework"];
  const discard = [];
  if (item.confidence === "low") discard.push("high_confidence_yield_prediction");
  if (item.window === "late" || item.window === "not_configured") discard.push("operation_calendar_as_execution_plan");
  if (item.crop_id === "orange") discard.push("rice_phenology_model", "rice_water_layer_logic", "rice_fertilizer_schedule");

  return {
    recommended_mode: item.mode,
    can_use_dndc_lite: item.mode !== modes.manual || item.crop_id !== "orange",
    can_use_dndc_lite_for_dates: item.window !== "late" && item.window !== "not_configured",
    can_use_dndc_lite_for_gdd: item.crop_id !== "orange",
    can_use_dndc_lite_for_water_balance: item.crop_id !== "orange" && item.risk !== "high",
    can_use_dndc_lite_for_nitrogen_budget: item.crop_id !== "orange",
    can_use_dndc_lite_for_fertilizer_schedule: item.crop_id !== "orange" && item.window !== "late",
    can_use_dndc_lite_for_yield_prediction: false,
    reuse_modules: reusable,
    discard_modules: discard,
    required_human_checks: item.dataGaps,
    notes: item.crop_id === "orange"
      ? "柑橘/橙子是多年生果树，必须先建立作物参数、区域校准和多年生物候逻辑。"
      : "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
  };
}

function makeContract(item) {
  return {
    schema_id: "gpt55-review-schema-v1",
    review_status: "pending_review",
    allowed_actions: ["risk_review", "plain_language_rewrite", "json_patch_suggestion", "data_gap_detection", "human_checklist"],
    forbidden_actions: ["overwrite_dndc_dates", "auto_apply_patch", "invent_pesticide_product", "guarantee_yield"],
    patch_policy: "all_json_patch_suggestions_must_remain_pending_review",
    data_gaps: item.dataGaps
  };
}

function waterMessage(value) {
  if (value === "dry") return "干旱场景必须提示水分胁迫，并检查灌溉触发是否与水分余额一致。";
  if (value === "wet") return "雨水偏多场景应减少灌溉并提示排水、渍涝和病害风险。";
  return "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。";
}

function nitrogenMessage(value) {
  if (value === "low") return "氮素不足时必须提示氮胁迫，不能仍给高产结论。";
  if (value === "high") return "氮素过量时必须提示倒伏、贪青、病害和环境风险。";
  return "氮素需求应随物候推进，不应在后期大量土施氮肥。";
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

const samples = scenarios.map((item) => ({
  id: item.id,
  crop_id: item.crop_id || "rice",
  region_id: item.region_id || "hubei-jianghan",
  scenario: item.scenario,
  start_date: item.start_date,
  input_summary: {
    soil_ph: item.soil_ph,
    soil_salinity_level: item.salinity,
    nitrogen_supply_level: item.n,
    water_condition: item.water,
    target_yield_level: item.yieldLevel,
    management_intensity: item.management
  },
  dndc_lite_output: makeOutput(item),
  local_validation_result: makeChecklist(item),
  gpt55_review_contract: makeContract(item),
  gpt55_review_output: null,
  decision: makeDecision(item),
  status: "not_reviewed"
}));

writeFileSync(outputPath, `${JSON.stringify({
  schemaVersion: "2026-05-dndc-lite-model-evaluation-samples-v1",
  description: "Twenty scenario samples for evaluating DNDC-lite output and GPT-5.5 review boundaries. GPT outputs are intentionally null and pending human review.",
  samples
}, null, 2)}\n`, "utf8");

console.log(`Generated ${outputPath}`);
