const BASE_SOURCE = Array.isArray(window.CUSTOMER_DATA) ? window.CUSTOMER_DATA : [];
const BASE_RAW_SOURCE = Array.isArray(window.CUSTOMER_RAW_DATA) ? window.CUSTOMER_RAW_DATA : [];

const DEFAULT_SOURCE_NAME = "官方综合清单（含中小补充）";
const ALL_TEXT = "全部";
const NOTE_STORAGE_KEY = "targetCustomerNotes_v1";
const EDIT_PASSWORD = "123456789Dxy";
const EDIT_STORE_KEY = "targetCustomerEdits_v1";
const DETAILS_EXPAND_KEY = "targetCustomerDetailExpanded_v1";
const DEFAULT_COOP_STATUS = "未合作";
const DATA_MODE_KEY = "targetCustomerDataMode_v1";
const TABLE_COLUMN_COUNT = 11;
const EDIT_PRIORITY_OPTIONS = [
  "S-立即拜访",
  "A-优先拜访",
  "B-重点观察",
  "B-备选拜访",
  "C-待评估",
  "C-储备/尽调",
];
const EDIT_COOP_OPTIONS = ["未合作", "已合作", "待确认"];

const DATA_MODES = {
  dedupe: {
    value: "dedupe",
    label: "按主体（去重）",
    name: DEFAULT_SOURCE_NAME,
    rows: BASE_SOURCE,
    dedupe: true,
  },
  raw: {
    value: "raw",
    label: "按线索明细（原始行）",
    name: "继续新增2倍高价值主体版（线索明细）",
    rows: BASE_RAW_SOURCE,
    dedupe: false,
  },
};

function getDataModeConfig(mode) {
  return DATA_MODES[mode] || DATA_MODES.dedupe;
}

let currentSourceName = DEFAULT_SOURCE_NAME;
let currentSourceMode = "dedupe";
let currentRows = [];

const els = {
  keyword: document.getElementById("keyword"),
  priority: document.getElementById("priority"),
  category: document.getElementById("category"),
  province: document.getElementById("province"),
  city: document.getElementById("city"),
  econScale: document.getElementById("econScale"),
  landClass: document.getElementById("landClass"),
  farmFlag: document.getElementById("farmFlag"),
  cooperation: document.getElementById("cooperation"),
  sortBy: document.getElementById("sortBy"),
  dataMode: document.getElementById("dataMode"),
  rows: document.getElementById("rows"),
  resultCount: document.getElementById("resultCount"),
  summary: document.getElementById("summary"),
  metricCards: document.getElementById("metricCards"),
  categoryBoard: document.getElementById("categoryBoard"),
  provinceBoard: document.getElementById("provinceBoard"),
  scaleBoard: document.getElementById("scaleBoard"),
  resetBtn: document.getElementById("resetBtn"),
  editModeBtn: document.getElementById("editModeBtn"),
  exportBtn: document.getElementById("exportBtn"),
  exportAllBtn: document.getElementById("exportAllBtn"),
  importFile: document.getElementById("importFile"),
  restoreBtn: document.getElementById("restoreBtn"),
  importStatus: document.getElementById("importStatus"),
};

let renderedRows = [];
let noteStore = {};
let editStore = {};
let detailExpandStore = {};
let isEditMode = false;

function normalizeCoopStatus(value) {
  const s = toText(value);
  if (!s || s === "") return DEFAULT_COOP_STATUS;
  if (/已合作|合作中|合作成功|签约|已签/.test(s)) return "已合作";
  if (/未合作|未签|无合作/.test(s)) return "未合作";
  return s;
}

function loadEditStore() {
  try {
    const raw = window.localStorage.getItem(EDIT_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {
    // ignore invalid cache
  }
  return {};
}

function saveEditStore() {
  try {
    window.localStorage.setItem(EDIT_STORE_KEY, JSON.stringify(editStore));
  } catch (_) {
    // ignore storage failures
  }
}

function getRowEditState(itemOrKey) {
  const key = resolveNoteKey(itemOrKey);
  if (!key) return {};
  return editStore[key] || {};
}

function setRowEditState(itemOrKey, changes) {
  const key = resolveNoteKey(itemOrKey);
  if (!key) return;
  if (!editStore[key]) editStore[key] = {};

  Object.entries(changes || {}).forEach(([field, value]) => {
    editStore[key][field] = value;
  });
  if (!Object.keys(editStore[key]).length) {
    delete editStore[key];
  }
  saveEditStore();
}

function applyPersistedEdits(row) {
  const persisted = getRowEditState(row);
  if (persisted.优先级) row.优先级 = persisted.优先级;
  if (persisted.是否合作) row.是否合作 = persisted.是否合作;
  if (!row.是否合作) row.是否合作 = DEFAULT_COOP_STATUS;
  return row;
}

function toText(v) {
  return (v === undefined || v === null) ? "" : String(v).trim();
}

function escapeHtml(value) {
  return toText(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });
}

function renderIcons(root = document) {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.8,
      },
      root,
    });
  }
}

function iconMarkup(name) {
  return `<span data-lucide="${name}" aria-hidden="true"></span>`;
}

function setEditModeButton() {
  if (!els.editModeBtn) return;
  els.editModeBtn.classList.toggle("ghost", !isEditMode);
  els.editModeBtn.innerHTML = isEditMode
    ? `${iconMarkup("unlock-keyhole")}退出编辑`
    : `${iconMarkup("lock-keyhole")}编辑客户`;
  renderIcons(els.editModeBtn);
}

function getNoteStorageKey(item) {
  if (!item || typeof item !== "object") return "";
  if (item._noteKey) return toText(item._noteKey);
  if (item._rowUid) return toText(item._rowUid);
  return [
    item.公司主体,
    item.省份,
    item.地级市,
    item.目标用户大类,
    item.主要作物,
    item.农田面积,
  ]
    .map((v) => toText(v).replace(/\s+/g, ""))
    .join("||");
}

function resolveNoteKey(itemOrKey) {
  if (itemOrKey && typeof itemOrKey === "object" && !Array.isArray(itemOrKey)) {
    return getNoteStorageKey(itemOrKey);
  }
  return toText(itemOrKey);
}

function loadNoteStore() {
  try {
    const raw = window.localStorage.getItem(NOTE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {
    // ignore invalid cache
  }
  return {};
}

function saveNoteStore() {
  try {
    window.localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(noteStore));
  } catch (_) {
    // ignore storage failures (private mode / quota)
  }
}

function getNote(itemOrKey) {
  const key = resolveNoteKey(itemOrKey);
  if (!key) return "";
  return noteStore[key] || "";
}

function setNote(itemOrKey, noteText) {
  const key = resolveNoteKey(itemOrKey);
  const note = toText(noteText);
  if (!key) return;
  if (note) {
    noteStore[key] = note;
  } else {
    delete noteStore[key];
  }
  saveNoteStore();
}

function loadDetailExpandState() {
  try {
    const raw = window.localStorage.getItem(DETAILS_EXPAND_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {
    // ignore
  }
  return {};
}

function saveDetailExpandState() {
  try {
    window.localStorage.setItem(DETAILS_EXPAND_KEY, JSON.stringify(detailExpandStore));
  } catch (_) {
    // ignore
  }
}

function isDetailExpanded(itemOrKey) {
  const key = resolveNoteKey(itemOrKey);
  if (!key) return false;
  return Boolean(detailExpandStore[key]);
}

function setDetailExpanded(itemOrKey, isExpanded) {
  const key = resolveNoteKey(itemOrKey);
  if (!key) return;
  if (isExpanded) {
    detailExpandStore[key] = true;
  } else {
    delete detailExpandStore[key];
  }
  saveDetailExpandState();
}

function parseNumeric(v) {
  const t = toText(v).replace(/,/g, "");
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "zh-CN"));
}

function buildOptions(element, values) {
  element.innerHTML = "";
  element.appendChild(new Option(ALL_TEXT, ALL_TEXT));
  values.forEach((v) => element.appendChild(new Option(v, v)));
}

function toMu(areaText) {
  const t = toText(areaText);
  if (!t) return null;
  if (/加工厂|加工企业|未披露|待核验|需核验|公开未披露|暂无/i.test(t)) return null;

  const patterns = [
    /([0-9]+(?:\.[0-9]+)?)\s*万亩/i,
    /([0-9]+(?:\.[0-9]+)?)\s*公顷/i,
    /约?\s*([0-9]+(?:\.[0-9]+)?)\s*亩/i,
    /([0-9]+(?:\.[0-9]+)?)\s*亩地/i,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (!m) continue;
    const n = parseNumeric(m[1]);
    if (!n) continue;
    if (/公顷/.test(p.source)) return n * 15;
    if (/万亩/.test(p.source)) return n * 10000;
    return n;
  }
  const raw = t.match(/(\\d+(?:\\.\\d+)?)/);
  return raw ? parseNumeric(raw[1]) : null;
}

function areaClass(areaMu) {
  if (areaMu == null) return "面积需核验";
  if (areaMu < 300) return "50-300亩";
  if (areaMu < 1000) return "300-1000亩";
  if (areaMu < 5000) return "1000-5000亩";
  if (areaMu < 10000) return "5000-10000亩";
  return "1万亩以上";
}

function econClass(areaMu, areaText) {
  if (/加工厂|加工企业/.test(toText(areaText))) return "以加工厂为主";
  if (areaMu == null) return "待核验";
  if (areaMu < 300) return "小型高潜";
  if (areaMu < 1000) return "小型";
  if (areaMu < 5000) return "中型";
  if (areaMu < 10000) return "中型偏大";
  return "大型";
}

function farmFlag(text) {
  const t = toText(text);
  if (/有/.test(t)) return "有";
  if (/否|无/.test(t)) return "无";
  return "需核验";
}

function normalizePriority(p) {
  if (!p) return "C-待评估";
  const s = toText(p);
  if (/^S/.test(s)) return "S-立即拜访";
  if (/^A/.test(s)) return "A-优先拜访";
  if (/^B-备选/.test(s)) return "B-备选拜访";
  if (/^B/.test(s)) return "B-重点观察";
  if (/^C-储备/.test(s)) return "C-储备/尽调";
  if (/^C/.test(s)) return "C-待评估";
  return s;
}

function normalizeRow(raw, fallbackProvinceSeq = 0, source = DEFAULT_SOURCE_NAME) {
  const rawAreaText = toText(
    raw["公开土地/基地面积"] ||
      raw["公开面积/产能/经营规模"] ||
      raw["农田面积/公开口径"] ||
      raw["农田面积"] ||
      raw["公开面积亩"] ||
      raw["面积"] ||
      ""
  );
  const areaText = rawAreaText || "公开未披露";
  const areaMu = toMu(areaText);
  const province = toText(raw["省份"]) || "未知省份";
  const city = toText(raw["地级市"]) || toText(raw["地级市/区域"]) || "未知城市";
  const name = toText(raw["公司主体"] || raw["公司/基地主体"] || raw["公司名称"] || raw["企业名称"] || raw["公司"] || raw["线索名称"] || "");
  const areaLevelText = toText(raw["土地级别"] || "");
  const scaleText = toText(raw["经济规模"] || "");
  const sourceRowUid = toText(
    raw._rowUid ||
      raw["_rowUid"] ||
      raw["_sourceRow"] ||
      raw["来源ID"] ||
      raw["线索名称"] ||
      `${source}-${fallbackProvinceSeq}`
  );

  const normalized = {
    序号: toText(raw["序号"]) || String(fallbackProvinceSeq),
    公司主体: name,
    目标用户大类: toText(raw["目标用户大类"] || raw["分类"] || ""),
    分类: toText(raw["分类"] || raw["目标用户大类"] || ""),
    省份: province,
    地级市: city,
    区县: toText(raw["区县"]) || toText(raw["区县/基地"]),
    主要作物: toText(raw["主要作物"]) || toText(raw["主要作物/产品"]) || "",
    自有农田: toText(raw["是否有自有/合作农田"] || raw["自有/合作农田"] || raw["自有农田"] || ""),
    农田面积: rawAreaText || "公开未披露",
    典型废弃物: toText(raw["典型废弃物"]) || toText(raw["典型废弃物/副产物"]) || "",
    推荐路线: toText(raw["推荐路线"]) || toText(raw["推荐切入路线"]) || toText(raw["推荐线路"]) || toText(raw["推荐产品/服务"]) || "",
    优先级: normalizePriority(raw["优先级"] || raw["推荐优先级"]),
    总分: parseNumeric(raw["总分"]) || parseNumeric(raw["推荐总分"]) || parseNumeric(raw["扩展匹配分"]) || parseNumeric(raw["原始总分"]) || "",
    客户角色: toText(raw["客户角色"]) || toText(raw["业务入口/切入场景"]) || "",
    拜访建议: toText(raw["拜访建议"]) || toText(raw["拜访切入建议"]) || toText(raw["首轮动作"]) || "",
    数据口径: toText(raw["数据口径"]) || toText(raw["数据口径/可信度"]) || toText(raw["数据状态"]) || "",
    来源: toText(raw["来源"]) || toText(raw["来源类型"]) || toText(raw["来源/备注"]) || "导入清单",
    网址: toText(raw["网址"]) || toText(raw["来源URL/核验线索"]) || "",
    尽调问题: toText(raw["尽调问题"]),
    农田可用: farmFlag(raw["自有农田"] || raw["自有/合作农田"] || raw["农田可用"] || raw["是否有自有/合作农田"]),
    是否合作: normalizeCoopStatus(raw["是否合作"] || raw["合作状态"]),
    公开面积亩: areaMu,
    土地级别: areaLevelText || areaClass(areaMu),
    经济规模: scaleText || econClass(areaMu, rawAreaText),
    _sourceMode: source,
    _rowUid: sourceRowUid,
    _sourceSheet: toText(raw["_sourceSheet"] || raw["来源表"] || raw["来源文件"] || ""),
    _sourceRow: raw["_sourceRow"] || fallbackProvinceSeq,
  };
  normalized.基本情况介绍 = buildBriefIntro(normalized);
  applyPersistedEdits(normalized);
  return normalized;
}

function dedupeRows(rows) {
  const map = new Map();
  for (const row of rows) {
    const key = `${row.公司主体}-${row.省份}-${row.地级市}-${row.目标用户大类}-${row.主要作物}`.replace(/\\s+/g, "");
    if (!map.has(key)) map.set(key, row);
  }
  return Array.from(map.values());
}

function initDataModeSelector() {
  if (!els.dataMode) return;
  const options = [
    { value: DATA_MODES.dedupe.value, label: DATA_MODES.dedupe.label },
    { value: DATA_MODES.raw.value, label: DATA_MODES.raw.label },
  ];
  const mode = getStoredDataMode();

  els.dataMode.innerHTML = "";
  options.forEach((item) => {
    const modeRows = DATA_MODES[item.value]?.rows || [];
    const count = Array.isArray(modeRows) ? modeRows.length : 0;
    const label = `${item.label}（${count}条）`;
    const opt = new Option(label, item.value);
    if (item.value === DATA_MODES.raw.value && (!Array.isArray(DATA_MODES.raw.rows) || DATA_MODES.raw.rows.length === 0)) {
      opt.disabled = true;
    }
    els.dataMode.appendChild(opt);
  });

  const shouldUseRaw =
    mode === DATA_MODES.raw.value &&
    Array.isArray(DATA_MODES.raw.rows) &&
    DATA_MODES.raw.rows.length > 0;
  currentSourceMode = shouldUseRaw ? DATA_MODES.raw.value : DATA_MODES.dedupe.value;
  els.dataMode.value = currentSourceMode;
}

function getStoredDataMode() {
  try {
    const raw = window.localStorage.getItem(DATA_MODE_KEY);
    if (raw && DATA_MODES[raw]) return raw;
  } catch (_) {
    // ignore
  }
  return DATA_MODES.dedupe.value;
}

function saveDataMode(mode) {
  try {
    window.localStorage.setItem(DATA_MODE_KEY, mode);
  } catch (_) {
    // ignore
  }
}

function buildSourceName(mode) {
  const config = getDataModeConfig(mode);
  const allCount = Array.isArray(config.rows) ? config.rows.length : 0;
  if (config.value === DATA_MODES.raw.value) {
    const displayCount = config.dedupe ? config.rows.length : allCount;
    return `${config.name}（原始${allCount}条 / 显示${displayCount}条）`;
  }
  return `${config.name}（${allCount}条）`;
}

function getNormalizedRowsByMode(mode) {
  const config = getDataModeConfig(mode);
  return normalizeRows(config.rows, config.name, config.dedupe);
}

function normalizeRows(rawRows, source = "导入清单", dedupe = true) {
  if (!Array.isArray(rawRows)) return [];
  const mapped = rawRows
    .map((r, i) => {
      const row = normalizeRow(r, i + 1, source);
      row.来源 = source || row.来源;
      return row;
    })
    .filter((r) => r.公司主体 && r.省份 && r.地级市);
  if (!dedupe) return mapped;
  return dedupeRows(mapped);
}

function buildCityOptions(selectedProvince) {
  const cities = currentRows
    .filter((item) => selectedProvince === ALL_TEXT || item.省份 === selectedProvince)
    .map((item) => item.地级市);
  buildOptions(els.city, uniq(cities));
}

function initFilters() {
  buildOptions(els.priority, uniq(currentRows.map((i) => i.优先级)));
  buildOptions(els.category, uniq(currentRows.map((i) => i.目标用户大类)));
  buildOptions(els.province, uniq(currentRows.map((i) => i.省份)));
  buildCityOptions(ALL_TEXT);
  buildOptions(els.econScale, uniq(currentRows.map((i) => i.经济规模)));
  buildOptions(els.landClass, uniq(currentRows.map((i) => i.土地级别)));
  buildOptions(els.farmFlag, uniq(currentRows.map((i) => i.农田可用)));
  buildOptions(els.cooperation, uniq(currentRows.map((i) => i.是否合作 || DEFAULT_COOP_STATUS)));
  buildOptions(els.sortBy, ["综合排序（默认）", "优先级", "总分高→低", "总分低→高", "省份", "地级市"]);
}

function updateSummary() {
  const totalWithArea = currentRows.filter((item) => Number.isFinite(item.公开面积亩)).length;
  const modeText = getDataModeConfig(currentSourceMode).label || "数据口径";
  const priorityCounts = currentRows.reduce((acc, item) => {
    const key = item.优先级 || "未定义";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const coopCounts = currentRows.reduce((acc, item) => {
    const key = item.是否合作 || DEFAULT_COOP_STATUS;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const scaleSummary = currentRows.reduce((acc, item) => {
    const key = item.经济规模 || "待核验";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const defaultPriorityOrder = ["S-立即拜访", "A-优先拜访", "B-重点观察", "B-备选拜访", "C-待评估", "C-储备/尽调"];
  els.summary.textContent = `当前库：${currentSourceName}（${modeText}），共 ${currentRows.length} 家候选；已提取面积口径 ${totalWithArea} 家；` +
    `高潜 ${scaleSummary["小型高潜"] || 0}，中型 ${scaleSummary["中型"] || 0}，大规模 ${scaleSummary["中型偏大"] || 0}/${scaleSummary["大型"] || 0}，未核验 ${scaleSummary["待核验"] || 0}。` +
    `合作状态：已合作 ${coopCounts["已合作"] || 0}，未合作 ${coopCounts["未合作"] || 0}。` +
    `优先级：` + defaultPriorityOrder.map((k) => `${k}:${priorityCounts[k] || 0}`).join("，");
}

function renderMetricCard(label, value) {
  const card = document.createElement("div");
  card.className = "metric-card";

  const title = document.createElement("div");
  title.className = "metric-title";
  title.textContent = label;

  const valueNode = document.createElement("div");
  valueNode.className = "metric-value";
  valueNode.textContent = value;

  card.append(title, valueNode);
  return card;
}

function percentText(count, total) {
  if (!total) return "0.0%";
  return `${((count / total) * 100).toFixed(1)}%`;
}

function renderDistributionBoard(container, rows, field) {
  if (!container) return;
  container.innerHTML = "";
  const total = rows.length;

  if (!total) {
    container.classList.add("empty");
    container.textContent = "当前筛选暂无数据";
    return;
  }

  container.classList.remove("empty");
  const buckets = {};
  rows.forEach((item) => {
    const key = toText(item[field]) || "未分类";
    buckets[key] = (buckets[key] || 0) + 1;
  });

  const entries = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  const frag = document.createDocumentFragment();
  const shown = entries.slice(0, 8);
  shown.forEach(([name, count]) => {
    const row = document.createElement("div");
    row.className = "board-row";

    const rowLabel = document.createElement("div");
    rowLabel.className = "board-row-label";
    rowLabel.innerHTML = `<span>${name}</span><span class="count">${count} 家 / ${percentText(count, total)}</span>`;

    const track = document.createElement("div");
    track.className = "board-track";

    const fill = document.createElement("div");
    fill.className = "board-fill";
    fill.style.width = `${total ? (count / total) * 100 : 0}%`;
    track.appendChild(fill);

    row.append(rowLabel, track);
    frag.appendChild(row);
  });

  if (entries.length > shown.length) {
    const otherCount = entries.slice(8).reduce((acc, it) => acc + it[1], 0);
    const row = document.createElement("div");
    row.className = "board-row";

    const rowLabel = document.createElement("div");
    rowLabel.className = "board-row-label";
    rowLabel.innerHTML = `<span>其他</span><span class="count">${otherCount} 家 / ${percentText(otherCount, total)}</span>`;

    const track = document.createElement("div");
    track.className = "board-track";

    const fill = document.createElement("div");
    fill.className = "board-fill";
    fill.style.width = `${total ? (otherCount / total) * 100 : 0}%`;
    track.appendChild(fill);
    row.append(rowLabel, track);
    frag.appendChild(row);
  }
  container.appendChild(frag);
}

function updateOverviewBoards(filteredRows) {
  const rows = Array.isArray(filteredRows) ? filteredRows : [];
  const total = rows.length;
  const areaCount = rows.filter((item) => Number.isFinite(item.公开面积亩)).length;
  const totalCoop = rows.filter((item) => (item.是否合作 || DEFAULT_COOP_STATUS) === "已合作").length;
  const saas = rows.filter((item) => item.优先级 === "S-立即拜访").length;
  const aVisit = rows.filter((item) => item.优先级 === "A-优先拜访").length;
  const totalPriority = saas + aVisit;
  const pendingCoop = rows.filter((item) => (item.是否合作 || DEFAULT_COOP_STATUS) === "待确认").length;
  const disclosedArea = rows.filter((item) => toText(item.农田面积) && item.农田面积 !== "公开未披露").length;

  if (!els.metricCards) return;
  els.metricCards.innerHTML = "";
  els.metricCards.append(
    renderMetricCard("筛选后总量", total + " 家"),
    renderMetricCard("有可核验农田", areaCount + " 家"),
    renderMetricCard("S/A级潜在重点", totalPriority + " 家"),
    renderMetricCard("已合作", totalCoop + " 家"),
    renderMetricCard("待确认合作", pendingCoop + " 家"),
    renderMetricCard("已披露面积", disclosedArea + " 家")
  );

  if (els.categoryBoard) {
    els.categoryBoard.innerHTML = "";
    renderDistributionBoard(els.categoryBoard, rows, "目标用户大类");
  }
  if (els.provinceBoard) {
    els.provinceBoard.innerHTML = "";
    renderDistributionBoard(els.provinceBoard, rows, "省份");
  }
  if (els.scaleBoard) {
    els.scaleBoard.innerHTML = "";
    renderDistributionBoard(els.scaleBoard, rows, "经济规模");
  }
}

function matchText(item, keyword) {
  if (!keyword) return true;
  const hay = [
    item.公司主体,
    item.主要作物,
    item.省份,
    item.地级市,
    item.目标用户大类,
    item.推荐路线,
    item.典型废弃物,
    item.是否合作,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(keyword);
}

function buildBriefIntro(item) {
  const parts = [];
  const area = [item.省份, item.地级市].filter(Boolean).join(" / ");
  if (area) parts.push(`区域：${area}`);
  if (item.客户角色) parts.push(`角色：${item.客户角色}`);
  if (item.自有农田) parts.push(`自有农田：${item.自有农田}`);
  if (item.主要作物) parts.push(`作物：${item.主要作物}`);
  if (item.农田面积) parts.push(`面积：${item.农田面积}`);
  if (item.典型废弃物) parts.push(`废弃物：${item.典型废弃物}`);
  if (item.推荐路线) parts.push(`切入路线：${item.推荐路线}`);
  if (item.拜访建议) parts.push(`建议：${item.拜访建议}`);
  if (item.尽调问题) parts.push(`尽调：${item.尽调问题}`);
  return parts.join("；") || "待补充基本情况";
}

function toDisplayText(value, fallback = "") {
  const text = toText(value);
  return text || fallback;
}

function createDetailLine(label, value, isMultiLine = false) {
  const row = document.createElement("p");
  row.className = "detail-line";
  const key = document.createElement("span");
  key.className = "detail-line-label";
  key.textContent = `${label}：`;
  const val = document.createElement("span");
  val.className = isMultiLine ? "detail-line-value multi" : "detail-line-value";
  val.textContent = toDisplayText(value, "待补充");
  row.append(key, val);
  return row;
}

function createSourceLink(url) {
  const text = toText(url);
  if (!text) return "待补充";
  if (/^https?:\/\//i.test(text)) {
    const a = document.createElement("a");
    a.href = text;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "查看线索";
    return a;
  }
  return document.createTextNode(text);
}

function createDetailPanel(item, noteKey) {
  const detailRow = document.createElement("tr");
  detailRow.className = "detail-row";
  detailRow.dataset.noteKey = noteKey;

  const detailCell = document.createElement("td");
  detailCell.colSpan = TABLE_COLUMN_COUNT;

  const detailPanel = document.createElement("div");
  detailPanel.className = "detail-panel";

  const sectionA = document.createElement("div");
  sectionA.className = "detail-section";
  sectionA.appendChild(createDetailLine("基本情况", item.基本情况介绍 || buildBriefIntro(item), true));
  sectionA.appendChild(createDetailLine("主要作物", item.主要作物));
  sectionA.appendChild(createDetailLine("自有农田", item.自有农田));
  sectionA.appendChild(createDetailLine("土地级别", item.土地级别 || item.经济规模 || "待核验"));

  const sectionB = document.createElement("div");
  sectionB.className = "detail-section";
  sectionB.appendChild(createDetailLine("典型废弃物", item.典型废弃物));
  sectionB.appendChild(createDetailLine("推荐路线", item.推荐路线));
  sectionB.appendChild(createDetailLine("拜访建议", item.拜访建议, true));
  sectionB.appendChild(createDetailLine("尽调问题", item.尽调问题, true));

  const sectionC = document.createElement("div");
  sectionC.className = "detail-section";
  sectionC.appendChild(createDetailLine("可核验面积", item.农田面积));

  const sourceLinkHost = createSourceLink(item.网址);
  const sourceRow = document.createElement("p");
  sourceRow.className = "detail-line";
  const sourceLabel = document.createElement("span");
  sourceLabel.className = "detail-line-label";
  sourceLabel.textContent = "来源：";
  sourceRow.append(sourceLabel, sourceLinkHost);
  sectionC.appendChild(sourceRow);

  const noteRow = document.createElement("div");
  noteRow.className = "note-editor-wrap";
  const noteTitle = document.createElement("div");
  noteTitle.className = "note-title";
  noteTitle.textContent = "备注";
  const textarea = document.createElement("textarea");
  textarea.className = "note-editor";
  textarea.rows = 2;
  textarea.placeholder = "点击输入备注并保存";
  textarea.value = getNote(noteKey);
  const actionLine = document.createElement("div");
  actionLine.className = "note-action-row";
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "note-save-btn ghost";
  saveBtn.innerHTML = `${iconMarkup("save")}保存备注`;
  saveBtn.dataset.noteKey = noteKey;
  const state = document.createElement("span");
  state.className = "note-state";
  state.dataset.noteKey = noteKey;
  actionLine.append(saveBtn, state);
  noteRow.append(noteTitle, textarea, actionLine);

  detailPanel.append(sectionA, sectionB, sectionC, noteRow);
  detailCell.appendChild(detailPanel);
  detailRow.appendChild(detailCell);
  renderIcons(detailRow);

  return { detailRow, textarea, state };
}

function createEmptyDetailRow(noteKey) {
  const detailRow = document.createElement("tr");
  detailRow.className = "detail-row";
  detailRow.dataset.noteKey = noteKey;
  detailRow.hidden = true;

  const detailCell = document.createElement("td");
  detailCell.colSpan = TABLE_COLUMN_COUNT;
  detailRow.appendChild(detailCell);
  return detailRow;
}

function fillDetailRow(detailRow, item, noteKey) {
  if (!detailRow || detailRow.querySelector(".detail-panel")) return;
  const filled = createDetailPanel(item, noteKey);
  detailRow.replaceChildren(...Array.from(filled.detailRow.childNodes));
  detailRow.dataset.noteKey = noteKey;
}

function priorityToWeight(priority) {
  const map = {
    "S-立即拜访": 100,
    "A-优先拜访": 80,
    "B-重点观察": 60,
    "B-备选拜访": 60,
    "C-待评估": 40,
    "C-储备/尽调": 30,
  };
  return map[priority] || 20;
}

function createBadge(text, type) {
  const badge = document.createElement("span");
  const normalized = toText(text) || "待确认";
  badge.className = `status-badge ${type || ""}`;
  badge.textContent = normalized;
  return badge;
}

function getPriorityBadgeType(priority) {
  const text = toText(priority);
  if (text.startsWith("S")) return "priority-s";
  if (text.startsWith("A")) return "priority-a";
  if (text.startsWith("B")) return "priority-b";
  return "priority-c";
}

function getCoopBadgeType(status) {
  const text = normalizeCoopStatus(status);
  if (text === "已合作") return "coop-done";
  if (text === "待确认") return "coop-pending";
  return "coop-none";
}

function setDetailToggleButton(button, isExpanded) {
  if (!button) return;
  button.classList.toggle("is-open", isExpanded);
  button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  button.textContent = isExpanded ? "收起" : "详情";
}

function createSelectEditor(options, selectedValue, field, noteKey) {
  const select = document.createElement("select");
  select.className = "inline-editor";
  select.dataset.field = field;
  select.dataset.noteKey = noteKey;
  select.disabled = !isEditMode;
  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    if (optionValue === selectedValue) option.selected = true;
    select.appendChild(option);
  });
  return select;
}

function syncEditToState(row, field, value) {
  if (!row || !field) return;
  row[field] = value;
  const key = getNoteStorageKey(row);
  if (!key) return;
  if (field === "是否合作" || field === "优先级") {
    const patch = {};
    patch[field] = value;
    setRowEditState(key, patch);
  }
}

function renderRows(filtered) {
  els.rows.innerHTML = "";
  els.resultCount.textContent = `${filtered.length} 条`;

  if (!filtered.length) {
    renderedRows = [];
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = TABLE_COLUMN_COUNT;
    td.className = "empty";
    td.textContent = "当前筛选条件下暂无结果，请调整筛选条件。";
    tr.appendChild(td);
    els.rows.appendChild(tr);
    return;
  }

  const sorted = [...filtered];
  const sortMode = els.sortBy.value;
  if (sortMode === "总分高→低") sorted.sort((a, b) => (b.总分 || 0) - (a.总分 || 0));
  if (sortMode === "总分低→高") sorted.sort((a, b) => (a.总分 || 0) - (b.总分 || 0));
  if (sortMode === "优先级") sorted.sort((a, b) => priorityToWeight(b.优先级) - priorityToWeight(a.优先级));
  if (sortMode === "省份") sorted.sort((a, b) => String(a.省份 || "").localeCompare(String(b.省份 || ""), "zh-CN"));
  if (sortMode === "地级市") sorted.sort((a, b) => String(a.地级市 || "").localeCompare(String(b.地级市 || ""), "zh-CN"));
  if (sortMode === "综合排序（默认）") sorted.sort((a, b) => (priorityToWeight(b.优先级) - priorityToWeight(a.优先级)) || ((b.总分 || 0) - (a.总分 || 0)));

  renderedRows = sorted;

  const frag = document.createDocumentFragment();
  sorted.forEach((item) => {
    const noteKey = getNoteStorageKey(item);
    const isExpanded = isDetailExpanded(noteKey);
    const tr = document.createElement("tr");
    tr.dataset.noteKey = noteKey;
    tr.className = "customer-row";
    tr.classList.toggle("is-expanded", isExpanded);
    const priorityText = item.优先级 || "";
    const cooperationText = item.是否合作 || DEFAULT_COOP_STATUS;

    tr.innerHTML = `
      <td>${escapeHtml(item.序号)}</td>
      <td>${escapeHtml(item.省份)}</td>
      <td>${escapeHtml(item.地级市)}</td>
      <td class="company-cell">${escapeHtml(item.公司主体)}</td>
      <td>${escapeHtml(item.目标用户大类)}</td>
      <td class="truncate">${escapeHtml(item.主要作物)}</td>
      <td>${escapeHtml(item.农田面积)}</td>
      <td>${escapeHtml(item.土地级别)}</td>
      <td class="priority-cell"></td>
      <td class="cooperation-cell"></td>
      <td class="detail-cell"></td>
    `;

    const priorityCell = tr.querySelector(".priority-cell");
    if (isEditMode) {
      const prioritySelect = createSelectEditor(EDIT_PRIORITY_OPTIONS, priorityText, "优先级", noteKey);
      prioritySelect.value = priorityText;
      priorityCell.appendChild(prioritySelect);
    } else {
      priorityCell.appendChild(createBadge(priorityText, getPriorityBadgeType(priorityText)));
    }

    const cooperationCell = tr.querySelector(".cooperation-cell");
    if (isEditMode) {
      const cooperationSelect = createSelectEditor(EDIT_COOP_OPTIONS, cooperationText, "是否合作", noteKey);
      cooperationSelect.value = cooperationText;
      cooperationCell.appendChild(cooperationSelect);
    } else {
      cooperationCell.appendChild(createBadge(cooperationText, getCoopBadgeType(cooperationText)));
    }

    const detailCell = tr.querySelector(".detail-cell");
    const detailButton = document.createElement("button");
    detailButton.type = "button";
    detailButton.className = "detail-toggle ghost";
    detailButton.dataset.noteKey = noteKey;
    setDetailToggleButton(detailButton, isExpanded);
    detailCell.appendChild(detailButton);

    const detailPackage = isExpanded ? createDetailPanel(item, noteKey) : { detailRow: createEmptyDetailRow(noteKey) };
    const { detailRow } = detailPackage;
    detailRow.hidden = !isExpanded;

    const detailPanelCell = detailRow.querySelector("td");
    if (detailPanelCell && item.来源) {
      detailPanelCell.dataset.source = item.来源;
    }

    frag.appendChild(tr);
    frag.appendChild(detailRow);
  });
  els.rows.appendChild(frag);
}

function updateNoteStatus(rowEl, text) {
  if (!rowEl) return;
  const state = rowEl.querySelector(".note-state");
  if (!state) return;
  state.textContent = text || "";
}

function clearNoteStatus(rowEl) {
  if (!rowEl) return;
  const state = rowEl.querySelector(".note-state");
  if (!state) return;
  window.setTimeout(() => {
    state.textContent = "";
  }, 1800);
}

function saveCurrentRowNote(event) {
  const btn = event.target.closest(".note-save-btn");
  if (!btn) return;
  const row = btn.closest("tr");
  if (!row) return;

  const key = btn.dataset.noteKey || "";
  const textarea = row.querySelector(".note-editor");
  if (!textarea) return;

  setNote(key, textarea.value);
  updateNoteStatus(row, "已保存");
  clearNoteStatus(row);
}

function toggleDetail(event) {
  const btn = event.target.closest(".detail-toggle");
  if (!btn) return;
  const key = btn.dataset.noteKey;
  const baseRow = btn.closest("tr");
  if (!baseRow) return;

  let detailRow = baseRow.nextElementSibling;
  if (!detailRow || !detailRow.classList.contains("detail-row")) {
    detailRow = Array.from(baseRow.parentElement.children).find((el) => {
      return el.tagName === "TR" && el.classList.contains("detail-row") && el.dataset.noteKey === key;
    });
  }
  if (!detailRow) return;

  const nextState = detailRow.hidden;
  if (nextState && !detailRow.querySelector(".detail-panel")) {
    const targetItem = renderedRows.find((row) => getNoteStorageKey(row) === key);
    if (targetItem) fillDetailRow(detailRow, targetItem, key);
  }
  detailRow.hidden = !nextState;
  baseRow.classList.toggle("is-expanded", nextState);
  setDetailToggleButton(btn, nextState);
  setDetailExpanded(key, nextState);
}

function handleRowEditorChange(event) {
  const editor = event.target;
  if (!(editor instanceof HTMLSelectElement)) return;
  if (!editor.matches(".inline-editor")) return;
  const key = editor.dataset.noteKey;
  const field = editor.dataset.field;
  const value = toText(editor.value);
  if (!key || !field) return;
  const targetRow = currentRows.find((row) => getNoteStorageKey(row) === key);
  if (!targetRow) return;

  syncEditToState(targetRow, field, value);
  updateSummary();
  applyFilters();
}

function ensureEditMode() {
  if (isEditMode) return true;
  const input = window.prompt("请输入编辑密码");
  if (input !== EDIT_PASSWORD) {
    window.alert("密码错误，未开启编辑权限。");
    return false;
  }
  isEditMode = true;
  setEditModeButton();
  applyFilters();
  return true;
}

function exitEditMode() {
  isEditMode = false;
  setEditModeButton();
  applyFilters();
}

function toggleEditMode() {
  if (isEditMode) {
    exitEditMode();
    return;
  }
  ensureEditMode();
}

function switchDataMode() {
  const mode = toText(els.dataMode && els.dataMode.value) || DATA_MODES.dedupe.value;
  const config = getDataModeConfig(mode);
  if (!Array.isArray(config.rows) || !config.rows.length) {
    window.alert("当前没有可用的线索明细数据，已切回去重主体视图。");
    currentSourceMode = DATA_MODES.dedupe.value;
    if (els.dataMode) els.dataMode.value = DATA_MODES.dedupe.value;
    return;
  }

  saveDataMode(config.value);
  const normalizedRows = getNormalizedRowsByMode(config.value);
  setCurrentRows(normalizedRows, buildSourceName(config.value), false, config.value);
}

function applyFilters() {
  const keyword = toText(els.keyword.value).toLowerCase();
  const cond = {
    priority: els.priority.value,
    category: els.category.value,
    province: els.province.value,
    city: els.city.value,
    econScale: els.econScale.value,
    landClass: els.landClass.value,
    farmFlag: els.farmFlag.value,
    cooperation: els.cooperation.value,
  };

  const filtered = currentRows.filter((item) => {
    if (cond.priority !== ALL_TEXT && item.优先级 !== cond.priority) return false;
    if (cond.category !== ALL_TEXT && item.目标用户大类 !== cond.category) return false;
    if (cond.province !== ALL_TEXT && item.省份 !== cond.province) return false;
    if (cond.city !== ALL_TEXT && item.地级市 !== cond.city) return false;
    if (cond.econScale !== ALL_TEXT && item.经济规模 !== cond.econScale) return false;
    if (cond.landClass !== ALL_TEXT && item.土地级别 !== cond.landClass) return false;
    if (cond.farmFlag !== ALL_TEXT && item.农田可用 !== cond.farmFlag) return false;
    if (cond.cooperation !== ALL_TEXT && (item.是否合作 || DEFAULT_COOP_STATUS) !== cond.cooperation) return false;
    if (!matchText(item, keyword)) return false;
    return true;
  });

  renderRows(filtered);
  updateOverviewBoards(filtered);
}

function setCurrentRows(rows, sourceName, keepFilters = false, mode = currentSourceMode) {
  currentRows = rows;
  currentSourceName = sourceName || "导入清单";
  currentSourceMode = mode;
  if (els.dataMode) {
    els.dataMode.value = currentSourceMode;
  }
  els.importStatus.textContent = `当前使用：${currentSourceName}（${currentRows.length}条）`;
  initFilters();
  updateSummary();
  buildCityOptions(els.province.value || ALL_TEXT);
  if (!keepFilters) {
    els.keyword.value = "";
    els.priority.value = ALL_TEXT;
    els.category.value = ALL_TEXT;
    els.province.value = ALL_TEXT;
    buildCityOptions(ALL_TEXT);
    els.city.value = ALL_TEXT;
    els.econScale.value = ALL_TEXT;
    els.landClass.value = ALL_TEXT;
    els.farmFlag.value = ALL_TEXT;
    els.cooperation.value = ALL_TEXT;
    els.sortBy.value = "综合排序（默认）";
  }
  applyFilters();
}

function resetFilters() {
  const config = getDataModeConfig(currentSourceMode);
  const rows = normalizeRows(config.rows, config.name, config.dedupe);
  setCurrentRows(rows, buildSourceName(config.value), false, config.value);
}

function parseCsvContent(text) {
  const rows = [];
  const separator =
    (text.includes("\t") && !text.includes(",")) || (text.split("\n")[0] || "").includes("\t")
      ? "\t"
      : ",";
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === separator) {
      row.push(field);
      field = "";
      continue;
    }

    if (ch === "\r") continue;

    if (ch === "\n") {
      row.push(field);
      if (row.some((v) => toText(v))) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += ch;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((v) => toText(v))) rows.push(row);
  }
  return rows;
}

function csvRowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => toText(h).replace(/^\uFEFF/, ""));
  const out = [];

  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length === 1 && !toText(rows[i][0])) continue;
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = rows[i][index] ?? "";
    });
    out.push(obj);
  }
  return out;
}

function xlsxRowsToObjects(fileData) {
  if (!window.XLSX || typeof window.XLSX.read !== "function") {
    throw new Error("未检测到 XLSX 解析库，请检查网络是否可访问 https://cdn.jsdelivr.net 或改为 CSV/JSON 导入。");
  }

  const workbook = window.XLSX.read(fileData, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) return [];
  const sheet = workbook.Sheets[firstSheet];
  const json = window.XLSX.utils.sheet_to_json(sheet, { defval: "", header: 1 });
  if (!json || !json.length) return [];
  return csvRowsToObjects(json);
}

function importFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const raw = toText(e.target.result);
      const ext = file.name.split(".").pop().toLowerCase();
      let importedRaw = [];

      if (ext === "json") {
        importedRaw = JSON.parse(raw);
        if (!Array.isArray(importedRaw)) throw new Error("JSON 格式应为数组");
      } else if (ext === "xlsx" || ext === "xls") {
        importedRaw = xlsxRowsToObjects(e.target.result);
      } else {
        const rows = parseCsvContent(typeof e.target.result === "string" ? raw : new TextDecoder("utf-8").decode(e.target.result));
        importedRaw = csvRowsToObjects(rows);
      }

      const shouldDedupe = getDataModeConfig(currentSourceMode).dedupe;
      const merged = normalizeRows(importedRaw, `导入清单：${file.name}`, shouldDedupe);
      if (!merged.length) {
        els.importStatus.textContent = `导入失败：${file.name} 解析为空，请确认文件有标题行和数据行。`;
        return;
      }
      setCurrentRows(merged, `导入清单：${file.name}`, false, currentSourceMode);
      els.importStatus.textContent = `导入成功：${file.name}（原始 ${importedRaw.length} 条，已入库 ${merged.length} 条）`;
    } catch (err) {
      els.importStatus.textContent = `导入失败：${file.name}，请检查文件格式是否为 CSV 或 JSON。`;
      console.error(err);
    } finally {
      els.importFile.value = "";
    }
  };
  if (file.name.toLowerCase().endsWith(".xlsx") || file.name.toLowerCase().endsWith(".xls")) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file, "utf-8");
  }
}

function exportCSV() {
  exportRowsToCsv(renderedRows, "目标客户筛选结果.csv");
}

function exportAllDatabase() {
  exportRowsToCsv(currentRows, "目标客户数据库_完整表.csv");
}

function exportRowsToCsv(rows, filename) {
  const rowsForExport = Array.isArray(rows) ? rows : [];
  const dataRows = rowsForExport.map((item) => [
    item.序号 || "",
    item.省份 || "",
    item.地级市 || "",
    item.公司主体 || "",
    item.目标用户大类 || "",
    item.主要作物 || "",
    item.自有农田 || "",
    item.农田面积 || "",
    item.土地级别 || "",
    item.经济规模 || "",
    item.优先级 || "",
    item.总分 || "",
    item.典型废弃物 || "",
    item.是否合作 || DEFAULT_COOP_STATUS,
    item.基本情况介绍 || buildBriefIntro(item),
    getNote(item),
  ]);

  const lines = [
    "序号,省份,地级市,公司主体,目标用户大类,主要作物,自有农田,农田面积,土地级别,经济规模,优先级,总分,典型废弃物,是否合作,基本情况介绍,备注",
  ];
  dataRows.forEach((row) => {
    const vals = row.length >= 16 ? row.slice(0, 16) : [...row, ...Array(16 - row.length).fill("")];
    const escaped = vals.map((v) => `"${(v || "").replace(/"/g, '""')}"`);
    lines.push(escaped.join(","));
  });
  const blob = new Blob([lines.join("\\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename || "目标客户筛选结果.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  els.keyword.addEventListener("input", applyFilters);
  els.priority.addEventListener("change", applyFilters);
  els.category.addEventListener("change", applyFilters);
  els.province.addEventListener("change", () => {
    buildCityOptions(els.province.value || ALL_TEXT);
    applyFilters();
  });
  els.city.addEventListener("change", applyFilters);
  els.econScale.addEventListener("change", applyFilters);
  els.landClass.addEventListener("change", applyFilters);
  els.farmFlag.addEventListener("change", applyFilters);
  els.cooperation.addEventListener("change", applyFilters);
  els.sortBy.addEventListener("change", applyFilters);
  if (els.dataMode) {
    els.dataMode.addEventListener("change", switchDataMode);
  }
  els.resetBtn.addEventListener("click", resetFilters);
  if (els.editModeBtn) {
    els.editModeBtn.addEventListener("click", toggleEditMode);
  }
  els.exportBtn.addEventListener("click", exportCSV);
  els.exportAllBtn.addEventListener("click", exportAllDatabase);
  els.rows.addEventListener("click", saveCurrentRowNote);
  els.rows.addEventListener("click", toggleDetail);
  els.rows.addEventListener("change", handleRowEditorChange);
  els.restoreBtn.addEventListener("click", () => {
    const config = getDataModeConfig(currentSourceMode);
    const resetRows = normalizeRows(config.rows, config.name, config.dedupe);
    setCurrentRows(resetRows, buildSourceName(config.value), false, config.value);
    els.importStatus.textContent = `已恢复：${config.name}`;
  });
  els.importFile.addEventListener("change", (e) => importFromFile(e.target.files[0]));
}

function boot() {
  noteStore = loadNoteStore();
  editStore = loadEditStore();
  detailExpandStore = loadDetailExpandState();
  initDataModeSelector();

  const baseMode = getDataModeConfig(currentSourceMode);
  const baseRows = normalizeRows(baseMode.rows, baseMode.name, baseMode.dedupe);
  if (!baseRows.length) {
    currentRows = [];
    els.summary.textContent = "未检测到有效数据，请先确认 data.js 是否正确加载。";
    els.resultCount.textContent = "0 条";
    return;
  }
  setEditModeButton();
  renderIcons();
  setCurrentRows(baseRows, buildSourceName(baseMode.value), false, baseMode.value);
  bindEvents();
}

boot();
