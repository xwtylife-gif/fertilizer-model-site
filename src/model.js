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
    dailyClimate,
    formatDate,
    parseLocalDate
  };
})();
