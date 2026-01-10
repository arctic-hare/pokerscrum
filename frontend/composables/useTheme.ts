import { ref, computed, watch } from 'vue';

type Theme = 'light' | 'dark' | 'auto';

const currentTheme = ref<Theme>('auto');
const effectiveTheme = ref<'light' | 'dark'>('light');

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.setAttribute('data-theme', 'light');
    html.classList.add('light');
    html.classList.remove('dark');
  }
};

const updateEffectiveTheme = () => {
  if (currentTheme.value === 'auto') {
    effectiveTheme.value = getSystemTheme();
  } else {
    effectiveTheme.value = currentTheme.value;
  }
  applyTheme(effectiveTheme.value);
};

// Инициализация темы из localStorage (синхронно, но после плагина)
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
    currentTheme.value = savedTheme;
  } else {
    currentTheme.value = 'auto';
  }
  // Обновляем эффективную тему для реактивности
  if (currentTheme.value === 'auto') {
    effectiveTheme.value = getSystemTheme();
  } else {
    effectiveTheme.value = currentTheme.value;
  }
}

export const useTheme = () => {
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
    updateEffectiveTheme();
  };

  const theme = computed(() => currentTheme.value);
  const isDark = computed(() => effectiveTheme.value === 'dark');

  // Инициализация слушателя изменений системной темы
  if (typeof window !== 'undefined') {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (currentTheme.value === 'auto') {
          updateEffectiveTheme();
        }
      };

      // Современные браузеры
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        // Fallback для старых браузеров
        mediaQuery.addListener(handleChange);
      }
    }
  }

  // Следим за изменениями темы
  watch(currentTheme, () => {
    updateEffectiveTheme();
  });

  return {
    theme,
    isDark,
    setTheme,
  };
};
