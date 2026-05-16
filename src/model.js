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

  const sum = (items, key) => items.reduce((total, item) => total + Number(item[key] || 0), 0);
  const pct = (value) => `${Math.round(value * 100)}%`;
  const kgMu = (kgHa) => Math.round(kgHa / 15);
  const yieldMu = (kgHa) => Math.round(kgHa / 15);

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

  function estimateCropPlan(crop, startDateInput) {
    const startDate = startDateInput ? new Date(`${startDateInput}T00:00:00`) : new Date();
    let cursor = new Date(startDate);
    return crop.stages.map((stage) => {
      const stageDays = Math.max(7, Math.round(crop.thermal.typicalSeasonDays[1] * stage.thermalShare));
      const stageStart = new Date(cursor);
      cursor.setDate(cursor.getDate() + stageDays);
      const stageEnd = new Date(cursor);
      return {
        stage: stage.name,
        start: stageStart.toISOString().slice(0, 10),
        end: stageEnd.toISOString().slice(0, 10),
        waterMm: Math.round(crop.water.seasonRequirementMm * stage.waterShare),
        nKgMu: kgMu(crop.nutrientDemandKgHa.n * stage.nShare),
        pKgMu: kgMu(crop.nutrientDemandKgHa.p2o5 * stage.pShare),
        kKgMu: kgMu(crop.nutrientDemandKgHa.k2o * stage.kShare),
        soilWater: `${stage.targetSoilWaterPctFieldCapacity[0]}-${stage.targetSoilWaterPctFieldCapacity[1]}% FC`
      };
    });
  }

  window.DNDCLiteModel = {
    validateCropDatabase,
    summarizeCrop,
    estimateCropPlan
  };
})();
