// script.js

const taskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

const timerDisplay = document.getElementById('timer-display');
const startStopBtn = document.getElementById('start-stop');
const resetBtn = document.getElementById('reset');
const setsInput = document.getElementById('sets');

let tasks = [];
let timeLeft = 25 * 60;
let running = false;
let totalSets = 1;

// 🔁 アラーム再生用（ループ）
let alarmAudio = new Audio('alarm.mp3');
alarmAudio.loop = true;

function playAlarm() {
  alarmAudio.play().catch(err => console.error('Alarm playback failed:', err));
}

function stopAlarm() {
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task;
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'x';
    removeBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });
    li.appendChild(removeBtn);
    taskList.appendChild(li);
  });
}

function saveTasks() {
  chrome.storage.sync.set({ tasks });
}

function loadTasks() {
  chrome.storage.sync.get('tasks', data => {
    tasks = data.tasks || [];
    renderTasks();
  });
}

addTaskBtn.addEventListener('click', () => {
  const value = taskInput.value.trim();
  if (value) {
    tasks.push(value);
    taskInput.value = '';
    saveTasks();
    renderTasks();
  }
});

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTaskBtn.click();
  }
});

function updateTimerDisplay() {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function loadTimerState() {
  chrome.storage.local.get(['timeLeft', 'running', 'sets'], data => {
    timeLeft = data.timeLeft ?? 25 * 60;
    running = data.running ?? false;
    totalSets = data.sets ?? 1;
    setsInput.value = totalSets;
    updateTimerDisplay();
    startStopBtn.textContent = running ? 'Pause' : 'Start';
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.timeLeft) {
    timeLeft = changes.timeLeft.newValue;
    updateTimerDisplay();
  }
  if (changes.running) {
    running = changes.running.newValue;
    startStopBtn.textContent = running ? 'Pause' : 'Start';
    if (!running) stopAlarm();
  }
});

startStopBtn.addEventListener('click', () => {
  const type = running ? 'PAUSE_TIMER' : 'START_TIMER';
  chrome.runtime.sendMessage({ type });
});

resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
});

setsInput.addEventListener('change', () => {
  totalSets = parseInt(setsInput.value, 10) || 1;
  chrome.storage.local.set({ sets: totalSets });
});

loadTasks();
loadTimerState();
