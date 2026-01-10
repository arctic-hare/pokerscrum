export default defineNuxtPlugin(() => {
  // Инициализация темы на клиенте
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const getSystemTheme = (): 'light' | 'dark' => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme: 'light' | 'dark') => {
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

    // Загружаем сохраненную тему из localStorage
    const savedTheme = localStorage.getItem('theme');
    let effectiveTheme: 'light' | 'dark';

    if (savedTheme === 'light' || savedTheme === 'dark') {
      effectiveTheme = savedTheme;
    } else {
      // Используем системную тему
      effectiveTheme = getSystemTheme();
    }

    // Применяем тему синхронно, до первого рендера
    applyTheme(effectiveTheme);
  }
});
