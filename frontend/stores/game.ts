import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface Player {
  id: string;
  nickname: string;
  createdAt: string;
}

interface Vote {
  playerId: string;
  playerNickname: string;
  value: string | null;
}

interface GameState {
  id: string;
  name?: string;
  status: 'waiting' | 'voting' | 'revealed';
  deckType:
    | 'standard'
    | 'short'
    | 'fibonacci'
    | 'modified_fibonacci'
    | 'tshirts'
    | 'powers_of_2'
    | 'custom';
  availableCards: string[];
  players: Player[];
  votes: Vote[];
  averageScore?: number | null;
  progress: {
    total: number;
    voted: number;
  };
}

export const useGameStore = defineStore('game', () => {
  const game = ref<GameState | null>(null);
  const gameId = ref<string | null>(null);
  const playerId = ref<string | null>(null);
  const nickname = ref<string>('');
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const sessionId = ref<string | null>(null);

  const getConfig = () => useRuntimeConfig();

  const getApiBase = () => {
    const config = getConfig();
    return config.public.apiBase || '';
  };

  const getWsBase = () => {
    const config = getConfig();
    if (config.public.wsBase) {
      return config.public.wsBase;
    }
    if (config.public.apiBase) {
      return config.public.apiBase.replace(/^http/, 'ws');
    }
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      return `${protocol}://${window.location.host}`;
    }
    return 'ws://localhost:3000';
  };

  const isJoined = computed(() => !!gameId.value && !!playerId.value);
  const canVote = computed(() => game.value?.status !== 'revealed');
  const canReveal = computed(() => game.value?.status === 'voting');
  const canReset = computed(() => game.value?.status === 'revealed');

  const loadSessionId = () => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find((c) => c.trim().startsWith('sessionId='));
      if (sessionCookie) {
        sessionId.value = sessionCookie.split('=')[1] ?? null;
      }
    }
  };

  const createGame = async (data?: {
    name?: string;
    deckType?:
      | 'standard'
      | 'short'
      | 'fibonacci'
      | 'modified_fibonacci'
      | 'tshirts'
      | 'powers_of_2'
      | 'custom';
    customDeck?: string;
  }) => {
    try {
      const response = await $fetch<{ gameId: string }>(
        `${getApiBase()}/api/game/create`,
        {
          method: 'POST',
          body: data || {},
          credentials: 'include',
        }
      );
      gameId.value = response.gameId;
      return response.gameId;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  };

  const joinGame = async (gameIdParam: string, nicknameParam: string) => {
    try {
      loadSessionId();
      const response = await $fetch<{ playerId: string; gameId: string }>(
        `${getApiBase()}/api/game/join`,
        {
          method: 'POST',
          body: {
            gameId: gameIdParam,
            nickname: nicknameParam,
          },
          credentials: 'include',
        }
      );
      gameId.value = response.gameId;
      playerId.value = response.playerId;
      nickname.value = nicknameParam;
      return response;
    } catch (error) {
      console.error('Error joining game:', error);
      throw error;
    }
  };

  const connectWebSocket = () => {
    if (!gameId.value) return;

    // WebSocket автоматически передает cookies при подключении
    const wsUrl = `${getWsBase()}/ws`;
    ws.value = new WebSocket(wsUrl);

    ws.value.onopen = () => {
      console.log('WebSocket connected');
      isConnected.value = true;
      // Отправляем JOIN_GAME сообщение (sessionId берется из cookies на сервере)
      if (ws.value && gameId.value) {
        ws.value.send(
          JSON.stringify({
            type: 'JOIN_GAME',
            gameId: gameId.value,
          })
        );
      }
    };

    ws.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'GAME_UPDATE') {
          game.value = message.game;
        } else if (message.type === 'ERROR') {
          console.error('WebSocket error:', message.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.value.onclose = () => {
      console.log('WebSocket disconnected');
      isConnected.value = false;
      ws.value = null;
    };
  };

  const disconnectWebSocket = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
      isConnected.value = false;
    }
  };

  const vote = (value: string) => {
    if (!ws.value || !isConnected.value || !canVote.value) {
      return;
    }

    // На всякий случай: даже если прилетело число (старый формат), отправляем строковый id
    const voteValue = String(value);
    // Проверяем, что значение допустимо для текущей системы голосования
    if (game.value && !game.value.availableCards.includes(voteValue)) {
      console.error(`Value ${voteValue} is not in available cards`);
      return;
    }
    ws.value.send(
      JSON.stringify({
        type: 'VOTE',
        value: voteValue,
      })
    );
  };

  const reveal = () => {
    if (!ws.value || !isConnected.value || !canReveal.value) {
      return;
    }
    ws.value.send(
      JSON.stringify({
        type: 'REVEAL',
      })
    );
  };

  const resetRound = () => {
    if (!ws.value || !isConnected.value || !canReset.value) {
      return;
    }
    ws.value.send(
      JSON.stringify({
        type: 'RESET',
      })
    );
  };

  const loadGame = async () => {
    if (!gameId.value) return;
    try {
      const gameData = await $fetch<GameState>(
        `${getApiBase()}/api/game/${gameId.value}`,
        {
          credentials: 'include',
        }
      );
      game.value = gameData;
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const checkCurrentPlayer = async (gameIdParam: string) => {
    try {
      const response = await $fetch<{ player: { id: string; nickname: string } | null }>(
        `${getApiBase()}/api/game/${gameIdParam}/current-player`,
        {
          credentials: 'include',
        }
      );
      if (response.player) {
        gameId.value = gameIdParam;
        playerId.value = response.player.id;
        nickname.value = response.player.nickname;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking current player:', error);
      return false;
    }
  };

  const reset = () => {
    game.value = null;
    gameId.value = null;
    playerId.value = null;
    nickname.value = '';
    disconnectWebSocket();
  };

  return {
    game,
    gameId,
    playerId,
    nickname,
    ws,
    isConnected,
    sessionId,
    isJoined,
    canVote,
    canReveal,
    canReset,
    createGame,
    joinGame,
    connectWebSocket,
    disconnectWebSocket,
    vote,
    reveal,
    resetRound,
    loadGame,
    checkCurrentPlayer,
    reset,
    loadSessionId,
  };
});
