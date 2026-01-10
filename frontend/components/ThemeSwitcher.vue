<template>
  <div class="theme-switcher">
    <button
      :class="['theme-button', { 'dark-mode': isDark }]"
      :title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
      @click="toggleTheme"
    >
      <span class="theme-icon">{{ isDark ? '☀️' : '🌙' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '~/composables/useTheme';

const { theme, isDark, setTheme } = useTheme();

const toggleTheme = () => {
  if (theme.value === 'auto') {
    // Если был auto, переключаем на противоположную к текущей эффективной теме
    setTheme(isDark.value ? 'light' : 'dark');
  } else if (theme.value === 'light') {
    setTheme('dark');
  } else {
    setTheme('light');
  }
};
</script>

<style scoped>
.theme-switcher {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: var(--z-index-fixed, 1030);
}

.theme-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background-color: var(--color-white);
  color: var(--color-primary);
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base, 0.3s ease);
  box-shadow: var(--shadow-md);
}

.theme-button:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
  background-color: var(--color-gray-50);
}

.theme-button.dark-mode {
  background-color: var(--color-gray-800);
  border-color: var(--color-info);
  color: var(--color-warning);
}

.theme-button.dark-mode:hover {
  background-color: var(--color-gray-700);
}

.theme-icon {
  display: block;
  line-height: 1;
  font-size: 1.5rem;
}
</style>
