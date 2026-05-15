
# 桌面宠物 - 比格犬 / Desktop Beagle Pet

[![GitHub stars](https://img.shields.io/github/stars/zhengyun21/desktop-beagle-pet?style=social)](https://github.com/zhengyun21/desktop-beagle-pet/stargazers)

## 🌍 选择语言 / Choose Language

- [中文](#中文)
- [English](#english)

---

## 中文

## 🐶 项目简介

可爱的桌面宠物应用，支持自定义外观和音效！

## 📋 系统要求

- Windows 10 或更高版本
- Node.js 16.x 或更高版本

## 🚀 快速开始

### 方法一：一键启动（推荐）

直接双击运行 **`启动.bat`**！

脚本会自动：
1. 检查 Node.js 是否安装
2. 安装依赖包（首次运行）
3. 创建图标素材
4. 启动桌面宠物

### 方法二：手动安装

```bash
# 1. 进入项目目录
cd d:\Maven\desktop-dog-pet

# 2. 安装依赖
npm install

# 3. 启动应用
npm start
```

## 📦 功能介绍

| 功能 | 说明 |
|------|------|
| **拖拽移动** | 鼠标按住宠物拖拽到任意位置 |
| **点击叫唤** | 单击宠物播放声音 + 兴奋表情 |
| **自定义音效** | 导入 MP3/WAV/OGG/M4A，随机播放 |
| **自定义外观** | 导入 PNG/GIF/WebP 替换默认比格犬 |
| **系统托盘** | 后台运行，右键菜单管理 |
| **双击设置** | 快速打开设置界面 |

## 🔧 自定义宠物

### 1. 自定义外观
- 双击宠物 → 「外观设置」
- 导入图片（推荐 PNG/GIF/WebP）
- 支持 GIF 动画！

### 2. 自定义音效
- 双击宠物 → 「音效设置」
- 点击「添加音效」导入音频文件
- 可以导入多个，点击时随机播放

## 📁 项目结构

```
desktop-dog-pet/
├── 启动.bat           # 一键启动脚本
├── main.js            # 主进程（Electron）
├── preload.js         # 安全桥接脚本
├── package.json       # 项目配置
├── assets/            # 素材文件夹
│   └── create-icons.js # 图标生成脚本
└── src/
    ├── index.html     # 宠物主窗口
    ├── renderer.js    # 宠物交互逻辑
    ├── settings.html  # 设置界面
    └── settings.js    # 设置逻辑
```

## ⚠️ 常见问题

### Q: 提示 `'electron' 不是内部命令`
A: 运行 `npm install` 安装依赖，或直接双击 `启动.bat`

### Q: 提示未检测到 Node.js
A: 请先下载安装 Node.js LTS 版本：https://nodejs.org/

### Q: 如何打包成 EXE 文件？
A: 运行 `npm run build`，生成的 EXE 在 `dist/` 目录

### Q: 宠物看不见？
A: 检查系统托盘（右下角），双击图标显示/隐藏

## 📝 开发说明

### 启动开发模式
```bash
npm start
```

### 打包成安装程序
```bash
npm run build
```

### 只打包（不打包成安装程序）
```bash
npm run pack
```

## 👋 退出应用

1. 在系统托盘右键点击「桌面宠物」图标
2. 选择「退出」

---

## English

## 🐶 Project Introduction

A cute desktop pet application with customizable appearance and sound effects!

## 📋 System Requirements

- Windows 10 or later
- Node.js 16.x or later

## 🚀 Quick Start

### Method 1: One-click Launch (Recommended)

Just double-click **`启动.bat`**!

The script will automatically:
1. Check if Node.js is installed
2. Install dependencies (first run)
3. Create icon assets
4. Launch the desktop pet

### Method 2: Manual Installation

```bash
# 1. Navigate to project directory
cd d:\Maven\desktop-dog-pet

# 2. Install dependencies
npm install

# 3. Start the application
npm start
```

## 📦 Features

| Feature | Description |
|---------|-------------|
| **Drag to Move** | Hold and drag the pet anywhere on screen |
| **Click to Bark** | Click the pet to play sound + excited animation |
| **Custom Sounds** | Import MP3/WAV/OGG/M4A, plays randomly |
| **Custom Appearance** | Import PNG/GIF/WebP to replace default beagle |
| **System Tray** | Runs in background, manage via right-click menu |
| **Double-click Settings** | Quick access to settings panel |

## 🔧 Customize Your Pet

### 1. Custom Appearance
- Double-click pet → 「Appearance Settings」
- Import images (PNG/GIF/WebP recommended)
- Supports GIF animations!

### 2. Custom Sounds
- Double-click pet → 「Sound Settings」
- Click 「Add Sound」 to import audio files
- Import multiple, plays randomly on click

## 📁 Project Structure

```
desktop-dog-pet/
├── 启动.bat           # One-click launch script
├── main.js            # Main process (Electron)
├── preload.js         # Security bridge script
├── package.json       # Project config
├── assets/            # Assets folder
│   └── create-icons.js # Icon generation script
└── src/
    ├── index.html     # Pet main window
    ├── renderer.js    # Pet interaction logic
    ├── settings.html  # Settings interface
    └── settings.js    # Settings logic
```

## ⚠️ FAQ

### Q: Error `'electron' is not recognized`
A: Run `npm install` to install dependencies, or just double-click `启动.bat`

### Q: Node.js not detected
A: Download and install Node.js LTS: https://nodejs.org/

### Q: How to build EXE file?
A: Run `npm run build`, EXE will be in `dist/` directory

### Q: Pet not visible?
A: Check system tray (bottom-right), double-click icon to show/hide

## 📝 Development Guide

### Start Development Mode
```bash
npm start
```

### Build Installer
```bash
npm run build
```

### Package Only (No Installer)
```bash
npm run pack
```

## 👋 Exit Application

1. Right-click the 「Desktop Pet」 icon in system tray
2. Select 「Exit」

---

Enjoy! 🐾

---

[![GitHub stars](https://img.shields.io/github/stars/zhengyun21/desktop-beagle-pet?style=social)](https://github.com/zhengyun21/desktop-beagle-pet/stargazers)

