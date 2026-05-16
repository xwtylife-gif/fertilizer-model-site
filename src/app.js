(function () {
  const db = window.CROP_GROWTH_DB;
  const regionDb = window.AGRO_REGION_DB;
  const managementDb = window.MANAGEMENT_PLAN_DB;
  const model = window.DNDCLiteModel;
  const app = document.querySelector("#app");

  if (!db || !regionDb || !managementDb || !model) {
    app.innerHTML = '<main class="shell"><section class="panel"><h1>数据库加载失败</h1><p>请确认 data/*.js 已生成。</p></section></main>';
    return;
  }

  const validation = model.validateCropDatabase(db);
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
      <span class="status ${validation.ok ? "ok" : "bad"}">${validation.ok ? "校验通过" : "需要修正"}</span>
    </header>

    <main class="shell">
      <section class="panel planner">
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

      <section class="panel">
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
          <code>npm run validate:data</code>
        </div>
        ${renderValidation(validation)}
      </section>
    </main>
  `;

  const cropSelect = document.querySelector("#cropSelect");
  const regionSelect = document.querySelector("#regionSelect");
  const startDate = document.querySelector("#startDate");
  const planPreview = document.querySelector("#planPreview");

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

  cropSelect.addEventListener("change", updatePlan);
  regionSelect.addEventListener("change", updatePlan);
  startDate.addEventListener("change", updatePlan);
  updatePlan();

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
})();
