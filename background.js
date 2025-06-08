// background.js

// このスクリプトはポップアップが閉じてもタイマーを維持するために使われます。

let timer = null;
let timeLeft = 25 * 60; // デフォルト 25分
let running = false;
let alarmAudio = null;

function startInterval() {
  timer = setInterval(() => {
    timeLeft--;
    chrome.storage.local.set({ timeLeft });

    if (timeLeft <= 0) {
      clearInterval(timer);
      running = false;
      chrome.storage.local.set({ running: false });

      alarmAudio = new Audio(chrome.runtime.getURL('alarm.mp3'));
      alarmAudio.loop = true;
      alarmAudio.play();
    }
  }, 1000);
}

chrome.storage.local.get(['timeLeft', 'running'], data => {
  if (typeof data.timeLeft === 'number') {
    timeLeft = data.timeLeft;
  }
  if (data.running) {
    running = true;
    startInterval();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    if (!running) {
      running = true;
      startInterval();
      chrome.storage.local.set({ running: true });
    }
  } else if (message.type === 'PAUSE_TIMER') {
    clearInterval(timer);
    running = false;
    chrome.storage.local.set({ running: false });
  } else if (message.type === 'RESET_TIMER') {
    clearInterval(timer);
    timeLeft = 25 * 60;
    running = false;
    chrome.storage.local.set({ timeLeft, running });

    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
  } else if (message.type === 'GET_TIMER_STATE') {
    sendResponse({ timeLeft, running });
  }
});
