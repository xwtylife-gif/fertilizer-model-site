window.GPT55_REVIEW_SCHEMA = {
  "schemaVersion": "gpt55-review-schema-v1",
  "purpose": "GPT-5.5 risk review and JSON patch suggestion contract",
  "review_policy": {
    "default_status": "pending_review",
    "patch_application": "manual_confirmation_required",
    "gpt_role": [
      "risk_review",
      "plain_language_rewrite",
      "json_patch_suggestion",
      "data_gap_detection",
      "human_review_checklist"
    ],
    "forbidden_actions": [
      "overwrite_dndc_lite_deterministic_results",
      "auto_apply_patch",
      "invent_pesticide_product",
      "guarantee_yield_increase"
    ]
  },
  "input_required": [
    "dndc_lite_output",
    "local_validation_result",
    "crop",
    "region",
    "management_plan",
    "data_gaps"
  ],
  "output_schema": {
    "overall_judgement": "usable|partially_usable|not_usable|needs_expert_review",
    "confidence_level": "low|medium|high",
    "module_reviews": {
      "phenology": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      },
      "gdd": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      },
      "water_balance": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      },
      "nitrogen_budget": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      },
      "fertilizer_schedule": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      },
      "irrigation_schedule": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      },
      "yield_prediction": {
        "score": 0,
        "judgement": "usable|partially_usable|not_usable",
        "reason": "",
        "red_flags": []
      }
    },
    "recommended_mode": "dndc_primary_gpt_review|hybrid|gpt_direct_draft|manual_expert_only",
    "what_to_keep_from_dndc": [],
    "what_to_modify": [],
    "what_to_discard": [],
    "json_patch_suggestions": [],
    "human_review_required": true,
    "data_gaps": [],
    "status": "pending_review"
  }
};
