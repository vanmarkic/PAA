import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationFR from './locales/fr/translation.json';
import translationNL from './locales/nl/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  fr: {
    translation: translationFR
  },
  nl: {
    translation: translationNL
  },
  en: {
    translation: translationEN
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'fr', // French is the primary language for Belgium
    debug: false,

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'paa-language',
    },

    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Belgian-specific language settings
    supportedLngs: ['fr', 'nl', 'en'],

    // Language naming for display
    lng: 'fr', // Default to French
  });

export default i18n;