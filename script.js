// script.js

const taskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

const timerDisplay = document.getElementById('timer-display');
const startStopBtn = document.getElementById('start-stop');
const resetBtn = document.getElementById('reset');

let tasks = [];
let timer = null;
let timeLeft = 25 * 60;
let running = false;

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

function tick() {
  if (timeLeft > 0) {
    timeLeft -= 1;
    updateTimerDisplay();
  } else {
    clearInterval(timer);
    running = false;
    startStopBtn.textContent = 'Start';
    playAlarm();
  }
}

startStopBtn.addEventListener('click', () => {
  if (running) {
    clearInterval(timer);
    startStopBtn.textContent = 'Start';
  } else {
    timer = setInterval(tick, 1000);
    startStopBtn.textContent = 'Pause';
  }
  running = !running;
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  running = false;
  timeLeft = 25 * 60;
  updateTimerDisplay();
  startStopBtn.textContent = 'Start';
  stopAlarm();
});

loadTasks();
updateTimerDisplay();
