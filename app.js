const recordsKey = "sugar-skin-records";
const todayKey = getLocalDateKey(new Date());

const sugarSources = [
  { id: "sweet-drink", label: "奶茶/甜饮" },
  { id: "dessert", label: "甜食/糖果" },
  { id: "late-snack", label: "夜宵" },
  { id: "takeout-carb", label: "外卖主食" },
  { id: "other", label: "其它" }
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

const todayLabel = document.querySelector("#todayLabel");
const todaySummary = document.querySelector("#todaySummary");
const streakCount = document.querySelector("#streakCount");
const successDays = document.querySelector("#successDays");
const avgAcne = document.querySelector("#avgAcne");
const avgOil = document.querySelector("#avgOil");
const saveStatus = document.querySelector("#saveStatus");
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
  saveAndRender();
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

function createEmptyRecord() {
  return {
    sugarStatus: "",
    sugarSources: [],
    sugarNote: "",
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

  return {
    sugarStatus: record.sugarStatus === "success" || record.sugarStatus === "miss" ? record.sugarStatus : "",
    sugarSources: sugarSourceValues.filter((source) => sugarSources.some((item) => item.id === source)),
    sugarNote: typeof record.sugarNote === "string" ? record.sugarNote : "",
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
}

function normalizeScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(5, Math.max(0, Math.round(number)));
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
  records[todayKey] = todayRecord;
  saveRecords();
  if (shouldRender) render();
}

function render() {
  renderSugar();
  renderSkin();
  renderTasks();
  renderSummary();
  renderTrend();
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
  todaySummary.textContent = `${statusText}。${skinText}`;
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

    card.className = "trend-card";
    card.innerHTML = `
      <time>${formatShortDate(dateKey)}</time>
      <div>
        <strong>${skinText}</strong>
        <span>${record && record.hasLargePimple ? "有大痘/破溃痘" : " "}</span>
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
