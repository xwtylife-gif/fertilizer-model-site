window.MANAGEMENT_PLAN_DB = {
  "schemaVersion": "2026-05-dndc-lite-management-db-v1",
  "description": "Region-aware management templates. Rice in Hubei is implemented first as the reference expert-grade schedule.",
  "fertilizerProducts": [
    {
      "id": "rice-crf-26-10-12",
      "name": "水稻缓释配方肥 26-10-12",
      "type": "缓释/控释配方肥",
      "nutrientPct": {
        "n": 26,
        "p2o5": 10,
        "k2o": 12
      },
      "bestUse": "移栽同步侧深施或整田最后一遍耙田前深施",
      "notes": "适合新手优先使用，减少追肥次数；侧深施肥田块氮肥总量可按当地指导减少。"
    },
    {
      "id": "rice-formula-20-10-15",
      "name": "水稻配方肥 20-10-15",
      "type": "常规复合肥",
      "nutrientPct": {
        "n": 20,
        "p2o5": 10,
        "k2o": 15
      },
      "bestUse": "基肥或分次施肥体系",
      "notes": "无法使用缓释肥时作为替代，后续必须配合分蘖肥和穗肥。"
    },
    {
      "id": "urea-46",
      "name": "尿素 46-0-0",
      "type": "速效氮肥",
      "nutrientPct": {
        "n": 46,
        "p2o5": 0,
        "k2o": 0
      },
      "bestUse": "分蘖肥、穗肥按苗情少量追施",
      "notes": "禁止一次性过量，深水、强降雨前不撒施。"
    },
    {
      "id": "kcl-60",
      "name": "氯化钾 0-0-60",
      "type": "钾肥",
      "nutrientPct": {
        "n": 0,
        "p2o5": 0,
        "k2o": 60
      },
      "bestUse": "基肥或孕穗期补钾",
      "notes": "湖北水稻钾肥优先选氯化钾；低钾田和高产田重点补。"
    },
    {
      "id": "ca-mg-phosphate-12",
      "name": "钙镁磷肥 0-12-0",
      "type": "磷肥/土壤调理",
      "nutrientPct": {
        "n": 0,
        "p2o5": 12,
        "k2o": 0
      },
      "bestUse": "酸性或缺磷水稻土基肥",
      "notes": "湖北水稻磷肥优先选钙镁磷肥。"
    },
    {
      "id": "mkp-foliar",
      "name": "磷酸二氢钾叶面肥",
      "type": "叶面肥",
      "nutrientPct": {
        "n": 0,
        "p2o5": 52,
        "k2o": 34
      },
      "bestUse": "抽穗扬花到灌浆初期叶面喷施",
      "notes": "逆境、叶色偏淡或灌浆势弱时用；高温时避开中午。"
    }
  ],
  "plans": [
    {
      "id": "rice-hubei-jianghan-midseason-v1",
      "cropId": "rice",
      "regionId": "hubei-jianghan",
      "name": "湖北江汉平原中稻高产稳产方案",
      "targetUser": "不会种地的新手执行者",
      "targetYieldKgMu": [
        650,
        750
      ],
      "decisionPrinciple": "先用逐日积温确定生育节点，再把施肥、水层、植保和田间操作挂到节点上；遇到晚播积温不足时给出不建议种植结论。",
      "gpt55Optimization": {
        "model": "gpt-5.5",
        "endpoint": "Responses API",
        "reasoningEffort": "high",
        "role": "agronomic_plan_auditor",
        "strategy": "Deterministic DNDC-lite engine produces dates and nutrient budgets first; GPT-5.5 audits local risks, rewrites novice-readable instructions, and returns structured JSON patches. It must not invent unregistered pesticide products.",
        "inputContract": [
          "crop record",
          "region agro-climate record",
          "soil test record",
          "daily weather forecast or normal",
          "phenology simulation result",
          "fertilizer inventory",
          "local pest forecast if available"
        ],
        "outputContract": {
          "format": "json",
          "fields": [
            "riskReview",
            "schedulePatches",
            "fertilizerAdjustments",
            "waterAdjustments",
            "plantProtectionWarnings",
            "noviceChecklist"
          ]
        },
        "guardrails": [
          "Do not change thermal-stage dates unless a weather dataset is supplied.",
          "Do not name a pesticide product unless the local label/registration is supplied.",
          "Prefer monitoring threshold and local plant protection station confirmation for chemical control.",
          "Keep every instruction executable by a novice with date, field condition, amount, and stop condition."
        ]
      },
      "nutrientBudgetKgMu": {
        "standard": {
          "n": [
            10.5,
            12.5
          ],
          "p2o5": [
            4,
            6
          ],
          "k2o": [
            7,
            9
          ]
        },
        "preferredSideDeep": [
          {
            "productId": "rice-crf-26-10-12",
            "amountKgMu": [
              30,
              35
            ],
            "timing": "移栽同步侧深施或整田末次耙田前"
          },
          {
            "productId": "ca-mg-phosphate-12",
            "amountKgMu": [
              10,
              15
            ],
            "timing": "基肥，缺磷或酸性田优先"
          },
          {
            "productId": "urea-46",
            "amountKgMu": [
              4,
              6
            ],
            "timing": "分蘖初期，看苗补施"
          },
          {
            "productId": "kcl-60",
            "amountKgMu": [
              5,
              6
            ],
            "timing": "幼穗分化初期，高产田或低钾田必施"
          },
          {
            "productId": "mkp-foliar",
            "amountKgMu": [
              0.15,
              0.2
            ],
            "timing": "抽穗扬花到灌浆初期，兑水45-50公斤叶喷"
          }
        ],
        "traditionalSplit": [
          {
            "productId": "rice-formula-20-10-15",
            "amountKgMu": [
              25,
              30
            ],
            "timing": "基肥"
          },
          {
            "productId": "ca-mg-phosphate-12",
            "amountKgMu": [
              10,
              15
            ],
            "timing": "基肥"
          },
          {
            "productId": "urea-46",
            "amountKgMu": [
              6,
              8
            ],
            "timing": "分蘖肥"
          },
          {
            "productId": "urea-46",
            "amountKgMu": [
              2,
              3
            ],
            "timing": "穗肥"
          },
          {
            "productId": "kcl-60",
            "amountKgMu": [
              5,
              6
            ],
            "timing": "穗肥"
          }
        ]
      },
      "eventTemplates": [
        {
          "id": "day0-transplant",
          "timing": {
            "type": "afterStart",
            "days": 0
          },
          "category": "栽插/水层",
          "title": "第1天：移栽或直播，建立浅水层",
          "action": "田面整平后移栽，水层保持2-3厘米；直播田保持厢面湿润，避免深水闷芽。",
          "fertilizer": "优先同步侧深施水稻缓释配方肥 26-10-12 30-35公斤/亩；无法侧深施时，整田末次耙田前基施并混匀。",
          "water": "移栽田浅水护苗，直播田湿润不淹芽。",
          "check": "当天检查田面平整度，水深不得淹没秧心。",
          "noviceTip": "先把田整平，比多撒肥更重要；高低不平会导致一边缺水一边烂苗。"
        },
        {
          "id": "day3-greenup",
          "timing": {
            "type": "afterStart",
            "days": 2
          },
          "category": "查苗/补苗",
          "title": "第3天：查苗补缺，稳住返青",
          "action": "沿田块走一圈，补齐缺穴、扶正漂秧，发现烂根或发黄集中区单独标记。",
          "fertilizer": "不追肥，先让根系恢复。",
          "water": "水层2-3厘米，阴雨田可落干露田脚。",
          "check": "秧苗开始挺立、心叶转绿为正常。",
          "noviceTip": "返青前不要急着追尿素，根没恢复时撒氮肥容易徒长或烧苗。"
        },
        {
          "id": "day7-tiller-fertilizer",
          "timing": {
            "type": "afterStart",
            "days": 6
          },
          "windowDays": 3,
          "category": "分蘖肥/除草窗口",
          "title": "第7-10天：分蘖肥，促早发低位分蘖",
          "action": "秧苗返青后追施分蘖肥；若田间叶色深绿、分蘖已经旺，可取低量或推迟。",
          "fertilizer": "尿素 4-6公斤/亩；传统分次施肥田可用6-8公斤/亩。缺磷田不在此时补磷，磷肥应放基肥。",
          "water": "施肥前保持浅水，施肥后保水3-5天，不排水。",
          "plantProtection": "结合当地杂草谱选择登记除草方案；药后保持说明书要求水层。",
          "check": "5天后看新分蘖是否增加，叶色以嫩绿到正绿为宜。",
          "noviceTip": "尿素撒完3天内不要排水，否则肥随水跑掉。"
        },
        {
          "id": "tillering-scout",
          "timing": {
            "type": "stageStart",
            "stageId": "vegetative",
            "offsetDays": 5
          },
          "category": "分蘖期巡田",
          "title": "分蘖启动后：查虫查病，控制无效分蘖",
          "action": "每3-5天巡田一次，重点看叶鞘基部纹枯病、卷叶虫苞、飞虱和螟虫枯心。",
          "fertilizer": "不见明显脱肥不再补氮。",
          "water": "浅水促蘖，够苗后准备晒田。",
          "plantProtection": "优先物理/生态和统防统治；达到当地阈值后再用登记药剂。",
          "check": "基本苗和分蘖足够后，田间不再追求继续增蘖。",
          "noviceTip": "不是分蘖越多越好，太密会后期倒伏、病重、空秕多。"
        },
        {
          "id": "mid-tillering-dry-field",
          "timing": {
            "type": "stageFraction",
            "stageId": "vegetative",
            "fraction": 0.55
          },
          "category": "晒田控苗",
          "title": "分蘖中后期：够苗晒田",
          "action": "当群体够苗、叶色偏深或田脚发软时，排水晒田到田面细裂、脚踩不陷泥；弱苗田轻晒或不晒。",
          "fertilizer": "不施肥。",
          "water": "晒田后复水，保持湿润到浅水。",
          "check": "叶片挺直、根系白根增加、田面不陷脚即达标。",
          "noviceTip": "晒田是水稻高产的刹车，不晒容易贪青倒伏。"
        },
        {
          "id": "panicle-fertilizer",
          "timing": {
            "type": "stageStart",
            "stageId": "flowering",
            "offsetDays": 0
          },
          "windowDays": 5,
          "category": "穗肥/补钾",
          "title": "幼穗分化初期：施穗肥，稳大穗",
          "action": "进入拔节孕穗期后，根据叶色和苗情施穗肥；叶色淡、苗不旺可补氮，叶色深绿只补钾或少补氮。",
          "fertilizer": "尿素 2-3公斤/亩 + 氯化钾 5-6公斤/亩；高产田和低钾田必须补钾。",
          "water": "施肥前浅水，施后保水3-5天。",
          "check": "5-7天后叶色转正常绿，不能黑绿披叶。",
          "noviceTip": "穗肥不是越多越好，氮多会晚熟、病重、倒伏。"
        },
        {
          "id": "booting-water",
          "timing": {
            "type": "stageFraction",
            "stageId": "flowering",
            "fraction": 0.55
          },
          "category": "孕穗水层",
          "title": "孕穗期：稳水防高温热害",
          "action": "孕穗到抽穗前保持3-5厘米水层，高温天气不要断水。",
          "fertilizer": "一般不再土施氮肥。",
          "water": "浅水到寸水，连续高温时加深到5厘米左右降温。",
          "plantProtection": "开始关注纹枯病、稻飞虱、稻纵卷叶螟和穗颈瘟风险。",
          "check": "叶片不卷、田间无大面积发黄。",
          "noviceTip": "孕穗期缺水一次，后面补多少肥都很难补回来。"
        },
        {
          "id": "heading-protection",
          "timing": {
            "type": "stageStart",
            "stageId": "filling",
            "offsetDays": -3
          },
          "windowDays": 6,
          "category": "破口抽穗保护",
          "title": "破口前后：穗期病虫保护关键窗口",
          "action": "破口前3天到破口后3天，重点保护穗颈瘟、稻曲病、纹枯病、螟虫、稻飞虱和稻纵卷叶螟。",
          "fertilizer": "不撒尿素。",
          "water": "保持浅水，避免药后立即排水。",
          "plantProtection": "按当地植保站预警和登记药剂组合防控；阴雨寡照、感病品种或老病区要提前预防。",
          "check": "抽穗整齐、剑叶和穗部无明显病斑。",
          "noviceTip": "穗期保护宁可提前一点，不要等病害上穗再补救。"
        },
        {
          "id": "full-heading-second-check",
          "timing": {
            "type": "stageStart",
            "stageId": "filling",
            "offsetDays": 7
          },
          "windowDays": 3,
          "category": "齐穗复查",
          "title": "齐穗后7-10天：复查穗期病虫",
          "action": "若破口期后连续阴雨、田间仍有虫量或病斑扩展，按预警做第二次保护；低风险田不重复用药。",
          "fertilizer": "叶色偏淡或受灾田，可叶喷磷酸二氢钾150-200克/亩，兑水45-50公斤。",
          "water": "干湿交替，保持根系活力。",
          "plantProtection": "严格遵守安全间隔期，采收前不得随意用药。",
          "check": "谷粒开始灌浆，叶片保持功能绿。",
          "noviceTip": "这一遍不是固定必须打药，是看天气、虫量和病斑决定。"
        },
        {
          "id": "grain-filling",
          "timing": {
            "type": "stageFraction",
            "stageId": "filling",
            "fraction": 0.55
          },
          "category": "灌浆管理",
          "title": "灌浆中期：干湿交替，防早衰",
          "action": "保持田面湿润，见干见湿；不长期深水，不让田完全开大裂。",
          "fertilizer": "一般不土施肥；弱苗可叶面补磷酸二氢钾。",
          "water": "灌一次浅水后自然落干，再复水。",
          "check": "籽粒逐渐充实，剑叶不过早枯黄。",
          "noviceTip": "灌浆期深水泡根会早衰，完全断水又会灌浆不足。"
        },
        {
          "id": "drain-before-harvest",
          "timing": {
            "type": "stageStart",
            "stageId": "maturity",
            "offsetDays": 0
          },
          "category": "收前排水",
          "title": "黄熟初期：收前7-10天排水",
          "action": "大多数谷粒转黄后排水落干，方便机械收获并减少倒伏。",
          "fertilizer": "停止施肥和用药。",
          "water": "排水但不让田面过早龟裂伤根。",
          "check": "85%左右谷粒转黄即可准备收获。",
          "noviceTip": "收得太早产量和米质都吃亏，太晚容易倒伏落粒。"
        },
        {
          "id": "harvest",
          "timing": {
            "type": "harvest",
            "offsetDays": 0
          },
          "category": "收获",
          "title": "收获日：适时机收，及时烘干",
          "action": "85-90%谷粒黄熟、籽粒坚实时收获；收后尽快晒干或烘干，避免堆闷发热。",
          "fertilizer": "无。",
          "water": "田面落干便于机械下田。",
          "check": "收获损失、含水率和杂质率符合当地收购要求。",
          "noviceTip": "收后处理和田间管理一样重要，湿谷堆一夜就可能发热变质。"
        }
      ],
      "sourceIds": [
        "hubei-2026-fertilization",
        "hubei-rice-pest-green-control",
        "moa-rice-pest-2024",
        "openai-gpt55-model"
      ]
    }
  ]
};
