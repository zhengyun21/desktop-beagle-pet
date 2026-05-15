# 中英文语言切换功能设计文档

## 1. 概述

### 1.1 项目背景
桌面宠物应用需要支持中英文语言切换功能，以满足不同语言用户的需求。

### 1.2 目标
- 实现中英文双向切换
- 根据系统语言自动选择默认语言
- 提供在设置界面和系统托盘的切换入口
- 语言设置持久化保存
- 架构可扩展，支持未来添加更多语言

## 2. 系统架构

### 2.1 文件结构
```
desktop-dog-pet/
├── src/
│   └── i18n/
│       ├── index.js          # i18n 核心逻辑
│       ├── zh-CN.js          # 中文翻译文件
│       └── en-US.js          # 英文翻译文件
├── main.js                   # 更新以支持语言切换
├── preload.js                # 添加 i18n 相关接口
└── src/
    ├── renderer.js           # 添加语言切换逻辑
    ├── settings.html         # 添加语言切换器 UI
    └── settings.js           # 实现语言切换功能
```

### 2.2 组件说明

| 组件 | 位置 | 职责 |
|------|------|------|
| i18n 核心模块 | src/i18n/index.js | 管理语言、加载翻译、提供翻译函数 |
| 中文翻译 | src/i18n/zh-CN.js | 包含所有中文文本 |
| 英文翻译 | src/i18n/en-US.js | 包含所有英文文本 |
| 主进程集成 | main.js | 初始化语言、管理托盘菜单、提供 IPC 接口 |
| 设置界面 | src/settings.html | 添加语言选择器 UI |
| 渲染进程 | preload.js, src/renderer.js, src/settings.js | 实现界面切换逻辑 |

## 3. 数据设计

### 3.1 翻译文件结构
翻译文件采用标准的 key-value 结构：

```javascript
// src/i18n/zh-CN.js
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
  
  // 设置界面
  "settings.title": "桌面宠物设置",
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
  "settings.sounds.soundType": "格式",
  
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
  "settings.reminders.icon": "⏰",
  
  // 通用设置
  "settings.general.title": "常规选项",
  "settings.general.autoStart": "开机自动启动",
  "settings.general.showPet": "显示宠物",
  "settings.general.language": "语言",
  "settings.general.Chinese": "中文",
  "settings.general.English": "English",
  "settings.general.shortcuts": "快捷操作",
  "settings.general.shortcut1": "• 拖拽移动：按住宠物拖动",
  "settings.general.shortcut2": "• 点击叫唤：单击宠物播放声音",
  "settings.general.shortcut3": "• 打开设置：双击宠物",
  "settings.general.shortcut4": "• 显示/隐藏：双击托盘图标",
  
  // 页脚
  "settings.footer": "桌面宠物 v1.0.0",
  "settings.footer.madeWith": "Made with ❤️",
  
  // 宠物界面
  "pet.bark": "汪汪！",
  
  // 提醒触发
  "reminder.triggered": "提醒！"
};
```

### 3.2 配置存储
使用现有的 electron-store 存储语言设置：
```javascript
{
  "language": "zh-CN" // 或 "en-US"
}
```

## 4. 功能设计

### 4.1 i18n 核心模块 (src/i18n/index.js)

**主要功能：**
- 初始化语言（基于系统语言或用户配置）
- 加载对应的翻译文件
- 提供翻译函数 `t(key)`
- 提供语言切换函数 `setLanguage(lang)`
- 提供获取当前语言函数 `getLanguage()`

**接口设计：**
```javascript
const i18n = {
  currentLang: 'zh-CN',
  translations: {},
  
  init(defaultLang) { /* ... */ },
  t(key) { /* ... */ },
  setLanguage(lang) { /* ... */ },
  getLanguage() { /* ... */ },
  getSystemLanguage() { /* ... */ }
};
```

### 4.2 主进程集成 (main.js)

**主要更新：**
- 在应用启动时初始化 i18n
- 系统托盘菜单使用翻译后的文本
- 提供 IPC 接口：
  - `get-language` - 获取当前语言
  - `set-language` - 设置语言
  - `get-translations` - 获取所有翻译

- 语言变化时通知所有渲染进程

### 4.3 设置界面更新 (src/settings.html)

**新增 UI：**
在“通用设置”标签页添加语言选择器：
```html
<div class="toggle-container">
    <span class="toggle-label" data-i18n="settings.general.language">语言</span>
    <select id="languageSelect" class="reminder-form-input" style="width: auto; min-width: 120px;">
        <option value="zh-CN" data-i18n="settings.general.Chinese">中文</option>
        <option value="en-US" data-i18n="settings.general.English">English</option>
    </select>
</div>
```

### 4.4 渲染进程逻辑

**preload.js：**
暴露 i18n 相关接口给渲染进程

**src/renderer.js：**
- 监听语言变化事件
- 更新语音气泡文本

**src/settings.js：**
- 实现语言选择器功能
- 语言切换时更新整个设置界面

## 5. 数据流程

### 5.1 应用启动流程
```
1. 应用启动
   ↓
2. 检查 electron-store 中的语言配置
   ↓
3. 若无配置，检测系统语言
   ↓
4. 初始化 i18n，加载对应翻译
   ↓
5. 创建托盘菜单和窗口（使用翻译）
   ↓
6. 通知渲染进程当前语言
```

### 5.2 语言切换流程
```
1. 用户在设置界面选择语言
   ↓
2. 调用 IPC 接口 set-language
   ↓
3. 主进程更新配置和 i18n
   ↓
4. 重建托盘菜单
   ↓
5. 向所有窗口发送 language-changed 事件
   ↓
6. 各渲染进程更新 UI
```

## 6. 实现任务清单

1. 创建 i18n 目录和翻译文件
2. 实现 i18n 核心模块
3. 更新 main.js 集成 i18n
4. 更新 preload.js 暴露接口
5. 更新 src/renderer.js 支持语言切换
6. 更新 src/settings.html 添加语言选择器
7. 更新 src/settings.js 实现切换功能
8. 测试功能

## 7. 未来扩展

此架构支持未来轻松添加更多语言，只需：
1. 在 src/i18n/ 下添加新的翻译文件（如 ja-JP.js）
2. 在 settings.html 的下拉菜单中添加新选项
3. 在 i18n 核心模块中添加新语言支持
