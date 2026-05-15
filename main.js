const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const i18n = require('./src/i18n/index.js');

const store = new Store({
    name: 'desktop-pet-config',
    defaults: {
        petPosition: { x: 200, y: 200 },
        customPetEnabled: false,
        customPetPath: '',
        customPetExcitedPath: '',
        customSoundEnabled: false,
        customSounds: [],
        selectedSoundIndex: 0,
        autoStart: false,
        petVisible: true,
        clickSoundCooldown: 500,
        reminders: []
    }
});

let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isQuitting = false;
let reminderTimers = [];

const userDataPath = app.getPath('userData');
const customPetsPath = path.join(userDataPath, 'custom-pets');
const customSoundsPath = path.join(userDataPath, 'custom-sounds');

function ensureDirectories() {
  [customPetsPath, customSoundsPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function updateAutoStart(enabled) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: app.getPath('exe')
  });
}

function cleanupOrphanedResources() {
  const activePetPath = store.get('customPetPath');
  const activeExcitedPetPath = store.get('customPetExcitedPath');
  const activeSoundPaths = new Set(store.get('customSounds') || []);
  
  // 清理宠物图片
  if (fs.existsSync(customPetsPath)) {
    const petFiles = fs.readdirSync(customPetsPath);
    petFiles.forEach(file => {
      const fullPath = path.join(customPetsPath, file);
      if (fullPath !== activePetPath && fullPath !== activeExcitedPetPath) {
        try {
          fs.unlinkSync(fullPath);
          console.log('Cleaned up orphaned pet file:', fullPath);
        } catch (err) {
            console.error('Failed to delete orphaned pet file:', err);
          }
      }
    });
  }
  
  // 清理音效文件
  if (fs.existsSync(customSoundsPath)) {
    const soundFiles = fs.readdirSync(customSoundsPath);
    soundFiles.forEach(file => {
      const fullPath = path.join(customSoundsPath, file);
      if (!activeSoundPaths.has(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log('Cleaned up orphaned sound file:', fullPath);
        } catch (err) {
            console.error('Failed to delete orphaned sound file:', err);
          }
      }
    });
  }
}

function initI18n() {
  const savedLang = store.get('language');
  if (savedLang) {
    i18n.init(savedLang);
  } else {
    // 使用默认值，不立即写入文件
    i18n.init('zh-CN');
  }
}

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

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a'];
const AUDIO_REGEX = /\.(mp3|wav|ogg|m4a)$/i;

function copyPetImageFile(filePath) {
    const fileName = path.basename(filePath);
    const destPath = path.join(customPetsPath, `custom-pet-${Date.now()}${path.extname(fileName)}`);
    fs.copyFileSync(filePath, destPath);
    return { name: fileName, path: destPath, originalPath: filePath };
}

function copySoundFiles(filePaths) {
    const currentSounds = store.get('customSounds');
    const imported = [];
    for (const filePath of filePaths) {
        if (currentSounds.length + imported.length >= 20) break;
        const fileName = path.basename(filePath);
        const destPath = path.join(customSoundsPath, `${Date.now()}-${fileName}`);
        try {
            fs.copyFileSync(filePath, destPath);
            imported.push({ name: fileName, path: destPath, originalPath: filePath });
        } catch (err) {
            console.error('Failed to copy sound file:', err);
        }
    }
    return imported;
}

function deleteFileIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
}

function setPetVisibility(visible) {
    if (mainWindow) {
        visible ? mainWindow.show() : mainWindow.hide();
    }
    store.set('petVisible', visible);
    updateTrayMenu();
}

function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: true,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    mainWindow.once('ready-to-show', () => {
        if (store.get('petVisible')) {
            mainWindow.show();
        }
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
    });

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('init-config', { ...store.store });
    });

    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });
}

function createSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 550,
        height: 500,
        resizable: false,
        frame: true,
        center: true,
        title: '桌面宠物设置',
        icon: getTrayIcon(),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    settingsWindow.loadFile(path.join(__dirname, 'src', 'settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

async function importPetImageFromTray() {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Image Files', extensions: IMAGE_EXTENSIONS }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        try {
            const { path: destPath } = copyPetImageFile(result.filePaths[0]);
            store.set('customPetPath', destPath);
            store.set('customPetEnabled', true);
            if (mainWindow) {
                mainWindow.webContents.send('config-updated', {
                    customPetPath: destPath,
                    customPetEnabled: true
                });
            }
        } catch (err) {
            console.error('Failed to copy pet image:', err);
        }
    }
}

async function importSoundFromTray() {
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Audio Files', extensions: AUDIO_EXTENSIONS }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const imported = copySoundFiles(result.filePaths);
        const allSounds = [...store.get('customSounds'), ...imported.map(f => f.path)];
        store.set('customSounds', allSounds);
        store.set('customSoundEnabled', true);
        if (mainWindow) {
            mainWindow.webContents.send('config-updated', {
                customSounds: allSounds,
                customSoundEnabled: true
            });
        }
    }
}

function resetPetImage() {
    const petPath = store.get('customPetPath');
    const excitedPetPath = store.get('customPetExcitedPath');
    
    if (petPath && fs.existsSync(petPath)) {
        try {
            fs.unlinkSync(petPath);
        } catch (err) {
            console.error('Failed to delete pet image:', err);
        }
    }
    
    if (excitedPetPath && fs.existsSync(excitedPetPath)) {
        try {
            fs.unlinkSync(excitedPetPath);
        } catch (err) {
            console.error('Failed to delete excited pet image:', err);
        }
    }
    
    store.set('customPetPath', '');
    store.set('customPetExcitedPath', '');
    store.set('customPetEnabled', false);
    if (mainWindow) {
        mainWindow.webContents.send('config-updated', {
            customPetPath: '',
            customPetExcitedPath: '',
            customPetEnabled: false
        });
    }
    updateTrayMenu();
}

let cachedTrayIcon = null;

function getTrayIcon() {
    if (cachedTrayIcon) return cachedTrayIcon;

    const customIconPath = path.join(__dirname, 'assets', 'bg3.png');
    let trayIcon;

    if (fs.existsSync(customIconPath)) {
        trayIcon = nativeImage.createFromPath(customIconPath).resize({ width: 16, height: 16 });
    } else {
        const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
        if (fs.existsSync(iconPath)) {
            trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
        }
    }

    if (!trayIcon || trayIcon.isEmpty()) {
        trayIcon = nativeImage.createFromBuffer(
            Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEaSURBVDiNpZM9SwNBEIafvdxdQqIEwUJBsLCwsLGwsLCwtv4CW1v7C2xtbW1tbYKFYGMjFhYW/gJBsLCwIFhY+P0xs3t3l0sOLhQHZndn3jzPzOwC/jecc0QimfV+n/MkW1paIpPJIM8k6fV6TE9Pk8/nSafTlEslSqUSuVyOdDqN1prZ2VnK5TL1ep12u02z2aTRaGCMwTlHq9XC931836der+N5Hr7vU6lUqNfrNBoN6vU6jUaDZDKJ1hprDdZaAFprjDFYa9Fad79N0zQdYzDGkE6naTab7O3tkU6naTab1Go1qtUqhUKBarVKKpVC9/33C8AYQ7VaJZ1Ok0wmcV0Xa4wxOI6D4zjdx0IIlFKEh4j/IuJbK8uy7uO5cPjwYaLRKEoplFKEQiHCMIQQIgghUErxK0VR1F1cK8Y/B7j2b4q/hwH/hx8P9Jf8C3rK3e/3q1J4AAAAAElFTkSuQmCC', 'base64')
        );
    }

    cachedTrayIcon = trayIcon;
    return trayIcon;
}

function buildTrayMenu() {
    return Menu.buildFromTemplate([
        {
            label: store.get('petVisible') ? i18n.t('tray.hide') : i18n.t('tray.show'),
            click: () => {
                setPetVisibility(!store.get('petVisible'));
            }
        },
        { type: 'separator' },
        {
            label: i18n.t('tray.appearance'),
            submenu: [
                {
                    label: i18n.t('tray.importAppearance'),
                    click: () => importPetImageFromTray()
                },
                {
                    label: i18n.t('tray.resetAppearance'),
                    enabled: store.get('customPetEnabled'),
                    click: () => resetPetImage()
                }
            ]
        },
        {
            label: i18n.t('tray.sounds'),
            submenu: [
                {
                    label: i18n.t('tray.importSound'),
                    click: () => importSoundFromTray()
                },
                {
                    label: i18n.t('tray.enableCustomSound'),
                    type: 'checkbox',
                    checked: store.get('customSoundEnabled'),
                    click: (item) => {
                        store.set('customSoundEnabled', item.checked);
                        if (mainWindow) {
                            mainWindow.webContents.send('config-updated', {
                                customSoundEnabled: item.checked
                            });
                        }
                    }
                }
            ]
        },
        { type: 'separator' },
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
        {
            label: i18n.t('tray.settings'),
            click: () => createSettingsWindow()
        },
        {
            label: i18n.t('tray.quit'),
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]);
}

function updateTrayMenu() {
    if (tray) {
        tray.setContextMenu(buildTrayMenu());
    }
}

function createTray() {
    tray = new Tray(getTrayIcon());
    tray.setToolTip(i18n.t('tray.tooltip'));
    updateTrayMenu();

    tray.on('double-click', () => {
        setPetVisibility(!store.get('petVisible'));
    });
}

ipcMain.handle('get-config', () => {
    return { ...store.store };
});

ipcMain.handle('save-config', (event, config) => {
    Object.entries(config).forEach(([key, value]) => {
        store.set(key, value);
    });
    if (mainWindow) {
        mainWindow.webContents.send('config-updated', config);
    }
    if (settingsWindow) {
        settingsWindow.webContents.send('config-updated', config);
    }
    return true;
});

ipcMain.handle('get-pet-position', () => {
    return store.get('petPosition');
});

ipcMain.handle('save-pet-position', (event, position) => {
    store.set('petPosition', position);
    return true;
});

ipcMain.handle('show-settings', () => {
    createSettingsWindow();
    return true;
});

ipcMain.handle('select-sound-file', async () => {
    const result = await dialog.showOpenDialog(settingsWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Audio Files', extensions: AUDIO_EXTENSIONS }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return copySoundFiles(result.filePaths);
    }

    return [];
});

ipcMain.handle('select-pet-image', async () => {
    const result = await dialog.showOpenDialog(settingsWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Image Files', extensions: IMAGE_EXTENSIONS }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        try {
            return copyPetImageFile(result.filePaths[0]);
        } catch (err) {
            console.error('Failed to copy pet image:', err);
            return null;
        }
    }

    return null;
});

function handleDeleteFile(event, filePath) {
    try {
        return deleteFileIfExists(filePath);
    } catch (err) {
        console.error('Failed to delete file:', err);
        return false;
    }
}

ipcMain.handle('delete-sound', handleDeleteFile);
ipcMain.handle('delete-pet-image', handleDeleteFile);

ipcMain.handle('get-custom-sounds', () => {
    if (!fs.existsSync(customSoundsPath)) {
        return [];
    }
    return fs.readdirSync(customSoundsPath)
        .filter(f => AUDIO_REGEX.test(f))
        .map(f => ({
            name: f,
            path: path.join(customSoundsPath, f)
        }));
});

ipcMain.handle('get-custom-pet-image', () => {
    const petPath = store.get('customPetPath');
    if (petPath && fs.existsSync(petPath)) {
        return petPath;
    }
    return null;
});

ipcMain.handle('hide-pet', () => {
    setPetVisibility(false);
    return true;
});

ipcMain.handle('show-pet', () => {
    setPetVisibility(true);
    return true;
});

ipcMain.handle('import-pet-image', async () => {
    await importPetImageFromTray();
    return true;
});

ipcMain.handle('import-sound', async () => {
    await importSoundFromTray();
    return true;
});

ipcMain.handle('reset-pet-image', () => {
    resetPetImage();
    return true;
});

ipcMain.handle('play-sound', (event, soundPath) => {
    mainWindow?.webContents.send('play-sound-from-main', soundPath);
    return true;
});

ipcMain.handle('set-ignore-mouse-events', (event, ignore) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
  return true;
});

ipcMain.handle('update-auto-start', async (event, enabled) => {
  updateAutoStart(enabled);
  store.set('autoStart', enabled);
  return true;
});

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

function clearAllReminderTimers() {
    reminderTimers.forEach(timer => clearTimeout(timer));
    reminderTimers = [];
}

function scheduleReminder(reminder) {
    if (!reminder.enabled) return;

    const now = new Date();
    const [hours, minutes] = reminder.time.split(':').map(Number);
    
    let nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);
    
    if (nextTime <= now) {
        nextTime.setDate(nextTime.getDate() + 1);
    }
    
    const delay = nextTime.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
        triggerReminder(reminder);
        
        if (reminder.repeat === 'daily') {
            scheduleReminder(reminder);
        }
    }, delay);
    
    reminderTimers.push(timer);
}

function triggerReminder(reminder) {
    if (mainWindow) {
        mainWindow.webContents.send('reminder-triggered', reminder);
    }
}

function loadReminders() {
    clearAllReminderTimers();
    const reminders = store.get('reminders') || [];
    
    reminders.forEach(reminder => {
        if (reminder.enabled) {
            scheduleReminder(reminder);
        }
    });
}

ipcMain.handle('get-reminders', () => {
    return store.get('reminders');
});

ipcMain.handle('save-reminder', (event, reminder) => {
    const reminders = store.get('reminders');
    
    if (reminder.id) {
        const index = reminders.findIndex(r => r.id === reminder.id);
        if (index !== -1) {
            reminders[index] = reminder;
        }
    } else {
        reminder.id = Date.now().toString();
        reminders.push(reminder);
    }
    
    store.set('reminders', reminders);
    loadReminders();
    
    return true;
});

ipcMain.handle('delete-reminder', (event, reminderId) => {
    const reminders = store.get('reminders');
    const filtered = reminders.filter(r => r.id !== reminderId);
    store.set('reminders', filtered);
    loadReminders();
    return true;
});

ipcMain.handle('update-reminder-enabled', (event, { id, enabled }) => {
    const reminders = store.get('reminders');
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        reminder.enabled = enabled;
        store.set('reminders', reminders);
        loadReminders();
    }
    return true;
});

app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu-sandbox');

app.whenReady().then(() => {
    ensureDirectories();
    initI18n();
    createMainWindow();
    createTray();
    loadReminders();
    
    // 初始化开机自启动
    updateAutoStart(store.get('autoStart'));
    
    // 清理孤立资源
    cleanupOrphanedResources();
});

app.on('window-all-closed', (e) => {
    e.preventDefault();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
