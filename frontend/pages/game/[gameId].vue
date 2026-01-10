<template>
  <div class="game">
    <LanguageSwitcher />
    <div v-if="!gameStore.isJoined">
      <h2>{{ t('game.join.title') }}</h2>
      <input
        v-model="nickname"
        class="game__nickname"
        type="text"
        :placeholder="t('game.join.nicknamePlaceholder')"
      />
      <button class="primary-button" @click="handleJoin">{{ t('game.join.joinButton') }}</button>
    </div>
    <template v-else>
      <div class="game__header">
        <div class="game__header-info">
          <h2 class="game__header-title">{{ gameStore.game?.name || `Game: ${gameId}` }}</h2>
          <p class="game__header-status">
            {{ t('game.header.status') }}: {{ t(`game.status.${gameStore.game?.status}`) }}
          </p>
          <div v-if="gameStore.game?.deckType" class="game__header-deck">
            <p class="game__header-deck-text">
              {{ t('game.header.votingSystem') }}:
              {{ deckTypeLabel }}
            </p>
          </div>
        </div>
        <div class="game__header-user">
          <p class="game__header-user-nickname">
            {{ t('game.header.yourNickname') }}: {{ gameStore.nickname }}
          </p>
          <button class="game__header-invite" @click="copyInviteLink">
            {{ t('game.header.invitePlayers') }}
          </button>
          <p v-if="copied" class="game__header-copied">{{ t('game.header.linkCopied') }}</p>
        </div>
      </div>
      <div class="game__players-container">
        <div class="game__players game__players--top">
          <div
            v-for="player in topPlayers"
            :key="player.id"
            :class="[
              'game__player-card',
              { 'game__player-card--revealed': gameStore.game?.status === 'revealed' },
            ]"
          >
            <div class="game__player-card-content">
              <div v-if="gameStore.game?.status === 'revealed'" class="game__player-card-vote">
                {{
                  formatCard(
                    gameStore.game?.votes.find((v) => v.playerId === player.id)?.value ?? null
                  ) ?? '-'
                }}
              </div>
            </div>
            <div class="game__player-card-name">{{ player.nickname }}</div>
          </div>
        </div>

        <div class="game__actions">
          <div class="game__progress">
            {{ progressText }}
          </div>
          <div
            v-if="
              gameStore.game?.status === 'revealed' &&
              gameStore.game.averageScore !== null &&
              gameStore.game.averageScore !== undefined
            "
            class="game__average"
          >
            <div class="game__average-label">{{ t('game.results.averageScore') }}</div>
            <div class="game__average-value">{{ gameStore.game.averageScore.toFixed(2) }}</div>
          </div>
          <div class="game__actions-buttons">
            <button
              v-if="gameStore.canReveal"
              :disabled="!gameStore.isConnected"
              class="game__actions-button game__actions-button--reveal"
              @click="gameStore.reveal"
            >
              {{ t('game.actions.revealCards') }}
            </button>
            <button
              v-if="gameStore.canReset"
              :disabled="!gameStore.isConnected"
              class="game__actions-button game__actions-button--reset"
              @click="gameStore.resetRound"
            >
              {{ t('game.actions.startNewVoting') }}
            </button>
          </div>
        </div>

        <div class="game__players game__players--bottom">
          <div
            v-for="player in bottomPlayers"
            :key="player.id"
            :class="[
              'game__player-card',
              { 'game__player-card--revealed': gameStore.game?.status === 'revealed' },
            ]"
          >
            <div class="game__player-card-content">
              <div v-if="gameStore.game?.status === 'revealed'" class="game__player-card-vote">
                {{
                  formatCard(
                    gameStore.game?.votes.find((v) => v.playerId === player.id)?.value ?? null
                  ) ?? '-'
                }}
              </div>
            </div>
            <div class="game__player-card-name">{{ player.nickname }}</div>
          </div>
        </div>
      </div>
      <div v-if="gameStore.canVote" class="game__voting">
        <div class="game__voting-cards">
          <button
            v-for="card in gameStore.game?.availableCards || []"
            :key="card"
            :disabled="!gameStore.isConnected"
            :class="['game__voting-card', { 'game__voting-card--active': currentVote === card }]"
            @click="gameStore.vote(card)"
          >
            {{ formatCard(card) }}
          </button>
        </div>
      </div>
      <div class="game__footer">
        <p class="game__footer-status">
          {{ t('game.footer.websocket') }}:
          {{ gameStore.isConnected ? t('game.footer.connected') : t('game.footer.disconnected') }}
        </p>
        <button class="game__footer-leave" @click="gameStore.reset">
          {{ t('game.footer.leaveGame') }}
        </button>
        <a href="/" class="game__footer-home">{{ t('common.home') }}</a>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '~/stores/game';
import { useI18n } from '~/composables/useI18n';
import LanguageSwitcher from '~/components/LanguageSwitcher.vue';

definePageMeta({
  ssr: false,
});

const route = useRoute();
const gameStore = useGameStore();
const { t } = useI18n();
const gameId = computed(() => route.params.gameId as string);
const nickname = ref('');
const copied = ref(false);

const deckTypeLabel = computed(() => {
  const dt = gameStore.game?.deckType;
  if (!dt) return '';
  const keyByDeckType: Record<string, string> = {
    standard: 'game.header.votingSystemStandard',
    short: 'game.header.votingSystemShort',
    fibonacci: 'game.header.votingSystemFibonacci',
    modified_fibonacci: 'game.header.votingSystemModifiedFibonacci',
    tshirts: 'game.header.votingSystemTshirts',
    powers_of_2: 'game.header.votingSystemPowersOf2',
    custom: 'game.header.votingSystemCustom',
  };
  const translationKey = keyByDeckType[dt] ?? keyByDeckType.standard;
  if (!translationKey) {
    return '';
  }
  return t(translationKey);
});

const formatCard = (cardId: string | null) => {
  if (cardId === null) return null;
  if (cardId === 'unknown') return '?';
  if (cardId === 'coffee') return '☕';
  if (cardId === '0.5') return '½';
  return cardId;
};

const currentVote = computed(() => {
  if (!gameStore.game || !gameStore.playerId) return null;
  const vote = gameStore.game.votes.find((v) => v.playerId === gameStore.playerId);
  return vote?.value ?? null;
});

const players = computed(() => {
  return gameStore.game?.players || [];
});

const topPlayers = computed(() => {
  const playersList = players.value;
  const midPoint = Math.ceil(playersList.length / 2);
  return playersList.slice(0, midPoint);
});

const bottomPlayers = computed(() => {
  const playersList = players.value;
  const midPoint = Math.ceil(playersList.length / 2);
  return playersList.slice(midPoint);
});

const progressText = computed(() => {
  if (!gameStore.game) return '';
  return `${t('game.header.progress')}: ${gameStore.game.progress.voted} / ${gameStore.game.progress.total} ${t('game.header.playersVoted')}`;
});

const handleJoin = async () => {
  if (!nickname.value) {
    alert(t('game.join.errors.nicknameRequired'));
    return;
  }
  try {
    await gameStore.joinGame(gameId.value, nickname.value);
    gameStore.connectWebSocket();
    await gameStore.loadGame();
  } catch (error: any) {
    alert(t('game.join.errors.joinFailed') + ': ' + (error.message || ''));
  }
};

const copyInviteLink = async () => {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      console.error(err);
    }
    document.body.removeChild(textArea);
  }
};

onMounted(async () => {
  // Если уже присоединены к этой игре, подключаемся
  if (gameStore.gameId === gameId.value && gameStore.isJoined) {
    gameStore.connectWebSocket();
    await gameStore.loadGame();
  } else {
    // Проверяем, есть ли уже игрок с таким sessionId в этой игре
    const isPlayerExists = await gameStore.checkCurrentPlayer(gameId.value);
    if (isPlayerExists) {
      // Игрок уже присоединен, восстанавливаем состояние
      gameStore.connectWebSocket();
      await gameStore.loadGame();
    } else if (gameStore.gameId !== gameId.value) {
      // Если это другая игра, сбрасываем состояние
      gameStore.reset();
    }
  }
});

onUnmounted(() => {
  gameStore.disconnectWebSocket();
});

watch(
  () => gameStore.game,
  () => {
    // Game state updated
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.game {
  display: flex;
  flex-direction: column;
}

// Заголовок игры
.game__header {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
}

.game__header-info {
  margin-right: auto;
}

.game__header-title {
  margin-bottom: 0.5rem;
}

.game__header-status {
  font-weight: bold;
  text-transform: capitalize;
  margin-bottom: 0.5rem;
}

.game__header-deck {
  margin: 0.5rem 0;
  font-style: italic;
  color: #666;
}

.game__header-deck-text {
  margin: 0;
}

.game__header-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.game__header-user-nickname {
  margin-bottom: 0.5rem;
}

.game__header-invite {
  margin-top: 1rem;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.game__header-invite:hover {
  background-color: #218838;
}

.game__header-copied {
  color: #28a745;
  font-weight: bold;
  margin-top: 0.5rem;
}

// Форма входа
.game__nickname {
  max-width: 320px;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

// Блок голосования
.game__voting {
  display: flex;
  justify-content: center;
  background-color: var(--color-gray-100, #f8f9fa);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid var(--color-gray-300, #d1d5db);
}

.game__voting-empty {
  color: #6c757d;
  margin: 1rem 0;
}

.game__voting-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.game__voting-card {
  width: 60px;
  height: 80px;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid var(--color-primary, #007bff);
  background-color: var(--color-white, white);
  color: var(--color-primary, #007bff);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.game__voting-card:hover:not(:disabled) {
  background-color: var(--color-gray-50, #e7f3ff);
  transform: scale(1.05);
}

.game__voting-card--active {
  background-color: var(--color-primary, #007bff);
  color: var(--color-white, white);
}

.game__voting-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

// Контейнер карточек игроков
.game__players-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin: 2rem 0;
}

// Карточки игроков (верхние и нижние)
.game__players {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.game__players--top {
  align-items: flex-end;
}

.game__players--bottom {
  align-items: flex-start;
}

.game__player-card {
  width: 80px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--color-gray-100, #f3f4f6);
  border: 1px solid var(--color-gray-300, #d1d5db);
  border-radius: 8px;
  padding: 1rem 0.5rem;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.game__player-card--revealed {
  background-color: var(--color-gray-200, #e5e7eb);
  border-color: var(--color-primary, #007bff);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.game__player-card-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 64px;
  margin-bottom: 0.5rem;
}

.game__player-card-vote {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary, #007bff);
  text-align: center;
}

.game__player-card-name {
  font-size: 0.75rem;
  text-align: center;
  word-wrap: break-word;
  max-width: 64px;
  overflow-wrap: break-word;
  line-height: 1.2;
  color: var(--color-gray-900, #111827);
}

// Блок действий (по центру)
.game__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-100, #f8f9fa);
  border-radius: 8px;
  padding: 2rem;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
}

.game__progress {
  margin-bottom: 1.5rem;
  font-weight: 500;
  text-align: center;
}

.game__average {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--color-info-light, #e7f3ff);
  border-radius: 8px;
  text-align: center;
  width: 100%;
}

.game__average-label {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-weight: 500;
}

.game__average-value {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.game__actions-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game__actions-button {
  padding: 12px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.game__actions-button--reveal {
  background-color: #ffc107;
  color: #000;
}

.game__actions-button--reveal:hover:not(:disabled) {
  background-color: #e0a800;
}

.game__actions-button--reset {
  background-color: #17a2b8;
  color: white;
}

.game__actions-button--reset:hover:not(:disabled) {
  background-color: #138496;
}

.game__actions-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

// Футер
.game__footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-300, #ddd);
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.game__footer-status {
  margin: 0;
}

.game__footer-leave {
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.game__footer-leave:hover {
  background-color: #c82333;
}

.game__footer-home {
  color: var(--color-primary, #007bff);
  text-decoration: none;
  transition: color 0.3s;
}

.game__footer-home:hover {
  text-decoration: underline;
}

// Мобильная версия
@media (max-width: 768px) {
  .game__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .game__header-info {
    margin-right: 0;
    width: 100%;
  }

  .game__header-user {
    align-items: flex-start;
    width: 100%;
  }

  .game__players {
    justify-content: flex-start;
  }

  .game__player-card {
    width: calc(50% - 0.5rem);
    max-width: 120px;
  }

  .game__actions {
    padding: 1.5rem;
  }

  .game__actions-buttons {
    width: 100%;
  }

  .game__actions-button {
    flex: 1;
    min-width: 140px;
  }

  .game__footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
