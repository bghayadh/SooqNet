import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files (in this example, en and ar)
import enTranslation from './Locales/en.json';
import arTranslation from './Locales/ar.json';

i18next
  .use(initReactI18next)  // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      ar: {
        translation: arTranslation
      },
    },
    lng: 'en',  // Default language
    fallbackLng: 'en',  // Fallback language when the user's language is not available
    interpolation: {
      escapeValue: false,  // React already escapes values
    },
  });

export default i18next;