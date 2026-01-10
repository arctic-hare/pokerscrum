import { ref, computed } from 'vue';
import ru from '~/locales/ru';
import en from '~/locales/en';

type Locale = 'ru' | 'en';
type TranslationKey = string;

const currentLocale = ref<Locale>('ru');

const translations = {
  ru,
  en,
};

export const useI18n = () => {
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[currentLocale.value];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key "${key}" not found for locale "${currentLocale.value}"`);
        return key;
      }
    }

    return value || key;
  };

  const setLocale = (locale: Locale) => {
    currentLocale.value = locale;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
  };

  const locale = computed(() => currentLocale.value);

  // Инициализация из localStorage
  if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'ru' || savedLocale === 'en')) {
      currentLocale.value = savedLocale;
    }
  }

  return {
    t,
    locale,
    setLocale,
  };
};
