<template>
  <div class="language-switcher">
    <button :class="['lang-button', { active: locale === 'ru' }]" @click="setLocale('ru')">
      RU
    </button>
    <button :class="['lang-button', { active: locale === 'en' }]" @click="setLocale('en')">
      EN
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n';

const { locale, setLocale } = useI18n();
</script>

<style scoped>
.language-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 0.5rem;
  z-index: var(--z-index-fixed, 1030);
}

.lang-button {
  padding: 8px 16px;
  border: 2px solid var(--color-primary, #007bff);
  background-color: var(--color-white);
  color: var(--color-primary, #007bff);
  border-radius: var(--border-radius-base, 4px);
  cursor: pointer;
  font-weight: bold;
  transition: all var(--transition-base, 0.3s);
}

.lang-button:hover {
  background-color: var(--color-gray-50);
}

.lang-button.active {
  background-color: var(--color-primary, #007bff);
  color: var(--color-white);
}
</style>
