let config = {
    customPetEnabled: false,
    customPetPath: '',
    customPetExcitedPath: '',
    customSoundEnabled: false,
    customSounds: [],
    selectedSoundIndex: 0,
    autoStart: false,
    petVisible: true,
    reminders: []
};

let customSounds = [];
let reminders = [];
let playingAudio = null;
let editingReminder = null;

// 语言相关
let currentLanguage = 'zh-CN';
let translations = {};

const elements = {
    tabs: document.querySelectorAll('.tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    currentPetImage: document.getElementById('currentPetImage'),
    currentPetPlaceholder: document.getElementById('currentPetPlaceholder'),
    currentPetName: document.getElementById('currentPetName'),
    currentPetType: document.getElementById('currentPetType'),
    importNormalPetBtn: document.getElementById('importNormalPetBtn'),
    importExcitedPetBtn: document.getElementById('importExcitedPetBtn'),
    normalPetPreview: document.getElementById('normalPetPreview'),
    excitedPetPreview: document.getElementById('excitedPetPreview'),
    normalPetPlaceholder: document.getElementById('normalPetPlaceholder'),
    excitedPetPlaceholder: document.getElementById('excitedPetPlaceholder'),
    resetPetBtn: document.getElementById('resetPetBtn'),
    customSoundToggle: document.getElementById('customSoundToggle'),
    soundList: document.getElementById('soundList'),
    soundEmptyState: document.getElementById('soundEmptyState'),
    importSoundBtn: document.getElementById('importSoundBtn'),
    addSoundBtn: document.getElementById('addSoundBtn'),
    autoStartToggle: document.getElementById('autoStartToggle'),
    petVisibleToggle: document.getElementById('petVisibleToggle'),
    languageSelect: document.getElementById('languageSelect'),
    
    reminderList: document.getElementById('reminderList'),
    reminderEmptyState: document.getElementById('reminderEmptyState'),
    addReminderBtn: document.getElementById('addReminderBtn'),
    addReminderBtn2: document.getElementById('addReminderBtn2'),
    reminderModal: document.getElementById('reminderModal'),
    reminderModalTitle: document.getElementById('reminderModalTitle'),
    reminderTitle: document.getElementById('reminderTitle'),
    reminderTime: document.getElementById('reminderTime'),
    reminderRepeat: document.getElementById('reminderRepeat'),
    reminderCancelBtn: document.getElementById('reminderCancelBtn'),
    reminderSaveBtn: document.getElementById('reminderSaveBtn')
};

function initTabs() {
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.tabs.forEach(t => t.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// 语言相关函数
function applyTranslations() {
    // 应用翻译到 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
            el.textContent = translations[key];
        }
    });

    // 更新其他文本
    updateUITexts();
}

function updateUITexts() {
    // 更新宠物显示文本
    if (!config.customPetEnabled) {
        if (translations['settings.appearance.defaultName']) {
            elements.currentPetName.textContent = translations['settings.appearance.defaultName'];
        }
        if (translations['settings.appearance.defaultType']) {
            elements.currentPetType.textContent = translations['settings.appearance.defaultType'];
        }
    }

    // 更新提醒列表中的文本
    renderReminderList();
    renderSoundList();
}

async function changeLanguage(lang) {
    if (lang !== currentLanguage) {
        currentLanguage = lang;
        await window.electronAPI.setLanguage(lang);
    }
}

// 监听语言变化
function initLanguageListener() {
    window.electronAPI.onLanguageChanged((data) => {
        currentLanguage = data.language;
        translations = data.translations;
        
        // 更新语言选择器
        if (elements.languageSelect) {
            elements.languageSelect.value = currentLanguage;
        }
        
        applyTranslations();
    });
}

// 初始化语言
async function initLanguage() {
    const data = await window.electronAPI.getLanguage();
    currentLanguage = data.language;
    translations = data.translations;
    
    // 设置语言选择器
    if (elements.languageSelect) {
        elements.languageSelect.value = currentLanguage;
    }
    
    applyTranslations();
}

function updatePetDisplay() {
    // 更新预览图
    if (config.customPetPath) {
        elements.normalPetPreview.src = `file://${config.customPetPath}`;
        elements.normalPetPreview.style.display = 'block';
        elements.normalPetPlaceholder.style.display = 'none';
    } else {
        elements.normalPetPreview.style.display = 'none';
        elements.normalPetPlaceholder.style.display = 'flex';
    }
    
    if (config.customPetExcitedPath) {
        elements.excitedPetPreview.src = `file://${config.customPetExcitedPath}`;
        elements.excitedPetPreview.style.display = 'block';
        elements.excitedPetPlaceholder.style.display = 'none';
    } else {
        elements.excitedPetPreview.style.display = 'none';
        elements.excitedPetPlaceholder.style.display = 'flex';
    }
    
    // 更新当前宠物显示
    if (config.customPetEnabled && config.customPetPath) {
        elements.currentPetImage.src = `file://${config.customPetPath}`;
        elements.currentPetImage.style.display = 'block';
        elements.currentPetPlaceholder.style.display = 'none';

        const fileName = config.customPetPath.split(/[/\\]/).pop();
        const ext = config.customPetPath.toLowerCase();

        elements.currentPetName.textContent = fileName;
        elements.currentPetType.textContent = ext.endsWith('.gif') 
            ? (translations['settings.appearance.gifType'] || 'GIF动画') 
            : (translations['settings.appearance.customType'] || '自定义图片');
        elements.resetPetBtn.style.display = 'inline-flex';
    } else {
        elements.currentPetImage.style.display = 'none';
        elements.currentPetPlaceholder.style.display = 'flex';
        elements.currentPetName.textContent = translations['settings.appearance.defaultName'] || '默认比格犬';
        elements.currentPetType.textContent = translations['settings.appearance.defaultType'] || '内置SVG';
        elements.resetPetBtn.style.display = 'none';
    }
}

function renderSoundList() {
    if (customSounds.length === 0) {
        elements.soundList.innerHTML = '';
        elements.soundList.appendChild(elements.soundEmptyState);
        return;
    }

    elements.soundList.innerHTML = '';

    customSounds.forEach((sound, index) => {
        const item = document.createElement('div');
        item.className = 'sound-item';
        item.dataset.index = index;
        if (index === config.selectedSoundIndex) {
            item.classList.add('selected');
        }

        const fileName = sound.name || sound.path.split(/[/\\]/).pop();
        const ext = fileName.split('.').pop().toUpperCase();
        const playText = translations['settings.sounds.play'] || '播放';
        const selectText = index === config.selectedSoundIndex ? (translations['settings.sounds.selected'] || '默认') : (translations['settings.sounds.select'] || '设为默认');
        const deleteText = translations['settings.sounds.delete'] || '删除';
        const soundTypeText = translations['settings.sounds.soundType'] ? `${ext} ${translations['settings.sounds.soundType']}` : `${ext} 格式`;

        item.innerHTML = `
            <div class="sound-icon">🔊</div>
            <div class="sound-info">
                <div class="sound-name">${fileName}</div>
                <div class="sound-type">${soundTypeText}</div>
            </div>
            <div class="sound-actions">
                <button class="btn btn-secondary btn-small play-btn">${playText}</button>
                <button class="btn btn-primary btn-small select-btn">${selectText}</button>
                <button class="btn btn-danger btn-small delete-btn">${deleteText}</button>
            </div>
        `;

        const playBtn = item.querySelector('.play-btn');
        const selectBtn = item.querySelector('.select-btn');
        const deleteBtn = item.querySelector('.delete-btn');

        playBtn.addEventListener('click', () => playSound(sound.path, item));
        selectBtn.addEventListener('click', () => selectSound(index));
        deleteBtn.addEventListener('click', () => deleteSound(index));

        elements.soundList.appendChild(item);
    });
}

async function selectSound(index) {
    config.selectedSoundIndex = index;
    await window.electronAPI.saveConfig({ selectedSoundIndex: index });
    renderSoundList();
}

function playSound(soundPath, itemElement) {
    if (playingAudio) {
        playingAudio.pause();
        playingAudio = null;
        document.querySelectorAll('.sound-item').forEach(el => el.classList.remove('playing'));
    }

    try {
        playingAudio = new Audio(`file://${soundPath}`);
        playingAudio.play();
        itemElement.classList.add('playing');

        playingAudio.onended = () => {
            itemElement.classList.remove('playing');
            playingAudio = null;
        };

        playingAudio.onerror = () => {
            itemElement.classList.remove('playing');
            playingAudio = null;
        };
    } catch (err) {
        console.error('Failed to play sound:', err);
    }
}

async function deleteSound(index) {
    const sound = customSounds[index];

    try {
        await window.electronAPI.deleteSound(sound.path);
        customSounds.splice(index, 1);
        config.customSounds = customSounds.map(s => s.path);
        
        // 更新选中索引
        let newSelectedIndex = config.selectedSoundIndex;
        if (index === config.selectedSoundIndex) {
            // 删除了当前选中的音效，重置为0
            newSelectedIndex = Math.max(0, customSounds.length - 1);
        } else if (index < config.selectedSoundIndex) {
            // 删除的在选中之前，索引减1
            newSelectedIndex = config.selectedSoundIndex - 1;
        }
        
        config.selectedSoundIndex = newSelectedIndex;
        
        await window.electronAPI.saveConfig({ 
            customSounds: config.customSounds,
            selectedSoundIndex: config.selectedSoundIndex 
        });
        renderSoundList();
    } catch (err) {
        console.error('Failed to delete sound:', err);
    }
}

async function importSound() {
    try {
        const importedFiles = await window.electronAPI.selectSoundFile();

        if (importedFiles && importedFiles.length > 0) {
            for (const file of importedFiles) {
                if (customSounds.length < 20 && file.path) {
                    const exists = customSounds.some(s => s.path === file.path);
                    if (!exists) {
                        customSounds.push({
                            name: file.name,
                            path: file.path
                        });
                    }
                }
            }

            config.customSounds = customSounds.map(s => s.path);
            config.customSoundEnabled = true;
            elements.customSoundToggle.classList.add('active');

            await window.electronAPI.saveConfig({
                customSounds: config.customSounds,
                customSoundEnabled: true
            });

            renderSoundList();
        }
    } catch (err) {
        console.error('Failed to import sound:', err);
    }
}

async function importNormalPetImage() {
    try {
        const file = await window.electronAPI.selectPetImage();

        if (file) {
            config.customPetPath = file.path;
            config.customPetEnabled = true;

            await window.electronAPI.saveConfig({
                customPetPath: file.path,
                customPetEnabled: true
            });

            updatePetDisplay();
        }
    } catch (err) {
        console.error('Failed to import normal pet image:', err);
    }
}

async function importExcitedPetImage() {
    try {
        const file = await window.electronAPI.selectPetImage();

        if (file) {
            config.customPetExcitedPath = file.path;
            config.customPetEnabled = true;

            await window.electronAPI.saveConfig({
                customPetExcitedPath: file.path,
                customPetEnabled: true
            });

            updatePetDisplay();
        }
    } catch (err) {
        console.error('Failed to import excited pet image:', err);
    }
}

async function resetPetImage() {
    const oldPath = config.customPetPath;
    const oldExcitedPath = config.customPetExcitedPath;
    config.customPetPath = '';
    config.customPetExcitedPath = '';
    config.customPetEnabled = false;

    try {
        if (oldPath) {
            await window.electronAPI.deletePetImage(oldPath);
        }
        if (oldExcitedPath) {
            await window.electronAPI.deletePetImage(oldExcitedPath);
        }
    } catch (err) {
        console.error('Failed to delete pet images:', err);
    }

    await window.electronAPI.saveConfig({
        customPetPath: '',
        customPetExcitedPath: '',
        customPetEnabled: false
    });

    updatePetDisplay();
}

function toggleCustomSound() {
    config.customSoundEnabled = !config.customSoundEnabled;
    elements.customSoundToggle.classList.toggle('active', config.customSoundEnabled);
    window.electronAPI.saveConfig({ customSoundEnabled: config.customSoundEnabled });
}

async function toggleAutoStart() {
    config.autoStart = !config.autoStart;
    elements.autoStartToggle.classList.toggle('active', config.autoStart);
    await window.electronAPI.updateAutoStart(config.autoStart);
}

function togglePetVisible() {
    config.petVisible = !config.petVisible;
    elements.petVisibleToggle.classList.toggle('active', config.petVisible);

    if (config.petVisible) {
        window.electronAPI.showPet();
    } else {
        window.electronAPI.hidePet();
    }

    window.electronAPI.saveConfig({ petVisible: config.petVisible });
}

async function loadConfig() {
    try {
        const [loadedConfig, sounds, reminderList] = await Promise.all([
            window.electronAPI.getConfig(),
            window.electronAPI.getCustomSounds(),
            window.electronAPI.getReminders()
        ]);
        config = { ...config, ...loadedConfig };
        customSounds = sounds;
        reminders = reminderList;

        elements.customSoundToggle.classList.toggle('active', config.customSoundEnabled);
        elements.autoStartToggle.classList.toggle('active', config.autoStart);
        elements.petVisibleToggle.classList.toggle('active', config.petVisible);

        updatePetDisplay();
        renderSoundList();
        renderReminderList();
    } catch (err) {
        console.error('Failed to load config:', err);
    }
}

function renderReminderList() {
    if (reminders.length === 0) {
        elements.reminderList.innerHTML = '';
        elements.reminderList.appendChild(elements.reminderEmptyState);
        return;
    }

    elements.reminderList.innerHTML = '';

    const onceText = translations['settings.reminders.once'] || '仅一次';
    const dailyText = translations['settings.reminders.daily'] || '每天';
    const disableText = translations['settings.reminders.disable'] || '禁用';
    const enableText = translations['settings.reminders.enable'] || '启用';
    const editText = translations['settings.reminders.edit'] || '编辑';
    const deleteText = translations['settings.reminders.delete'] || '删除';

    reminders.forEach((reminder) => {
        const item = document.createElement('div');
        item.className = `reminder-item${reminder.enabled ? '' : ' disabled'}`;
        item.dataset.id = reminder.id;

        item.innerHTML = `
            <div class="reminder-icon">⏰</div>
            <div class="reminder-info">
                <div class="reminder-title">${reminder.title}</div>
                <div class="reminder-time">${reminder.time} ${reminder.repeat === 'daily' ? `(${dailyText})` : `(${onceText})`}</div>
            </div>
            <div class="reminder-actions">
                <button class="btn btn-secondary btn-small" onclick="toggleReminderEnabled('${reminder.id}')">
                    ${reminder.enabled ? disableText : enableText}
                </button>
                <button class="btn btn-primary btn-small" onclick="editReminder('${reminder.id}')">${editText}</button>
                <button class="btn btn-danger btn-small" onclick="deleteReminder('${reminder.id}')">${deleteText}</button>
            </div>
        `;

        elements.reminderList.appendChild(item);
    });
}

function openReminderModal(reminder = null) {
    editingReminder = reminder;
    
    const addTitle = translations['settings.reminders.modalTitle'] || '添加提醒';
    const editTitle = translations['settings.reminders.modalEditTitle'] || '编辑提醒';
    
    if (reminder) {
        elements.reminderModalTitle.textContent = editTitle;
        elements.reminderTitle.value = reminder.title;
        elements.reminderTime.value = reminder.time;
        elements.reminderRepeat.value = reminder.repeat;
    } else {
        elements.reminderModalTitle.textContent = addTitle;
        elements.reminderTitle.value = '';
        elements.reminderTime.value = new Date().toTimeString().slice(0, 5);
        elements.reminderRepeat.value = 'daily';
    }
    
    elements.reminderModal.classList.add('show');
}

function closeReminderModal() {
    elements.reminderModal.classList.remove('show');
    editingReminder = null;
}

async function saveReminder() {
    const title = elements.reminderTitle.value.trim();
    const time = elements.reminderTime.value;
    const repeat = elements.reminderRepeat.value;

    if (!title || !time) {
        const msg = translations['settings.reminders.required'] || '请填写完整的提醒信息';
        alert(msg);
        return;
    }

    const reminder = editingReminder || {};
    reminder.title = title;
    reminder.time = time;
    reminder.repeat = repeat;
    reminder.enabled = reminder.enabled !== undefined ? reminder.enabled : true;

    await window.electronAPI.saveReminder(reminder);
    reminders = await window.electronAPI.getReminders();
    renderReminderList();
    closeReminderModal();
}

async function toggleReminderEnabled(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        const newEnabled = !reminder.enabled;
        await window.electronAPI.updateReminderEnabled({ id, enabled: newEnabled });
        reminders = await window.electronAPI.getReminders();
        renderReminderList();
    }
}

async function editReminder(id) {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
        openReminderModal(reminder);
    }
}

async function deleteReminder(id) {
    const confirmText = translations['settings.reminders.confirmDelete'] || '确定要删除这个提醒吗？';
    if (!confirm(confirmText)) {
        return;
    }
    
    await window.electronAPI.deleteReminder(id);
    reminders = await window.electronAPI.getReminders();
    renderReminderList();
}

function init() {
    initTabs();
    initLanguageListener();
    initLanguage();
    loadConfig();

    elements.importNormalPetBtn.addEventListener('click', importNormalPetImage);
    elements.importExcitedPetBtn.addEventListener('click', importExcitedPetImage);
    elements.resetPetBtn.addEventListener('click', resetPetImage);
    elements.customSoundToggle.addEventListener('click', toggleCustomSound);
    elements.importSoundBtn.addEventListener('click', importSound);
    elements.addSoundBtn.addEventListener('click', importSound);
    elements.autoStartToggle.addEventListener('click', toggleAutoStart);
    elements.petVisibleToggle.addEventListener('click', togglePetVisible);
    
    // 语言选择器事件
    if (elements.languageSelect) {
        elements.languageSelect.addEventListener('change', (e) => {
            changeLanguage(e.target.value);
        });
    }
    
    elements.addReminderBtn.addEventListener('click', () => openReminderModal());
    elements.addReminderBtn2.addEventListener('click', () => openReminderModal());
    elements.reminderCancelBtn.addEventListener('click', closeReminderModal);
    elements.reminderSaveBtn.addEventListener('click', saveReminder);
    
    elements.reminderModal.addEventListener('click', (e) => {
        if (e.target === elements.reminderModal) {
            closeReminderModal();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
