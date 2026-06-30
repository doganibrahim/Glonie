import en from '../locales/en.json';

const locales = { en };

// Current language (expand later for multi-language)
let currentLang = 'en';

export const useLocale = () => {
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = locales[currentLang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    // Replace {param} placeholders
    if (typeof value === 'string') {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(`{${param}}`, val),
        value
      );
    }

    return value;
  };

  return { t, lang: currentLang };
};