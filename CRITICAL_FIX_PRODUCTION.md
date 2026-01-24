# 🔴 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ - Frontend на Production

## ❌ ПРОБЛЕМА

Production frontend обращается к `http://localhost:3000` вместо `https://pokerscrum.ru`.

**Ошибка:** `Failed to fetch` при создании игры.

## 🎯 Корневая причина

**Переменные окружения в PM2 НЕ работают для Nuxt после сборки!**

В Nuxt переменные `NUXT_PUBLIC_*` **запекаются в код во время `npm run build`**.

Текущая сборка была создана БЕЗ переменных окружения, поэтому используются дефолтные localhost из `nuxt.config.ts`.

---

## ✅ СРОЧНОЕ ИСПРАВЛЕНИЕ

### На production сервере выполните:

```bash
#!/bin/bash

# Перейти в директорию проекта
cd /path/to/planning-poker

# Получить последние изменения
git pull origin main

# Перейти в frontend
cd frontend

# УДАЛИТЬ старую сборку
echo "🗑️  Удаление старой сборки..."
rm -rf .output
rm -rf .nuxt
rm -rf node_modules/.cache

# Создать production .env файл
echo "📝 Создание production .env..."
cat > .env.production << 'EOF'
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
PORT=3001
NITRO_PORT=3001
NODE_ENV=production
EOF

# Собрать с production переменными
echo "🔨 Сборка с production переменными..."
export NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
export NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
npm run build

# Проверить, что .output существует
if [ ! -d ".output" ]; then
    echo "❌ Ошибка: .output не создан!"
    exit 1
fi

# Вернуться в корень
cd ..

# Перезапустить frontend через PM2
echo "🔄 Перезапуск frontend..."
pm2 restart pokerscrum-frontend

# Показать логи
echo "📋 Логи frontend:"
pm2 logs pokerscrum-frontend --lines 30 --nostream

echo ""
echo "✅ Готово!"
echo ""
echo "Проверьте https://pokerscrum.ru"
echo "API запросы должны идти на https://pokerscrum.ru/api/..."
```

---

## 🐛 Для Windows

```powershell
# Перейти в директорию проекта
cd C:\path\to\planning-poker

# Получить изменения
git pull origin main

# Перейти в frontend
cd frontend

# Удалить старую сборку
Remove-Item -Recurse -Force .output -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .nuxt -ErrorAction SilentlyContinue

# Установить переменные окружения
$env:NUXT_PUBLIC_API_BASE = "https://pokerscrum.ru"
$env:NUXT_PUBLIC_WS_BASE = "wss://pokerscrum.ru"

# Собрать
npm run build

# Вернуться
cd ..

# Перезапустить
pm2 restart pokerscrum-frontend
pm2 logs pokerscrum-frontend --lines 30
```

---

## 📋 Пошаговая проверка

### 1. Убедитесь, что сборка создана с правильными переменными

```bash
# Проверить содержимое сборки
cd frontend/.output
grep -r "localhost:3000" . || echo "✅ localhost не найден"
grep -r "pokerscrum.ru" . && echo "✅ pokerscrum.ru найден"
```

### 2. Проверьте логи PM2

```bash
pm2 logs pokerscrum-frontend --lines 50

# Не должно быть ошибок
# Должен быть запущен на порту 3001
```

### 3. Проверьте через curl на сервере

```bash
# Должен вернуть HTML
curl http://localhost:3001

# Должен содержать pokerscrum.ru
curl http://localhost:3001 | grep "pokerscrum.ru"
```

### 4. Проверьте в браузере

1. Откройте https://pokerscrum.ru
2. Откройте DevTools → Console
3. Выполните:
   ```javascript
   fetch('/api/game/create', { method: 'POST', body: '{}' })
   ```
4. В Network tab должен быть запрос к `https://pokerscrum.ru/api/game/create`

---

## ⚠️ ВАЖНО: Исправление ecosystem.config.js

**Проблема:** Переменные `env_production` в `ecosystem.config.js` НЕ влияют на Nuxt сборку!

**Решение:** Нужно собирать frontend ПЕРЕД запуском PM2.

### Обновленный процесс деплоя:

```bash
# ❌ НЕПРАВИЛЬНО (старый способ):
npm run build
pm2 start ecosystem.config.js --env production

# ✅ ПРАВИЛЬНО (новый способ):
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru \
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru \
npm run build

pm2 start ecosystem.config.js
```

### Или через скрипт build:prod:

Обновим `package.json` чтобы `build:prod` не использовал cross-env (который может не работать в некоторых окружениях):

```json
{
  "scripts": {
    "build:prod": "nuxt build",
    "prebuild:prod": "echo 'Building for production...'"
  }
}
```

И создадим `.env.production`:

```env
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
```

---

## 🔍 Диагностика после деплоя

### Проверка 1: Runtime Config в браузере

Откройте https://pokerscrum.ru, затем в Console:

```javascript
// Создайте временный компонент для проверки
const config = useRuntimeConfig();
console.log('API Base:', config.public.apiBase);
console.log('WS Base:', config.public.wsBase);

// Должно быть:
// API Base: https://pokerscrum.ru
// WS Base: wss://pokerscrum.ru

// Если видите localhost - сборка неправильная!
```

### Проверка 2: Network запросы

1. Откройте DevTools → Network
2. Попробуйте создать игру
3. Должен быть запрос к `https://pokerscrum.ru/api/game/create`
4. **НЕ должно быть** запросов к `localhost:3000`

### Проверка 3: WebSocket

1. DevTools → Network → WS
2. Должен быть WebSocket к `wss://pokerscrum.ru/ws`
3. Status: `101 Switching Protocols`

---

## 💡 Альтернатива: Nuxt Environment Modes

Создайте файл `.env.production` в frontend:

```bash
cd frontend

cat > .env.production << 'EOF'
# Production environment
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
PORT=3001
EOF
```

Теперь при запуске `npm run build` Nuxt автоматически использует `.env.production` если `NODE_ENV=production`.

---

## 🎯 Итоговый чеклист

- [ ] git pull выполнен
- [ ] Старая сборка удалена (`rm -rf .output .nuxt`)
- [ ] Frontend собран с переменными:
  - [ ] `NUXT_PUBLIC_API_BASE=https://pokerscrum.ru`
  - [ ] `NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru`
- [ ] Директория `.output` создана
- [ ] PM2 перезапущен
- [ ] Логи PM2 без ошибок
- [ ] Сайт открывается
- [ ] API запросы идут на `https://pokerscrum.ru`
- [ ] WebSocket подключается к `wss://pokerscrum.ru`
- [ ] Нет запросов к localhost
- [ ] Можно создать игру ✅
- [ ] Всё работает! 🎉

---

## 📞 Если проблема остаётся

### 1. Проверьте, что build был с переменными:

```bash
# В процессе сборки должно быть видно:
export NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
npm run build

# Во время сборки Nuxt должен показать:
# ℹ Using Nitro server preset: node-server
```

### 2. Проверьте содержимое сборки:

```bash
cd frontend/.output/server
cat index.mjs | grep -A5 -B5 "apiBase"

# Должно содержать "pokerscrum.ru", НЕ "localhost"
```

### 3. Полная пересборка:

```bash
cd frontend
rm -rf node_modules .output .nuxt package-lock.json
npm install
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru \
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru \
npm run build
```

---

**ВРЕМЯ ВЫПОЛНЕНИЯ:** 5-10 минут (зависит от скорости сборки)  
**ДАУНТАЙМ:** ~5 секунд (время перезапуска PM2)  
**ПРИОРИТЕТ:** 🔴 КРИТИЧЕСКИЙ
