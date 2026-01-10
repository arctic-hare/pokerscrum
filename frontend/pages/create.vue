<template>
  <div>
    <LanguageSwitcher />
    <h1>{{ t('create.title') }}</h1>
    <div class="create-form">
      <div>
        <label for="gameName">{{ t('create.gameName') }}</label>
        <input
          id="gameName"
          v-model="gameName"
          type="text"
          :placeholder="t('create.gameNamePlaceholder')"
        />
      </div>
      <div>
        <label for="deckType">{{ t('create.votingSystem') }}</label>
        <select id="deckType" v-model="deckType">
          <option value="standard">{{ t('create.deckStandard') }}</option>
          <option value="short">{{ t('create.deckShort') }}</option>
          <option value="fibonacci">{{ t('create.deckFibonacci') }}</option>
          <option value="modified_fibonacci">{{ t('create.deckModifiedFibonacci') }}</option>
          <option value="tshirts">{{ t('create.deckTshirts') }}</option>
          <option value="powers_of_2">{{ t('create.deckPowersOf2') }}</option>
          <option value="custom">{{ t('create.deckCustom') }}</option>
        </select>
      </div>
      <div v-if="deckType === 'custom'">
        <label for="customDeck">{{ t('create.customDeck') }}</label>
        <input
          id="customDeck"
          v-model="customDeck"
          type="text"
          :placeholder="t('create.customDeckPlaceholder')"
        />
        <p v-if="customDeckError" class="error">{{ customDeckError }}</p>
      </div>
      <div class="actions">
        <button :disabled="!isFormValid" @click="handleCreateGame">
          {{ t('create.createGame') }}
        </button>
        <button class="secondary-button" @click="goToHome">{{ t('common.cancel') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '~/stores/game';
import { useI18n } from '~/composables/useI18n';
import LanguageSwitcher from '~/components/LanguageSwitcher.vue';

const { t } = useI18n();

const gameStore = useGameStore();
const gameName = ref('');
const deckType = ref('standard');
const customDeck = ref('');
const customDeckError = ref('');

const isFormValid = computed(() => {
  if (!gameName.value.trim()) {
    return false;
  }
  if (deckType.value === 'custom') {
    if (!customDeck.value.trim()) {
      return false;
    }
    // Проверка формата на клиенте
    const cards = customDeck.value.split(',').map((c) => c.trim());
    if (cards.length === 0) {
      return false;
    }
    for (const card of cards) {
      const num = parseInt(card, 10);
      if (isNaN(num) || num < 0) {
        return false;
      }
    }
  }
  return true;
});

const handleCreateGame = async () => {
  if (!gameName.value.trim()) {
    alert(t('create.errors.nameRequired'));
    return;
  }

  if (deckType.value === 'custom' && !customDeck.value.trim()) {
    customDeckError.value = t('create.errors.customDeckRequired');
    return;
  }

  customDeckError.value = '';

  try {
    const gameId = await gameStore.createGame({
      name: gameName.value,
      deckType: deckType.value as
        | 'standard'
        | 'short'
        | 'fibonacci'
        | 'modified_fibonacci'
        | 'tshirts'
        | 'powers_of_2'
        | 'custom',
      customDeck: deckType.value === 'custom' ? customDeck.value : undefined,
    });
    if (gameId) {
      await navigateTo(`/game/${gameId}`);
    }
  } catch (error: any) {
    const errorMessage = error.data?.message || error.message || t('common.error');
    if (errorMessage.includes('Custom deck')) {
      customDeckError.value = errorMessage;
    } else {
      alert(t('create.errors.createFailed') + ': ' + errorMessage);
    }
  }
};

const goToHome = () => {
  navigateTo('/');
};
</script>

<style scoped>
.create-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
}

.create-form > div {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:not(.secondary-button) {
  background-color: #007bff;
  color: white;
}

button:not(.secondary-button):hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #6c757d;
  color: white;
}

.secondary-button:hover {
  background-color: #5a6268;
}
</style>
