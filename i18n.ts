import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Resources
import rootUz from './locales/uz.json';
import rootRu from './locales/ru.json';

const resources = {
  uz: {
    translation: rootUz
  },
  ru: {
    translation: rootRu
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
