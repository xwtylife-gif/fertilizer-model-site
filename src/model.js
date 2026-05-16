(function () {
  const REQUIRED_FIELDS = [
    "id",
    "name",
    "category",
    "thermal",
    "water",
    "nutrientDemandKgHa",
    "yieldPotentialKgHa",
    "stages",
    "managementTemplates",
    "sourceIds"
  ];

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);
  const pct = (value) => `${Math.round(value * 100)}%`;
  const kgMu = (kgHa) => Math.round(kgHa / 15);
  const yieldMu = (kgHa) => Math.round(kgHa / 15);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function validateCropDatabase(db) {
    const errors = [];
    const warnings = [];
    const sourceIds = new Set((db.sources || []).map((source) => source.id));
    const cropIds = new Set();

    if (!Array.isArray(db.crops)) {
      errors.push("数据库缺少 crops 数组");
      return { ok: false, errors, warnings, cropCount: 0 };
    }

    if (db.crops.length !== db.validationRules.requiredCropCount) {
      errors.push(`作物数量应为 ${db.validationRules.requiredCropCount}，当前为 ${db.crops.length}`);
    }

    db.crops.forEach((crop) => {
      if (cropIds.has(crop.id)) errors.push(`作物 id 重复：${crop.id}`);
      cropIds.add(crop.id);

      REQUIRED_FIELDS.forEach((field) => {
        if (!Object.hasOwn(crop, field)) errors.push(`${crop.name || crop.id} 缺少字段 ${field}`);
      });

      if (!(crop.thermal.baseTempC < crop.thermal.optTempC && crop.thermal.optTempC < crop.thermal.maxTempC)) {
        errors.push(`${crop.name} 温度参数顺序不合理`);
      }

      if (crop.water.seasonRequirementMm < crop.water.validationRangeMm[0] || crop.water.seasonRequirementMm > crop.water.validationRangeMm[1]) {
        errors.push(`${crop.name} 全季需水量超出校验范围`);
      }

      const partitionTotal = Object.values(crop.biomassPartition).reduce((total, value) => total + value, 0);
      if (Math.abs(partitionTotal - 1) > 0.001) errors.push(`${crop.name} 生物量分配合计不是 1`);

      ["thermalShare", "nShare", "pShare", "kShare", "waterShare"].forEach((key) => {
        const total = sum(crop.stages, key);
        if (Math.abs(total - 1) > 0.001) errors.push(`${crop.name} 阶段 ${key} 合计为 ${total.toFixed(3)}`);
      });

      ["fertilization", "irrigation", "plantProtection", "fieldOperations"].forEach((group) => {
        if (!Array.isArray(crop.managementTemplates[group]) || crop.managementTemplates[group].length === 0) {
          errors.push(`${crop.name} 缺少 ${group} 管理模板`);
        }
      });

      crop.sourceIds.forEach((sourceId) => {
        if (!sourceIds.has(sourceId)) errors.push(`${crop.name} 引用了未知来源 ${sourceId}`);
      });

      if (crop.soilPreference.salinityThresholdDsM <= 1) {
        warnings.push(`${crop.name} 对盐分较敏感，区域配置时需要重点校验 EC`);
      }
    });

    return { ok: errors.length === 0, errors, warnings, cropCount: db.crops.length };
  }

  function summarizeCrop(crop) {
    return {
      name: crop.name,
      headline: `${crop.category} · ${crop.marketablePart}`,
      thermal: `${crop.thermal.totalGddC} GDD / ${crop.thermal.typicalSeasonDays[0]}-${crop.thermal.typicalSeasonDays[1]} 天`,
      water: `${crop.water.seasonRequirementMm} mm / Kc ${crop.water.kc.initial}-${crop.water.kc.mid}-${crop.water.kc.late}`,
      nutrients: `N ${kgMu(crop.nutrientDemandKgHa.n)} / P2O5 ${kgMu(crop.nutrientDemandKgHa.p2o5)} / K2O ${kgMu(crop.nutrientDemandKgHa.k2o)} kg/亩`,
      yield: `${yieldMu(crop.yieldPotentialKgHa).toLocaleString("zh-CN")} kg/亩`,
      soil: `pH ${crop.soilPreference.phOptLow}-${crop.soilPreference.phOptHigh} · EC≤${crop.soilPreference.salinityThresholdDsM} dS/m`,
      stages: crop.stages.map((stage) => `${stage.name} ${pct(stage.thermalShare)}`).join(" / ")
    };
  }

  function parseLocalDate(input) {
    if (input instanceof Date) return startOfDay(input);
    if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [year, month, day] = input.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
    return startOfDay(new Date());
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatMonthDay(date) {
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function daysBetween(start, end) {
    return Math.round((startOfDay(end) - startOfDay(start)) / MS_PER_DAY);
  }

  function daysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function monthDayValue(monthDay) {
    const [month, day] = monthDay.split("-").map(Number);
    return month * 100 + day;
  }

  function dateFromMonthDay(year, monthDay) {
    const [month, day] = monthDay.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function resolveLimitDate(startDate, monthDay) {
    if (!monthDay) return addDays(startDate, 420);
    let limit = dateFromMonthDay(startDate.getFullYear(), monthDay);
    if (limit < startDate) limit = dateFromMonthDay(startDate.getFullYear() + 1, monthDay);
    return limit;
  }

  function getCropWindow(region, cropId) {
    return region?.cropWindows?.[cropId] || null;
  }

  function getStartWindowStatus(startDate, cropWindow) {
    if (!cropWindow) {
      return {
        level: "unknown",
        label: "未配置区域窗口",
        message: "当前区域还没有这个作物的本地播栽窗口，模型只按作物通用积温运行。"
      };
    }

    const md = monthDayValue(formatMonthDay(startDate));
    const recommended = cropWindow.recommendedStart || [];
    const caution = cropWindow.cautionStart || [];
    const latest = cropWindow.latestRiskStart ? monthDayValue(cropWindow.latestRiskStart) : null;

    if (recommended.length === 2 && md >= monthDayValue(recommended[0]) && md <= monthDayValue(recommended[1])) {
      return { level: "good", label: "推荐窗口", message: `位于当地推荐播栽期 ${recommended[0]} 至 ${recommended[1]}。` };
    }

    if (caution.length === 2 && md >= monthDayValue(caution[0]) && md <= monthDayValue(caution[1])) {
      return { level: "caution", label: "谨慎窗口", message: `已进入晚播风险期 ${caution[0]} 至 ${caution[1]}，需要早熟品种和更紧凑管理。` };
    }

    if (latest && md > latest) {
      return { level: "bad", label: "不建议播栽", message: `已晚于本地高风险界限 ${cropWindow.latestRiskStart}，通常积温和安全灌浆窗口不足。` };
    }

    if (recommended.length === 2 && md < monthDayValue(recommended[0])) {
      return { level: "caution", label: "偏早", message: `早于推荐播栽期 ${recommended[0]}，需要确认低温、秧龄和田间条件。` };
    }

    return { level: "bad", label: "不在窗口", message: "不在当前区域配置的适宜播栽窗口内。", };
  }

  function interpolateMonthly(values, date, asDailyTotal = false) {
    if (!Array.isArray(values) || values.length !== 12) return 0;
    const month = date.getMonth();
    const nextMonth = (month + 1) % 12;
    const monthDays = Math.max(1, daysInMonth(date) - 1);
    const fraction = (date.getDate() - 1) / monthDays;
    const current = asDailyTotal ? values[month] / daysInMonth(date) : values[month];
    const nextDate = new Date(date.getFullYear(), nextMonth, 1);
    const next = asDailyTotal ? values[nextMonth] / daysInMonth(nextDate) : values[nextMonth];
    return current + (next - current) * fraction;
  }

  function dailyClimate(region, date) {
    const normal = region?.climateNormal || {};
    return {
      date: formatDate(date),
      tmeanC: round1(interpolateMonthly(normal.monthlyTmeanC, date, false)),
      rainMm: round1(interpolateMonthly(normal.monthlyRainMm, date, true)),
      et0Mm: round1(interpolateMonthly(normal.monthlyEt0Mm, date, true)),
      rhPct: Math.round(interpolateMonthly(normal.monthlyRhPct, date, false))
    };
  }

  function calculateDailyGdd(crop, climate) {
    return Math.max(0, Math.min(climate.tmeanC, crop.thermal.maxTempC) - crop.thermal.baseTempC);
  }

  function requiredGddFor(crop, region) {
    const cropWindow = getCropWindow(region, crop.id);
    return Number(cropWindow?.regionalGddOverride || crop.thermal.totalGddC);
  }

  function buildStageTargets(crop, requiredGdd) {
    let cumulative = 0;
    return crop.stages.map((stage) => {
      const startGdd = cumulative;
      cumulative += stage.thermalShare * requiredGdd;
      return { stage, startGdd, endGdd: cumulative };
    });
  }

  function summarizeDailyLogs(logs, startDate, endDate) {
    const rows = logs.filter((row) => {
      const date = parseLocalDate(row.date);
      return date >= startDate && date <= endDate;
    });
    const totalGdd = rows.reduce((total, row) => total + row.gdd, 0);
    const avgTmean = rows.length ? rows.reduce((total, row) => total + row.tmeanC, 0) / rows.length : 0;
    const rainMm = rows.reduce((total, row) => total + row.rainMm, 0);
    const et0Mm = rows.reduce((total, row) => total + row.et0Mm, 0);
    return {
      totalGdd: round1(totalGdd),
      avgTmeanC: round1(avgTmean),
      rainMm: Math.round(rainMm),
      et0Mm: Math.round(et0Mm)
    };
  }

  function simulatePhenology(crop, region, startDateInput) {
    const startDate = parseLocalDate(startDateInput);
    const cropWindow = getCropWindow(region, crop.id);
    const startWindowStatus = getStartWindowStatus(startDate, cropWindow);
    const requiredGdd = requiredGddFor(crop, region);
    const harvestLimit = cropWindow?.absoluteHarvestLimit
      ? resolveLimitDate(startDate, cropWindow.absoluteHarvestLimit)
      : addDays(startDate, crop.thermal.typicalSeasonDays[1] + 90);
    const maxDays = Math.min(420, Math.max(crop.thermal.typicalSeasonDays[1] + 100, 180));
    const stageTargets = buildStageTargets(crop, requiredGdd);
    const stageRows = [];
    const dailyLogs = [];
    const warnings = [];
    let accumulatedGdd = 0;
    let stageIndex = 0;
    let stageStart = new Date(startDate);
    let harvestDate = null;

    for (let day = 0; day <= maxDays; day += 1) {
      const date = addDays(startDate, day);
      if (date > harvestLimit) break;

      const climate = dailyClimate(region, date);
      const gdd = calculateDailyGdd(crop, climate);
      accumulatedGdd += gdd;
      dailyLogs.push({ ...climate, gdd: round1(gdd), accumulatedGdd: round1(accumulatedGdd) });

      while (stageIndex < stageTargets.length && accumulatedGdd >= stageTargets[stageIndex].endGdd) {
        const { stage, startGdd, endGdd } = stageTargets[stageIndex];
        const stageEnd = new Date(date);
        const climateSummary = summarizeDailyLogs(dailyLogs, stageStart, stageEnd);
        stageRows.push({
          id: stage.id,
          stage: stage.name,
          start: formatDate(stageStart),
          end: formatDate(stageEnd),
          durationDays: daysBetween(stageStart, stageEnd) + 1,
          gddTarget: Math.round(endGdd - startGdd),
          gddActual: climateSummary.totalGdd,
          avgTmeanC: climateSummary.avgTmeanC,
          rainMm: climateSummary.rainMm,
          et0Mm: climateSummary.et0Mm,
          waterMm: Math.round(crop.water.seasonRequirementMm * stage.waterShare),
          nKgMu: kgMu(crop.nutrientDemandKgHa.n * stage.nShare),
          pKgMu: kgMu(crop.nutrientDemandKgHa.p2o5 * stage.pShare),
          kKgMu: kgMu(crop.nutrientDemandKgHa.k2o * stage.kShare),
          soilWater: `${stage.targetSoilWaterPctFieldCapacity[0]}-${stage.targetSoilWaterPctFieldCapacity[1]}% FC`
        });

        stageIndex += 1;
        stageStart = addDays(stageEnd, 1);
      }

      if (stageIndex >= stageTargets.length) {
        harvestDate = new Date(date);
        break;
      }
    }

    if (!harvestDate && stageIndex < stageTargets.length) {
      const currentStage = stageTargets[stageIndex]?.stage || crop.stages[crop.stages.length - 1];
      stageRows.push({
        id: currentStage.id,
        stage: `${currentStage.name}（未完成）`,
        start: formatDate(stageStart),
        end: formatDate(harvestLimit),
        durationDays: Math.max(1, daysBetween(stageStart, harvestLimit) + 1),
        gddTarget: Math.round(stageTargets[stageIndex]?.endGdd - stageTargets[stageIndex]?.startGdd || 0),
        gddActual: summarizeDailyLogs(dailyLogs, stageStart, harvestLimit).totalGdd,
        avgTmeanC: summarizeDailyLogs(dailyLogs, stageStart, harvestLimit).avgTmeanC,
        rainMm: summarizeDailyLogs(dailyLogs, stageStart, harvestLimit).rainMm,
        et0Mm: summarizeDailyLogs(dailyLogs, stageStart, harvestLimit).et0Mm,
        waterMm: Math.round(crop.water.seasonRequirementMm * currentStage.waterShare),
        nKgMu: kgMu(crop.nutrientDemandKgHa.n * currentStage.nShare),
        pKgMu: kgMu(crop.nutrientDemandKgHa.p2o5 * currentStage.pShare),
        kKgMu: kgMu(crop.nutrientDemandKgHa.k2o * currentStage.kShare),
        soilWater: `${currentStage.targetSoilWaterPctFieldCapacity[0]}-${currentStage.targetSoilWaterPctFieldCapacity[1]}% FC`
      });
    }

    const accumulatedAtEnd = round1(Math.min(accumulatedGdd, requiredGdd));
    const missingGdd = Math.max(0, Math.round(requiredGdd - accumulatedGdd));
    if (missingGdd > 0) {
      warnings.push(`到安全收获上限 ${formatDate(harvestLimit)} 仍缺少约 ${missingGdd} GDD，预计不能正常成熟。`);
    }

    const headingRisk = checkRiceTemperatureRisk(crop, cropWindow, stageRows);
    warnings.push(...headingRisk);

    const windowBlocksPlanting = startWindowStatus.level === "bad";
    const viable = Boolean(harvestDate) && missingGdd === 0 && !windowBlocksPlanting && headingRisk.length === 0;
    const status = viable
      ? buildViableStatus(startWindowStatus)
      : buildNonViableStatus(startWindowStatus, missingGdd, headingRisk);

    const harvestDateText = harvestDate ? formatDate(harvestDate) : `晚于 ${formatDate(harvestLimit)}`;
    const durationDays = harvestDate ? daysBetween(startDate, harvestDate) + 1 : daysBetween(startDate, harvestLimit) + 1;

    return {
      cropId: crop.id,
      regionId: region?.id || "generic",
      startDate: formatDate(startDate),
      viable,
      status,
      startWindowStatus,
      harvestDate: harvestDateText,
      harvestLimit: formatDate(harvestLimit),
      durationDays,
      accumulatedGdd: accumulatedAtEnd,
      requiredGdd: Math.round(requiredGdd),
      missingGdd,
      stageRows,
      dailyLogs,
      warnings,
      alternative: cropWindow ? buildAlternativeWindow(startDate, cropWindow) : null
    };
  }

  function buildViableStatus(startWindowStatus) {
    if (startWindowStatus.level === "good") {
      return { level: "good", label: "适宜种植", message: "按常年气候估算，积温和收获窗口可以满足当前方案。" };
    }

    if (startWindowStatus.level === "caution") {
      return { level: "caution", label: startWindowStatus.label, message: `${startWindowStatus.message} 按积温仍可完成成熟，但建议使用早熟或本地审定品种。` };
    }

    if (startWindowStatus.level === "unknown") {
      return { level: "caution", label: "待区域校准", message: "当前区域缺少该作物播栽窗口，只能给出通用积温模拟，不能作为最终下地方案。" };
    }

    return { level: "caution", label: startWindowStatus.label, message: startWindowStatus.message };
  }

  function checkRiceTemperatureRisk(crop, cropWindow, stageRows) {
    if (crop.id !== "rice" || !cropWindow) return [];
    const warnings = [];
    const headingStage = stageRows.find((row) => row.id === "filling");
    const fillingStage = headingStage;

    if (headingStage && cropWindow.minHeadingTmeanC && headingStage.avgTmeanC < cropWindow.minHeadingTmeanC) {
      warnings.push(`抽穗灌浆初期平均温度约 ${headingStage.avgTmeanC}°C，低于安全抽穗阈值 ${cropWindow.minHeadingTmeanC}°C。`);
    }

    if (fillingStage && cropWindow.minFillingTmeanC && fillingStage.avgTmeanC < cropWindow.minFillingTmeanC) {
      warnings.push(`后期灌浆成熟平均温度约 ${fillingStage.avgTmeanC}°C，低于安全灌浆阈值 ${cropWindow.minFillingTmeanC}°C。`);
    }

    return warnings;
  }

  function buildNonViableStatus(startWindowStatus, missingGdd, temperatureWarnings) {
    if (startWindowStatus.level === "bad") {
      return {
        level: "bad",
        label: startWindowStatus.label,
        message: startWindowStatus.message
      };
    }

    if (missingGdd > 0) {
      return {
        level: "bad",
        label: "积温不足",
        message: "按常年气候推算无法在安全收获期前完成成熟，建议改早熟品种、提前播栽或改作。"
      };
    }

    if (temperatureWarnings.length) {
      return {
        level: "bad",
        label: "低温灌浆风险",
        message: "后期温度低于安全阈值，空秕、迟熟和产量下降风险高。"
      };
    }

    return {
      level: "caution",
      label: startWindowStatus.label,
      message: startWindowStatus.message
    };
  }

  function buildAlternativeWindow(startDate, cropWindow) {
    const window = cropWindow.recommendedStart;
    if (!Array.isArray(window) || window.length !== 2) return null;
    const year = startDate.getFullYear();
    const nextYear = monthDayValue(formatMonthDay(startDate)) > monthDayValue(window[1]) ? year + 1 : year;
    return {
      start: formatDate(dateFromMonthDay(nextYear, window[0])),
      end: formatDate(dateFromMonthDay(nextYear, window[1])),
      note: `建议改到 ${nextYear} 年 ${window[0]} 至 ${window[1]}，或选用当地审定早熟品种。`
    };
  }

  function resolveEventDate(event, simulation) {
    const startDate = parseLocalDate(simulation.startDate);
    const timing = event.timing || { type: "afterStart", days: 0 };
    const offset = Number(timing.offsetDays || 0);

    if (timing.type === "harvest") return addDays(parseLocalDate(simulation.harvestDate), offset);
    if (timing.type === "afterStart") return addDays(startDate, Number(timing.days || 0));

    const stage = simulation.stageRows.find((row) => row.id === timing.stageId);
    if (!stage) return addDays(startDate, Number(timing.days || 0));

    const stageStart = parseLocalDate(stage.start);
    const stageEnd = parseLocalDate(stage.end);

    if (timing.type === "stageFraction") {
      const fraction = clamp(Number(timing.fraction || 0), 0, 1);
      return addDays(stageStart, Math.round(daysBetween(stageStart, stageEnd) * fraction) + offset);
    }

    return addDays(stageStart, offset);
  }

  function buildManagementCalendar(crop, region, plan, startDateInput) {
    const simulation = simulatePhenology(crop, region, startDateInput);
    if (!plan || !Array.isArray(plan.eventTemplates)) {
      return {
        simulation,
        plan: null,
        rows: buildFallbackCalendar(crop, simulation),
        note: "当前作物还没有本地区专家级日程，先输出按生育阶段生成的水肥预算。"
      };
    }

    if (!simulation.viable) {
      return {
        simulation,
        plan,
        rows: [],
        note: "当前起始日不建议执行完整方案，请先调整播栽日期或品种。"
      };
    }

    const rows = plan.eventTemplates
      .map((event) => {
        const date = resolveEventDate(event, simulation);
        const windowDays = Number(event.windowDays || 0);
        return {
          id: event.id,
          date: formatDate(date),
          endDate: windowDays > 0 ? formatDate(addDays(date, windowDays)) : null,
          dayNumber: daysBetween(parseLocalDate(simulation.startDate), date) + 1,
          category: event.category,
          title: event.title,
          action: event.action,
          fertilizer: event.fertilizer,
          water: event.water,
          plantProtection: event.plantProtection || "",
          check: event.check,
          noviceTip: event.noviceTip
        };
      })
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

    return {
      simulation,
      plan,
      rows,
      note: "湖北水稻田已使用地区化专家日程；药剂名称仍需以当地植保站和登记标签为准。"
    };
  }

  function buildFallbackCalendar(crop, simulation) {
    return simulation.stageRows.map((row) => ({
      id: row.id,
      date: row.start,
      endDate: row.end,
      dayNumber: daysBetween(parseLocalDate(simulation.startDate), parseLocalDate(row.start)) + 1,
      category: "阶段预算",
      title: row.stage,
      action: `${row.stage} 按目标土壤水 ${row.soilWater} 管理，重点执行作物模板中的田间操作。`,
      fertilizer: `本阶段约 N/P2O5/K2O ${row.nKgMu}/${row.pKgMu}/${row.kKgMu} kg/亩。`,
      water: `阶段灌溉预算约 ${row.waterMm} mm，结合降雨和土壤墒情调整。`,
      plantProtection: crop.managementTemplates.plantProtection.join("；"),
      check: `阶段平均温度 ${row.avgTmeanC}°C，累计 ${row.gddActual} GDD。`,
      noviceTip: "这是通用模板，需要接入本地区专家日程后才能给出具体产品和窗口。"
    }));
  }

  function estimateCropPlan(crop, startDateInput, region, plan) {
    if (region) {
      return buildManagementCalendar(crop, region, plan, startDateInput);
    }

    const startDate = startDateInput ? parseLocalDate(startDateInput) : new Date();
    let cursor = new Date(startDate);
    const rows = crop.stages.map((stage) => {
      const stageDays = Math.max(7, Math.round(crop.thermal.typicalSeasonDays[1] * stage.thermalShare));
      const stageStart = new Date(cursor);
      cursor = addDays(cursor, stageDays);
      const stageEnd = new Date(cursor);
      return {
        stage: stage.name,
        start: formatDate(stageStart),
        end: formatDate(stageEnd),
        waterMm: Math.round(crop.water.seasonRequirementMm * stage.waterShare),
        nKgMu: kgMu(crop.nutrientDemandKgHa.n * stage.nShare),
        pKgMu: kgMu(crop.nutrientDemandKgHa.p2o5 * stage.pShare),
        kKgMu: kgMu(crop.nutrientDemandKgHa.k2o * stage.kShare),
        soilWater: `${stage.targetSoilWaterPctFieldCapacity[0]}-${stage.targetSoilWaterPctFieldCapacity[1]}% FC`
      };
    });

    return rows;
  }

  function estimateYield(crop, simulation, plan) {
    const potential = yieldMu(crop.yieldPotentialKgHa);
    const maturityFactor = simulation.missingGdd > 0 ? Math.max(0.45, simulation.accumulatedGdd / simulation.requiredGdd) : 1;
    const windowFactor = simulation.startWindowStatus.level === "good" ? 1 : simulation.startWindowStatus.level === "caution" ? 0.92 : 0.65;
    const tempFactor = simulation.warnings.some((warning) => warning.includes("低于安全")) ? 0.82 : 1;
    const expertPlanFactor = plan ? 1.03 : 0.96;
    const factor = clamp(maturityFactor * windowFactor * tempFactor * expertPlanFactor, 0.35, 1.08);
    return {
      kgMu: Math.round(potential * factor),
      factor: round2(factor),
      potentialKgMu: potential
    };
  }

  function localValidationChecklist(planOrEvaluationSample) {
    const sample = planOrEvaluationSample || {};
    const input = sample.input_summary || {};
    const output = sample.dndc_lite_output || {};
    const existing = sample.local_validation_result || {};
    const redFlags = new Set(existing.red_flags || []);
    const dataGaps = new Set(existing.data_gaps || output.risk_assessment_result?.data_gaps || sample.gpt55_review_contract?.data_gaps || []);

    const unit_check = [];
    const date_window_check = [];
    const gdd_check = [];
    const phenology_consistency_check = [];
    const water_balance_check = [];
    const nitrogen_budget_check = [];
    const fertilizer_schedule_check = [];
    const risk_check = [];
    const evidence_check = [];

    if (hasText(output.fertilizer_schedule_result?.unit, "kg/亩") || hasText(output.fertilizer_schedule_result?.unit, "kg/公顷")) {
      unit_check.push(`肥料单位已声明为 ${output.fertilizer_schedule_result.unit}。`);
    } else {
      unit_check.push("肥料用量缺少 kg/亩 或 kg/公顷 单位声明。");
      redFlags.add("肥料用量单位不完整");
    }

    if (hasText(JSON.stringify(output.nitrogen_demand_result || {}), "N") || hasText(JSON.stringify(output.nitrogen_demand_result || {}), "nitrogen")) {
      unit_check.push("氮素预算单独记录，避免与 P2O5/K2O 混用。");
    } else {
      unit_check.push("氮素预算字段不清晰。");
      redFlags.add("N/P2O5/K2O 口径可能混用");
    }

    if (hasText(output.irrigation_schedule_result?.unit, "mm") || hasText(output.irrigation_schedule_result?.unit, "cm")) {
      unit_check.push(`水分单位已声明为 ${output.irrigation_schedule_result.unit}。`);
    } else {
      unit_check.push("水分单位缺少 mm 或水层厘米说明。");
      redFlags.add("水分单位不完整");
    }

    if (isLegalDate(sample.start_date)) {
      date_window_check.push(`播栽日期 ${sample.start_date} 合法。`);
    } else {
      date_window_check.push(`播栽日期 ${sample.start_date || "未填写"} 不合法。`);
      redFlags.add("播栽日期不合法");
    }

    const startWindow = output.phenology_result?.start_window;
    if (startWindow === "late" || output.gdd_result?.missing_gdd_c > 0) {
      date_window_check.push("播栽日期导致晚播或积温不足，必须标红并停止自动执行日程。");
      redFlags.add("播栽窗口或积温不足");
    } else if (startWindow === "caution") {
      date_window_check.push("处于谨慎窗口：需结合当地气象和品种熟期人工确认。");
    } else if (startWindow === "recommended") {
      date_window_check.push("处于推荐窗口，可给出较高的日期/GDD 可信度。");
    } else {
      date_window_check.push("该作物缺少本地区播栽窗口配置。");
      redFlags.add("区域播栽窗口未配置");
    }

    const requiredGdd = numberOrZero(output.gdd_result?.required_gdd_c);
    const accumulatedGdd = numberOrZero(output.gdd_result?.accumulated_gdd_c);
    const missingGdd = numberOrZero(output.gdd_result?.missing_gdd_c);
    if (requiredGdd < 0 || accumulatedGdd < 0 || missingGdd < 0) {
      gdd_check.push("GDD 出现负值，违反积温规则。");
      redFlags.add("GDD 负值");
    } else {
      gdd_check.push(`GDD 检查：需求 ${requiredGdd}，累计 ${accumulatedGdd}，缺口 ${missingGdd}。`);
    }

    if (accumulatedGdd > requiredGdd * 1.25 && requiredGdd > 0) {
      gdd_check.push("累计积温超过合理范围，需要检查气候数据或作物参数。");
      redFlags.add("GDD 超出合理范围");
    }

    const yieldEstimate = numberOrZero(output.yield_prediction_result?.estimate_kg_mu);
    if (missingGdd > 0 && yieldEstimate >= 650) {
      gdd_check.push("GDD 不足却仍给出高产预测，必须标红。");
      redFlags.add("积温不足却预测高产");
    }

    if (output.phenology_result?.phenology_status === "incomplete_or_high_risk") {
      phenology_consistency_check.push("物候未完成或高风险，不得输出自动执行方案。");
    } else {
      phenology_consistency_check.push("物候阶段与 GDD 进度基本一致。");
    }

    const waterCondition = input.water_condition || output.water_balance_result?.water_condition;
    if (waterCondition === "dry") {
      water_balance_check.push("干旱场景必须提示水分胁迫，并检查灌溉触发。");
      if (!hasText(output.water_balance_result?.irrigation_logic, "irrigation")) redFlags.add("干旱场景缺少灌溉触发说明");
    } else if (waterCondition === "wet") {
      water_balance_check.push("雨水偏多场景必须减少灌溉并提示排水、渍涝和病害风险。");
      if (!hasText(output.water_balance_result?.irrigation_logic, "drainage")) redFlags.add("雨水偏多却缺少排水逻辑");
    } else {
      water_balance_check.push("常规水分场景需保持浅水、晒田、孕穗稳水和收前排水一致。");
    }

    const nitrogenLevel = input.nitrogen_supply_level || output.nitrogen_demand_result?.nitrogen_supply_level;
    if (nitrogenLevel === "low") {
      nitrogen_budget_check.push("氮供应不足：必须提示氮胁迫，不能给高可信高产结论。");
      redFlags.add("氮供应不足需人工复核");
    } else if (nitrogenLevel === "high") {
      nitrogen_budget_check.push("氮供应过量：必须提示倒伏、贪青、病害和环境风险。");
      redFlags.add("氮供应过量需人工复核");
    } else {
      nitrogen_budget_check.push("氮素需求应随物候变化，基肥/分蘖肥/穗肥逻辑基本可检查。");
    }

    if (output.fertilizer_schedule_result?.has_dates) {
      fertilizer_schedule_check.push("施肥日程包含日期化事件。");
    } else {
      fertilizer_schedule_check.push("施肥日程缺少可执行日期，不得直接给新手执行。");
      redFlags.add("施肥事件缺少日期");
    }

    if (Array.isArray(output.fertilizer_schedule_result?.required_events) && output.fertilizer_schedule_result.required_events.length >= 3) {
      fertilizer_schedule_check.push(`施肥事件包含：${output.fertilizer_schedule_result.required_events.join("、")}。`);
    } else {
      fertilizer_schedule_check.push("施肥事件过于笼统，缺少基肥、分蘖肥、穗肥等结构。");
      redFlags.add("施肥事件过于笼统");
    }

    const confidence = output.yield_prediction_result?.confidence_level;
    if ((dataGaps.has("缺少本地试验产量") || includesGap(dataGaps, "试验产量")) && confidence === "high") {
      risk_check.push("缺少本地试验产量时，产量预测 confidence 不能为 high。");
      redFlags.add("产量预测 confidence 过高");
    } else {
      risk_check.push("产量预测只能作为估算，不允许承诺保底增产。");
    }

    if (output.risk_assessment_result?.no_guaranteed_yield_claim !== true) {
      redFlags.add("缺少不承诺保底增产声明");
    }

    ["真实土壤检测", "逐日气象", "本地试验产量", "品种"].forEach((gap) => {
      if (includesGap(dataGaps, gap)) {
        evidence_check.push(`已记录数据缺口：${gap}。`);
      }
    });

    if (!evidence_check.length) {
      evidence_check.push("未记录关键数据缺口，需确认是否已有真实土壤、逐日气象、本地试验和品种参数。");
      redFlags.add("数据缺口记录不足");
    }

    const overall_risk_level = existing.overall_risk_level || deriveRiskLevel(redFlags, dataGaps);
    return {
      unit_check,
      date_window_check,
      gdd_check,
      phenology_consistency_check,
      water_balance_check,
      nitrogen_budget_check,
      fertilizer_schedule_check,
      risk_check,
      evidence_check,
      data_gaps: Array.from(dataGaps),
      red_flags: Array.from(redFlags),
      overall_risk_level,
      human_review_required: true
    };
  }

  function buildGpt55ReviewPrompt({ sample, crop, region, managementPlan, localValidationResult, schema }) {
    const dataGaps = localValidationResult?.data_gaps || sample?.gpt55_review_contract?.data_gaps || [];
    const dndcInput = {
      start_date: sample?.start_date,
      input_summary: sample?.input_summary,
      status: sample?.status || "not_reviewed"
    };

    return `你是一个谨慎的作物模型与农艺方案评审专家。你的任务不是重新生成种植方案，而是评估 DNDC-lite 输出是否可用，并提出风险复核和 JSON patch 建议。

请注意：

1. DNDC-lite 不是完整 DNDC。
2. DNDC-lite 当前没有经过充分本地校准。
3. GPT-5.5 不能替代确定性农学模型。
4. 你不能默认 DNDC-lite 正确。
5. 你也不能直接用自己的经验覆盖 DNDC-lite。
6. 你需要逐模块评审：物候、GDD、水平衡、氮素预算、施肥日历、灌溉日历、产量预测、风险提示。
7. 你需要判断哪些模块可保留，哪些模块需要修改，哪些模块必须丢弃。
8. 如果你认为需要修改，请输出 JSON patch suggestions，而不是直接输出整篇方案。
9. 如果缺少真实土壤检测、逐日气象、本地试验产量或品种参数，请降低 confidence。
10. 不允许承诺保底增产。
11. 输出必须是严格 JSON，不要输出 Markdown。

输入数据：
- 作物：
${stableJson(crop || { id: sample?.crop_id })}
- 区域：
${stableJson(region || { id: sample?.region_id })}
- 管理方案：
${stableJson(managementPlan || null)}
- DNDC-lite 输入：
${stableJson(dndcInput)}
- DNDC-lite 输出：
${stableJson(sample?.dndc_lite_output || {})}
- 本地规则检查结果：
${stableJson(localValidationResult || {})}
- 数据缺口：
${stableJson(dataGaps)}

请按照 gpt55-review-schema.json 的 output_schema 输出：
${stableJson(schema?.output_schema || {})}`;
  }

  function decideModelMode(localValidationResult, gpt55ReviewOutput) {
    const local = localValidationResult || {};
    const review = normalizeReviewOutput(gpt55ReviewOutput);
    const redFlags = local.red_flags || [];
    const dataGaps = unique([...(local.data_gaps || []), ...((review && review.data_gaps) || [])]);
    const scores = getModuleScores(review);
    const keyAverage = average(Object.values(scores));
    const severeDataMissing = hasAllSevereGaps(dataGaps);
    const severeLocalFlags = redFlags.length >= 2 || local.overall_risk_level === "high";
    const judgement = review?.overall_judgement || "needs_expert_review";
    let recommended_mode = review?.recommended_mode || "hybrid";
    let notes = "";

    if (severeLocalFlags && severeDataMissing) {
      recommended_mode = "manual_expert_only";
      notes = "本地检查出现严重 red_flags，且缺少真实土壤检测、逐日气象和本地试验产量，必须专家确认。";
    } else if (!redFlags.length && judgement === "usable" && keyAverage >= 80) {
      recommended_mode = "dndc_primary_gpt_review";
      notes = "本地规则未发现红旗，GPT 评审主要模块均分达到 80 以上，DNDC-lite 可作为主模型，GPT 只做审核。";
    } else if (scores.phenology >= 70 && scores.gdd >= 70 && scores.nitrogen_budget >= 70 && (scores.yield_prediction < 70 || scores.water_balance < 70 || scores.irrigation_schedule < 70)) {
      recommended_mode = "hybrid";
      notes = "日期、GDD、物候或氮素结构相对可用，但水分、灌溉或产量预测需要 GPT 草案和人工复核。";
    } else if (countBelow(scores, 60) >= 4 && !severeDataMissing) {
      recommended_mode = "gpt_direct_draft";
      notes = "DNDC-lite 多数关键模块低于 60，但基础数据并非完全缺失，GPT 只能生成 pending_review 草案。";
    }

    const nitrogenUsable = scores.nitrogen_budget >= 70 || (recommended_mode !== "manual_expert_only" && local.overall_risk_level !== "high");
    if (scores.nitrogen_budget >= 70 && judgement !== "usable") {
      notes = `${notes ? `${notes} ` : ""}DNDC-lite 整体不一定可用，但需肥规律、氮素需求随物候变化的结构可作为参考。`;
    }

    const canUseDates = recommended_mode !== "manual_expert_only" && scores.phenology >= 60 && scores.gdd >= 60 && !redFlags.some((flag) => hasText(flag, "播栽窗口") || hasText(flag, "积温"));
    const canUseDndc = ["dndc_primary_gpt_review", "hybrid"].includes(recommended_mode);
    const discard_modules = [];
    if (!canUseDates) discard_modules.push("date_or_phenology_as_execution_plan");
    if (scores.water_balance < 70) discard_modules.push("water_balance_without_local_weather");
    if (scores.yield_prediction < 80 || dataGaps.some((gap) => hasText(gap, "试验产量"))) discard_modules.push("high_confidence_yield_prediction");
    if (recommended_mode === "manual_expert_only") discard_modules.push("operation_calendar_as_execution_plan");

    const reuse_modules = [];
    if (canUseDates) reuse_modules.push("dates", "gdd", "phenology");
    if (nitrogenUsable) reuse_modules.push("nitrogen_budget_structure", "nutrient_demand_curve");
    if (scores.fertilizer_schedule >= 70 && recommended_mode !== "manual_expert_only") reuse_modules.push("fertilizer_event_framework");

    return {
      recommended_mode,
      can_use_dndc_lite: canUseDndc,
      can_use_dndc_lite_for_dates: canUseDates,
      can_use_dndc_lite_for_gdd: scores.gdd >= 60 && recommended_mode !== "manual_expert_only",
      can_use_dndc_lite_for_water_balance: scores.water_balance >= 70 && recommended_mode !== "manual_expert_only",
      can_use_dndc_lite_for_nitrogen_budget: nitrogenUsable,
      can_use_dndc_lite_for_fertilizer_schedule: scores.fertilizer_schedule >= 70 && recommended_mode !== "manual_expert_only",
      can_use_dndc_lite_for_yield_prediction: false,
      reuse_modules,
      discard_modules: unique(discard_modules),
      required_human_checks: unique([...dataGaps, ...redFlags]),
      notes: notes || "GPT 输出仍为 pending_review；所有 JSON patch 必须人工确认后才能合并。"
    };
  }

  function normalizeReviewOutput(value) {
    if (!value) return null;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  }

  function getModuleScores(review) {
    const modules = review?.module_reviews || {};
    const fallback = review ? 50 : 70;
    return {
      phenology: numberOrDefault(modules.phenology?.score, fallback),
      gdd: numberOrDefault(modules.gdd?.score, fallback),
      water_balance: numberOrDefault(modules.water_balance?.score, fallback),
      nitrogen_budget: numberOrDefault(modules.nitrogen_budget?.score, fallback),
      fertilizer_schedule: numberOrDefault(modules.fertilizer_schedule?.score, fallback),
      irrigation_schedule: numberOrDefault(modules.irrigation_schedule?.score, fallback),
      yield_prediction: numberOrDefault(modules.yield_prediction?.score, 40)
    };
  }

  function isLegalDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function numberOrZero(value) {
    return Number.isFinite(Number(value)) ? Number(value) : 0;
  }

  function numberOrDefault(value, fallback) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function hasText(value, text) {
    return String(value || "").toLowerCase().includes(String(text || "").toLowerCase());
  }

  function includesGap(gaps, text) {
    return Array.from(gaps || []).some((gap) => hasText(gap, text));
  }

  function deriveRiskLevel(redFlags, dataGaps) {
    if (redFlags.size >= 2 || includesGap(dataGaps, "真实土壤检测") && includesGap(dataGaps, "逐日气象")) return "high";
    if (redFlags.size >= 1 || Array.from(dataGaps).length >= 2) return "medium";
    return "low";
  }

  function hasAllSevereGaps(dataGaps) {
    return ["真实土壤", "逐日气象", "本地试验产量"].every((gap) => includesGap(dataGaps, gap));
  }

  function average(values) {
    const safe = values.filter((value) => Number.isFinite(value));
    return safe.length ? safe.reduce((total, value) => total + value, 0) / safe.length : 0;
  }

  function countBelow(scores, threshold) {
    return Object.values(scores).filter((score) => score < threshold).length;
  }

  function unique(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  function stableJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function round1(value) {
    return Math.round(value * 10) / 10;
  }

  function round2(value) {
    return Math.round(value * 100) / 100;
  }

  window.DNDCLiteModel = {
    validateCropDatabase,
    summarizeCrop,
    estimateCropPlan,
    simulatePhenology,
    buildManagementCalendar,
    estimateYield,
    localValidationChecklist,
    buildGpt55ReviewPrompt,
    decideModelMode,
    dailyClimate,
    formatDate,
    parseLocalDate
  };
})();
