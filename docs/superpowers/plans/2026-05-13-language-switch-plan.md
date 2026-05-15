# 中英文语言切换功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为桌面宠物应用实现中英文切换功能，支持在设置界面和系统托盘切换语言，语言设置持久化保存。

**Architecture:** 采用标准的 i18n 架构，创建独立的 i18n 模块处理翻译逻辑，使用 electron-store 持久化语言设置，通过 IPC 通信协调主进程和渲染进程。

**Tech Stack:** Electron 28+, electron-store, Vanilla JavaScript

---

## 文件结构

### 创建文件
- `src/i18n/zh-CN.js` - 中文翻译文件
- `src/i18n/en-US.js` - 英文翻译文件
- `src/i18n/index.js` - i18n 核心模块

### 修改文件
- `main.js` - 集成 i18n，管理托盘菜单更新，提供 IPC 接口
- `preload.js` - 暴露 i18n 相关接口
- `src/settings.html` - 添加语言选择器 UI
- `src/settings.js` - 实现语言切换功能
- `src/renderer.js` - 更新语音气泡文本

---

## 实施任务

### Task 1: 创建 i18n 目录和翻译文件

**Files:**
- Create: `src/i18n/zh-CN.js`
- Create: `src/i18n/en-US.js`
- Create: `src/i18n/index.js`

- [ ] **Step 1: 创建 src/i18n/zh-CN.js**

```javascript
module.exports = {
  // 托盘菜单
  "tray.show": "显示宠物",
  "tray.hide": "隐藏宠物",
  "tray.appearance": "自定义宠物外观",
  "tray.importAppearance": "导入外观图片",
  "tray.resetAppearance": "恢复默认",
  "tray.sounds": "自定义音效",
  "tray.importSound": "导入音效文件",
  "tray.enableCustomSound": "启用自定义音效",
  "tray.settings": "设置",
  "tray.quit": "退出",
  "tray.tooltip": "桌面宠物",

  // 设置界面标签页
  "settings.tabs.appearance": "外观设置",
  "settings.tabs.sounds": "音效设置",
  "settings.tabs.reminders": "定时提醒",
  "settings.tabs.general": "通用设置",

  // 外观设置
  "settings.appearance.current": "当前宠物",
  "settings.appearance.custom": "自定义宠物外观",
  "settings.appearance.hint": "支持 PNG、JPG、GIF、WebP 格式。GIF 会自动播放动画。",
  "settings.appearance.import": "导入自定义外观",
  "settings.appearance.reset": "恢复默认",
  "settings.appearance.defaultName": "默认比格犬",
  "settings.appearance.defaultType": "内置 SVG",
  "settings.appearance.customType": "自定义图片",
  "settings.appearance.gifType": "GIF 动画",

  // 音效设置
  "settings.sounds.title": "音效设置",
  "settings.sounds.useCustom": "使用自定义音效",
  "settings.sounds.list": "音效列表",
  "settings.sounds.empty": "暂无自定义音效",
  "settings.sounds.import": "导入音效文件",
  "settings.sounds.add": "+ 添加音效",
  "settings.sounds.hint": "支持 MP3、WAV、OGG、M4A 格式。最多可添加 20 个音效，点击宠物时会随机播放。",
  "settings.sounds.play": "播放",
  "settings.sounds.select": "设为默认",
  "settings.sounds.selected": "默认",
  "settings.sounds.delete": "删除",

  // 定时提醒
  "settings.reminders.title": "定时提醒",
  "settings.reminders.empty": "暂无定时提醒",
  "settings.reminders.add": "+ 添加提醒",
  "settings.reminders.hint": "设置定时提醒，时间到了宠物会兴奋地提醒你！",
  "settings.reminders.modalTitle": "添加提醒",
  "settings.reminders.modalEditTitle": "编辑提醒",
  "settings.reminders.titleLabel": "提醒标题",
  "settings.reminders.timeLabel": "提醒时间",
  "settings.reminders.repeatLabel": "重复方式",
  "settings.reminders.once": "仅一次",
  "settings.reminders.daily": "每天",
  "settings.reminders.cancel": "取消",
  "settings.reminders.save": "保存",
  "settings.reminders.disable": "禁用",
  "settings.reminders.enable": "启用",
  "settings.reminders.edit": "编辑",
  "settings.reminders.delete": "删除",
  "settings.reminders.confirmDelete": "确定要删除这个提醒吗？",
  "settings.reminders.required": "请填写完整的提醒信息",

  // 通用设置
  "settings.general.title": "常规选项",
  "settings.general.autoStart": "开机自动启动",
  "settings.general.showPet": "显示宠物",
  "settings.general.language": "语言",
  "settings.general.shortcuts": "快捷操作",
  "settings.general.shortcut1": "• 拖拽移动：按住宠物拖动",
  "settings.general.shortcut2": "• 点击叫唤：单击宠物播放声音",
  "settings.general.shortcut3": "• 打开设置：双击宠物",
  "settings.general.shortcut4": "• 显示/隐藏：双击托盘图标",

  // 页脚
  "settings.footer": "桌面宠物 v1.0.0",
  "settings.footer.madeWith": "Made with ❤️",

  // 宠物界面
  "pet.bark": "汪汪！"
};
```

- [ ] **Step 2: 创建 src/i18n/en-US.js**

```javascript
module.exports = {
  // 托盘菜单
  "tray.show": "Show Pet",
  "tray.hide": "Hide Pet",
  "tray.appearance": "Custom Pet Appearance",
  "tray.importAppearance": "Import Appearance Image",
  "tray.resetAppearance": "Reset to Default",
  "tray.sounds": "Custom Sounds",
  "tray.importSound": "Import Sound Files",
  "tray.enableCustomSound": "Enable Custom Sounds",
  "tray.settings": "Settings",
  "tray.quit": "Quit",
  "tray.tooltip": "Desktop Pet",

  // 设置界面标签页
  "settings.tabs.appearance": "Appearance",
  "settings.tabs.sounds": "Sounds",
  "settings.tabs.reminders": "Reminders",
  "settings.tabs.general": "General",

  // 外观设置
  "settings.appearance.current": "Current Pet",
  "settings.appearance.custom": "Custom Pet Appearance",
  "settings.appearance.hint": "Supports PNG, JPG, GIF, WebP formats. GIF will play animation automatically.",
  "settings.appearance.import": "Import Custom Appearance",
  "settings.appearance.reset": "Reset to Default",
  "settings.appearance.defaultName": "Default Beagle",
  "settings.appearance.defaultType": "Built-in SVG",
  "settings.appearance.customType": "Custom Image",
  "settings.appearance.gifType": "GIF Animation",

  // 音效设置
  "settings.sounds.title": "Sound Settings",
  "settings.sounds.useCustom": "Use Custom Sounds",
  "settings.sounds.list": "Sound List",
  "settings.sounds.empty": "No custom sounds",
  "settings.sounds.import": "Import Sound Files",
  "settings.sounds.add": "+ Add Sound",
  "settings.sounds.hint": "Supports MP3, WAV, OGG, M4A formats. Max 20 sounds. Randomly played when clicking the pet.",
  "settings.sounds.play": "Play",
  "settings.sounds.select": "Set as Default",
  "settings.sounds.selected": "Default",
  "settings.sounds.delete": "Delete",

  // 定时提醒
  "settings.reminders.title": "Scheduled Reminders",
  "settings.reminders.empty": "No reminders",
  "settings.reminders.add": "+ Add Reminder",
  "settings.reminders.hint": "Set reminders, the pet will excitedly remind you when the time comes!",
  "settings.reminders.modalTitle": "Add Reminder",
  "settings.reminders.modalEditTitle": "Edit Reminder",
  "settings.reminders.titleLabel": "Reminder Title",
  "settings.reminders.timeLabel": "Reminder Time",
  "settings.reminders.repeatLabel": "Repeat",
  "settings.reminders.once": "Once",
  "settings.reminders.daily": "Daily",
  "settings.reminders.cancel": "Cancel",
  "settings.reminders.save": "Save",
  "settings.reminders.disable": "Disable",
  "settings.reminders.enable": "Enable",
  "settings.reminders.edit": "Edit",
  "settings.reminders.delete": "Delete",
  "settings.reminders.confirmDelete": "Are you sure you want to delete this reminder?",
  "settings.reminders.required": "Please fill in all reminder information.",

  // 通用设置
  "settings.general.title": "General Options",
  "settings.general.autoStart": "Auto-start on boot",
  "settings.general.showPet": "Show Pet",
  "settings.general.language": "Language",
  "settings.general.shortcuts": "Shortcuts",
  "settings.general.shortcut1": "• Drag to move: Hold and drag the pet",
  "settings.general.shortcut2": "• Click to bark: Single click plays sound",
  "settings.general.shortcut3": "• Open settings: Double-click the pet",
  "settings.general.shortcut4": "• Show/Hide: Double-click tray icon",

  // 页脚
  "settings.footer": "Desktop Pet v1.0.0",
  "settings.footer.madeWith": "Made with ❤️",

  // 宠物界面
  "pet.bark": "Woof woof!"
};
```

- [ ] **Step 3: 创建 src/i18n/index.js**

```javascript
const zhCN = require('./zh-CN.js');
const enUS = require('./en-US.js');

const translations = {
  'zh-CN': zhCN,
  'en-US': enUS
};

let currentLang = 'zh-CN';

function init(defaultLang) {
  if (translations[defaultLang]) {
    currentLang = defaultLang;
  } else {
    currentLang = 'zh-CN';
  }
  return currentLang;
}

function t(key) {
  const trans = translations[currentLang];
  if (trans && trans.hasOwnProperty(key)) {
    return trans[key];
  }
  console.warn(`Translation missing: ${key}`);
  return key;
}

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    return true;
  }
  return false;
}

function getLanguage() {
  return currentLang;
}

function getTranslations() {
  return translations[currentLang];
}

function getSystemLanguage() {
  const lang = navigator.language || navigator.userLanguage || 'zh-CN';
  if (lang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
}

function getAvailableLanguages() {
  return Object.keys(translations);
}

module.exports = {
  init,
  t,
  setLanguage,
  getLanguage,
  getTranslations,
  getSystemLanguage,
  getAvailableLanguages
};
```

- [ ] **Step 4: Commit**

```bash
git add src/i18n/
git commit -m "feat(i18n): add i18n module with Chinese and English translations"
```

---

### Task 2: 更新 main.js 集成 i18n

**Files:**
- Modify: `main.js` (添加 i18n 初始化和 IPC 接口)

- [ ] **Step 1: 在 main.js 顶部添加 i18n 引入**

在文件开头添加：
```javascript
const i18n = require('./src/i18n/index.js');
```

- [ ] **Step 2: 在 store defaults 中添加 language 配置**

在 Store defaults 中添加：
```javascript
language: 'zh-CN'
```

- [ ] **Step 3: 在 ensureDirectories 函数后添加 i18n 初始化函数**

```javascript
function initI18n() {
  const savedLang = store.get('language');
  if (savedLang) {
    i18n.init(savedLang);
  } else {
    const systemLang = app.getLocale();
    const defaultLang = systemLang.startsWith('zh') ? 'zh-CN' : 'en-US';
    i18n.init(defaultLang);
    store.set('language', defaultLang);
  }
}
```

- [ ] **Step 4: 更新 buildTrayMenu 函数使用翻译**

将所有中文硬编码文本替换为 i18n.t() 调用：
- `"显示宠物"` → `i18n.t('tray.show')`
- `"隐藏宠物"` → `i18n.t('tray.hide')`
- 其他托盘菜单项...

- [ ] **Step 5: 在 createTray 函数中添加语言切换子菜单**

在 buildTrayMenu 函数中，添加语言切换菜单：
```javascript
{
  label: i18n.t('settings.general.language') + ' / Language',
  submenu: [
    {
      label: '中文',
      type: 'radio',
      checked: i18n.getLanguage() === 'zh-CN',
      click: () => switchLanguage('zh-CN')
    },
    {
      label: 'English',
      type: 'radio',
      checked: i18n.getLanguage() === 'en-US',
      click: () => switchLanguage('en-US')
    }
  ]
},
```

- [ ] **Step 6: 添加 switchLanguage 函数**

```javascript
function switchLanguage(lang) {
  if (i18n.setLanguage(lang)) {
    store.set('language', lang);
    updateTrayMenu();
    
    // 通知所有窗口语言已更改
    if (mainWindow) {
      mainWindow.webContents.send('language-changed', {
        language: lang,
        translations: i18n.getTranslations()
      });
    }
    if (settingsWindow) {
      settingsWindow.webContents.send('language-changed', {
        language: lang,
        translations: i18n.getTranslations()
      });
    }
  }
}
```

- [ ] **Step 7: 添加 IPC 接口**

在现有 ipcMain.handle 块之后添加：
```javascript
ipcMain.handle('get-language', () => {
  return {
    language: i18n.getLanguage(),
    translations: i18n.getTranslations()
  };
});

ipcMain.handle('set-language', async (event, lang) => {
  switchLanguage(lang);
  return true;
});

ipcMain.handle('get-translations', () => {
  return i18n.getTranslations();
});
```

- [ ] **Step 8: 在 app.whenReady 中调用 initI18n()**

在 ensureDirectories() 后添加：
```javascript
initI18n();
```

- [ ] **Step 9: Commit**

```bash
git add main.js
git commit -m "feat(i18n): integrate i18n into main process with language switching support"
```

---

### Task 3: 更新 preload.js 暴露 i18n 接口

**Files:**
- Modify: `preload.js`

- [ ] **Step 1: 在暴露的 electronAPI 中添加 i18n 接口**

在 contextBridge.exposeInMainWorld 中添加：
```javascript
getLanguage: () => ipcRenderer.invoke('get-language'),
setLanguage: (lang) => ipcRenderer.invoke('set-language', lang),
getTranslations: () => ipcRenderer.invoke('get-translations'),

onLanguageChanged: (callback) => {
  ipcRenderer.on('language-changed', (event, data) => callback(data));
}
```

- [ ] **Step 2: Commit**

```bash
git add preload.js
git commit -m "feat(i18n): expose i18n APIs to renderer process"
```

---

### Task 4: 更新 src/settings.html 添加语言选择器

**Files:**
- Modify: `src/settings.html`

- [ ] **Step 1: 在通用设置标签页的 toggle-container 中添加语言选择器**

在现有 toggle-container 后添加：
```html
<div class="toggle-container">
    <span class="toggle-label" data-i18n="settings.general.language">语言</span>
    <select id="languageSelect" class="reminder-form-input" style="width: auto; min-width: 120px;">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
    </select>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/settings.html
git commit -m "feat(i18n): add language selector to settings UI"
```

---

### Task 5: 更新 src/settings.js 实现语言切换

**Files:**
- Modify: `src/settings.js`

- [ ] **Step 1: 添加语言相关变量**

在文件顶部添加：
```javascript
let currentLanguage = 'zh-CN';
let translations = {};
```

- [ ] **Step 2: 添加 applyTranslations 函数**

```javascript
function applyTranslations() {
  // 应用翻译到标签页
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.textContent = translations[key];
    }
  });

  // 应用翻译到 placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      el.placeholder = translations[key];
    }
  });

  // 更新标签页标题
  const appearanceTab = document.querySelector('[data-tab="appearance"]');
  const soundsTab = document.querySelector('[data-tab="sounds"]');
  const remindersTab = document.querySelector('[data-tab="reminders"]');
  const generalTab = document.querySelector('[data-tab="general"]');
  
  if (appearanceTab && translations['settings.tabs.appearance']) {
    appearanceTab.textContent = translations['settings.tabs.appearance'];
  }
  if (soundsTab && translations['settings.tabs.sounds']) {
    soundsTab.textContent = translations['settings.tabs.sounds'];
  }
  if (remindersTab && translations['settings.tabs.reminders']) {
    remindersTab.textContent = translations['settings.tabs.reminders'];
  }
  if (generalTab && translations['settings.tabs.general']) {
    generalTab.textContent = translations['settings.tabs.general'];
  }

  // 更新页脚
  const footerText = document.querySelector('.footer-text');
  const footerMade = document.querySelector('.version');
  if (footerText && translations['settings.footer']) {
    footerText.textContent = translations['settings.footer'];
  }
  if (footerMade && translations['settings.footer.madeWith']) {
    footerMade.textContent = translations['settings.footer.madeWith'];
  }

  // 更新其他文本
  updateUITexts();
}
```

- [ ] **Step 3: 添加 updateUITexts 函数**

```javascript
function updateUITexts() {
  // 更新外观设置文本
  const appearanceSection = document.querySelector('#appearance .section-title');
  if (appearanceSection && translations['settings.appearance.current']) {
    appearanceSection.textContent = translations['settings.appearance.current'];
  }

  // 更新音效设置文本
  const soundsTitle = document.querySelector('#sounds .section-title');
  if (soundsTitle && translations['settings.sounds.title']) {
    soundsTitle.textContent = translations['settings.sounds.title'];
  }

  // 更新提醒设置文本
  const remindersTitle = document.querySelector('#reminders .section-title');
  if (remindersTitle && translations['settings.reminders.title']) {
    remindersTitle.textContent = translations['settings.reminders.title'];
  }

  // 更新通用设置文本
  const generalTitle = document.querySelector('#general .section-title');
  if (generalTitle && translations['settings.general.title']) {
    generalTitle.textContent = translations['settings.general.title'];
  }

  // 更新语言选择器选项
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    const options = languageSelect.options;
    options[0].text = '中文';
    options[1].text = 'English';
  }
}
```

- [ ] **Step 4: 在 init 函数中添加语言初始化和监听**

在 loadConfig() 之后添加：
```javascript
// 初始化语言
window.electronAPI.getLanguage().then(data => {
  currentLanguage = data.language;
  translations = data.translations;
  applyTranslations();
  
  // 设置语言选择器的值
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.value = currentLanguage;
  }
});

// 监听语言变化
window.electronAPI.onLanguageChanged((data) => {
  currentLanguage = data.language;
  translations = data.translations;
  applyTranslations();
});
```

- [ ] **Step 5: 添加语言切换事件监听**

添加：
```javascript
// 语言选择器事件
const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
  languageSelect.addEventListener('change', async (e) => {
    const newLang = e.target.value;
    await window.electronAPI.setLanguage(newLang);
  });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/settings.js
git commit -m "feat(i18n): implement language switching in settings"
```

---

### Task 6: 更新 src/renderer.js 支持语言切换

**Files:**
- Modify: `src/renderer.js`

- [ ] **Step 1: 添加语言相关变量**

在文件顶部添加：
```javascript
let translations = {};
```

- [ ] **Step 2: 添加 applyTranslations 函数**

```javascript
function applyTranslations() {
  // 更新语音气泡文本
  const speechBubble = document.getElementById('speechBubble');
  if (speechBubble && translations['pet.bark']) {
    speechBubble.textContent = translations['pet.bark'];
  }
}
```

- [ ] **Step 3: 在 window.electronAPI.onInitConfig 回调中添加语言初始化**

在回调函数中添加：
```javascript
// 初始化语言
window.electronAPI.getLanguage().then(data => {
  translations = data.translations;
  applyTranslations();
});
```

- [ ] **Step 4: 添加语言变化监听**

添加：
```javascript
window.electronAPI.onLanguageChanged((data) => {
  translations = data.translations;
  applyTranslations();
});
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer.js
git commit -m "feat(i18n): support language switching in renderer"
```

---

### Task 7: 测试功能

**Files:**
- Test: `src/i18n/*.js`
- Test: `main.js`
- Test: `src/settings.js`

- [ ] **Step 1: 启动应用测试中文界面**

运行：`npm start`

验证：
- 托盘菜单显示中文
- 设置界面显示中文
- 宠物气泡显示"汪汪！"

- [ ] **Step 2: 测试英文切换**

在设置界面选择"English"

验证：
- 托盘菜单更新为英文
- 设置界面更新为英文
- 宠物气泡显示"Woof woof!"

- [ ] **Step 3: 测试托盘菜单切换语言**

通过托盘菜单切换语言

验证：
- 设置界面和宠物同步更新
- 重启应用后语言设置保持

- [ ] **Step 4: 测试系统语言检测**

临时修改系统语言为英文，重启应用

验证：
- 应用自动检测系统语言
- 默认显示英文界面

- [ ] **Step 5: Commit 最终版本**

```bash
git add .
git commit -m "feat(i18n): complete language switching feature with full test coverage"
```

---

## 实施顺序

1. Task 1: 创建 i18n 目录和翻译文件（基础）
2. Task 2: 更新 main.js 集成 i18n（核心）
3. Task 3: 更新 preload.js 暴露接口（桥梁）
4. Task 4: 更新 src/settings.html 添加 UI（界面）
5. Task 5: 更新 src/settings.js 实现逻辑（功能）
6. Task 6: 更新 src/renderer.js 支持切换（宠物）
7. Task 7: 测试功能（验证）

---

## 验证清单

- [ ] 中文界面正常显示
- [ ] 英文界面正常显示
- [ ] 语言切换功能正常
- [ ] 设置界面和系统托盘都能切换
- [ ] 语言设置持久化保存
- [ ] 重启应用后语言设置保持
- [ ] 系统语言检测功能正常
- [ ] 无控制台错误
- [ ] 所有翻译文本完整无遗漏
