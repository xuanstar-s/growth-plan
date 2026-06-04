const dateKey = getLocalDateKey();
const storageKey = `growth-plan-${dateKey}`;
const reminderKey = "growth-plan-reminder";
const reminderHour = 9;
const reminderMinute = 30;

const defaultTasks = [
  { text: "拍 5 个生活 B-roll 镜头", slot: "下班后", done: false },
  { text: "写下今天的情绪主题", slot: "午休", done: false },
  { text: "健身或拉伸 40 分钟", slot: "晚上", done: false },
  { text: "剪一条 15-30 秒练习片", slot: "晚上", done: false },
  { text: "复盘一个镜头为什么有效", slot: "睡前", done: false }
];

const defaultShots = [
  ["状态", "用一个安静画面交代今天的情绪，比如电脑合上、鞋带系紧。"],
  ["行动", "拍手、脚步、推门、拿包，让画面开始往前走。"],
  ["阻力", "加入喘气、停顿、雨声、空镜，让情绪有一点重量。"],
  ["转折", "用一个动作改变节奏，比如抬头、开灯、走进健身房。"],
  ["收尾", "留下一个稳定画面，再配一句克制的旁白。"]
];

const state = loadState();

const todayLabel = document.querySelector("#todayLabel");
const doneCount = document.querySelector("#doneCount");
const totalCount = document.querySelector("#totalCount");
const completionRate = document.querySelector("#completionRate");
const taskList = document.querySelector("#taskList");
const shotGrid = document.querySelector("#shotGrid");
const taskForm = document.querySelector("#taskForm");
const taskText = document.querySelector("#taskText");
const taskSlot = document.querySelector("#taskSlot");
const moodInput = document.querySelector("#moodInput");
const voiceInput = document.querySelector("#voiceInput");
const reminderToggleBtn = document.querySelector("#reminderToggleBtn");
const reminderStatus = document.querySelector("#reminderStatus");
const reminder = loadReminder();
let reminderTimer = null;

todayLabel.textContent = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "long"
}).format(new Date());

document.querySelector("#addTaskBtn").addEventListener("click", () => {
  taskForm.classList.remove("is-hidden");
  taskText.focus();
});

document.querySelector("#cancelTaskBtn").addEventListener("click", () => {
  taskForm.reset();
  taskForm.classList.add("is-hidden");
});

document.querySelector("#resetDayBtn").addEventListener("click", () => {
  const confirmed = confirm("恢复今日模板会覆盖今天的计划和复盘，确定继续吗？");
  if (!confirmed) return;
  localStorage.removeItem(storageKey);
  Object.assign(state, createFreshState());
  render();
});

document.querySelector("#saveReviewBtn").addEventListener("click", () => {
  state.mood = moodInput.value.trim();
  state.voice = voiceInput.value.trim();
  saveState();
});

reminderToggleBtn.addEventListener("click", async () => {
  if (reminder.enabled) {
    reminder.enabled = false;
    saveReminder();
    scheduleReminder();
    renderReminder();
    return;
  }

  reminder.enabled = true;
  reminder.lastShownDate = "";

  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }

  saveReminder();
  scheduleReminder();
  renderReminder();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskText.value.trim();
  if (!text) return;

  state.tasks.push({
    id: createId(),
    text,
    slot: taskSlot.value,
    done: false
  });

  taskForm.reset();
  taskForm.classList.add("is-hidden");
  saveState();
  render();
});

moodInput.addEventListener("input", () => {
  state.mood = moodInput.value;
  saveState();
});

voiceInput.addEventListener("input", () => {
  state.voice = voiceInput.value;
  saveState();
});

function createFreshState() {
  return {
    tasks: defaultTasks.map((task) => ({ ...task, id: createId() })),
    mood: "",
    voice: ""
  };
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return createFreshState();

  try {
    const parsed = JSON.parse(saved);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : createFreshState().tasks,
      mood: parsed.mood || "",
      voice: parsed.voice || ""
    };
  } catch {
    return createFreshState();
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadReminder() {
  const saved = localStorage.getItem(reminderKey);
  if (!saved) return { enabled: false, lastShownDate: "" };

  try {
    const parsed = JSON.parse(saved);
    return {
      enabled: Boolean(parsed.enabled),
      lastShownDate: parsed.lastShownDate || ""
    };
  } catch {
    return { enabled: false, lastShownDate: "" };
  }
}

function saveReminder() {
  localStorage.setItem(reminderKey, JSON.stringify(reminder));
}

function render() {
  renderTasks();
  renderShots();
  renderReview();
  renderReminder();
}

function renderTasks() {
  taskList.innerHTML = "";

  state.tasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = `task-card${task.done ? " is-done" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.type = "button";
    checkButton.setAttribute("aria-label", task.done ? "标记为未完成" : "标记为完成");
    checkButton.textContent = "✓";
    checkButton.addEventListener("click", () => {
      task.done = !task.done;
      saveState();
      renderTasks();
    });

    const main = document.createElement("div");
    main.className = "task-main";
    main.innerHTML = `<strong>${escapeHtml(task.text)}</strong><span>${escapeHtml(task.slot)}</span>`;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.className = "small-button";
    editButton.type = "button";
    editButton.textContent = "改";
    editButton.addEventListener("click", () => editTask(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "small-button";
    deleteButton.type = "button";
    deleteButton.textContent = "删";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(editButton, deleteButton);
    card.append(checkButton, main, actions);
    taskList.append(card);
  });

  const done = state.tasks.filter((task) => task.done).length;
  const total = state.tasks.length;
  doneCount.textContent = done;
  totalCount.textContent = total;
  completionRate.textContent = total ? `${Math.round((done / total) * 100)}%` : "0%";
}

function renderShots() {
  shotGrid.innerHTML = "";

  defaultShots.forEach(([title, copy], index) => {
    const card = document.createElement("article");
    card.className = "shot-card";
    card.innerHTML = `
      <div class="shot-number">${index + 1}</div>
      <div>
        <strong>${title}</strong>
        <span>${copy}</span>
      </div>
    `;
    shotGrid.append(card);
  });
}

function renderReview() {
  moodInput.value = state.mood;
  voiceInput.value = state.voice;
}

function renderReminder() {
  reminderToggleBtn.textContent = reminder.enabled ? "关闭" : "开启";

  if (!reminder.enabled) {
    reminderStatus.textContent = "开启后，每天早上 9:30 提醒你回来打卡。";
    return;
  }

  if (!("Notification" in window)) {
    reminderStatus.textContent = "已开启 App 内提醒；当前浏览器不支持系统通知。";
    return;
  }

  if (Notification.permission === "granted") {
    reminderStatus.textContent = "已开启：每天早上 9:30 提醒打卡。";
    return;
  }

  if (Notification.permission === "denied") {
    reminderStatus.textContent = "已开启 App 内提醒；系统通知需要在浏览器设置里允许。";
    return;
  }

  reminderStatus.textContent = "已开启；点“允许通知”后，提醒会更可靠。";
}

function scheduleReminder() {
  if (reminderTimer) window.clearTimeout(reminderTimer);
  if (!reminder.enabled) return;

  const now = new Date();
  const next = new Date();
  next.setHours(reminderHour, reminderMinute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  reminderTimer = window.setTimeout(() => {
    showReminder();
    scheduleReminder();
  }, next.getTime() - now.getTime());
}

function showReminder() {
  const today = getLocalDateKey();
  if (reminder.lastShownDate === today) return;

  reminder.lastShownDate = today;
  saveReminder();
  reminderStatus.textContent = "现在可以完成今天第一项小任务了。";

  const title = "成长计划打卡";
  const body = "9:30 到了，打开成长计划，先完成今天第一项小任务。";

  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.showNotification(title, {
          body,
          icon: "icon.svg",
          tag: "growth-plan-daily-checkin"
        });
      })
      .catch(() => new Notification(title, { body, icon: "icon.svg" }));
    return;
  }

  new Notification(title, { body, icon: "icon.svg" });
}

function editTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  const nextText = prompt("修改任务内容", task.text);
  if (!nextText || !nextText.trim()) return;

  task.text = nextText.trim().slice(0, 40);
  saveState();
  renderTasks();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveState();
  renderTasks();
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

function createId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then((registration) => {
    if (registration.waiting) registration.waiting.postMessage("SKIP_WAITING");
  }).catch(() => {});
}

render();
scheduleReminder();
