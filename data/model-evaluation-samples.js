window.MODEL_EVALUATION_SAMPLES = {
  "schemaVersion": "2026-05-dndc-lite-model-evaluation-samples-v1",
  "description": "Twenty scenario samples for evaluating DNDC-lite output and GPT-5.5 review boundaries. GPT outputs are intentionally null and pending human review.",
  "samples": [
    {
      "id": "eval-001",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "湖北中稻推荐播栽窗口样本",
      "start_date": "2026-05-20",
      "input_summary": {
        "soil_ph": 6.2,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-05-20",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-15",
          "duration_days": 119,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 700,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "low",
          "red_flags": [],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少完整品种熟期参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-05-20 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "未发现严重规则冲突。"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少完整品种熟期参数"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少完整品种熟期参数"
        ],
        "red_flags": [],
        "overall_risk_level": "low",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少完整品种熟期参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "dndc_primary_gpt_review",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少完整品种熟期参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-002",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "推荐窗口高产管理样本",
      "start_date": "2026-06-01",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "high",
        "management_intensity": "high_yield"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-01",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-24",
          "duration_days": 116,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 742,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "low",
          "red_flags": [],
          "data_gaps": [
            "缺少逐日实测气象"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-01 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "未发现严重规则冲突。"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象"
        ],
        "data_gaps": [
          "缺少逐日实测气象"
        ],
        "red_flags": [],
        "overall_risk_level": "low",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "dndc_primary_gpt_review",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-003",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "推荐窗口低投入管理样本",
      "start_date": "2026-06-10",
      "input_summary": {
        "soil_ph": 6.3,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "low",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "low_input"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-10",
          "start_window": "recommended",
          "expected_harvest_date": "2026-10-04",
          "duration_days": 117,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "low",
          "planned_n_kg_mu": [
            8,
            9
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "nitrogen_deficit"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 610,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "氮供应不足时仍可能低估氮胁迫"
          ],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少品种熟期参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-10 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素不足时必须提示氮胁迫，不能仍给高产结论。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "氮供应不足时仍可能低估氮胁迫"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少品种熟期参数"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "red_flags": [
          "氮供应不足时仍可能低估氮胁迫"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-004",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "推荐窗口偏酸水稻土样本",
      "start_date": "2026-05-25",
      "input_summary": {
        "soil_ph": 5.1,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-05-25",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-20",
          "duration_days": 119,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 650,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "pH 偏酸，需要土壤检测和调理建议"
          ],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少品种熟期参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-05-25 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "pH 偏酸，需要土壤检测和调理建议"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少品种熟期参数"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "red_flags": [
          "pH 偏酸，需要土壤检测和调理建议"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-005",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "推荐窗口偏碱田块样本",
      "start_date": "2026-06-05",
      "input_summary": {
        "soil_ph": 7.9,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-05",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-29",
          "duration_days": 117,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 640,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "pH 偏碱，磷和微量元素有效性需要人工确认"
          ],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少品种熟期参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-05 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "pH 偏碱，磷和微量元素有效性需要人工确认"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少品种熟期参数"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "red_flags": [
          "pH 偏碱，磷和微量元素有效性需要人工确认"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-006",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "推荐窗口盐分偏高样本",
      "start_date": "2026-05-30",
      "input_summary": {
        "soil_ph": 6.5,
        "soil_salinity_level": "high",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-05-30",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-23",
          "duration_days": 117,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 570,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "盐分偏高，需先确认 EC 和洗盐排水条件"
          ],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少品种熟期参数",
            "缺少 EC 实测值"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-05-30 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "盐分偏高，需先确认 EC 和洗盐排水条件"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少品种熟期参数",
          "data_gap: 缺少 EC 实测值"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数",
          "缺少 EC 实测值"
        ],
        "red_flags": [
          "盐分偏高，需先确认 EC 和洗盐排水条件"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数",
          "缺少 EC 实测值"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少品种熟期参数",
          "缺少 EC 实测值"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-007",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "谨慎窗口早熟品种样本",
      "start_date": "2026-06-25",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-25",
          "start_window": "caution",
          "expected_harvest_date": "2026-10-16",
          "duration_days": 114,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 640,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "谨慎窗口，需要当地气象和早熟品种人工确认"
          ],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少品种熟期参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-25 合法；窗口状态为 caution。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "谨慎窗口，需要当地气象和早熟品种人工确认"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少品种熟期参数"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "red_flags": [
          "谨慎窗口，需要当地气象和早熟品种人工确认"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-008",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "谨慎窗口氮素不足样本",
      "start_date": "2026-07-05",
      "input_summary": {
        "soil_ph": 6.1,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "low",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "low_input"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-07-05",
          "start_window": "caution",
          "expected_harvest_date": "2026-10-27",
          "duration_days": 115,
          "phenology_status": "incomplete_or_high_risk",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1780,
          "missing_gdd_c": 70,
          "can_complete_before_harvest_limit": false,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "low",
          "planned_n_kg_mu": [
            8,
            9
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "nitrogen_deficit"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 560,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "谨慎窗口叠加氮供应不足",
            "本地数据缺口较大，产量预测不可用"
          ],
          "data_gaps": [
            "缺少真实土壤检测",
            "缺少逐日气象",
            "缺少本地试验产量",
            "缺少品种参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-07-05 合法；窗口状态为 caution。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1780/70; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候未完全完成，不能输出高可信收获方案。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素不足时必须提示氮胁迫，不能仍给高产结论。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "谨慎窗口叠加氮供应不足",
          "本地数据缺口较大，产量预测不可用"
        ],
        "evidence_check": [
          "data_gap: 缺少真实土壤检测",
          "data_gap: 缺少逐日气象",
          "data_gap: 缺少本地试验产量",
          "data_gap: 缺少品种参数"
        ],
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "red_flags": [
          "谨慎窗口叠加氮供应不足",
          "本地数据缺口较大，产量预测不可用"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-009",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "谨慎窗口雨水偏多样本",
      "start_date": "2026-07-10",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "wet",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-07-10",
          "start_window": "caution",
          "expected_harvest_date": "2026-11-01",
          "duration_days": 115,
          "phenology_status": "incomplete_or_high_risk",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1735,
          "missing_gdd_c": 115,
          "can_complete_before_harvest_limit": false,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "wet",
          "seasonal_water_budget_mm": 780,
          "irrigation_logic": "reduce_irrigation_and_prioritize_drainage",
          "stress_risk": "medium"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "雨水偏多时需要减少灌溉，优先排水。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 520,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "雨水偏多却仍需检查灌溉安排",
            "接近安全收获上限，低温灌浆风险高"
          ],
          "data_gaps": [
            "缺少真实土壤检测",
            "缺少逐日气象",
            "缺少本地试验产量",
            "缺少品种参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-07-10 合法；窗口状态为 caution。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1735/115; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候未完全完成，不能输出高可信收获方案。"
        ],
        "water_balance_check": [
          "雨水偏多场景应减少灌溉并提示排水、渍涝和病害风险。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "雨水偏多却仍需检查灌溉安排",
          "接近安全收获上限，低温灌浆风险高"
        ],
        "evidence_check": [
          "data_gap: 缺少真实土壤检测",
          "data_gap: 缺少逐日气象",
          "data_gap: 缺少本地试验产量",
          "data_gap: 缺少品种参数"
        ],
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "red_flags": [
          "雨水偏多却仍需检查灌溉安排",
          "接近安全收获上限，低温灌浆风险高"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "manual_expert_only",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-010",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "过晚播栽积温不足样本",
      "start_date": "2026-07-20",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-07-20",
          "start_window": "late",
          "expected_harvest_date": "晚于 2026-11-05",
          "duration_days": 109,
          "phenology_status": "incomplete_or_high_risk",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1194,
          "missing_gdd_c": 656,
          "can_complete_before_harvest_limit": false,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 311,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "晚于本地高风险界限",
            "到安全收获上限仍缺少大量 GDD"
          ],
          "data_gaps": [
            "缺少真实土壤检测",
            "缺少逐日气象",
            "缺少本地试验产量",
            "缺少品种参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-07-20 合法；窗口状态为 late。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1194/656; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候未完全完成，不能输出高可信收获方案。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "晚于本地高风险界限",
          "到安全收获上限仍缺少大量 GDD"
        ],
        "evidence_check": [
          "data_gap: 缺少真实土壤检测",
          "data_gap: 缺少逐日气象",
          "data_gap: 缺少本地试验产量",
          "data_gap: 缺少品种参数"
        ],
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "red_flags": [
          "晚于本地高风险界限",
          "到安全收获上限仍缺少大量 GDD"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "manual_expert_only",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": false,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": false,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction",
          "operation_calendar_as_execution_plan"
        ],
        "required_human_checks": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-011",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "极晚播栽不可成熟样本",
      "start_date": "2026-08-01",
      "input_summary": {
        "soil_ph": 6.3,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "low",
        "management_intensity": "low_input"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-08-01",
          "start_window": "late",
          "expected_harvest_date": "晚于 2026-11-05",
          "duration_days": 97,
          "phenology_status": "incomplete_or_high_risk",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 930,
          "missing_gdd_c": 920,
          "can_complete_before_harvest_limit": false,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 250,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "积温严重不足",
            "不应给出生产执行方案"
          ],
          "data_gaps": [
            "缺少真实土壤检测",
            "缺少逐日气象",
            "缺少本地试验产量",
            "缺少品种参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-08-01 合法；窗口状态为 late。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/930/920; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候未完全完成，不能输出高可信收获方案。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "积温严重不足",
          "不应给出生产执行方案"
        ],
        "evidence_check": [
          "data_gap: 缺少真实土壤检测",
          "data_gap: 缺少逐日气象",
          "data_gap: 缺少本地试验产量",
          "data_gap: 缺少品种参数"
        ],
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "red_flags": [
          "积温严重不足",
          "不应给出生产执行方案"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "manual_expert_only",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": false,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": false,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction",
          "operation_calendar_as_execution_plan"
        ],
        "required_human_checks": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-012",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "抽穗灌浆低温风险样本",
      "start_date": "2026-07-12",
      "input_summary": {
        "soil_ph": 6.5,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-07-12",
          "start_window": "caution",
          "expected_harvest_date": "2026-11-04",
          "duration_days": 116,
          "phenology_status": "incomplete_or_high_risk",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1705,
          "missing_gdd_c": 145,
          "can_complete_before_harvest_limit": false,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 500,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "抽穗灌浆期低温风险",
            "积温不足却不能给高产结论"
          ],
          "data_gaps": [
            "缺少真实土壤检测",
            "缺少逐日气象",
            "缺少本地试验产量",
            "缺少品种参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-07-12 合法；窗口状态为 caution。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1705/145; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候未完全完成，不能输出高可信收获方案。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "抽穗灌浆期低温风险",
          "积温不足却不能给高产结论"
        ],
        "evidence_check": [
          "data_gap: 缺少真实土壤检测",
          "data_gap: 缺少逐日气象",
          "data_gap: 缺少本地试验产量",
          "data_gap: 缺少品种参数"
        ],
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "red_flags": [
          "抽穗灌浆期低温风险",
          "积温不足却不能给高产结论"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "manual_expert_only",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少真实土壤检测",
          "缺少逐日气象",
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-013",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "干旱胁迫但播期适宜样本",
      "start_date": "2026-05-18",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "dry",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-05-18",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-14",
          "duration_days": 120,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "dry",
          "seasonal_water_budget_mm": 520,
          "irrigation_logic": "increase_monitoring_and_shallow_irrigation",
          "stress_risk": "medium"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 590,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "长期缺水场景必须提示水分胁迫"
          ],
          "data_gaps": [
            "缺少逐日降雨",
            "缺少田间水层记录"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-05-18 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "干旱场景必须提示水分胁迫，并检查灌溉触发是否与水分余额一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "长期缺水场景必须提示水分胁迫"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日降雨",
          "data_gap: 缺少田间水层记录"
        ],
        "data_gaps": [
          "缺少逐日降雨",
          "缺少田间水层记录"
        ],
        "red_flags": [
          "长期缺水场景必须提示水分胁迫"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日降雨",
          "缺少田间水层记录"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少逐日降雨",
          "缺少田间水层记录"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-014",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "雨水偏多与渍涝风险样本",
      "start_date": "2026-06-12",
      "input_summary": {
        "soil_ph": 6.6,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "wet",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-12",
          "start_window": "recommended",
          "expected_harvest_date": "2026-10-06",
          "duration_days": 117,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "wet",
          "seasonal_water_budget_mm": 780,
          "irrigation_logic": "reduce_irrigation_and_prioritize_drainage",
          "stress_risk": "medium"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "雨水偏多时需要减少灌溉，优先排水。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 610,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "雨水偏多时不能频繁建议灌溉"
          ],
          "data_gaps": [
            "缺少逐日降雨",
            "缺少排水能力数据"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-12 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "雨水偏多场景应减少灌溉并提示排水、渍涝和病害风险。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "雨水偏多时不能频繁建议灌溉"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日降雨",
          "data_gap: 缺少排水能力数据"
        ],
        "data_gaps": [
          "缺少逐日降雨",
          "缺少排水能力数据"
        ],
        "red_flags": [
          "雨水偏多时不能频繁建议灌溉"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日降雨",
          "缺少排水能力数据"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少逐日降雨",
          "缺少排水能力数据"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-015",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "氮素过量倒伏风险样本",
      "start_date": "2026-06-03",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "high",
        "water_condition": "normal",
        "target_yield_level": "high",
        "management_intensity": "high_yield"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-03",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-27",
          "duration_days": 117,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "high",
          "planned_n_kg_mu": [
            13,
            15
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "lodging_and_late_maturity"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 680,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "氮供应过量，需要提示倒伏、贪青和环境风险"
          ],
          "data_gaps": [
            "缺少逐日实测气象",
            "缺少品种熟期参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-03 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素过量时必须提示倒伏、贪青、病害和环境风险。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "氮供应过量，需要提示倒伏、贪青和环境风险"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日实测气象",
          "data_gap: 缺少品种熟期参数"
        ],
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "red_flags": [
          "氮供应过量，需要提示倒伏、贪青和环境风险"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少逐日实测气象",
          "缺少品种熟期参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-016",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "氮素不足低产风险样本",
      "start_date": "2026-06-08",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "low",
        "water_condition": "normal",
        "target_yield_level": "low",
        "management_intensity": "low_input"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-08",
          "start_window": "recommended",
          "expected_harvest_date": "2026-10-02",
          "duration_days": 117,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "low",
          "planned_n_kg_mu": [
            8,
            9
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "nitrogen_deficit"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 540,
          "confidence_level": "medium",
          "can_use_for_decision": true,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "氮供应不足时必须提示氮胁迫"
          ],
          "data_gaps": [
            "缺少土壤碱解氮实测",
            "缺少叶色/叶片氮监测"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-08 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素不足时必须提示氮胁迫，不能仍给高产结论。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "氮供应不足时必须提示氮胁迫"
        ],
        "evidence_check": [
          "data_gap: 缺少土壤碱解氮实测",
          "data_gap: 缺少叶色/叶片氮监测"
        ],
        "data_gaps": [
          "缺少土壤碱解氮实测",
          "缺少叶色/叶片氮监测"
        ],
        "red_flags": [
          "氮供应不足时必须提示氮胁迫"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少土壤碱解氮实测",
          "缺少叶色/叶片氮监测"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [],
        "required_human_checks": [
          "缺少土壤碱解氮实测",
          "缺少叶色/叶片氮监测"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-017",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "缺少真实土壤检测样本",
      "start_date": "2026-05-28",
      "input_summary": {
        "soil_ph": 6.4,
        "soil_salinity_level": "unknown",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-05-28",
          "start_window": "recommended",
          "expected_harvest_date": "2026-09-22",
          "duration_days": 118,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 660,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "缺少真实土壤检测，不能给 high confidence"
          ],
          "data_gaps": [
            "缺少真实土壤检测",
            "缺少 EC 实测",
            "缺少本地试验产量"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-05-28 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "缺少真实土壤检测，不能给 high confidence"
        ],
        "evidence_check": [
          "data_gap: 缺少真实土壤检测",
          "data_gap: 缺少 EC 实测",
          "data_gap: 缺少本地试验产量"
        ],
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少 EC 实测",
          "缺少本地试验产量"
        ],
        "red_flags": [
          "缺少真实土壤检测，不能给 high confidence"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少真实土壤检测",
          "缺少 EC 实测",
          "缺少本地试验产量"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少真实土壤检测",
          "缺少 EC 实测",
          "缺少本地试验产量"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-018",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "缺少本地试验产量样本",
      "start_date": "2026-06-18",
      "input_summary": {
        "soil_ph": 6.5,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "high",
        "management_intensity": "high_yield"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-06-18",
          "start_window": "recommended",
          "expected_harvest_date": "2026-10-11",
          "duration_days": 116,
          "phenology_status": "complete_under_normals",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1850,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": true,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": true,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": true,
          "event_count": 12,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 730,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "medium",
          "red_flags": [
            "缺少本地试验产量，产量预测不能 high confidence"
          ],
          "data_gaps": [
            "缺少本地试验产量",
            "缺少品种参数"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-06-18 合法；窗口状态为 recommended。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1850/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "缺少本地试验产量，产量预测不能 high confidence"
        ],
        "evidence_check": [
          "data_gap: 缺少本地试验产量",
          "data_gap: 缺少品种参数"
        ],
        "data_gaps": [
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "red_flags": [
          "缺少本地试验产量，产量预测不能 high confidence"
        ],
        "overall_risk_level": "medium",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少本地试验产量",
          "缺少品种参数"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "hybrid",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": true,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少本地试验产量",
          "缺少品种参数"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-019",
      "crop_id": "rice",
      "region_id": "hubei-jianghan",
      "scenario": "模块多数低分但基础数据尚可样本",
      "start_date": "2026-07-08",
      "input_summary": {
        "soil_ph": 5.4,
        "soil_salinity_level": "high",
        "nitrogen_supply_level": "high",
        "water_condition": "wet",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-07-08",
          "start_window": "caution",
          "expected_harvest_date": "2026-11-02",
          "duration_days": 118,
          "phenology_status": "incomplete_or_high_risk",
          "note": "基于月均气候插值的逐日 GDD 推算。"
        },
        "gdd_result": {
          "required_gdd_c": 1850,
          "accumulated_gdd_c": 1710,
          "missing_gdd_c": 140,
          "can_complete_before_harvest_limit": false,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "wet",
          "seasonal_water_budget_mm": 780,
          "irrigation_logic": "reduce_irrigation_and_prioritize_drainage",
          "stress_risk": "medium"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "high",
          "planned_n_kg_mu": [
            13,
            15
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "lodging_and_late_maturity"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [
            "基肥/侧深施",
            "分蘖肥",
            "穗肥/补钾",
            "叶面补肥可选"
          ],
          "reason_required": true,
          "note": "水稻施肥日程应随物候节点移动。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [
            "返青浅水",
            "够苗晒田",
            "孕穗稳水",
            "灌浆干湿交替",
            "收前排水"
          ],
          "note": "雨水偏多时需要减少灌溉，优先排水。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 430,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "盐分、过量氮、渍涝和晚播风险叠加",
            "DNDC-lite 日程不宜直接使用"
          ],
          "data_gaps": [
            "缺少逐日气象",
            "缺少叶片检测"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-07-08 合法；窗口状态为 caution。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 1850/1710/140; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候未完全完成，不能输出高可信收获方案。"
        ],
        "water_balance_check": [
          "雨水偏多场景应减少灌溉并提示排水、渍涝和病害风险。"
        ],
        "nitrogen_budget_check": [
          "氮素过量时必须提示倒伏、贪青、病害和环境风险。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "盐分、过量氮、渍涝和晚播风险叠加",
          "DNDC-lite 日程不宜直接使用"
        ],
        "evidence_check": [
          "data_gap: 缺少逐日气象",
          "data_gap: 缺少叶片检测"
        ],
        "data_gaps": [
          "缺少逐日气象",
          "缺少叶片检测"
        ],
        "red_flags": [
          "盐分、过量氮、渍涝和晚播风险叠加",
          "DNDC-lite 日程不宜直接使用"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少逐日气象",
          "缺少叶片检测"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "gpt_direct_draft",
        "can_use_dndc_lite": true,
        "can_use_dndc_lite_for_dates": true,
        "can_use_dndc_lite_for_gdd": true,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": true,
        "can_use_dndc_lite_for_fertilizer_schedule": true,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [
          "dates_if_window_valid",
          "gdd_progress",
          "nitrogen_demand_structure",
          "fertilizer_event_framework"
        ],
        "discard_modules": [
          "high_confidence_yield_prediction"
        ],
        "required_human_checks": [
          "缺少逐日气象",
          "缺少叶片检测"
        ],
        "notes": "DNDC-lite 可优先复用日期、GDD 和需肥结构；产量预测需本地试验校准。"
      },
      "status": "not_reviewed"
    },
    {
      "id": "eval-020",
      "crop_id": "orange",
      "region_id": "hubei-jianghan",
      "scenario": "未来扩展柑橘不可复用水稻模型样本",
      "start_date": "2026-03-20",
      "input_summary": {
        "soil_ph": 6,
        "soil_salinity_level": "normal",
        "nitrogen_supply_level": "medium",
        "water_condition": "normal",
        "target_yield_level": "medium",
        "management_intensity": "conventional"
      },
      "dndc_lite_output": {
        "phenology_result": {
          "start_date": "2026-03-20",
          "start_window": "not_configured",
          "expected_harvest_date": "未配置",
          "duration_days": 0,
          "phenology_status": "complete_under_normals",
          "note": "该作物没有区域物候参数，不能复用水稻模型。"
        },
        "gdd_result": {
          "required_gdd_c": 0,
          "accumulated_gdd_c": 0,
          "missing_gdd_c": 0,
          "can_complete_before_harvest_limit": true,
          "unit": "degree-days"
        },
        "water_balance_result": {
          "water_condition": "normal",
          "seasonal_water_budget_mm": 650,
          "irrigation_logic": "normal_awD_or_shallow_water",
          "stress_risk": "low"
        },
        "nitrogen_demand_result": {
          "nitrogen_supply_level": "medium",
          "planned_n_kg_mu": [
            10.5,
            12.5
          ],
          "stage_logic": "basal_or_side_deep + tillering adjustment + panicle potassium/nitrogen balance",
          "stress_risk": "normal"
        },
        "fertilizer_schedule_result": {
          "has_dates": false,
          "unit": "kg/亩",
          "required_events": [],
          "reason_required": true,
          "note": "缺少柑橘肥料日程，必须新建果树模型。"
        },
        "irrigation_schedule_result": {
          "has_dates": false,
          "unit": "cm water layer or mm",
          "key_rules": [],
          "note": "按阶段水层和土壤水状态触发。"
        },
        "operation_calendar_result": {
          "has_calendar": false,
          "event_count": 0,
          "pending_review": true,
          "note": "日程只作为 DNDC-lite 初算结果，GPT 和人工审核不得自动覆盖。"
        },
        "yield_prediction_result": {
          "estimate_kg_mu": 0,
          "confidence_level": "low",
          "can_use_for_decision": false,
          "warning": "产量预测只能作为估算；缺少本地试验产量时不能 high confidence。"
        },
        "risk_assessment_result": {
          "overall_risk_level": "high",
          "red_flags": [
            "不能直接照搬水稻模型到柑橘/橙子",
            "多年生果树需要单独参数和区域校准"
          ],
          "data_gaps": [
            "缺少柑橘作物参数",
            "缺少多年生物候模型",
            "缺少湖北柑橘区域校准",
            "缺少本地试验产量"
          ],
          "no_guaranteed_yield_claim": true
        }
      },
      "local_validation_result": {
        "unit_check": [
          "肥料用量字段使用 kg/亩；水分字段使用 mm 或水层厘米；N/P2O5/K2O 口径分开记录。"
        ],
        "date_window_check": [
          "播栽日期 2026-03-20 合法；窗口状态为 not_configured。"
        ],
        "gdd_check": [
          "GDD required/accumulated/missing = 0/0/0; 不允许负积温。"
        ],
        "phenology_consistency_check": [
          "物候阶段与 GDD 进度基本一致。"
        ],
        "water_balance_check": [
          "常规水分场景下，浅水、晒田、孕穗稳水和收前排水逻辑需与阶段一致。"
        ],
        "nitrogen_budget_check": [
          "氮素需求应随物候推进，不应在后期大量土施氮肥。"
        ],
        "fertilizer_schedule_check": [
          "施肥事件必须保留日期、阶段、肥料/养分、用量和原因；GPT patch 不得自动应用。"
        ],
        "risk_check": [
          "不能直接照搬水稻模型到柑橘/橙子",
          "多年生果树需要单独参数和区域校准"
        ],
        "evidence_check": [
          "data_gap: 缺少柑橘作物参数",
          "data_gap: 缺少多年生物候模型",
          "data_gap: 缺少湖北柑橘区域校准",
          "data_gap: 缺少本地试验产量"
        ],
        "data_gaps": [
          "缺少柑橘作物参数",
          "缺少多年生物候模型",
          "缺少湖北柑橘区域校准",
          "缺少本地试验产量"
        ],
        "red_flags": [
          "不能直接照搬水稻模型到柑橘/橙子",
          "多年生果树需要单独参数和区域校准"
        ],
        "overall_risk_level": "high",
        "human_review_required": true
      },
      "gpt55_review_contract": {
        "schema_id": "gpt55-review-schema-v1",
        "review_status": "pending_review",
        "allowed_actions": [
          "risk_review",
          "plain_language_rewrite",
          "json_patch_suggestion",
          "data_gap_detection",
          "human_checklist"
        ],
        "forbidden_actions": [
          "overwrite_dndc_dates",
          "auto_apply_patch",
          "invent_pesticide_product",
          "guarantee_yield"
        ],
        "patch_policy": "all_json_patch_suggestions_must_remain_pending_review",
        "data_gaps": [
          "缺少柑橘作物参数",
          "缺少多年生物候模型",
          "缺少湖北柑橘区域校准",
          "缺少本地试验产量"
        ]
      },
      "gpt55_review_output": null,
      "decision": {
        "recommended_mode": "manual_expert_only",
        "can_use_dndc_lite": false,
        "can_use_dndc_lite_for_dates": false,
        "can_use_dndc_lite_for_gdd": false,
        "can_use_dndc_lite_for_water_balance": false,
        "can_use_dndc_lite_for_nitrogen_budget": false,
        "can_use_dndc_lite_for_fertilizer_schedule": false,
        "can_use_dndc_lite_for_yield_prediction": false,
        "reuse_modules": [],
        "discard_modules": [
          "high_confidence_yield_prediction",
          "operation_calendar_as_execution_plan",
          "rice_phenology_model",
          "rice_water_layer_logic",
          "rice_fertilizer_schedule"
        ],
        "required_human_checks": [
          "缺少柑橘作物参数",
          "缺少多年生物候模型",
          "缺少湖北柑橘区域校准",
          "缺少本地试验产量"
        ],
        "notes": "柑橘/橙子是多年生果树，必须先建立作物参数、区域校准和多年生物候逻辑。"
      },
      "status": "not_reviewed"
    }
  ]
};
