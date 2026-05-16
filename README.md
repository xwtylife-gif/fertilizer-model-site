# DNDC-lite 作物种植管理模型

这是一个静态网页原型，用 DNDC 的逐日模拟思想做轻量化作物管理方案生成：

- 后台配置区域气候、土壤参数和默认种植制度。
- 用户只输入作物、种植区域、种植起始日。
- 模型按日估算积温、生育进程、水分收支、氮素需求/吸收胁迫，并生成施肥、灌溉、植保和其他农事操作日历。
- 预测产量以作物潜力产量为基准，叠加温度、水分、氮素、pH、盐分和设施栽培修正。

## 重要安全边界

本项目不包含 DNDC 原始源码、内部压缩包、PDF 手册或 `references/` 目录。`.gitignore` 已排除这些非发布资料。

## 本地使用

直接双击 `index.html` 即可运行，不依赖本地服务。

## 数据库验证

当前已生成可验证的作物生长数据库和湖北水稻管理方案：

```bash
npm run build:data
npm run validate:data
npm run validate:evaluation
```

数据库位置：

- `data/crop-growth-db.json`
- `data/agro-region-db.json`
- `data/management-plan-db.json`
- `data/model-evaluation-samples.json`
- `data/gpt55-review-schema.json`
- `data/README.md`
- `scripts/validate-crop-db.mjs`
- `scripts/validate-evaluation-db.mjs`

## 模型说明

当前实现是 `DNDC-lite` 原型，不是完整 DNDC。它保留这些核心结构：

- 气候、土壤、植被、管理四类驱动因子。
- 用区域月均气候插值为逐日气候，按起始日累计 GDD 推进物候进程。
- 对湖北水稻配置推荐播栽窗口、谨慎窗口、安全收获上限和抽穗灌浆低温阈值；晚播积温不足时会直接标记为不建议种植。
- 逐日计算作物需水、土壤水分余额和灌溉触发。
- 根据物候进程计算每日需氮，并用可给态氮与水分胁迫修正实际生长。
- 按生育阶段组织施肥、浇水、植保和田间操作事件；湖北水稻已生成从播栽到收获的日期化管理日程。
- 用年度水分与氮素收支指标给出方案可信度和风险提示。
- GPT-5.5 不替代确定性农学模型：页面先用 DNDC-lite 引擎生成日期、积温和肥水预算，再把 `gpt55Optimization` 作为后续接入 Responses API 的结构化审核契约，用于风险复核、文字转写和 JSON patch 输出。

## DNDC-lite 与 GPT-5.5 的关系

DNDC-lite 和 GPT-5.5 是两套不同模型。本项目不默认任何一方天然正确，也不允许 GPT-5.5 覆盖 DNDC-lite 的确定性计算结果。

- DNDC-lite 是规则/机理启发的逐日轻量模拟，负责先生成日期、积温、物候进程、肥水预算和管理日历。
- GPT-5.5 是语言模型审核与优化层，只能通过 `gpt55Optimization` 或 `gpt55-review-schema` 做风险复核、文字转写、JSON patch 建议和数据缺口识别。
- 二者输出可能冲突；冲突时保留 DNDC-lite 原始结果、记录 GPT patch 建议，并进入人工审核。
- 所有 GPT 输出默认 `pending_review`，所有 GPT patch 都必须人工确认后才能合并。
- 当前页面通过 20 组评估样本检查 DNDC-lite 的可用性，包括推荐窗口、谨慎窗口、过晚播栽、pH、盐分、氮素、水分、低温灌浆和管理强度差异。
- 即使 DNDC-lite 整体不可用，也要分别判断日期、积温、物候、需肥规律、氮素预算结构、施肥日程和产量预测哪些可借鉴、哪些应丢弃。
- 真实生产应用前必须接入真实土壤检测、逐日气象、本地试验产量、品种参数和专家审核。

后续接入真实土壤检测、逐日气象和本地试验产量后，可校准每个作物/区域的参数。
