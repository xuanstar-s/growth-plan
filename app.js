const recordsKey = "sugar-skin-records";
const todayKey = getLocalDateKey(new Date());

const sugarSources = [
  { id: "sweet-drink", label: "奶茶/甜饮" },
  { id: "dessert", label: "甜食/糖果" },
  { id: "late-snack", label: "夜宵" },
  { id: "takeout-carb", label: "外卖主食" },
  { id: "other", label: "其它" }
];

const mealSlots = [
  { id: "breakfast", label: "早餐" },
  { id: "lunch", label: "午餐" },
  { id: "dinner", label: "晚餐" },
  { id: "snack", label: "加餐/饮品" }
];

const estimateCategories = [
  {
    id: "sweet-drink",
    label: "奶茶/甜饮",
    risk: "high",
    riskLabel: "高糖风险",
    sugarMin: 25,
    sugarMax: 60,
    sourceId: "sweet-drink"
  },
  {
    id: "dessert",
    label: "甜点/糖果",
    risk: "high",
    riskLabel: "高糖风险",
    sugarMin: 15,
    sugarMax: 50,
    sourceId: "dessert"
  },
  {
    id: "takeout-carb",
    label: "外卖主食",
    risk: "medium-high",
    riskLabel: "中高风险",
    sugarMin: 10,
    sugarMax: 35,
    sourceId: "takeout-carb"
  },
  {
    id: "snack-food",
    label: "零食",
    risk: "medium-high",
    riskLabel: "中高风险",
    sugarMin: 8,
    sugarMax: 30,
    sourceId: "other"
  },
  {
    id: "fruit",
    label: "水果",
    risk: "medium",
    riskLabel: "中等风险",
    sugarMin: 8,
    sugarMax: 25,
    sourceId: "other"
  },
  {
    id: "other",
    label: "其它",
    risk: "unknown",
    riskLabel: "待确认",
    sugarMin: null,
    sugarMax: null,
    sourceId: "other"
  }
];

const scoreFields = [
  { key: "acneScore", label: "痘痘严重度" },
  { key: "oilScore", label: "出油程度" },
  { key: "sleepScore", label: "睡眠质量" }
];

const dailyTasks = [
  { id: "noSweetDrink", title: "不喝含糖饮料", hint: "奶茶、可乐、果汁都算" },
  { id: "noDessert", title: "不吃甜食", hint: "蛋糕、糖果、甜点都算" },
  { id: "noAfterDinnerFood", title: "晚饭后不加餐", hint: "尤其避开夜宵和零食" },
  { id: "sleepBefore2330", title: "23:30 前睡觉", hint: "睡眠也会影响出油和炎症" }
];

const records = loadRecords();
let todayRecord = ensureRecord(todayKey);
let photoPreviewUrl = "";
let pendingEstimate = createPendingEstimate();

const todayLabel = document.querySelector("#todayLabel");
const todaySummary = document.querySelector("#todaySummary");
const streakCount = document.querySelector("#streakCount");
const successDays = document.querySelector("#successDays");
const avgAcne = document.querySelector("#avgAcne");
const avgOil = document.querySelector("#avgOil");
const saveStatus = document.querySelector("#saveStatus");
const sugarBudgetCard = document.querySelector("#sugarBudgetCard");
const sugarBudgetRange = document.querySelector("#sugarBudgetRange");
const sugarBudgetStatus = document.querySelector("#sugarBudgetStatus");
const sugarBudgetFill = document.querySelector("#sugarBudgetFill");
const sugarLimitInput = document.querySelector("#sugarLimitInput");
const photoInput = document.querySelector("#photoInput");
const photoPreviewPanel = document.querySelector("#photoPreviewPanel");
const photoPreview = document.querySelector("#photoPreview");
const photoError = document.querySelector("#photoError");
const mealSlotGrid = document.querySelector("#mealSlotGrid");
const estimateCategoryGrid = document.querySelector("#estimateCategoryGrid");
const estimateResultCard = document.querySelector("#estimateResultCard");
const estimateRiskLabel = document.querySelector("#estimateRiskLabel");
const estimateRangeLabel = document.querySelector("#estimateRangeLabel");
const estimateMinInput = document.querySelector("#estimateMinInput");
const estimateMaxInput = document.querySelector("#estimateMaxInput");
const writeEstimateBtn = document.querySelector("#writeEstimateBtn");
const retakePhotoBtn = document.querySelector("#retakePhotoBtn");
const intakeList = document.querySelector("#intakeList");
const sourceGrid = document.querySelector("#sourceGrid");
const sugarNoteInput = document.querySelector("#sugarNoteInput");
const scoreList = document.querySelector("#scoreList");
const largePimpleInput = document.querySelector("#largePimpleInput");
const skinNoteInput = document.querySelector("#skinNoteInput");
const taskList = document.querySelector("#taskList");
const taskProgress = document.querySelector("#taskProgress");
const trendList = document.querySelector("#trendList");

todayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "long"
}).format(new Date());

document.querySelector("#successBtn").addEventListener("click", () => {
  todayRecord.sugarStatus = "success";
  saveAndRender();
});

document.querySelector("#missBtn").addEventListener("click", () => {
  todayRecord.sugarStatus = "miss";
  saveAndRender();
});

document.querySelector("#resetTodayBtn").addEventListener("click", () => {
  const confirmed = confirm("重置今天的控糖和皮肤记录？");
  if (!confirmed) return;
  todayRecord = createEmptyRecord();
  records[todayKey] = todayRecord;
  clearPhotoPreview();
  pendingEstimate = createPendingEstimate();
  saveAndRender();
});

sugarLimitInput.addEventListener("input", () => {
  const nextLimit = normalizePositiveNumber(sugarLimitInput.value, 25);
  todayRecord.sugarBudget.limit = nextLimit;
  calculateSugarBudget(todayRecord);
  saveAndRender();
});

photoInput.addEventListener("change", () => {
  handlePhotoSelection(photoInput.files && photoInput.files[0]);
});

estimateMinInput.addEventListener("input", () => {
  pendingEstimate.sugarMin = normalizeOptionalNumber(estimateMinInput.value);
  updateEstimateResult();
});

estimateMaxInput.addEventListener("input", () => {
  pendingEstimate.sugarMax = normalizeOptionalNumber(estimateMaxInput.value);
  updateEstimateResult();
});

writeEstimateBtn.addEventListener("click", () => {
  writePendingEstimate();
});

retakePhotoBtn.addEventListener("click", () => {
  photoInput.value = "";
  photoInput.click();
});

sugarNoteInput.addEventListener("input", () => {
  todayRecord.sugarNote = sugarNoteInput.value;
  saveAndRender(false);
});

largePimpleInput.addEventListener("change", () => {
  todayRecord.hasLargePimple = largePimpleInput.checked;
  saveAndRender();
});

skinNoteInput.addEventListener("input", () => {
  todayRecord.skinNote = skinNoteInput.value;
  saveAndRender(false);
});

function createPendingEstimate() {
  return {
    hasPhoto: false,
    mealSlot: getDefaultMealSlot(),
    categoryId: "",
    sugarMin: null,
    sugarMax: null
  };
}

function createEmptyRecord() {
  return {
    sugarStatus: "",
    sugarSources: [],
    sugarNote: "",
    sugarBudget: {
      limit: 25,
      estimatedMin: 0,
      estimatedMax: 0
    },
    intakeItems: [],
    acneScore: 0,
    oilScore: 0,
    sleepScore: 0,
    hasLargePimple: false,
    skinNote: "",
    tasks: dailyTasks.reduce((result, task) => {
      result[task.id] = false;
      return result;
    }, {})
  };
}

function normalizeRecord(record) {
  const empty = createEmptyRecord();
  if (!record || typeof record !== "object") return empty;

  const sugarSourceValues = Array.isArray(record.sugarSources) ? record.sugarSources : empty.sugarSources;
  const taskValues = record.tasks && typeof record.tasks === "object" ? record.tasks : {};
  const budget = record.sugarBudget && typeof record.sugarBudget === "object" ? record.sugarBudget : {};

  const normalized = {
    sugarStatus: record.sugarStatus === "success" || record.sugarStatus === "miss" ? record.sugarStatus : "",
    sugarSources: sugarSourceValues.filter((source) => sugarSources.some((item) => item.id === source)),
    sugarNote: typeof record.sugarNote === "string" ? record.sugarNote : "",
    sugarBudget: {
      limit: normalizePositiveNumber(budget.limit, 25),
      estimatedMin: 0,
      estimatedMax: 0
    },
    intakeItems: Array.isArray(record.intakeItems) ? record.intakeItems.map(normalizeIntakeItem).filter(Boolean) : [],
    acneScore: normalizeScore(record.acneScore),
    oilScore: normalizeScore(record.oilScore),
    sleepScore: normalizeScore(record.sleepScore),
    hasLargePimple: Boolean(record.hasLargePimple),
    skinNote: typeof record.skinNote === "string" ? record.skinNote : "",
    tasks: dailyTasks.reduce((result, task) => {
      result[task.id] = Boolean(taskValues[task.id]);
      return result;
    }, {})
  };

  calculateSugarBudget(normalized);
  return normalized;
}

function normalizeIntakeItem(item) {
  if (!item || typeof item !== "object") return null;
  const category = estimateCategories.find((entry) => entry.id === item.category) || estimateCategories.find((entry) => entry.id === "other");
  const meal = mealSlots.find((entry) => entry.id === item.mealSlot) || mealSlots.find((entry) => entry.id === "snack");
  const sugarMin = normalizeOptionalNumber(item.sugarMin);
  const sugarMax = normalizeOptionalNumber(item.sugarMax);

  return {
    id: typeof item.id === "string" && item.id ? item.id : createId(),
    mode: typeof item.mode === "string" ? item.mode : "manual-photo",
    mealSlot: meal.id,
    mealLabel: meal.label,
    category: category.id,
    label: typeof item.label === "string" && item.label ? item.label : category.label,
    risk: category.risk,
    riskLabel: category.riskLabel,
    sugarRange: formatSugarRange(sugarMin, sugarMax),
    sugarMin,
    sugarMax,
    sourceId: category.sourceId,
    note: typeof item.note === "string" ? item.note : "照片只能估算，请按实际分量和配料修正。",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString()
  };
}

function normalizeScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(5, Math.max(0, Math.round(number)));
}

function normalizePositiveNumber(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.round(number);
}

function normalizeOptionalNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number);
}

function loadRecords() {
  const saved = localStorage.getItem(recordsKey);
  if (!saved) return {};

  try {
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return {};

    return Object.fromEntries(
      Object.entries(parsed).map(([date, record]) => [date, normalizeRecord(record)])
    );
  } catch {
    return {};
  }
}

function ensureRecord(dateKey) {
  records[dateKey] = normalizeRecord(records[dateKey]);
  return records[dateKey];
}

function saveRecords() {
  try {
    localStorage.setItem(recordsKey, JSON.stringify(records));
    saveStatus.textContent = "已同步到本机";
  } catch {
    saveStatus.textContent = "本次未能保存";
  }
}

function saveAndRender(shouldRender = true) {
  calculateSugarBudget(todayRecord);
  records[todayKey] = todayRecord;
  saveRecords();
  if (shouldRender) render();
}

function render() {
  renderBudget();
  renderPhotoEstimate();
  renderIntakeList();
  renderSugar();
  renderSkin();
  renderTasks();
  renderSummary();
  renderTrend();
}

function renderBudget() {
  const budget = calculateSugarBudget(todayRecord);
  const limit = budget.limit || 25;
  sugarLimitInput.value = limit;
  sugarBudgetRange.textContent = `估算 ${budget.estimatedMin}-${budget.estimatedMax}g / ${limit}g`;

  sugarBudgetCard.classList.remove("is-stable", "is-warning", "is-over");

  if (!todayRecord.intakeItems.length) {
    sugarBudgetStatus.textContent = "今天还没有估算糖分。";
    sugarBudgetFill.style.width = "0%";
    sugarBudgetCard.classList.add("is-stable");
    return;
  }

  const maxPercent = Math.min(100, Math.round((budget.estimatedMax / limit) * 100));
  sugarBudgetFill.style.width = `${maxPercent}%`;

  if (budget.estimatedMax <= 15) {
    sugarBudgetStatus.textContent = "还算稳。";
    sugarBudgetCard.classList.add("is-stable");
    return;
  }

  if (budget.estimatedMax <= limit) {
    sugarBudgetStatus.textContent = "接近目标，今天后面要收一收。";
    sugarBudgetCard.classList.add("is-warning");
    return;
  }

  sugarBudgetStatus.textContent = "已超过目标，今天建议停止摄入甜饮和甜食。";
  sugarBudgetCard.classList.add("is-over");
}

function renderPhotoEstimate() {
  photoPreviewPanel.classList.toggle("is-hidden", !pendingEstimate.hasPhoto);
  estimateResultCard.classList.toggle("is-hidden", !pendingEstimate.categoryId);

  renderMealSlots();
  renderEstimateCategories();
  updateEstimateResult();
}

function renderMealSlots() {
  mealSlotGrid.innerHTML = "";
  mealSlots.forEach((meal) => {
    const button = document.createElement("button");
    button.className = `chip-button${pendingEstimate.mealSlot === meal.id ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = meal.label;
    button.addEventListener("click", () => {
      pendingEstimate.mealSlot = meal.id;
      renderPhotoEstimate();
    });
    mealSlotGrid.append(button);
  });
}

function renderEstimateCategories() {
  estimateCategoryGrid.innerHTML = "";
  estimateCategories.forEach((category) => {
    const button = document.createElement("button");
    button.className = `chip-button${pendingEstimate.categoryId === category.id ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = category.label;
    button.addEventListener("click", () => {
      pendingEstimate.categoryId = category.id;
      pendingEstimate.sugarMin = category.sugarMin;
      pendingEstimate.sugarMax = category.sugarMax;
      renderPhotoEstimate();
    });
    estimateCategoryGrid.append(button);
  });
}

function updateEstimateResult() {
  const category = getPendingCategory();
  if (!category) return;

  estimateRiskLabel.textContent = category.riskLabel;
  estimateRiskLabel.dataset.risk = category.risk;
  estimateRangeLabel.textContent = formatSugarRange(pendingEstimate.sugarMin, pendingEstimate.sugarMax);
  estimateMinInput.value = pendingEstimate.sugarMin ?? "";
  estimateMaxInput.value = pendingEstimate.sugarMax ?? "";

  const hasNumericRange = Number.isFinite(pendingEstimate.sugarMin) && Number.isFinite(pendingEstimate.sugarMax);
  estimateMinInput.disabled = category.risk === "unknown";
  estimateMaxInput.disabled = category.risk === "unknown";
  writeEstimateBtn.disabled = category.risk !== "unknown" && !hasNumericRange;
}

function handlePhotoSelection(file) {
  photoError.textContent = "";
  if (!file) return;

  if (!file.type || !file.type.startsWith("image/")) {
    photoError.textContent = "请选择一张食物照片。";
    return;
  }

  clearPhotoPreview();
  photoPreviewUrl = URL.createObjectURL(file);
  photoPreview.innerHTML = "";
  const image = document.createElement("img");
  image.src = photoPreviewUrl;
  image.alt = "食物照片预览";
  photoPreview.append(image);

  pendingEstimate = createPendingEstimate();
  pendingEstimate.hasPhoto = true;
  renderPhotoEstimate();
}

function clearPhotoPreview() {
  if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
  photoPreviewUrl = "";
  photoPreview.innerHTML = "照片预览";
  photoInput.value = "";
  photoError.textContent = "";
}

function writePendingEstimate() {
  const category = getPendingCategory();
  const meal = mealSlots.find((entry) => entry.id === pendingEstimate.mealSlot) || mealSlots[3];
  if (!category) return;

  const sugarMin = normalizeOptionalNumber(pendingEstimate.sugarMin);
  const sugarMax = normalizeOptionalNumber(pendingEstimate.sugarMax);
  const item = {
    id: createId(),
    mode: "manual-photo",
    mealSlot: meal.id,
    mealLabel: meal.label,
    category: category.id,
    label: category.label,
    risk: category.risk,
    riskLabel: category.riskLabel,
    sugarRange: formatSugarRange(sugarMin, sugarMax),
    sugarMin,
    sugarMax,
    sourceId: category.sourceId,
    note: "照片只能估算，请按实际分量和配料修正。",
    createdAt: new Date().toISOString()
  };

  todayRecord.intakeItems.push(item);
  addUnique(todayRecord.sugarSources, item.sourceId);
  calculateSugarBudget(todayRecord);

  const latestNote = `拍照估算：${meal.label} ${category.label}，${category.riskLabel}，约 ${item.sugarRange}`;
  todayRecord.sugarNote = latestNote;

  if (category.risk === "high" || category.risk === "medium-high" || todayRecord.sugarBudget.estimatedMax > todayRecord.sugarBudget.limit) {
    todayRecord.sugarStatus = "miss";
  } else if (!todayRecord.sugarStatus && category.risk !== "unknown") {
    todayRecord.sugarStatus = "success";
  }

  pendingEstimate = createPendingEstimate();
  clearPhotoPreview();
  saveAndRender();
}

function getPendingCategory() {
  return estimateCategories.find((category) => category.id === pendingEstimate.categoryId);
}

function calculateSugarBudget(record) {
  const limit = normalizePositiveNumber(record.sugarBudget && record.sugarBudget.limit, 25);
  const totals = (record.intakeItems || []).reduce((result, item) => {
    if (Number.isFinite(item.sugarMin)) result.min += item.sugarMin;
    if (Number.isFinite(item.sugarMax)) result.max += item.sugarMax;
    return result;
  }, { min: 0, max: 0 });

  record.sugarBudget = {
    limit,
    estimatedMin: totals.min,
    estimatedMax: totals.max
  };

  return record.sugarBudget;
}

function renderIntakeList() {
  intakeList.innerHTML = "";

  mealSlots.forEach((meal) => {
    const items = todayRecord.intakeItems.filter((item) => item.mealSlot === meal.id);
    const group = document.createElement("section");
    group.className = "intake-group";

    const total = items.reduce((result, item) => {
      if (Number.isFinite(item.sugarMin)) result.min += item.sugarMin;
      if (Number.isFinite(item.sugarMax)) result.max += item.sugarMax;
      return result;
    }, { min: 0, max: 0 });

    const totalText = items.length ? `${total.min}-${total.max}g` : "无记录";
    group.innerHTML = `
      <header>
        <strong>${meal.label}</strong>
        <span>${totalText}</span>
      </header>
    `;

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "intake-item";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.riskLabel)} · ${escapeHtml(formatSugarRange(item.sugarMin, item.sugarMax))}</span>
        </div>
      `;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.type = "button";
      deleteButton.textContent = "删除";
      deleteButton.addEventListener("click", () => deleteIntakeItem(item.id));
      row.append(deleteButton);
      group.append(row);
    });

    intakeList.append(group);
  });
}

function deleteIntakeItem(id) {
  todayRecord.intakeItems = todayRecord.intakeItems.filter((item) => item.id !== id);
  calculateSugarBudget(todayRecord);
  rebuildSugarSourcesFromIntake();
  saveAndRender();
}

function rebuildSugarSourcesFromIntake() {
  const retained = todayRecord.sugarSources.filter((source) => !estimateCategories.some((category) => category.sourceId === source));
  todayRecord.intakeItems.forEach((item) => addUnique(retained, item.sourceId));
  todayRecord.sugarSources = retained;
}

function renderSugar() {
  document.querySelector("#successBtn").classList.toggle("is-active", todayRecord.sugarStatus === "success");
  document.querySelector("#missBtn").classList.toggle("is-active", todayRecord.sugarStatus === "miss");

  sourceGrid.innerHTML = "";
  sugarSources.forEach((source) => {
    const button = document.createElement("button");
    button.className = `chip-button${todayRecord.sugarSources.includes(source.id) ? " is-active" : ""}`;
    button.type = "button";
    button.textContent = source.label;
    button.addEventListener("click", () => {
      toggleValue(todayRecord.sugarSources, source.id);
      saveAndRender();
    });
    sourceGrid.append(button);
  });

  if (document.activeElement !== sugarNoteInput) {
    sugarNoteInput.value = todayRecord.sugarNote;
  }
}

function renderSkin() {
  scoreList.innerHTML = "";

  scoreFields.forEach((field) => {
    const row = document.createElement("article");
    row.className = "score-row";
    row.innerHTML = `
      <header>
        <strong>${field.label}</strong>
        <span>${todayRecord[field.key]} / 5</span>
      </header>
      <div class="score-buttons" aria-label="${field.label}"></div>
    `;

    const buttons = row.querySelector(".score-buttons");
    for (let score = 0; score <= 5; score += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = todayRecord[field.key] === score ? "is-active" : "";
      button.textContent = score;
      button.setAttribute("aria-label", `${field.label} ${score} 分`);
      button.addEventListener("click", () => {
        todayRecord[field.key] = score;
        saveAndRender();
      });
      buttons.append(button);
    }

    scoreList.append(row);
  });

  largePimpleInput.checked = todayRecord.hasLargePimple;

  if (document.activeElement !== skinNoteInput) {
    skinNoteInput.value = todayRecord.skinNote;
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  dailyTasks.forEach((task) => {
    const isDone = Boolean(todayRecord.tasks[task.id]);
    const card = document.createElement("article");
    card.className = `task-card${isDone ? " is-done" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.type = "button";
    checkButton.textContent = "✓";
    checkButton.setAttribute("aria-label", isDone ? "标记为未完成" : "标记为完成");
    checkButton.addEventListener("click", () => {
      todayRecord.tasks[task.id] = !isDone;
      saveAndRender();
    });

    const copy = document.createElement("div");
    copy.innerHTML = `<strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.hint)}</span>`;

    card.append(checkButton, copy);
    taskList.append(card);
  });

  const done = dailyTasks.filter((task) => todayRecord.tasks[task.id]).length;
  taskProgress.textContent = `${done}/${dailyTasks.length}`;
}

function renderSummary() {
  const recentRecords = getRecentDateKeys(7)
    .map((date) => records[date])
    .filter((record) => record && hasRecordSignal(record));
  const successes = recentRecords.filter((record) => record.sugarStatus === "success").length;
  const acneAverage = averageScore(recentRecords, "acneScore");
  const oilAverage = averageScore(recentRecords, "oilScore");

  successDays.textContent = `${successes}/7`;
  avgAcne.textContent = acneAverage === null ? "-" : acneAverage.toFixed(1);
  avgOil.textContent = oilAverage === null ? "-" : oilAverage.toFixed(1);
  streakCount.textContent = calculateStreak();

  if (!todayRecord.sugarStatus) {
    todaySummary.textContent = "完成一次记录，开始观察糖分、睡眠和皮肤状态。";
    return;
  }

  const statusText = todayRecord.sugarStatus === "success" ? "今天控糖成功" : "今天有破戒";
  const skinText = `痘痘 ${todayRecord.acneScore}/5，出油 ${todayRecord.oilScore}/5，睡眠 ${todayRecord.sleepScore}/5。`;
  const budget = todayRecord.sugarBudget;
  const budgetText = todayRecord.intakeItems.length ? `糖分估算 ${budget.estimatedMin}-${budget.estimatedMax}g/${budget.limit}g。` : "";
  todaySummary.textContent = `${statusText}。${budgetText}${skinText}`;
}

function renderTrend() {
  trendList.innerHTML = "";

  getRecentDateKeys(7).forEach((dateKey) => {
    const record = records[dateKey] ? normalizeRecord(records[dateKey]) : null;
    const card = document.createElement("article");
    const status = record ? record.sugarStatus : "";
    const statusClass = status ? ` is-${status}` : "";
    const statusText = status === "success" ? "成功" : status === "miss" ? "破戒" : "未记";
    const skinText = record ? `痘 ${record.acneScore} · 油 ${record.oilScore} · 睡 ${record.sleepScore}` : "暂无记录";
    const sugarText = record && record.intakeItems.length ? `糖 ${record.sugarBudget.estimatedMin}-${record.sugarBudget.estimatedMax}g` : "";

    card.className = "trend-card";
    card.innerHTML = `
      <time>${formatShortDate(dateKey)}</time>
      <div>
        <strong>${skinText}</strong>
        <span>${sugarText || (record && record.hasLargePimple ? "有大痘/破溃痘" : " ")}</span>
      </div>
      <div class="status-pill${statusClass}">${statusText}</div>
    `;
    trendList.append(card);
  });
}

function toggleValue(list, value) {
  const index = list.indexOf(value);
  if (index >= 0) {
    list.splice(index, 1);
    return;
  }
  list.push(value);
}

function addUnique(list, value) {
  if (!value || list.includes(value)) return;
  list.push(value);
}

function averageScore(recordList, key) {
  const values = recordList.map((record) => record[key]).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hasRecordSignal(record) {
  return Boolean(
    record.sugarStatus ||
    record.sugarSources.length ||
    record.sugarNote ||
    record.intakeItems.length ||
    record.acneScore ||
    record.oilScore ||
    record.sleepScore ||
    record.hasLargePimple ||
    record.skinNote ||
    dailyTasks.some((task) => record.tasks[task.id])
  );
}

function calculateStreak() {
  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = getLocalDateKey(cursor);
    if (!records[key] || records[key].sugarStatus !== "success") break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getRecentDateKeys(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return getLocalDateKey(date);
  });
}

function getDefaultMealSlot() {
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const time = hour + minute / 60;
  if (time < 10.5) return "breakfast";
  if (time < 15) return "lunch";
  if (time < 20.5) return "dinner";
  return "snack";
}

function formatSugarRange(min, max) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "需要手动确认";
  return `${min}-${max}g`;
}

function formatShortDate(dateKey) {
  const [, month, day] = dateKey.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char];
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then((registration) => {
    if (registration.waiting) registration.waiting.postMessage("SKIP_WAITING");
  }).catch(() => {});
}

render();
