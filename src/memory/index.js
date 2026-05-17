const { app } = require("electron");
const { logError } = require("../errors/index.js");

let heapSnapshots = [];
let timerRegistry = new Map();
let windowRegistry = new Map();

const MAX_SNAPSHOTS = 5;
const MEMORY_THRESHOLD_MB = 200;
const LEAK_DETECTION_INTERVAL = 60000;

function registerTimer(timerId, name, context = "") {
  timerRegistry.set(timerId, {
    name,
    context,
    createdAt: Date.now(),
    type:
      timerId instanceof Promise
        ? "promise"
        : typeof timerId === "number"
          ? "timeout"
          : "interval",
  });
}

function unregisterTimer(timerId) {
  timerRegistry.delete(timerId);
}

function registerWindow(window, name) {
  windowRegistry.set(window.id, {
    name,
    createdAt: Date.now(),
    webContentsId: window.webContents.id,
  });

  window.on("closed", () => {
    unregisterWindow(window.id);
  });
}

function unregisterWindow(windowId) {
  windowRegistry.delete(windowId);
}

function takeHeapSnapshot() {
  return new Promise((resolve) => {
    const snapshot = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      timers: Array.from(timerRegistry.values()),
      windows: Array.from(windowRegistry.values()),
    };

    heapSnapshots.push(snapshot);

    if (heapSnapshots.length > MAX_SNAPSHOTS) {
      heapSnapshots.shift();
    }

    resolve(snapshot);
  });
}

function analyzeMemoryUsage() {
  if (heapSnapshots.length < 2) return null;

  const recent = heapSnapshots[heapSnapshots.length - 1];
  const previous = heapSnapshots[heapSnapshots.length - 2];

  const usedMB = (recent.memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const previousMB = (previous.memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const growthMB =
    (recent.memoryUsage.heapUsed - previous.memoryUsage.heapUsed) / 1024 / 1024;

  return {
    currentMB: parseFloat(usedMB),
    previousMB: parseFloat(previousMB),
    growthMB: growthMB.toFixed(2),
    isOverThreshold: parseFloat(usedMB) > MEMORY_THRESHOLD_MB,
    snapshotCount: heapSnapshots.length,
  };
}

function checkForLeaks() {
  const analysis = analyzeMemoryUsage();

  if (analysis) {
    console.log("=== Memory Analysis Report ===");
    console.log(`Current Memory: ${analysis.currentMB} MB`);
    console.log(`Previous Memory: ${analysis.previousMB} MB`);
    console.log(`Growth: ${analysis.growthMB} MB`);

    if (analysis.isOverThreshold) {
      logError(
        new Error(`Memory usage exceeds threshold: ${analysis.currentMB} MB`),
        "Memory Leak Warning",
      );
    }

    if (parseFloat(analysis.growthMB) > 50) {
      logError(
        new Error(
          `Significant memory growth detected: +${analysis.growthMB} MB`,
        ),
        "Memory Growth Warning",
      );
    }
  }

  checkTimerLeaks();
}

function checkTimerLeaks() {
  const now = Date.now();
  const oldTimers = [];

  timerRegistry.forEach((info, id) => {
    if (now - info.createdAt > 300000) {
      oldTimers.push({ id, ...info });
    }
  });

  if (oldTimers.length > 0) {
    console.warn("=== Potential Timer Leaks ===");
    oldTimers.forEach((timer) => {
      console.warn(
        `Timer: ${timer.name}, Type: ${timer.type}, Age: ${(now - timer.createdAt) / 1000}s`,
      );
    });
  }
}

function printMemoryReport() {
  const report = {
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
    timers: {
      count: timerRegistry.size,
      list: Array.from(timerRegistry.values()),
    },
    windows: {
      count: windowRegistry.size,
      list: Array.from(windowRegistry.values()),
    },
    snapshots: heapSnapshots.length,
  };

  console.log("=== Memory Report ===");
  console.log(JSON.stringify(report, null, 2));

  return report;
}

function setupMemoryMonitoring() {
  setInterval(() => {
    takeHeapSnapshot().then(() => {
      checkForLeaks();
    });
  }, LEAK_DETECTION_INTERVAL);

  app.on("before-quit", () => {
    printMemoryReport();

    if (timerRegistry.size > 0) {
      console.warn(
        `Warning: ${timerRegistry.size} timers still active on quit`,
      );
    }
  });

  takeHeapSnapshot();

  console.log("Memory monitoring initialized");
}

module.exports = {
  registerTimer,
  unregisterTimer,
  registerWindow,
  unregisterWindow,
  takeHeapSnapshot,
  analyzeMemoryUsage,
  checkForLeaks,
  printMemoryReport,
  setupMemoryMonitoring,
  getTimerCount: () => timerRegistry.size,
  getWindowCount: () => windowRegistry.size,
};
