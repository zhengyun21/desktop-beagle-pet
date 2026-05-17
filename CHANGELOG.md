# 变更日志

所有重要的代码修改都将记录在此文件中。

## [未发布版本]

### 修复

- **时间**: 2026-05-17
- **用户要求**: 修复音频文件路径处理的安全隐患及 Windows 路径兼容性问题
- **分析原因及修改意见**:
  - 音频文件和图片文件路径中可能包含特殊字符（如中文、空格等），直接拼接到 file:// URL 可能导致加载失败或安全问题
  - 使用 `encodeURI()` 对路径进行编码，确保特殊字符被正确转义
  - **重要修复**: Windows 路径包含反斜杠 `\`，直接使用 `encodeURI()` 会将 `\` 编码成 `%5C`，导致路径无效
  - 解决方案：先替换反斜杠为正斜杠，再进行 URL 编码
  - 这是一个安全性改进，同时保持对现有功能的完全兼容
- **代码修改前**:
  ```javascript
  // renderer.js
  currentAudio = new Audio(`file://${selectedSound.path}`);
  currentAudio = new Audio(`file://${soundPath}`);
  customPetImage.src = `file://${config.customPetPath}`;
  customPetExcitedImage.src = `file://${config.customPetExcitedPath}`;

  // settings.js
  elements.normalPetPreview.src = `file://${config.customPetPath}`;
  elements.excitedPetPreview.src = `file://${config.customPetExcitedPath}`;
  elements.currentPetImage.src = `file://${config.customPetPath}`;
  playingAudio = new Audio(`file://${soundPath}`);
  ```
- **代码修改后**:
  ```javascript
  // 新增通用函数（renderer.js 和 settings.js）
  function createFileUrl(filePath) {
    if (!filePath) return '';
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `file://${encodeURI(normalizedPath).replace(/#/g, '%23')}`;
  }

  // renderer.js
  currentAudio = new Audio(createFileUrl(selectedSound.path));
  currentAudio = new Audio(createFileUrl(soundPath));
  customPetImage.src = createFileUrl(config.customPetPath);
  customPetExcitedImage.src = createFileUrl(config.customPetExcitedPath);

  // settings.js
  elements.normalPetPreview.src = createFileUrl(config.customPetPath);
  elements.excitedPetPreview.src = createFileUrl(config.customPetExcitedPath);
  elements.currentPetImage.src = createFileUrl(config.customPetPath);
  playingAudio = new Audio(createFileUrl(soundPath));
  ```
- **修改的文件**:
  - `src/renderer.js` - 添加 `createFileUrl` 函数，修复了 4 处音频和图片路径编码问题
  - `src/settings.js` - 添加 `createFileUrl` 函数，修复了 4 处音频和图片路径编码问题
- **技术说明**:
  - `filePath.replace(/\\/g, '/')` - 将 Windows 反斜杠替换为正斜杠
  - `encodeURI(normalizedPath)` - 对路径中的特殊字符进行 URL 编码
  - `.replace(/#/g, '%23')` - 确保井号也被正确编码（encodeURI 不会编码井号）
