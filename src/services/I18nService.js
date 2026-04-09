import { translations } from '../i18n/translations.js';

export class I18nService {
  constructor() {
    this.currentLang = localStorage.getItem('app_lang') || 'vi';
    this.langs = ['vi', 'ja', 'en'];
    // Gắn hàm t vào window để các controller có thể gọi toàn cục
    window.t = this.t.bind(this);
  }

  init() {
    this.renderLanguageSelector();
    this.applyTranslations();
  }

  setLanguage(lang) {
    if (!this.langs.includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('app_lang', lang);
    this.updateSelectorUI();
    this.applyTranslations();
    
    // Bắn một sự kiện để các UI linh động tự động load lại chuỗi
    window.dispatchEvent(new Event('languageChanged'));
  }

  t(key, ...args) {
    const dict = translations[this.currentLang] || translations['vi'];
    let text = dict[key];
    if (!text) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    
    // Replace {0}, {1} etc with arguments
    if (args.length > 0) {
      args.forEach((val, i) => {
        text = text.replace(`{${i}}`, val);
      });
    }
    return text;
  }

  applyTranslations() {
    // Dịch các text bên trong thẻ
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // Dịch các thuộc tính placeholder
    const phElements = document.querySelectorAll('[data-i18n-placeholder]');
    phElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', this.t(key));
      }
    });
  }

  renderLanguageSelector() {
    // Tạo vùng chứa các nút đổi ngôn ngữ nếu chưa có
    let selector = document.getElementById('lang-selector');
    if (!selector) {
      selector = document.createElement('div');
      selector.id = 'lang-selector';
      selector.className = 'lang-selector-panel';
      
      const btnVi = document.createElement('button');
      btnVi.className = 'lang-btn';
      btnVi.innerHTML = '🇻🇳 Tiếng Việt';
      btnVi.onclick = () => this.setLanguage('vi');
      
      const btnJa = document.createElement('button');
      btnJa.className = 'lang-btn';
      btnJa.innerHTML = '🇯🇵 日本語';
      btnJa.onclick = () => this.setLanguage('ja');
      
      const btnEn = document.createElement('button');
      btnEn.className = 'lang-btn';
      btnEn.innerHTML = '🇬🇧 English';
      btnEn.onclick = () => this.setLanguage('en');

      selector.appendChild(btnVi);
      selector.appendChild(btnJa);
      selector.appendChild(btnEn);
      
      document.body.appendChild(selector);
    }
    this.updateSelectorUI();
  }

  updateSelectorUI() {
    const selector = document.getElementById('lang-selector');
    if (!selector) return;
    
    const btns = selector.querySelectorAll('.lang-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    if (this.currentLang === 'vi') btns[0].classList.add('active');
    else if (this.currentLang === 'ja') btns[1].classList.add('active');
    else if (this.currentLang === 'en') btns[2].classList.add('active');
  }
}
