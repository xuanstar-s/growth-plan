# Sugar Acne Control PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing mobile daily planner PWA into an iPhone-friendly "控糖护肤计划" app for sugar-control check-ins and acne-prone skin tracking.

**Architecture:** Keep the existing static PWA shape and replace the current planner domain with a single-page local tracker. `index.html` owns semantic structure, `styles.css` owns mobile-first presentation, and `app.js` owns local date records, rendering, and persistence through `localStorage`.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, `localStorage`, existing manifest and service worker.

---

## File Structure

- Modify `index.html`: Replace the daily planner UI with the sugar-control and skin-tracking UI.
- Modify `styles.css`: Replace current planner styling with mobile-first tracker styling and iPhone-safe layout.
- Modify `app.js`: Replace task/review/reminder logic with daily records, toggles, score controls, task checkboxes, streak, and 7-day trend logic.
- Modify `manifest.json`: Rename the PWA to "控糖护肤计划".
- Modify `README.md`: Update project description and usage notes.
- Leave `service-worker.js` structurally unchanged unless cache names or asset references need updating.

---

### Task 1: Update PWA Shell And Content

**Files:**
- Modify: `index.html`
- Modify: `manifest.json`
- Modify: `README.md`

- [ ] **Step 1: Replace `index.html` with the approved app structure**

Use this complete structure:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#f4f6f1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="控糖护肤计划">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>控糖护肤计划</title>
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="icon.svg">
    <link rel="icon" href="icon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow" id="todayLabel">今日</p>
          <h1>控糖护肤计划</h1>
        </div>
        <button class="icon-button" id="resetTodayBtn" type="button" aria-label="重置今天记录" title="重置今天记录">↻</button>
      </header>

      <section class="hero-panel" aria-labelledby="statusTitle">
        <div>
          <p class="section-kicker">Today</p>
          <h2 id="statusTitle">先稳住今天</h2>
          <p id="todaySummary">完成一次记录，开始观察糖分、睡眠和皮肤状态。</p>
        </div>
        <div class="streak-badge" aria-label="连续控糖天数">
          <strong id="streakCount">0</strong>
          <span>连续天</span>
        </div>
      </section>

      <section class="metrics-strip" aria-label="最近七天趋势">
        <div>
          <strong id="successDays">0/7</strong>
          <span>控糖成功</span>
        </div>
        <div>
          <strong id="avgAcne">-</strong>
          <span>平均痘痘</span>
        </div>
        <div>
          <strong id="avgOil">-</strong>
          <span>平均出油</span>
        </div>
      </section>

      <section class="tracker-section" aria-labelledby="sugarTitle">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Sugar</p>
            <h2 id="sugarTitle">今日控糖</h2>
          </div>
          <span class="save-status" id="saveStatus">已同步到本机</span>
        </div>

        <div class="segmented-control" role="group" aria-label="控糖结果">
          <button id="successBtn" type="button" data-value="success">成功</button>
          <button id="missBtn" type="button" data-value="miss">破戒</button>
        </div>

        <div class="chip-grid" id="sourceGrid" aria-label="高糖来源"></div>

        <label class="field">
          一句记录
          <input id="sugarNoteInput" maxlength="48" placeholder="例如：下午想喝奶茶，换成无糖茶">
        </label>
      </section>

      <section class="tracker-section" aria-labelledby="skinTitle">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Skin</p>
            <h2 id="skinTitle">痘痘观察</h2>
          </div>
        </div>

        <div class="score-list" id="scoreList"></div>

        <label class="switch-row">
          <span>
            <strong>大痘/破溃痘</strong>
            <small>今天是否需要重点保护</small>
          </span>
          <input id="largePimpleInput" type="checkbox">
        </label>

        <label class="field">
          皮肤备注
          <textarea id="skinNoteInput" rows="3" maxlength="80" placeholder="例如：右脸大痘已结痂，今天没有再挤"></textarea>
        </label>
      </section>

      <section class="tracker-section" aria-labelledby="taskTitle">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Tasks</p>
            <h2 id="taskTitle">今日小任务</h2>
          </div>
          <strong id="taskProgress">0/4</strong>
        </div>
        <div class="task-list" id="taskList"></div>
      </section>

      <section class="tracker-section" aria-labelledby="reviewTitle">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Review</p>
            <h2 id="reviewTitle">最近 7 天</h2>
          </div>
        </div>
        <div class="trend-list" id="trendList"></div>
      </section>
    </main>

    <nav class="bottom-nav" aria-label="快捷导航">
      <a href="#sugarTitle">控糖</a>
      <a href="#skinTitle">皮肤</a>
      <a href="#reviewTitle">趋势</a>
    </nav>

    <script src="app.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Update `manifest.json`**

Use this complete file:

```json
{
  "name": "控糖护肤计划",
  "short_name": "控糖护肤",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#f4f6f1",
  "theme_color": "#f4f6f1",
  "icons": [
    {
      "src": "icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

- [ ] **Step 3: Update `README.md`**

Use this content:

```markdown
# 控糖护肤计划

一个手机优先的静态 PWA，用来记录每日控糖、甜食饮料来源、痘痘状态、出油、睡眠和 7 天趋势。

## 功能

- 今日控糖成功/破戒记录
- 高糖来源勾选
- 痘痘、出油、睡眠 0-5 分观察
- 大痘/破溃痘标记
- 每日控糖小任务
- 最近 7 天趋势
- 支持 iPhone Safari 添加到主屏幕

## 发布

这是纯静态网页，可以直接发布到 GitHub Pages 等 HTTPS 静态站点。
```

- [ ] **Step 4: Verify static shell**

Run: open `index.html` in a browser or local server.

Expected:

- Page title is "控糖护肤计划".
- Four main sections are visible.
- Bottom navigation links scroll to the correct sections.

- [ ] **Step 5: Commit shell updates**

```bash
git add index.html manifest.json README.md
git commit -m "Update app shell for sugar skin tracker"
```

---

### Task 2: Implement Styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Replace `styles.css` with mobile-first tracker styles**

Use this complete stylesheet:

```css
:root {
  --paper: #f4f6f1;
  --surface: #fffdf8;
  --ink: #20252b;
  --muted: #687078;
  --line: #d9dfd2;
  --green: #2f6f5e;
  --blue: #2f5f8f;
  --red: #b9574f;
  --amber: #c58a2c;
  --soft-green: #e8f2ed;
  --soft-blue: #edf2f7;
  --soft-red: #f7ece9;
  --shadow: 0 14px 34px rgba(28, 35, 31, 0.09);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  letter-spacing: 0;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  width: min(100%, 520px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 18px 16px 92px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: max(10px, env(safe-area-inset-top)) 0 12px;
}

.topbar h1,
.tracker-section h2,
.hero-panel h2 {
  margin: 0;
  line-height: 1.15;
}

.topbar h1 {
  font-size: 28px;
}

.eyebrow,
.section-kicker {
  margin: 0 0 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-size: 22px;
}

.hero-panel,
.tracker-section {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.hero-panel {
  display: grid;
  grid-template-columns: 1fr 92px;
  gap: 18px;
  align-items: center;
  margin: 6px 0 14px;
  padding: 18px;
}

.hero-panel p:last-child {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.65;
}

.hero-panel h2 {
  font-size: 22px;
}

.streak-badge {
  display: grid;
  place-items: center;
  min-height: 92px;
  border-radius: 8px;
  background: var(--green);
  color: #fff;
}

.streak-badge strong {
  font-size: 34px;
  line-height: 1;
}

.streak-badge span {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 800;
}

.metrics-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 14px 0;
}

.metrics-strip div {
  min-width: 0;
  padding: 12px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 253, 248, 0.78);
}

.metrics-strip strong {
  display: block;
  font-size: 21px;
  line-height: 1;
}

.metrics-strip span {
  display: block;
  margin-top: 7px;
  color: var(--muted);
  font-size: 12px;
}

.tracker-section {
  margin-top: 14px;
  padding: 16px;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.tracker-section h2 {
  font-size: 20px;
}

.save-status,
#taskProgress {
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.segmented-control {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #f6f8f3;
}

.segmented-control button {
  min-height: 44px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--muted);
  font-weight: 800;
}

.segmented-control button.is-active {
  background: var(--green);
  color: #fff;
}

.segmented-control button[data-value="miss"].is-active {
  background: var(--red);
}

.chip-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin: 14px 0;
}

.chip-button {
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  font-weight: 800;
}

.chip-button.is-active {
  border-color: var(--amber);
  background: #fff4df;
  color: #7a4c13;
}

.field {
  display: grid;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
}

input,
textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  outline: 0;
}

input {
  min-height: 44px;
  padding: 0 12px;
}

textarea {
  resize: vertical;
  padding: 12px;
  line-height: 1.55;
}

input:focus,
textarea:focus {
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(47, 95, 143, 0.14);
}

.score-list,
.task-list,
.trend-list {
  display: grid;
  gap: 10px;
}

.score-row,
.task-card,
.trend-card,
.switch-row {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fffdf8;
}

.score-row {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.score-row header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-weight: 800;
}

.score-row header span {
  color: var(--muted);
}

.score-buttons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.score-buttons button {
  min-width: 0;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: var(--muted);
  font-weight: 800;
}

.score-buttons button.is-active {
  border-color: var(--blue);
  background: var(--soft-blue);
  color: var(--blue);
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 12px 0;
  padding: 12px;
}

.switch-row span {
  display: grid;
  gap: 4px;
}

.switch-row small {
  color: var(--muted);
  font-size: 12px;
}

.switch-row input {
  width: 24px;
  min-height: 24px;
  accent-color: var(--red);
}

.task-card {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  padding: 10px;
}

.task-card.is-done {
  background: var(--soft-green);
}

.check-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  color: transparent;
}

.task-card.is-done .check-button {
  border-color: var(--green);
  background: var(--green);
  color: #fff;
}

.task-card strong {
  display: block;
  font-size: 15px;
  line-height: 1.4;
}

.task-card span {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.trend-card {
  display: grid;
  grid-template-columns: 62px 1fr auto;
  gap: 10px;
  align-items: center;
  min-height: 58px;
  padding: 10px;
}

.trend-card time {
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.trend-card strong {
  font-size: 14px;
}

.trend-card span {
  color: var(--muted);
  font-size: 12px;
}

.status-pill {
  min-width: 48px;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--soft-blue);
  color: var(--blue);
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

.status-pill.is-success {
  background: var(--soft-green);
  color: var(--green);
}

.status-pill.is-miss {
  background: var(--soft-red);
  color: var(--red);
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  background: rgba(255, 253, 248, 0.94);
  backdrop-filter: blur(14px);
}

.bottom-nav a {
  display: grid;
  place-items: center;
  min-height: 42px;
  border-radius: 8px;
  color: var(--ink);
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
}

.bottom-nav a:focus,
.bottom-nav a:hover {
  background: #edf2e7;
}

@media (max-width: 370px) {
  .app-shell {
    padding-inline: 12px;
  }

  .hero-panel {
    grid-template-columns: 1fr;
  }

  .streak-badge {
    min-height: 72px;
  }

  .chip-grid {
    grid-template-columns: 1fr;
  }

  .trend-card {
    grid-template-columns: 54px 1fr;
  }

  .status-pill {
    grid-column: 2;
    justify-self: start;
  }
}
```

- [ ] **Step 2: Verify mobile layout manually**

Run: open the app at an iPhone-sized viewport, around 390x844.

Expected:

- Header text fits.
- Score buttons fit six across without overlap.
- Bottom nav does not cover final content.
- No text overlaps inside buttons or cards.

- [ ] **Step 3: Commit styling**

```bash
git add styles.css
git commit -m "Style sugar skin tracker"
```

---

### Task 3: Implement Tracker State And Rendering

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Replace `app.js` with tracker logic**

Use this complete script:

```js
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
  { key: "acneScore", label: "痘痘严重度", low: "平稳", high: "爆发" },
  { key: "oilScore", label: "出油程度", low: "清爽", high: "很油" },
  { key: "sleepScore", label: "睡眠质量", low: "很差", high: "很好" }
];

const dailyTasks = [
  { id: "noSweetDrink", title: "不喝含糖饮料", hint: "奶茶、可乐、果汁都算" },
  { id: "noDessert", title: "不吃甜食", hint: "蛋糕、糖果、甜点都算" },
  { id: "noAfterDinnerFood", title: "晚饭后不加餐", hint: "尤其避开夜宵和零食" },
  { id: "sleepBefore2330", title: "23:30 前睡觉", hint: "睡眠也会影响出油和炎症" }
];

const records = loadRecords();
const todayRecord = ensureRecord(todayKey);

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
  records[todayKey] = createEmptyRecord();
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

  const sugarSourcesValue = Array.isArray(record.sugarSources) ? record.sugarSources : empty.sugarSources;
  const tasksValue = record.tasks && typeof record.tasks === "object" ? record.tasks : {};

  return {
    sugarStatus: record.sugarStatus === "success" || record.sugarStatus === "miss" ? record.sugarStatus : "",
    sugarSources: sugarSourcesValue.filter((source) => sugarSources.some((item) => item.id === source)),
    sugarNote: typeof record.sugarNote === "string" ? record.sugarNote : "",
    acneScore: normalizeScore(record.acneScore),
    oilScore: normalizeScore(record.oilScore),
    sleepScore: normalizeScore(record.sleepScore),
    hasLargePimple: Boolean(record.hasLargePimple),
    skinNote: typeof record.skinNote === "string" ? record.skinNote : "",
    tasks: dailyTasks.reduce((result, task) => {
      result[task.id] = Boolean(tasksValue[task.id]);
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
  const recent = getRecentDateKeys(7).map((date) => records[date]).filter(Boolean);
  const successes = recent.filter((record) => record.sugarStatus === "success").length;
  const acneAverage = averageScore(recent, "acneScore");
  const oilAverage = averageScore(recent, "oilScore");

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

function averageScore(records, key) {
  const values = records.map((record) => record[key]).filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
saveRecords();
```

- [ ] **Step 2: Verify tracker behavior**

Run the app and perform these actions:

1. Click "成功".
2. Select "奶茶/甜饮".
3. Set痘痘严重度 to 3.
4. Set出油程度 to 4.
5. Set睡眠质量 to 2.
6. Toggle大痘/破溃痘.
7. Complete two tasks.
8. Refresh the page.

Expected:

- All selected values remain after refresh.
- Top summary shows today's status and scores.
- Task progress shows `2/4`.
- 7-day trend shows today's row as success.

- [ ] **Step 3: Verify reset behavior**

Click the reset button and confirm.

Expected:

- Today's record returns to empty/default values.
- Trend row for today becomes "未记".
- No JavaScript error appears in the console.

- [ ] **Step 4: Commit tracker logic**

```bash
git add app.js
git commit -m "Implement sugar skin tracker"
```

---

### Task 4: Final Verification

**Files:**
- No new files.
- Verify: `index.html`, `styles.css`, `app.js`, `manifest.json`, `README.md`

- [ ] **Step 1: Check git status**

Run:

```bash
git status --short
```

Expected:

- Only intentional files are modified before final commit, or the working tree is clean after commits.

- [ ] **Step 2: Run local static server**

Run:

```bash
python -m http.server 8000
```

Expected:

- Server starts at `http://localhost:8000/`.

- [ ] **Step 3: Verify in browser**

Open:

```text
http://localhost:8000/
```

Expected:

- No blank page.
- No console errors caused by the app.
- Data entry persists across reload.
- Mobile viewport around 390px wide has no overlapping text.

- [ ] **Step 4: Final commit if needed**

If any verification fixes were made:

```bash
git add index.html styles.css app.js manifest.json README.md service-worker.js
git commit -m "Verify sugar skin tracker"
```

## Plan Self-Review

- Spec coverage: The plan covers iPhone PWA shell, local records, sugar status, high-sugar sources, skin scores, large pimple flag, daily tasks, 7-day trend, and local persistence.
- Placeholders: No unresolved placeholder steps are present.
- Type consistency: Data fields match the approved spec: `sugarStatus`, `sugarSources`, `acneScore`, `oilScore`, `sleepScore`, `hasLargePimple`, and `tasks`.
