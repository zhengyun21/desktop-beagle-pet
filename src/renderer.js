let config = {
  petPosition: { x: 200, y: 200 },
  customPetEnabled: false,
  customPetPath: "",
  customPetExcitedPath: "",
  customSoundEnabled: false,
  customSounds: [],
  selectedSoundIndex: 0,
  clickSoundCooldown: 500,
};

let isDragging = false;
let isExcited = false;
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
let startX = 0;
let startY = 0;
let lastClickTime = 0;
let animationFrame = null;

let audioContext = null;
let customSounds = [];
let currentAudio = null;
let speechBubbleHideTimer = null;

// 语言相关
let translations = {};

function createFileUrl(filePath) {
  if (!filePath) return "";
  const normalizedPath = filePath.replace(/\\/g, "/");
  return `file://${encodeURI(normalizedPath).replace(/#/g, "%23")}`;
}

const pet = document.getElementById("pet");
const speechBubble = document.getElementById("speechBubble");
const heartsContainer = document.getElementById("hearts");
const beagleSvg = document.getElementById("beagleSvg");
const customPetImage = document.getElementById("customPetImage");
const customPetExcitedImage = document.getElementById("customPetExcitedImage");

// 语言相关函数
function applyTranslations() {
  if (speechBubble && translations["pet.bark"]) {
    // 只有当气泡显示默认文本时才更新
    if (
      speechBubble.textContent === "汪汪！" ||
      speechBubble.textContent === "Woof woof!"
    ) {
      speechBubble.textContent = translations["pet.bark"];
    }
  }
}

function initLanguage() {
  window.electronAPI
    .getLanguage()
    .then((data) => {
      translations = data.translations;
      applyTranslations();
    })
    .catch((err) => {
      console.error("Failed to load language:", err);
    });
}

function initLanguageListener() {
  window.electronAPI.onLanguageChanged((data) => {
    translations = data.translations;
    applyTranslations();
  });
}

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playDefaultBarkSound() {
  initAudio();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const duration = 0.25;
  const now = audioContext.currentTime;

  for (let i = 0; i < 3; i++) {
    const startTime = now + i * 0.12;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(350 + Math.random() * 80, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      180,
      startTime + duration,
    );

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, startTime);
    filter.Q.value = 1;

    gainNode.gain.setValueAtTime(0.25, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
}

function playCustomSound() {
  if (customSounds.length === 0) {
    playDefaultBarkSound();
    return;
  }

  const maxIndex = customSounds.length - 1;
  let soundIndex = config.selectedSoundIndex;

  // 确保索引在有效范围内
  if (soundIndex < 0 || soundIndex > maxIndex) {
    soundIndex = 0;
  }

  const selectedSound = customSounds[soundIndex];

  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    currentAudio = new Audio(createFileUrl(selectedSound.path));
    currentAudio.play().catch((err) => {
      console.error("Failed to play custom sound:", err);
      currentAudio = null;
      playDefaultBarkSound();
    });
  } catch (err) {
    console.error("Failed to load custom sound:", err);
    currentAudio = null;
    playDefaultBarkSound();
  }
}

function playSound(soundPath) {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    currentAudio = new Audio(createFileUrl(soundPath));
    currentAudio.play().catch((err) => {
      console.error("Failed to play sound:", err);
      currentAudio = null;
    });
  } catch (err) {
    console.error("Failed to load sound:", err);
    currentAudio = null;
  }
}

function createHeart() {
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = "👿";
  heart.style.left = Math.random() * 60 - 30 + "px";
  heart.style.animationDelay = Math.random() * 0.3 + "s";
  heartsContainer.appendChild(heart);

  setTimeout(() => heart.remove(), 1000);
}

function setExcited(excited) {
  isExcited = excited;
  pet.classList.toggle("excited", excited);

  if (config.customPetEnabled) {
    // 自定义宠物模式下切换图片
    if (config.customPetExcitedPath) {
      if (excited) {
        customPetImage.style.display = "none";
        customPetExcitedImage.style.display = "block";
      } else {
        customPetImage.style.display = "block";
        customPetExcitedImage.style.display = "none";
      }
    }
  } else {
    // 默认 SVG 模式
    const normalEyes = beagleSvg.querySelectorAll(".beagle-eye");
    const excitedEyes = beagleSvg.querySelectorAll(".beagle-eye-excited");
    const normalMouth = beagleSvg.querySelector(".mouth-normal");
    const excitedMouth = beagleSvg.querySelector(".mouth-excited");

    normalEyes.forEach(
      (eye) => (eye.style.display = excited ? "none" : "block"),
    );
    excitedEyes.forEach(
      (eye) => (eye.style.display = excited ? "block" : "none"),
    );
    if (normalMouth) normalMouth.style.display = excited ? "none" : "block";
    if (excitedMouth) excitedMouth.style.display = excited ? "block" : "none";
  }

  if (excited) {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createHeart(), i * 100);
    }
  }
}

let maxPetX = window.innerWidth - 200;
let maxPetY = window.innerHeight - 160;

function constrainPosition(x, y) {
  const padding = 10;
  return {
    x: Math.max(padding, Math.min(maxPetX, x)),
    y: Math.max(padding, Math.min(maxPetY, y)),
  };
}

function resumeAnimation() {
  if (!animationFrame) {
    animationFrame = requestAnimationFrame(updatePetPosition);
  }
}

function updatePetPosition() {
  const easedX = currentX + (targetX - currentX) * 0.15;
  const easedY = currentY + (targetY - currentY) * 0.15;

  const dx = Math.abs(targetX - currentX);
  const dy = Math.abs(targetY - currentY);

  if (dx > 0.5 || dy > 0.5) {
    currentX = easedX;
    currentY = easedY;
  } else {
    currentX = targetX;
    currentY = targetY;
  }

  pet.style.setProperty("--pet-x", `${currentX}px`);
  pet.style.setProperty("--pet-y", `${currentY}px`);
  pet.style.transform = `translate(${currentX}px, ${currentY}px)`;

  if (dx > 0.01 || dy > 0.01) {
    animationFrame = requestAnimationFrame(updatePetPosition);
  } else {
    animationFrame = null;
  }
}

async function savePosition() {
  try {
    await window.electronAPI.savePetPosition({ x: targetX, y: targetY });
  } catch (err) {
    console.error("Failed to save position:", err);
  }
}

function loadCustomSounds() {
  window.electronAPI
    .getCustomSounds()
    .then((sounds) => {
      customSounds = sounds;
    })
    .catch((err) => {
      console.error("Failed to load custom sounds:", err);
    });
}

function loadCustomPet() {
  if (!config.customPetEnabled || !config.customPetPath) {
    beagleSvg.style.display = "block";
    customPetImage.style.display = "none";
    customPetExcitedImage.style.display = "none";
    return;
  }

  beagleSvg.style.display = "none";

  // 加载正常状态图片
  const ext = config.customPetPath.toLowerCase();
  customPetImage.src = createFileUrl(config.customPetPath);
  customPetImage.style.display = "block";
  customPetImage.style.top = "0";
  customPetImage.style.left = "0";
  if (ext.endsWith(".gif")) {
    customPetImage.classList.add("custom-pet-gif");
  } else {
    customPetImage.classList.remove("custom-pet-gif");
  }

  // 加载兴奋状态图片（如果有）
  if (config.customPetExcitedPath) {
    const excitedExt = config.customPetExcitedPath.toLowerCase();
    customPetExcitedImage.src = createFileUrl(config.customPetExcitedPath);
    customPetExcitedImage.style.display = "none"; // 默认隐藏，点击时才显示
    customPetExcitedImage.style.top = "0";
    customPetExcitedImage.style.left = "0";
    if (excitedExt.endsWith(".gif")) {
      customPetExcitedImage.classList.add("custom-pet-gif");
    } else {
      customPetExcitedImage.classList.remove("custom-pet-gif");
    }
  }
}

pet.addEventListener("mousedown", (e) => {
  if (isExcited) return;

  isDragging = true;
  startX = e.clientX - targetX;
  startY = e.clientY - targetY;
  pet.style.cursor = "grabbing";
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const newX = e.clientX - startX;
  const newY = e.clientY - startY;
  const constrained = constrainPosition(newX, newY);

  targetX = constrained.x;
  targetY = constrained.y;
  resumeAnimation();
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    pet.style.cursor = "grab";
    savePosition();
  }
});

pet.addEventListener("click", (e) => {
  if (isDragging) {
    e.stopPropagation();
    return;
  }

  if (!isExcited) {
    if (config.customSoundEnabled && customSounds.length > 0) {
      playCustomSound();
    } else {
      playDefaultBarkSound();
    }

    setExcited(true);

    clearTimeout(speechBubbleHideTimer);
    speechBubble.textContent = translations["pet.bark"] || "汪汪！";
    speechBubble.style.display = "block";

    speechBubbleHideTimer = setTimeout(() => {
      speechBubble.style.display = "none";
    }, 3000);

    setTimeout(() => {
      setExcited(false);
    }, 1500);
  }
});

window.electronAPI.onInitConfig((initialConfig) => {
  config = { ...config, ...initialConfig };

  maxPetX = window.innerWidth - 200;
  maxPetY = window.innerHeight - 160;

  const initialPos = constrainPosition(
    config.petPosition?.x ?? window.innerWidth / 2 - 100,
    config.petPosition?.y ?? window.innerHeight / 2 - 80,
  );

  targetX = initialPos.x;
  targetY = initialPos.y;
  currentX = targetX;
  currentY = targetY;

  pet.style.transform = `translate(${currentX}px, ${currentY}px)`;
  pet.style.setProperty("--pet-x", `${currentX}px`);
  pet.style.setProperty("--pet-y", `${currentY}px`);

  loadCustomSounds();
  loadCustomPet();

  // 初始化语言
  initLanguage();
  initLanguageListener();

  resumeAnimation();
});

window.electronAPI.onConfigUpdated((updatedConfig) => {
  config = { ...config, ...updatedConfig };
  loadCustomSounds();
  loadCustomPet();
});

window.electronAPI.onPlaySoundFromMain((soundPath) => {
  playSound(soundPath);
});

window.electronAPI.onReminderTriggered((reminder) => {
  showReminder(reminder);
});

function showReminder(reminder) {
  if (isExcited) return;

  setExcited(true);

  clearTimeout(speechBubbleHideTimer);
  speechBubble.textContent = reminder.title;
  speechBubble.style.display = "block";

  if (config.customSoundEnabled && customSounds.length > 0) {
    playCustomSound();
  } else {
    playDefaultBarkSound();
  }

  speechBubbleHideTimer = setTimeout(() => {
    speechBubble.style.display = "none";
  }, 5000);

  setTimeout(() => {
    setExcited(false);
  }, 3000);
}

window.addEventListener("resize", () => {
  maxPetX = window.innerWidth - 200;
  maxPetY = window.innerHeight - 160;
  const constrained = constrainPosition(targetX, targetY);
  targetX = constrained.x;
  targetY = constrained.y;
  resumeAnimation();
});

function setupMousePassthrough() {
  let isMouseOverPet = false;

  pet.addEventListener("mouseenter", () => {
    isMouseOverPet = true;
    window.electronAPI.setIgnoreMouseEvents(false);
  });

  pet.addEventListener("mouseleave", () => {
    isMouseOverPet = false;
    window.electronAPI.setIgnoreMouseEvents(true);
  });

  window.electronAPI.setIgnoreMouseEvents(true);
}

window.addEventListener("load", () => {
  setupMousePassthrough();
});
