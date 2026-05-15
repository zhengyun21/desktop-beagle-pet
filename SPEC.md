# 比格犬桌面宠物 - Windows 应用设计规范

## 1. 产品概念

一款轻量级的 Windows 桌面宠物应用，以卡通比格犬为默认形象，支持用户完全自定义宠物外观和音效，打造专属的桌面陪伴体验。

## 2. 核心功能

### 2.1 基础交互
- **拖拽移动**: 鼠标拖拽宠物在桌面自由移动，带弹性跟随效果
- **点击叫唤**: 单击宠物播放音效 + 触发表情动画
- **待机动画**: 呼吸起伏、尾巴摇摆、眨眼等自然动作

### 2.2 自定义功能
- **自定义音效**: 
  - 支持导入 MP3/WAV/OGG 格式音频
  - 每次点击随机播放一个导入的音效
  - 提供默认犬吠音效
  - 支持试听、删除、添加多个音效

- **自定义外观**:
  - 支持导入 PNG/GIF/WebP 格式图片
  - 图片作为宠物层叠显示
  - 可导入多帧组成动画
  - 提供默认比格犬 SVG 外观

### 2.3 系统集成
- **系统托盘**: 后台运行，右键菜单（显示/隐藏、设置、退出）
- **开机自启**: 可选功能
- **窗口透明**: 无边框透明窗口，鼠标穿透空白区域

## 3. 技术架构

### 技术栈
- **框架**: Electron 28+
- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **构建**: electron-builder
- **存储**: electron-store (用户配置、本地素材)

### 项目结构
```
desktop-pet/
├── package.json           # 项目配置
├── main.js               # Electron 主进程
├── preload.js            # 预加载脚本（安全桥接）
├── src/
│   ├── index.html        # 主窗口页面
│   ├── styles.css        # 样式文件
│   ├── renderer.js      # 渲染进程逻辑
│   ├── pet-engine.js     # 宠物核心引擎
│   ├── settings.html     # 设置页面
│   └── settings.js       # 设置逻辑
├── assets/
│   ├── default-pet.svg   # 默认宠物外观
│   ├── default-sound.mp3 # 默认音效
│   └── icon.ico          # 应用图标
└── build/                # 构建输出
```

## 4. 数据存储

### 用户数据目录
```
%APPDATA%/desktop-pet/
├── config.json           # 用户配置
├── custom-pets/          # 自定义宠物图片
│   ├── frame1.png
│   ├── frame2.gif
│   └── ...
├── custom-sounds/        # 自定义音效
│   ├── bark1.mp3
│   ├── bark2.wav
│   └── ...
└── logs/                 # 日志文件
```

### 配置项
```json
{
  "petPosition": { "x": 100, "y": 100 },
  "customPetEnabled": false,
  "customPetFrames": [],
  "customSoundEnabled": false,
  "customSounds": [],
  "autoStart": false,
  "petVisible": true,
  "clickSoundCooldown": 500
}
```

## 5. UI/UX 设计

### 5.1 主窗口
- **尺寸**: 全屏透明覆盖层
- **特性**: 无边框、背景透明、鼠标穿透、置顶显示
- **宠物容器**: 绝对定位，响应所有鼠标事件

### 5.2 设置界面
- **触发**: 双击宠物 或 右键菜单"设置"
- **样式**: 独立窗口，居中显示
- **布局**: 标签页切换（外观/音效/通用）

### 5.3 系统托盘
- **图标**: 宠物头像缩略图
- **菜单项**: 
  - 显示/隐藏宠物
  - 设置
  - 分隔线
  - 退出

## 6. 组件清单

| 组件 | 功能 | 状态 |
|------|------|------|
| PetEngine | 宠物渲染、动画控制、碰撞检测 | 核心引擎 |
| DragController | 拖拽逻辑、边界约束、惯性 | 交互控制 |
| SoundManager | 音效加载、播放、列表管理 | 音频控制 |
| PetLoader | 自定义外观加载、多帧解析 | 资源管理 |
| SettingsPanel | 配置界面、导入导出 | UI 界面 |
| TrayManager | 托盘图标、菜单、事件 | 系统集成 |
| ConfigStore | 配置读写、数据持久化 | 数据层 |

## 7. 动画系统

### 待机动画
- 呼吸: scaleY 1.0 → 1.02, 3s循环
- 尾巴: rotate -10° → 10°, 0.5s循环
- 眨眼: scaleY 1 → 0.1, 4s随机触发
- 耳朵: translateY 0 → -3px, 2s循环

### 交互动画
- 点击兴奋: scale 1 → 1.1 → 1, 0.3s
- 拖拽跟随: translate 弹性插值, 0.15 缓动系数
- 飘出爱心: translateY -60px + scale 1, 1s

## 8. 音效方案

### 默认音效
- 内置 Web Audio API 合成的犬吠声
- 时长: 0.3s × 3连发

### 自定义音效
- 支持格式: MP3, WAV, OGG
- 最大文件: 5MB
- 最多数量: 20个
- 存储位置: %APPDATA%/desktop-pet/custom-sounds/

## 9. 自定义外观方案

### 默认外观
- 内联 SVG 比格犬矢量图
- 多层结构支持动画控制

### 自定义图片
- 支持格式: PNG, GIF, WebP
- 最大尺寸: 512×512
- 多帧支持: 自动解析 GIF/WebP 帧
- 存储位置: %APPDATA%/desktop-pet/custom-pets/
- 替换模式: 直接覆盖默认外观

## 10. 窗口配置

### 主窗口
```javascript
{
  frame: false,
  transparent: true,
  alwaysOnTop: true,
  skipTaskbar: true,
  resizable: false,
  width: screen.width,
  height: screen.height,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: './preload.js'
  }
}
```

### 设置窗口
```javascript
{
  parent: null,  // 无父窗口，独立显示
  modal: false,
  width: 500,
  height: 400,
  resizable: false,
  frame: true,
  center: true
}
```
