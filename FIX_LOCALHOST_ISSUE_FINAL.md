# 🔴 ФИНАЛЬНОЕ РЕШЕНИЕ ПРОБЛЕМЫ С LOCALHOST

## ❌ Проблема

Production сайт `https://pokerscrum.ru` обращается к `http://localhost:3000` вместо `https://pokerscrum.ru`.

**Ошибка:** `Failed to fetch` при создании игры.

---

## 🎯 Причина

**Nuxt запекает переменные окружения во время сборки!**

Frontend был собран БЕЗ переменных `NUXT_PUBLIC_API_BASE` и `NUXT_PUBLIC_WS_BASE`, поэтому использовались дефолтные `localhost` из `nuxt.config.ts`.

**Переменные в PM2 `ecosystem.config.js` НЕ работают после сборки!**

---

## ✅ РЕШЕНИЕ (3 способа)

### Способ 1: Автоматический скрипт (РЕКОМЕНДУЕТСЯ) ⭐

На production сервере:

```bash
cd /path/to/planning-poker

# Получить обновления
git pull origin main

# Запустить скрипт сборки
chmod +x build-production.sh
./build-production.sh

# Перезапустить PM2
pm2 restart all

# Проверить
pm2 logs
```

**Время: ~5 минут**

---

### Способ 2: Вручную (быстрый)

```bash
cd /path/to/planning-poker

git pull origin main

cd frontend

# Удалить старую сборку
rm -rf .output .nuxt

# Собрать с переменными
export NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
export NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
npm run build

# Перезапустить
cd ..
pm2 restart pokerscrum-frontend
```

**Время: ~3 минуты**

---

### Способ 3: Через npm скрипт

```bash
cd /path/to/planning-poker

git pull origin main

cd frontend

# Этот скрипт теперь использует правильные переменные
npm run build:prod

cd ..
pm2 restart pokerscrum-frontend
```

**Время: ~3 минуты**

---

## 📝 Что было исправлено

### 1. Создан файл `frontend/.env.production`

```env
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
PORT=3001
NITRO_PORT=3001
NODE_ENV=production
```

Nuxt автоматически использует этот файл при `NODE_ENV=production`.

### 2. Обновлен `frontend/package.json`

```json
{
  "scripts": {
    "build:prod": "cross-env NODE_ENV=production NUXT_PUBLIC_API_BASE=https://pokerscrum.ru NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru nuxt build"
  }
}
```

Теперь `npm run build:prod` гарантированно использует production URLs.

### 3. Исправлен `frontend/stores/game.ts`

Убран fallback на `ws://localhost:3000` - теперь используется browser detection.

### 4. Созданы скрипты автоматизации

- `build-production.sh` (Linux/macOS) - автоматическая сборка
- `build-production.bat` (Windows) - автоматическая сборка

### 5. Создана документация

- `CRITICAL_FIX_PRODUCTION.md` - детальная документация
- `EMERGENCY_FIX_NOW.txt` - экстренная шпаргалка
- `LOCALHOST_BUG_DIAGRAM.md` - визуальная схема проблемы

---

## ✅ Проверка после деплоя

### 1. Логи PM2

```bash
pm2 logs pokerscrum-frontend --lines 30

# Должно быть:
# ✅ Server running on http://localhost:3001
# ✅ Без ошибок
```

### 2. В браузере

1. Откройте `https://pokerscrum.ru`
2. Откройте DevTools → Network
3. Попробуйте создать игру
4. **Должен быть запрос к** `https://pokerscrum.ru/api/game/create`
5. **НЕ должно быть** запросов к `localhost:3000`

### 3. WebSocket

1. DevTools → Network → WS
2. Должен быть WebSocket: `wss://pokerscrum.ru/ws`
3. Status: `101 Switching Protocols`

### 4. Console

В браузере Console выполните:

```javascript
// Проверка runtime config
const config = useRuntimeConfig();
console.log('API Base:', config.public.apiBase);
console.log('WS Base:', config.public.wsBase);

// Должно быть:
// API Base: https://pokerscrum.ru
// WS Base: wss://pokerscrum.ru
```

---

## 🐛 Если проблема остаётся

### Проблема: В сборке всё ещё localhost

**Решение:** Проверьте переменные окружения во время сборки:

```bash
cd frontend

# Проверить .env.production
cat .env.production

# Должно быть:
# NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
# NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru

# Если файла нет - создать:
cat > .env.production << 'EOF'
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
PORT=3001
NODE_ENV=production
EOF

# Пересобрать
rm -rf .output .nuxt
npm run build:prod
```

### Проблема: npm run build:prod не работает

**Решение:** Установите cross-env:

```bash
cd frontend
npm install --save-dev cross-env
npm run build:prod
```

### Проблема: PM2 не перезапускается

**Решение:**

```bash
# Остановить
pm2 stop pokerscrum-frontend

# Удалить
pm2 delete pokerscrum-frontend

# Запустить заново
pm2 start ecosystem.config.js --only pokerscrum-frontend

# Сохранить
pm2 save
```

---

## 📊 Итоговый чеклист

- [ ] Git pull выполнен
- [ ] Frontend пересобран с production переменными
- [ ] PM2 перезапущен
- [ ] Логи без ошибок
- [ ] Сайт открывается
- [ ] API запросы идут на `https://pokerscrum.ru`
- [ ] WebSocket подключается к `wss://pokerscrum.ru`
- [ ] Нет запросов к localhost
- [ ] Можно создать игру
- [ ] Можно проголосовать
- [ ] Всё работает! 🎉

---

## 🎯 Важно для будущего

### ✅ Всегда для production используйте:

```bash
# Вариант 1: Скрипт
./build-production.sh && pm2 restart all

# Вариант 2: npm
cd frontend && npm run build:prod && cd .. && pm2 restart all

# Вариант 3: Вручную с переменными
cd frontend
export NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
export NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
npm run build
```

### ❌ Никогда не используйте:

```bash
# ❌ НЕПРАВИЛЬНО - использует localhost из .env
npm run build
pm2 restart all

# ❌ НЕПРАВИЛЬНО - переменные в PM2 не влияют на сборку
pm2 start ecosystem.config.js --env production
```

---

## 📚 Связанная документация

- [CRITICAL_FIX_PRODUCTION.md](CRITICAL_FIX_PRODUCTION.md) - детальная документация
- [EMERGENCY_FIX_NOW.txt](EMERGENCY_FIX_NOW.txt) - экстренная шпаргалка
- [LOCALHOST_BUG_DIAGRAM.md](LOCALHOST_BUG_DIAGRAM.md) - визуальная схема
- [HOTFIX_LOCALHOST_ISSUE.md](HOTFIX_LOCALHOST_ISSUE.md) - первое исправление
- [DEPLOY_HOTFIX.md](DEPLOY_HOTFIX.md) - инструкция по деплою

---

## 🏁 Резюме

1. **Проблема:** Nuxt запекает переменные окружения во время сборки
2. **Причина:** Frontend был собран без `NUXT_PUBLIC_*` переменных
3. **Решение:** Пересобрать с явным указанием production URLs
4. **Время:** ~5 минут
5. **Даунтайм:** ~5 секунд

---

**СТАТУС:** ✅ ИСПРАВЛЕНО  
**ПРИОРИТЕТ:** 🔴 КРИТИЧЕСКИЙ  
**ТРЕБУЕТСЯ:** Передеплой на production
