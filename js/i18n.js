const I18N_STORAGE_KEY = "site-lang";
const DEFAULT_LANG = "zh-TW";

let messages = {};
let currentLang = localStorage.getItem(I18N_STORAGE_KEY) || DEFAULT_LANG;

async function loadLocale(lang) {
  const res = await fetch(`./locales/${lang}.json`);
  if (!res.ok) {
    throw new Error(`Failed to load locale: ${lang}`);
  }
  return res.json();
}

function getNestedValue(obj, path) {
  return obj[path];
}

function applyI18n() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const value = getNestedValue(messages, key);

    if (typeof value === "string") {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    const value = getNestedValue(messages, key);

    if (typeof value === "string") {
      el.setAttribute("placeholder", value);
    }
  });
}

async function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(I18N_STORAGE_KEY, lang);
  messages = await loadLocale(lang);
  applyI18n();

  if (typeof window.renderProductDetail === "function") {
    window.renderProductDetail();
  }
}

async function initI18n() {
  try {
    messages = await loadLocale(currentLang);
  } catch {
    currentLang = DEFAULT_LANG;
    messages = await loadLocale(DEFAULT_LANG);
  }

  applyI18n();

  const switchers = document.querySelectorAll("[data-lang-switch]");
  switchers.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const lang = btn.dataset.langSwitch;
      await setLanguage(lang);
    });
  });
  
}


window.getCurrentLang = () => currentLang;
window.initI18n = initI18n;