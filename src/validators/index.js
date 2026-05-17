const path = require('path');
const { ValidationError, SecurityError } = require('../errors/index.js');

const TRAVERSAL_PATTERNS = [
  /\.\./,
  /\/\.\./,
  /\\\.\./,
  /^(\.\.)/,
  /(\/|\\)\.\.(\/|\\|$)/
];

const VALID_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VALID_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

function isValidPath(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    return false;
  }

  for (const pattern of TRAVERSAL_PATTERNS) {
    if (pattern.test(filePath)) {
      return false;
    }
  }

  return true;
}

function validateFilePath(filePath, allowedExtensions = []) {
  if (typeof filePath !== 'string') {
    throw new ValidationError('File path must be a string', 'filePath');
  }

  if (filePath.trim() === '') {
    throw new ValidationError('File path cannot be empty', 'filePath');
  }

  if (!isValidPath(filePath)) {
    throw new SecurityError('Path traversal detected in file path', { filePath });
  }

  if (allowedExtensions.length > 0) {
    const ext = path.extname(filePath).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      throw new ValidationError(
        `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
        'filePath',
        { allowedExtensions, actualExtension: ext }
      );
    }
  }

  return true;
}

function validateImagePath(filePath) {
  return validateFilePath(filePath, VALID_IMAGE_EXTENSIONS);
}

function validateAudioPath(filePath) {
  return validateFilePath(filePath, VALID_AUDIO_EXTENSIONS);
}

function validatePathInDirectory(filePath, allowedDir) {
  validateFilePath(filePath);

  const resolvedFilePath = path.resolve(filePath);
  const resolvedAllowedDir = path.resolve(allowedDir);

  if (!resolvedFilePath.startsWith(resolvedAllowedDir + path.sep) && 
      resolvedFilePath !== resolvedAllowedDir) {
    throw new SecurityError('File path is outside allowed directory', {
      filePath: resolvedFilePath,
      allowedDir: resolvedAllowedDir
    });
  }

  return true;
}

function validateConfig(config) {
  if (typeof config !== 'object' || config === null) {
    throw new ValidationError('Config must be an object', 'config');
  }

  const errors = [];

  if (config.customPetPath !== undefined) {
    try {
      if (config.customPetPath) {
        validateImagePath(config.customPetPath);
      }
    } catch (e) {
      errors.push({ field: 'customPetPath', message: e.message });
    }
  }

  if (config.customPetExcitedPath !== undefined) {
    try {
      if (config.customPetExcitedPath) {
        validateImagePath(config.customPetExcitedPath);
      }
    } catch (e) {
      errors.push({ field: 'customPetExcitedPath', message: e.message });
    }
  }

  if (config.customSounds !== undefined) {
    if (!Array.isArray(config.customSounds)) {
      errors.push({ field: 'customSounds', message: 'Must be an array' });
    } else {
      config.customSounds.forEach((soundPath, index) => {
        try {
          validateAudioPath(soundPath);
        } catch (e) {
          errors.push({ field: `customSounds[${index}]`, message: e.message });
        }
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid config', 'config', { errors });
  }

  return true;
}

function validateReminder(reminder) {
  if (typeof reminder !== 'object' || reminder === null) {
    throw new ValidationError('Reminder must be an object', 'reminder');
  }

  const errors = [];

  if (!reminder.title || typeof reminder.title !== 'string' || reminder.title.trim() === '') {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!reminder.time || typeof reminder.time !== 'string') {
    errors.push({ field: 'time', message: 'Time is required' });
  } else {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(reminder.time)) {
      errors.push({ field: 'time', message: 'Invalid time format. Use HH:MM' });
    }
  }

  if (reminder.repeat !== undefined && !['daily', 'once'].includes(reminder.repeat)) {
    errors.push({ field: 'repeat', message: 'Repeat must be "daily" or "once"' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Invalid reminder', 'reminder', { errors });
  }

  return true;
}

function validateLanguage(language) {
  const supportedLanguages = ['zh-CN', 'en-US'];
  
  if (!supportedLanguages.includes(language)) {
    throw new ValidationError(
      `Invalid language. Supported: ${supportedLanguages.join(', ')}`,
      'language',
      { supportedLanguages, actual: language }
    );
  }

  return true;
}

module.exports = {
  isValidPath,
  validateFilePath,
  validateImagePath,
  validateAudioPath,
  validatePathInDirectory,
  validateConfig,
  validateReminder,
  validateLanguage,
  VALID_IMAGE_EXTENSIONS,
  VALID_AUDIO_EXTENSIONS
};