(function () {
  const db = window.CROP_GROWTH_DB;
  const regionDb = window.AGRO_REGION_DB;
  const managementDb = window.MANAGEMENT_PLAN_DB;
  const evaluationDb = window.MODEL_EVALUATION_SAMPLES;
  const reviewSchema = window.GPT55_REVIEW_SCHEMA;
  const model = window.DNDCLiteModel;
  const app = document.querySelector("#app");

  if (!db || !regionDb || !managementDb || !evaluationDb || !reviewSchema || !model) {
    app.innerHTML = '<main class="shell"><section class="panel"><h1>数据库加载失败</h1><p>请确认 data/*.js 已生成。</p></section></main>';
    return;
  }

  const validation = model.validateCropDatabase(db);
  const evaluationSamples = evaluationDb.samples || [];
  const reviewDrafts = new Map();
  const decisionDrafts = new Map();
  let selectedSampleId = evaluationSamples[0]?.id || "";

  const cropOptions = db.crops
    .map((crop) => `<option value="${crop.id}" ${crop.id === "rice" ? "selected" : ""}>${crop.name}</option>`)
    .join("");
  const regionOptions = regionDb.regions
    .map((region) => `<option value="${region.id}" ${region.id === "hubei-jianghan" ? "selected" : ""}>${region.name}</option>`)
    .join("");

  app.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">DNDC-lite crop model</p>
        <h1>作物种植管理智能数据库</h1>
      </div>
      <nav class="topnav" aria-label="页面导航">
        <a href="#planner">水稻方案</a>
        <a href="#modelEvaluation">模型评估中心</a>
        <a href="#cropDatabase">作物参数</a>
      </nav>
      <span class="status ${validation.ok ? "ok" : "bad"}">${validation.ok ? "校验通过" : "需要修正"}</span>
    </header>

    <main class="shell">
      <section id="planner" class="panel planner">
        <div class="planner-head">
          <div>
            <p class="eyebrow">湖北水稻田示例</p>
            <h2>按起始日和当地积温生成生育节点、施肥、浇水、植保和收获日程</h2>
            <div class="field-photo" role="img" aria-label="稻田"></div>
          </div>
          <div class="controls">
            <label>
              作物
              <select id="cropSelect">${cropOptions}</select>
            </label>
            <label>
              种植区域
              <select id="regionSelect">${regionOptions}</select>
            </label>
            <label>
              种植起始日
              <input id="startDate" type="date" value="2026-06-01" />
            </label>
          </div>
        </div>
        <div id="planPreview" class="planner-output"></div>
      </section>

      <section id="modelEvaluation" class="panel evaluation-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">model evaluation center</p>
            <h2>模型评估中心</h2>
          </div>
          <span>GPT-5.5 不替代确定性农学模型</span>
        </div>
        ${renderRoleCards()}
        ${renderModeGuide()}
        <div class="section-head compact">
          <div>
            <p class="eyebrow">20 evaluation samples</p>
            <h3>模型评估样本</h3>
          </div>
          <span>${evaluationSamples.length} 组样本 · 默认 not_reviewed</span>
        </div>
        <div id="evaluationTable" class="evaluation-table"></div>
        <div id="evaluationDetail" class="evaluation-detail"></div>
      </section>

      <section id="cropDatabase" class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">database records</p>
            <h2>10 种作物基础参数</h2>
          </div>
          <span>${db.schemaVersion}</span>
        </div>
        <div class="grid">
          ${db.crops.map(renderCropCard).join("")}
        </div>
      </section>

      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">validation</p>
            <h2>校验结果</h2>
          </div>
          <code>npm run validate:data && npm run validate:evaluation</code>
        </div>
        ${renderValidation(validation)}
      </section>
    </main>
  `;

  const cropSelect = document.querySelector("#cropSelect");
  const regionSelect = document.querySelector("#regionSelect");
  const startDate = document.querySelector("#startDate");
  const planPreview = document.querySelector("#planPreview");
  const evaluationTable = document.querySelector("#evaluationTable");
  const evaluationDetail = document.querySelector("#evaluationDetail");

  function updatePlan() {
    const crop = db.crops.find((item) => item.id === cropSelect.value) || db.crops[0];
    const region = regionDb.regions.find((item) => item.id === regionSelect.value) || regionDb.regions[0];
    const plan = managementDb.plans.find((item) => item.cropId === crop.id && item.regionId === region.id);
    const result = model.estimateCropPlan(crop, startDate.value, region, plan);
    const simulation = result.simulation;
    const yieldEstimate = model.estimateYield(crop, simulation, result.plan);

    planPreview.innerHTML = `
      <div class="result-grid">
        <article class="result-card status-card ${simulation.status.level}">
          <span>${simulation.status.label}</span>
          <strong>${simulation.harvestDate}</strong>
          <p>${simulation.status.message}</p>
        </article>
        <article class="result-card">
          <span>${simulation.viable ? "预计产量" : "风险产量"}</span>
          <strong>${simulation.viable ? yieldEstimate.kgMu.toLocaleString("zh-CN") : yieldEstimate.kgMu.toLocaleString("zh-CN") + " 以下"} kg/亩</strong>
          <p>${simulation.viable ? `潜力 ${yieldEstimate.potentialKgMu.toLocaleString("zh-CN")} kg/亩 · 修正系数 ${yieldEstimate.factor}` : "仅用于说明晚播损失，不建议执行该方案。"}</p>
        </article>
        <article class="result-card">
          <span>积温进度</span>
          <strong>${simulation.accumulatedGdd}/${simulation.requiredGdd} GDD</strong>
          <p>${simulation.missingGdd > 0 ? `缺少约 ${simulation.missingGdd} GDD` : `全生育期约 ${simulation.durationDays} 天`}</p>
        </article>
        <article class="result-card">
          <span>播栽窗口</span>
          <strong>${simulation.startWindowStatus.label}</strong>
          <p>${simulation.startWindowStatus.message}</p>
        </article>
      </div>

      ${renderWarnings(simulation)}
      ${renderAlternative(simulation)}

      <div class="split-layout">
        <section>
          <div class="section-head compact">
            <div>
              <p class="eyebrow">thermal stages</p>
              <h3>生育节点</h3>
            </div>
            <span>${region.name}</span>
          </div>
          ${renderStageTable(simulation.stageRows)}
        </section>

        <section>
          <div class="section-head compact">
            <div>
              <p class="eyebrow">gpt-5.5 audit</p>
              <h3>智能优化配置</h3>
            </div>
            <span>${result.plan ? result.plan.targetYieldKgMu.join("-") + " kg/亩" : "待配置"}</span>
          </div>
          ${renderOptimization(result)}
        </section>
      </div>

      <section class="calendar-section">
        <div class="section-head compact">
          <div>
            <p class="eyebrow">management calendar</p>
            <h3>种植管理日程</h3>
          </div>
          <span>${result.note}</span>
        </div>
        ${renderCalendar(result)}
      </section>
    `;
  }

  function updateEvaluationTable() {
    evaluationTable.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>样本 ID</th>
              <th>作物/区域</th>
              <th>场景</th>
              <th>播栽日期</th>
              <th>本地风险</th>
              <th>GPT 状态</th>
              <th>推荐模式</th>
              <th>DNDC-lite</th>
              <th>需肥逻辑</th>
            </tr>
          </thead>
          <tbody>
            ${evaluationSamples.map(renderEvaluationRow).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function updateEvaluationDetail() {
    const sample = getSelectedSample();
    if (!sample) {
      evaluationDetail.innerHTML = "<p>暂无评估样本。</p>";
      return;
    }

    const crop = findCrop(sample.crop_id);
    const region = findRegion(sample.region_id);
    const managementPlan = managementDb.plans.find((item) => item.cropId === sample.crop_id && item.regionId === sample.region_id) || null;
    const localValidation = model.localValidationChecklist(sample);
    const prompt = model.buildGpt55ReviewPrompt({ sample, crop, region, managementPlan, localValidationResult: localValidation, schema: reviewSchema });
    const pastedReview = reviewDrafts.get(sample.id) || "";
    const decision = decisionDrafts.get(sample.id) || sample.decision;

    evaluationDetail.innerHTML = `
      <div class="detail-head">
        <div>
          <p class="eyebrow">sample detail</p>
          <h3>${sample.id} · ${escapeHtml(sample.scenario)}</h3>
        </div>
        <span class="pill ${riskClass(localValidation.overall_risk_level)}">${localValidation.overall_risk_level}</span>
      </div>

      <div class="detail-grid">
        <section class="detail-block">
          <h4>DNDC-lite 输入</h4>
          <pre>${escapeHtml(stableJson({
            crop_id: sample.crop_id,
            crop_name: crop?.name || "柑橘/橙子（待建模）",
            region_id: sample.region_id,
            region_name: region?.name,
            start_date: sample.start_date,
            input_summary: sample.input_summary
          }))}</pre>
        </section>
        <section class="detail-block">
          <h4>模型裁决结果</h4>
          ${renderDecision(decision)}
        </section>
      </div>

      <div class="detail-grid wide-left">
        <section class="detail-block">
          <h4>DNDC-lite 拆分输出</h4>
          <pre>${escapeHtml(stableJson(sample.dndc_lite_output))}</pre>
        </section>
        <section class="detail-block">
          <h4>本地规则检查结果</h4>
          ${renderChecklist(localValidation)}
        </section>
      </div>

      <section class="detail-block">
        <div class="inline-head">
          <h4>GPT-5.5 审核提示词</h4>
          <button id="copyPromptButton" class="small-button" type="button">复制 GPT-5.5 审核提示词</button>
        </div>
        <textarea id="gptPromptText" class="prompt-box" readonly>${escapeHtml(prompt)}</textarea>
      </section>

      <section class="detail-block">
        <div class="inline-head">
          <h4>GPT 审核 JSON 粘贴框</h4>
          <button id="runDecisionButton" class="small-button primary" type="button">触发模型裁决</button>
        </div>
        <textarea id="gptReviewInput" class="prompt-box" placeholder="粘贴 GPT-5.5 严格 JSON 输出；所有内容默认 pending_review。">${escapeHtml(pastedReview)}</textarea>
        <p id="reviewParseMessage" class="parse-message">GPT patch 不会自动应用，只会用于本地裁决展示。</p>
      </section>
    `;
  }

  cropSelect.addEventListener("change", updatePlan);
  regionSelect.addEventListener("change", updatePlan);
  startDate.addEventListener("change", updatePlan);
  evaluationTable.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sample-id]");
    if (!button) return;
    selectedSampleId = button.dataset.sampleId;
    updateEvaluationTable();
    updateEvaluationDetail();
  });

  evaluationDetail.addEventListener("click", (event) => {
    if (event.target.id === "copyPromptButton") copyPrompt();
    if (event.target.id === "runDecisionButton") runDecisionFromReview();
  });

  updatePlan();
  updateEvaluationTable();
  updateEvaluationDetail();

  function renderRoleCards() {
    const roles = [
      {
        title: "DNDC-lite",
        tag: "确定性规则/机理启发模型",
        points: ["负责日期、积温、物候、肥水预算", "优点：结构化、可解释、可复现", "风险：不是完整 DNDC，未经过充分本地校准"]
      },
      {
        title: "GPT-5.5",
        tag: "语言模型审核与优化层",
        points: ["负责风险复核、文字转写、JSON patch 建议", "优点：能发现逻辑矛盾、补充风险提示、提升可读性", "风险：可能幻觉，不能作为确定性农学模型"]
      },
      {
        title: "人工审核",
        tag: "最终裁决",
        points: ["确认是否可用于真实生产", "补充当地经验、真实土壤检测、逐日气象和试验数据", "所有 GPT 输出和 patch 都必须人工确认"]
      }
    ];

    return `<div class="role-grid">${roles.map((role) => `
      <article class="role-card">
        <span>${role.tag}</span>
        <h3>${role.title}</h3>
        <ul>${role.points.map((point) => `<li>${point}</li>`).join("")}</ul>
      </article>
    `).join("")}</div>`;
  }

  function renderModeGuide() {
    const modes = [
      ["dndc_primary_gpt_review", "DNDC-lite 为主，GPT 只审核"],
      ["hybrid", "DNDC-lite 提供日期/积温/需肥结构，GPT 生成待审草案与风险说明"],
      ["gpt_direct_draft", "不使用 DNDC-lite 输出作为事实，GPT 只生成 pending_review 草案"],
      ["manual_expert_only", "只能生成检查清单，必须专家确认"]
    ];

    return `<div class="mode-guide">${modes.map(([mode, text]) => `
      <div><strong>${mode}</strong><span>${text}</span></div>
    `).join("")}</div>`;
  }

  function renderEvaluationRow(sample) {
    const local = model.localValidationChecklist(sample);
    const decision = decisionDrafts.get(sample.id) || sample.decision;
    const crop = findCrop(sample.crop_id);
    const region = findRegion(sample.region_id);
    const active = sample.id === selectedSampleId ? "active-row" : "";

    return `
      <tr class="${active}">
        <td><button class="link-button" type="button" data-sample-id="${sample.id}">${sample.id}</button></td>
        <td>${escapeHtml(crop?.name || "柑橘/橙子")}<br><span>${escapeHtml(region?.name || sample.region_id)}</span></td>
        <td>${escapeHtml(sample.scenario)}</td>
        <td>${sample.start_date}</td>
        <td><span class="pill ${riskClass(local.overall_risk_level)}">${local.overall_risk_level}</span></td>
        <td>${sample.status}</td>
        <td><code>${decision.recommended_mode}</code></td>
        <td>${decision.can_use_dndc_lite ? "可用/待审" : "不可直接用"}</td>
        <td>${decision.can_use_dndc_lite_for_nitrogen_budget ? "可借鉴" : "不可借鉴"}</td>
      </tr>
    `;
  }

  function renderCropCard(crop) {
    const summary = model.summarizeCrop(crop);
    return `
      <article class="crop-card">
        <div class="crop-title">
          <div>
            <h3>${summary.name}</h3>
            <p>${summary.headline}</p>
          </div>
          <span>${summary.yield}</span>
        </div>
        <dl>
          <div><dt>积温</dt><dd>${summary.thermal}</dd></div>
          <div><dt>需水</dt><dd>${summary.water}</dd></div>
          <div><dt>需肥</dt><dd>${summary.nutrients}</dd></div>
          <div><dt>土壤</dt><dd>${summary.soil}</dd></div>
        </dl>
        <p class="stage-line">${summary.stages}</p>
      </article>
    `;
  }

  function renderStageTable(rows) {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>阶段</th>
              <th>日期</th>
              <th>天数</th>
              <th>积温</th>
              <th>水肥预算</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <td>${row.stage}</td>
                <td>${row.start} 至 ${row.end}</td>
                <td>${row.durationDays}</td>
                <td>${row.gddActual}/${row.gddTarget} GDD<br><span>${row.avgTmeanC}°C</span></td>
                <td>${row.waterMm} mm<br><span>N/P/K ${row.nKgMu}/${row.pKgMu}/${row.kKgMu} kg/亩</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderOptimization(result) {
    if (!result.plan) {
      return `<div class="empty-state">该作物在当前区域还没有专家级管理日程，页面先按通用生育阶段输出水肥预算。</div>`;
    }

    const profile = result.plan.gpt55Optimization;
    return `
      <div class="opt-box">
        <dl>
          <div><dt>模型</dt><dd>${profile.model}</dd></div>
          <div><dt>接口</dt><dd>${profile.endpoint}</dd></div>
          <div><dt>推理强度</dt><dd>${profile.reasoningEffort}</dd></div>
          <div><dt>角色</dt><dd>${profile.role}</dd></div>
        </dl>
        <p>${profile.strategy}</p>
      </div>
    `;
  }

  function renderCalendar(result) {
    const simulation = result.simulation;
    if (!simulation.viable && result.plan) {
      return `
        <div class="empty-state">
          <strong>${simulation.status.label}</strong>
          <p>${simulation.status.message}</p>
        </div>
      `;
    }

    return `
      <div class="calendar-list">
        ${result.rows.map((row) => `
          <article class="calendar-item">
            <div class="calendar-date">
              <strong>${row.date}${row.endDate ? ` 至 ${row.endDate}` : ""}</strong>
              <span>第 ${Math.max(1, row.dayNumber)} 天 · ${row.category}</span>
            </div>
            <div class="calendar-body">
              <h4>${row.title}</h4>
              <p>${row.action}</p>
              <dl>
                <div><dt>施肥</dt><dd>${row.fertilizer}</dd></div>
                <div><dt>水层/浇水</dt><dd>${row.water}</dd></div>
                ${row.plantProtection ? `<div><dt>植保</dt><dd>${row.plantProtection}</dd></div>` : ""}
                <div><dt>检查</dt><dd>${row.check}</dd></div>
                <div><dt>新手要点</dt><dd>${row.noviceTip}</dd></div>
              </dl>
            </div>
          </article>
        `).join("")}
      </div>
    `;
  }

  function renderChecklist(result) {
    const groups = [
      ["单位", result.unit_check],
      ["播栽窗口", result.date_window_check],
      ["GDD", result.gdd_check],
      ["物候", result.phenology_consistency_check],
      ["水分", result.water_balance_check],
      ["氮素", result.nitrogen_budget_check],
      ["施肥日历", result.fertilizer_schedule_check],
      ["风险", result.risk_check],
      ["证据", result.evidence_check]
    ];

    return `
      <div class="checklist">
        ${groups.map(([label, items]) => `
          <div>
            <strong>${label}</strong>
            <ul>${(items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        `).join("")}
        <div class="red-flags">
          <strong>red_flags</strong>
          ${(result.red_flags || []).length ? `<ul>${result.red_flags.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "<p>无严重红旗。</p>"}
        </div>
      </div>
    `;
  }

  function renderDecision(decision) {
    return `
      <div class="decision-box">
        <p><strong>${decision.recommended_mode}</strong></p>
        <dl>
          <div><dt>可用 DNDC-lite</dt><dd>${yesNo(decision.can_use_dndc_lite)}</dd></div>
          <div><dt>日期</dt><dd>${yesNo(decision.can_use_dndc_lite_for_dates)}</dd></div>
          <div><dt>GDD</dt><dd>${yesNo(decision.can_use_dndc_lite_for_gdd)}</dd></div>
          <div><dt>水分</dt><dd>${yesNo(decision.can_use_dndc_lite_for_water_balance)}</dd></div>
          <div><dt>氮素/需肥</dt><dd>${yesNo(decision.can_use_dndc_lite_for_nitrogen_budget)}</dd></div>
          <div><dt>施肥日程</dt><dd>${yesNo(decision.can_use_dndc_lite_for_fertilizer_schedule)}</dd></div>
          <div><dt>产量预测</dt><dd>${yesNo(decision.can_use_dndc_lite_for_yield_prediction)}</dd></div>
        </dl>
        <div class="module-lists">
          <div><strong>可复用模块</strong><p>${(decision.reuse_modules || []).join("、") || "无"}</p></div>
          <div><strong>应丢弃模块</strong><p>${(decision.discard_modules || []).join("、") || "无"}</p></div>
          <div><strong>必须人工确认项</strong><p>${(decision.required_human_checks || []).join("、") || "无"}</p></div>
        </div>
        <p>${escapeHtml(decision.notes || "所有 GPT 输出必须 pending_review。")}</p>
      </div>
    `;
  }

  function renderWarnings(simulation) {
    if (!simulation.warnings.length) return "";
    return `<ul class="alerts">${simulation.warnings.map((warning) => `<li>${warning}</li>`).join("")}</ul>`;
  }

  function renderAlternative(simulation) {
    if (!simulation.alternative || simulation.viable) return "";
    return `
      <div class="alternative">
        <strong>替代窗口：${simulation.alternative.start} 至 ${simulation.alternative.end}</strong>
        <span>${simulation.alternative.note}</span>
      </div>
    `;
  }

  function renderValidation(result) {
    if (result.ok) {
      const warnings = result.warnings.length
        ? `<ul class="notes">${result.warnings.map((warning) => `<li>${warning}</li>`).join("")}</ul>`
        : "<p>无警告。</p>";
      return `<p>数据库结构、阶段比例、需水范围、生物量分配和来源引用均已通过校验。</p>${warnings}`;
    }

    return `<ul class="errors">${result.errors.map((error) => `<li>${error}</li>`).join("")}</ul>`;
  }

  function copyPrompt() {
    const promptBox = document.querySelector("#gptPromptText");
    const message = document.querySelector("#reviewParseMessage");
    promptBox.select();
    const fallback = () => {
      const ok = document.execCommand("copy");
      message.textContent = ok ? "提示词已复制。" : "复制失败，请手动选择提示词。";
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(promptBox.value)
        .then(() => { message.textContent = "提示词已复制。"; })
        .catch(fallback);
    } else {
      fallback();
    }
  }

  function runDecisionFromReview() {
    const sample = getSelectedSample();
    const input = document.querySelector("#gptReviewInput");
    const message = document.querySelector("#reviewParseMessage");
    const raw = input.value.trim();

    if (!raw) {
      message.textContent = "请先粘贴 GPT-5.5 严格 JSON 输出。";
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const localValidation = model.localValidationChecklist(sample);
      const decision = model.decideModelMode(localValidation, parsed);
      reviewDrafts.set(sample.id, raw);
      decisionDrafts.set(sample.id, decision);
      updateEvaluationTable();
      updateEvaluationDetail();
    } catch (error) {
      message.textContent = `JSON 解析失败：${error.message}`;
    }
  }

  function getSelectedSample() {
    return evaluationSamples.find((sample) => sample.id === selectedSampleId) || evaluationSamples[0];
  }

  function findCrop(cropId) {
    return db.crops.find((crop) => crop.id === cropId);
  }

  function findRegion(regionId) {
    return regionDb.regions.find((region) => region.id === regionId);
  }

  function yesNo(value) {
    return value ? "是" : "否";
  }

  function riskClass(value) {
    return value === "high" ? "risk-high" : value === "medium" ? "risk-medium" : "risk-low";
  }

  function stableJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
