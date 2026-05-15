const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    getPetPosition: () => ipcRenderer.invoke('get-pet-position'),
    savePetPosition: (position) => ipcRenderer.invoke('save-pet-position', position),
    showSettings: () => ipcRenderer.invoke('show-settings'),
    selectSoundFile: () => ipcRenderer.invoke('select-sound-file'),
    selectPetImage: () => ipcRenderer.invoke('select-pet-image'),
    deleteSound: (filePath) => ipcRenderer.invoke('delete-sound', filePath),
    deletePetImage: (filePath) => ipcRenderer.invoke('delete-pet-image', filePath),
    getCustomSounds: () => ipcRenderer.invoke('get-custom-sounds'),
    getCustomPetImage: () => ipcRenderer.invoke('get-custom-pet-image'),
    hidePet: () => ipcRenderer.invoke('hide-pet'),
    showPet: () => ipcRenderer.invoke('show-pet'),
    playSound: (soundPath) => ipcRenderer.invoke('play-sound', soundPath),
    setIgnoreMouseEvents: (ignore) => ipcRenderer.invoke('set-ignore-mouse-events', ignore),
    updateAutoStart: (enabled) => ipcRenderer.invoke('update-auto-start', enabled),
    
    getLanguage: () => ipcRenderer.invoke('get-language'),
    setLanguage: (lang) => ipcRenderer.invoke('set-language', lang),
    getTranslations: () => ipcRenderer.invoke('get-translations'),
    
    getReminders: () => ipcRenderer.invoke('get-reminders'),
    saveReminder: (reminder) => ipcRenderer.invoke('save-reminder', reminder),
    deleteReminder: (reminderId) => ipcRenderer.invoke('delete-reminder', reminderId),
    updateReminderEnabled: ({ id, enabled }) => ipcRenderer.invoke('update-reminder-enabled', { id, enabled }),

    onInitConfig: (callback) => {
        ipcRenderer.on('init-config', (event, config) => callback(config));
    },
    onConfigUpdated: (callback) => {
        ipcRenderer.on('config-updated', (event, config) => callback(config));
    },
    onPlaySoundFromMain: (callback) => {
        ipcRenderer.on('play-sound-from-main', (event, soundPath) => callback(soundPath));
    },
    onReminderTriggered: (callback) => {
        ipcRenderer.on('reminder-triggered', (event, reminder) => callback(reminder));
    },
    onLanguageChanged: (callback) => {
        ipcRenderer.on('language-changed', (event, data) => callback(data));
    }
});
