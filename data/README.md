# 作物生长数据库说明

核心文件：

- `crop-growth-db.json`：DNDC-lite 作物生长数据库，当前包含 10 种常见作物。
- `agro-region-db.json`：区域气候、土壤、播栽窗口和安全收获约束；当前先配置湖北江汉平原。
- `management-plan-db.json`：地区化农事日程、肥料产品库和 GPT-5.5 审核契约；当前先实现湖北水稻。
- `model-evaluation-samples.json`：20 组 DNDC-lite 与 GPT-5.5 审核层评估样本。
- `gpt55-review-schema.json`：GPT-5.5 风险复核与 JSON patch 建议输出契约。
- `crop-growth-db.js`：由 JSON 自动生成的浏览器加载版本，用于静态网页直接双击运行。
- `agro-region-db.js`、`management-plan-db.js`、`model-evaluation-samples.js`、`gpt55-review-schema.js`：由 JSON 自动生成的浏览器加载版本。

验证命令：

```bash
npm run build:data
npm run validate:data
npm run validate:evaluation
```

## 作物列表

- 番茄
- 黄瓜
- 辣椒
- 草莓
- 蓝莓
- 棉花
- 玉米
- 小麦
- 水稻
- 马铃薯

## 数据结构

每个作物包含：

- `thermal`：基础温度、最适温度、最高温度、全生育期积温。
- `water`：全季需水量、FAO 参考校验范围、Kc 曲线、允许亏缺比例、关键需水阶段。
- `nutrientDemandKgHa`：目标产量下 N、P2O5、K2O 全季需求。
- `yieldPotentialKgHa`：当前模型使用的高产管理潜力产量。
- `biomassPartition`：成熟期收获器官、茎叶、根系生物量分配。
- `cnRatio`：收获器官、茎叶和根系 C/N 比，用于后续残体和氮素平衡。
- `soilPreference`：pH 和盐分适宜范围。
- `stages`：生育阶段热量、水分、N/P/K 需求比例。
- `managementTemplates`：施肥、灌溉、植保、田间操作模板。

区域与管理方案包含：

- `climateNormal`：12 个月平均温度、降雨、ET0 和相对湿度，用于逐日插值。
- `cropWindows`：作物在当地的推荐播栽期、谨慎播栽期、安全收获上限和低温阈值。
- `fertilizerProducts`：肥料产品名、养分含量、适用环节和风险说明。
- `eventTemplates`：从播栽到收获的管理事件，按起始日或生育阶段自动换算为实际日期。
- `gpt55Optimization`：后续接入 GPT-5.5 的输入、输出和安全约束，限定 GPT 只做审核、优化和结构化补丁，不擅自改写模型日期或虚构农药产品。

评估样本包含：

- `dndc_lite_output`：拆分记录物候、GDD、水平衡、氮素需求、施肥日程、灌溉日程、操作日历、产量预测和风险评估。
- `local_validation_result`：本地规则检查清单，包含单位、日期窗口、GDD、水分、氮素、施肥日历、产量和证据缺口检查。
- `gpt55_review_contract`：限定 GPT-5.5 只能风险复核、文字转写、提出 JSON patch 建议和识别数据缺口。
- `decision`：记录 DNDC-lite 哪些模块可复用、哪些模块应丢弃，以及是否必须人工确认。

## DNDC-lite 映射

该数据库不复制 DNDC 或任何内部源码，只抽象保留 DNDC 对作物模型最有用的参数框架：

- `thermal.totalGddC` 对应 DNDC 的作物生长积温需求。
- `cropWindows.regionalGddOverride` 用于地区/品种制度下的积温校正，例如湖北中稻采用更严格的区域积温需求。
- `water.seasonRequirementMm` 和 `water.kc` 用于逐日 ETc 与水分胁迫计算。
- `nutrientDemandKgHa.n` 用于每日氮需求和氮素胁迫计算。
- `biomassPartition` 与 `cnRatio` 支撑后续根、茎叶、收获器官分配和残体还田。
- `managementTemplates` 对应 DNDC 的管理事件思想，包括施肥、灌溉、植保和收获。

## 校验规则

验证脚本会检查：

- 作物数量是否为 10。
- 必填字段是否完整。
- 温度参数顺序是否合理。
- 需水量是否落在参考范围内。
- 生育阶段 `thermalShare`、`nShare`、`pShare`、`kShare`、`waterShare` 是否分别合计为 1。
- 生物量分配是否合计为 1。
- 每个作物是否包含施肥、灌溉、植保、田间操作建议。
- 来源引用是否存在。
- 区域月度气候数组是否为 12 个月。
- 管理方案是否引用真实作物、真实区域、真实肥料产品和真实生育阶段。
- 湖北水稻方案是否声明 GPT-5.5 审核配置。
- 模型评估样本是否不少于 20 条，且每条包含 9 个 DNDC-lite 输出模块。
- GPT-5.5 审核 schema 是否存在、结构合法，并强制人工审核。
