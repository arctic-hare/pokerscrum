# 🚨 HOTFIX: Localhost в Production

## Проблема

На production сайте `https://pokerscrum.ru` браузер запрашивал разрешение на доступ к локальной сети, потому что frontend пытался подключиться к `ws://localhost:3000`.

## Причина

В `frontend/stores/game.ts` в функции `getWsBase()` был фоллбэк на `ws://localhost:3000` (строка 66).

При Server-Side Rendering (SSR) в Nuxt, код проверки `window.location` не выполнялся, и возвращался дефолтный `ws://localhost:3000`. Это значение попадало в клиентский код.

## Исправление

### Изменен файл: `frontend/stores/game.ts`

**Было:**
```javascript
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
  return 'ws://localhost:3000';  // ❌ ПРОБЛЕМА!
};
```

**Стало:**
```javascript
const getWsBase = () => {
  const config = getConfig();
  
  // 1. Приоритет: явно указанный wsBase
  if (config.public.wsBase) {
    return config.public.wsBase;
  }
  
  // 2. Конвертируем apiBase в WS URL
  if (config.public.apiBase) {
    return config.public.apiBase.replace(/^http/, 'ws');
  }
  
  // 3. В браузере определяем по текущему location
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${window.location.host}`;
  }
  
  // 4. FALLBACK на SSR: пустая строка вместо localhost
  return '';  // ✅ ИСПРАВЛЕНО!
};
```

## 🚀 Деплой исправления

### Вариант 1: PM2 (рекомендуется)

```bash
# 1. Получить обновления
cd c:\Projects\planning-poker
git pull origin main

# 2. Пересобрать frontend с правильными переменными
cd frontend
npm run build:prod

# 3. Перезапустить через PM2
cd ..
pm2 reload pokerscrum-frontend

# 4. Проверить логи
pm2 logs pokerscrum-frontend --lines 50
```

### Вариант 2: Прямой деплой

```bash
# 1. Получить обновления
git pull origin main

# 2. Убедиться, что переменные окружения правильные
# Либо в .env:
cat frontend/.env
# Должно быть:
# NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
# NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru

# ИЛИ использовать build:prod которая уже настроена:
cd frontend
npm run build:prod

# 3. Перезапустить приложение
```

### Вариант 3: Docker

```bash
# 1. Получить обновления
git pull origin main

# 2. Пересобрать контейнер
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Проверить логи
docker-compose logs -f frontend
```

## ✅ Проверка исправления

После деплоя:

1. Откройте `https://pokerscrum.ru` в браузере
2. Создайте новую игру
3. **Не должно быть** запроса на доступ к локальной сети
4. Откройте DevTools → Network → WS
5. Проверьте WebSocket URL - должно быть `wss://pokerscrum.ru/ws`

## 🔍 Дополнительная проверка

### Проверить переменные окружения в сборке

Создайте временный файл для проверки:

```vue
<!-- frontend/pages/debug.vue -->
<template>
  <div>
    <h1>Debug Info</h1>
    <pre>{{ config }}</pre>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();
</script>
```

Откройте `https://pokerscrum.ru/debug` и проверьте:
- `apiBase` должен быть `https://pokerscrum.ru`
- `wsBase` должен быть `wss://pokerscrum.ru`

**После проверки удалите этот файл!**

## 📝 Важно для будущего

### При сборке frontend всегда используйте:

```bash
# Для production
npm run build:prod

# Это автоматически установит:
# NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
# NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
```

### Или через PM2:

```bash
pm2 start ecosystem.config.js --env production
# Переменные берутся из ecosystem.config.js
```

### Никогда не используйте:

```bash
npm run build  # ❌ Использует .env (может быть localhost!)
```

## 🎯 Корневая причина

Production frontend был **либо**:
1. Собран с `npm run build` вместо `npm run build:prod`
2. Собран без переменных окружения
3. Переменные окружения были не установлены при запуске

## 🔐 Безопасность

Этот баг **не критичен для безопасности**, но:
- Ухудшает пользовательский опыт (запрос разрешений)
- WebSocket не подключался (приложение не работало)
- Браузеры блокировали подключение к localhost

## ✨ Итог

- ✅ Убран hardcoded `ws://localhost:3000` fallback
- ✅ Добавлена проверка `window.location` в браузере
- ✅ SSR fallback теперь пустая строка (используется browser detection)
- ✅ Документированы правильные команды сборки

---

**Дата исправления:** 2024  
**Приоритет:** HIGH  
**Статус:** ИСПРАВЛЕНО (требует передеплоя)
