# 🔧 ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ДЛЯ NGINX

## ❌ Проблема

Frontend обращается к `http://localhost:3000/api/game/create` вместо использования Nginx proxy.

## 🎯 Корневая причина

**У вас Nginx reverse proxy!**

Ваша Nginx конфигурация:
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
}
```

НО Frontend был собран с:
```javascript
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
// Формирует: https://pokerscrum.ru/api/game/create
```

Это создаёт абсолютный URL, который **обходит Nginx proxy**!

---

## ✅ Правильное решение

Для работы с Nginx reverse proxy нужно использовать **относительные пути**:

```javascript
// ❌ НЕПРАВИЛЬНО (абсолютный URL):
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
// Формирует: https://pokerscrum.ru/api/game/create

// ✅ ПРАВИЛЬНО (относительный путь):
NUXT_PUBLIC_API_BASE=
// Формирует: /api/game/create
// Nginx перенаправит на backend
```

---

## 🔧 Что было исправлено

### 1. `frontend/.env.production`

**Было:**
```env
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
```

**Стало:**
```env
# Пустые значения = относительные пути для Nginx
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_WS_BASE=
```

### 2. `frontend/nuxt.config.ts`

**Было:**
```javascript
apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
```

**Стало:**
```javascript
// В production пустая строка (относительные пути)
// В development полный URL
apiBase: process.env.NUXT_PUBLIC_API_BASE || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000')
```

### 3. `frontend/package.json`

**Было:**
```json
"build:prod": "cross-env NUXT_PUBLIC_API_BASE=https://pokerscrum.ru nuxt build"
```

**Стало:**
```json
"build:prod": "cross-env NODE_ENV=production nuxt build"
```

### 4. Скрипты `build-production.sh/bat`

Обновлены для использования пустых переменных.

---

## 🚀 КАК РАБОТАЕТ СЕЙЧАС

### С Nginx (Production):

```
Browser: https://pokerscrum.ru
    │
    ├─► Запрос: /api/game/create (относительный!)
    │       │
    │       ▼
    │   Nginx
    │       │
    │       ├─► location /api/ → proxy_pass http://127.0.0.1:3000
    │       │
    │       ▼
    │   Backend :3000
    │       │
    │       └─► ✅ Обработка запроса
    │
    └─► ✅ Всё работает!
```

### Без Nginx (Development):

```
Browser: http://localhost:3001
    │
    ├─► Запрос: http://localhost:3000/api/game/create (абсолютный!)
    │       │
    │       ▼
    │   Backend :3000
    │       │
    │       └─► ✅ Обработка запроса
```

---

## 📋 ДЕПЛОЙ (ВЫПОЛНИТЕ СЕЙЧАС)

На production сервере:

```bash
# 1. Перейти в проект
cd /path/to/planning-poker

# 2. Получить обновления
git pull origin main

# 3. Перейти в frontend
cd frontend

# 4. УДАЛИТЬ старую сборку
rm -rf .output .nuxt node_modules/.cache

# 5. Проверить .env.production
cat .env.production
# Должно быть:
# NUXT_PUBLIC_API_BASE=
# NUXT_PUBLIC_WS_BASE=

# 6. Собрать с пустыми переменными
npm run build:prod

# 7. Проверить сборку
grep -r "localhost:3000" .output/ && echo "❌ ОШИБКА: localhost найден!" || echo "✅ OK"

# 8. Вернуться в корень и перезапустить
cd ..
pm2 restart pokerscrum-frontend

# 9. Проверить логи
pm2 logs pokerscrum-frontend --lines 30
```

**Время: ~5 минут**

---

## ✅ Проверка после деплоя

### 1. DevTools → Network

Откройте https://pokerscrum.ru

Попробуйте создать игру.

**Должно быть:**
```
✅ Request URL: https://pokerscrum.ru/api/game/create (относительный!)
✅ Status: 200 OK
```

**НЕ должно быть:**
```
❌ Request URL: http://localhost:3000/api/game/create
```

### 2. WebSocket

DevTools → Network → WS

**Должен быть:**
```
✅ wss://pokerscrum.ru/ws
✅ Status: 101 Switching Protocols
```

### 3. Console проверка

```javascript
const config = useRuntimeConfig();
console.log('API Base:', config.public.apiBase);
console.log('WS Base:', config.public.wsBase);

// Должно быть:
// API Base: "" (пустая строка)
// WS Base: "" (пустая строка)
```

---

## 🔍 Проверка сборки

Чтобы убедиться, что в сборке нет localhost:

```bash
cd frontend

# Проверить, что в сборке НЕТ localhost
grep -r "localhost:3000" .output/

# Если ничего не найдено = ✅ ОК
# Если что-то найдено = ❌ Пересобрать!
```

---

## 🐛 Если проблема остаётся

### Проблема: Всё ещё обращается к localhost

**Решение 1:** Полная очистка и пересборка

```bash
cd frontend

# Удалить всё
rm -rf .output .nuxt node_modules/.cache node_modules package-lock.json

# Переустановить
npm install

# Пересобрать
npm run build:prod

# Проверить
grep -r "localhost:3000" .output/ || echo "OK"
```

**Решение 2:** Проверить переменные окружения

```bash
# Во время сборки должно быть:
export NODE_ENV=production
export NUXT_PUBLIC_API_BASE=
export NUXT_PUBLIC_WS_BASE=
npm run build
```

**Решение 3:** Использовать скрипт

```bash
cd /path/to/planning-poker
./build-production.sh
pm2 restart pokerscrum-frontend
```

---

## 📊 Сравнение подходов

### ❌ НЕПРАВИЛЬНО (было):

```javascript
// Frontend формирует абсолютные URL
apiBase: 'https://pokerscrum.ru'

// Результат:
fetch('https://pokerscrum.ru/api/game/create')
// Обходит Nginx, идёт напрямую
```

### ✅ ПРАВИЛЬНО (стало):

```javascript
// Frontend использует относительные пути
apiBase: ''

// Результат:
fetch('/api/game/create')
// Nginx перехватывает и проксирует на backend
```

---

## 💡 Важно для будущего

### Если используете Nginx reverse proxy:

```env
# ✅ ВСЕГДА используйте пустые значения для production
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_WS_BASE=
```

### Если НЕ используете Nginx (прямой доступ):

```env
# ✅ Используйте полные URL
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
```

### Для локальной разработки:

```env
# ✅ Полные URL для прямого подключения
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_WS_BASE=ws://localhost:3000
```

---

## 📚 Связанная документация

- [DO_THIS_NOW.md](DO_THIS_NOW.md) - быстрая инструкция (устарела, см. этот файл)
- [ALL_FIXES_SUMMARY.md](ALL_FIXES_SUMMARY.md) - история всех исправлений

---

## 🎯 Резюме

**Проблема:** Frontend формировал абсолютные URL, обходя Nginx

**Решение:** Используем пустые `NUXT_PUBLIC_API_BASE` и `NUXT_PUBLIC_WS_BASE` для относительных путей

**Результат:** Nginx корректно проксирует запросы на backend

---

**СТАТУС:** ✅ ИСПРАВЛЕНО  
**ТРЕБУЕТСЯ:** Пересборка frontend на production  
**ВРЕМЯ:** ~5 минут  
**ПРИОРИТЕТ:** 🔴 КРИТИЧЕСКИЙ
