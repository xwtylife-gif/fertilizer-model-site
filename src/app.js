(function () {
  const db = window.CROP_GROWTH_DB;
  const model = window.DNDCLiteModel;
  const app = document.querySelector("#app");

  if (!db || !model) {
    app.innerHTML = '<main class="shell"><section class="panel"><h1>数据库加载失败</h1><p>请确认 data/crop-growth-db.js 已生成。</p></section></main>';
    return;
  }

  const validation = model.validateCropDatabase(db);
  const cropOptions = db.crops.map((crop) => `<option value="${crop.id}">${crop.name}</option>`).join("");

  app.innerHTML = `
    <header class="topbar">
      <div>
        <p class="eyebrow">DNDC-lite crop database</p>
        <h1>作物生长数据库</h1>
      </div>
      <span class="status ${validation.ok ? "ok" : "bad"}">${validation.ok ? "校验通过" : "需要修正"}</span>
    </header>

    <main class="shell">
      <section class="hero">
        <div>
          <p class="eyebrow">基于 DNDC 思路的轻量参数库</p>
          <h2>10 种常见作物，覆盖积温、需水、需肥、生育阶段和农事模板。</h2>
        </div>
        <div class="metrics">
          <div><strong>${db.crops.length}</strong><span>作物</span></div>
          <div><strong>${db.sources.length}</strong><span>来源</span></div>
          <div><strong>${validation.warnings.length}</strong><span>提醒</span></div>
        </div>
      </section>

      <section class="panel planner">
        <div>
          <p class="eyebrow">快速预览</p>
          <h2>输入作物和起始日，生成阶段水肥预算</h2>
        </div>
        <div class="controls">
          <label>
            作物
            <select id="cropSelect">${cropOptions}</select>
          </label>
          <label>
            种植起始日
            <input id="startDate" type="date" value="${new Date().toISOString().slice(0, 10)}" />
          </label>
        </div>
        <div id="planPreview" class="plan-table"></div>
      </section>

      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">database records</p>
            <h2>作物参数卡</h2>
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
  const startDate = document.querySelector("#startDate");
  const planPreview = document.querySelector("#planPreview");

  function updatePlan() {
    const crop = db.crops.find((item) => item.id === cropSelect.value) || db.crops[0];
    const plan = model.estimateCropPlan(crop, startDate.value);
    planPreview.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>阶段</th>
            <th>日期</th>
            <th>灌溉预算</th>
            <th>N/P2O5/K2O</th>
            <th>土壤水目标</th>
          </tr>
        </thead>
        <tbody>
          ${plan.map((row) => `
            <tr>
              <td>${row.stage}</td>
              <td>${row.start} 至 ${row.end}</td>
              <td>${row.waterMm} mm</td>
              <td>${row.nKgMu}/${row.pKgMu}/${row.kKgMu} kg/亩</td>
              <td>${row.soilWater}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  cropSelect.addEventListener("change", updatePlan);
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
