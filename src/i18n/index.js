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

function getAvailableLanguages() {
  return Object.keys(translations);
}

module.exports = {
  init,
  t,
  setLanguage,
  getLanguage,
  getTranslations,
  getAvailableLanguages
};
