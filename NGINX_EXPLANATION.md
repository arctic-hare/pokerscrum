# 🔍 Почему нужны пустые переменные для Nginx

## 📝 Объяснение проблемы

### Ваша Nginx конфигурация:

```nginx
server {
    server_name pokerscrum.ru;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3001;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

---

## ❌ Что происходило ДО исправления

### Frontend был собран с:

```env
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
```

### Код формировал URL:

```javascript
// В stores/game.ts:
const url = `${getApiBase()}/api/game/create`;
// Результат: 'https://pokerscrum.ru/api/game/create'

fetch('https://pokerscrum.ru/api/game/create', { ... });
```

### Что делал браузер:

```
Browser
    │
    ├─► fetch('https://pokerscrum.ru/api/game/create')
    │       │
    │       └─► DNS lookup для pokerscrum.ru
    │               │
    │               └─► Идёт напрямую на IP сервера
    │                       │
    │                       ├─► Nginx получает запрос
    │                       │
    │                       └─► location / (не /api/!)
    │                               │
    │                               └─► proxy_pass :3001 (Frontend!)
    │                                       │
    │                                       └─► ❌ Frontend не знает про /api
```

**Проблема:** Абсолютный URL `https://pokerscrum.ru/api/...` **НЕ матчится** с `location /api/` в Nginx!

Nginx видит только path после домена. Когда браузер делает:
```
GET https://pokerscrum.ru/api/game/create
```

Nginx получает только:
```
GET /api/game/create
```

НО! Если в JavaScript коде используется абсолютный URL, браузер пытается сделать прямое подключение к этому URL, **игнорируя** текущий контекст страницы.

---

## ✅ Что происходит ПОСЛЕ исправления

### Frontend собран с:

```env
NUXT_PUBLIC_API_BASE=
```

### Код формирует URL:

```javascript
// В stores/game.ts:
const url = `${getApiBase()}/api/game/create`;
// getApiBase() возвращает ''
// Результат: '/api/game/create'

fetch('/api/game/create', { ... });
```

### Что делает браузер:

```
Browser на https://pokerscrum.ru
    │
    ├─► fetch('/api/game/create')  ← ОТНОСИТЕЛЬНЫЙ путь!
    │       │
    │       └─► Браузер автоматически добавляет текущий host
    │               │
    │               └─► Фактический запрос: https://pokerscrum.ru/api/game/create
    │                       │
    │                       ▼
    │                   Nginx
    │                       │
    │                       ├─► Проверяет location
    │                       │
    │                       └─► location /api/ ← СОВПАДЕНИЕ! ✅
    │                               │
    │                               └─► proxy_pass http://127.0.0.1:3000
    │                                       │
    │                                       ▼
    │                                   Backend :3000
    │                                       │
    │                                       └─► ✅ Обрабатывает запрос!
```

---

## 🎯 Ключевая разница

### Абсолютный URL:

```javascript
fetch('https://pokerscrum.ru/api/game/create')
```

- Браузер видит полный URL
- Nginx получает запрос, но уже после DNS lookup
- Routing в Nginx может работать неправильно

### Относительный URL:

```javascript
fetch('/api/game/create')
```

- Браузер использует текущий host (pokerscrum.ru)
- Запрос идёт на тот же сервер
- Nginx корректно матчит `location /api/`
- Проксирует на backend

---

## 📊 Визуальное сравнение

### ❌ С абсолютным URL:

```
Frontend code:
  apiBase = 'https://pokerscrum.ru'
  fetch(`${apiBase}/api/game/create`)
      │
      └─► 'https://pokerscrum.ru/api/game/create'
              │
              ▼
          Browser
              │
              └─► Прямой запрос (может обойти Nginx location)
```

### ✅ С относительным URL:

```
Frontend code:
  apiBase = ''
  fetch(`${apiBase}/api/game/create`)
      │
      └─► '/api/game/create'
              │
              ▼
          Browser
              │
              └─► Относительный запрос
                      │
                      ▼
                  Nginx location /api/
                      │
                      └─► proxy_pass :3000 ✅
```

---

## 🔧 Как это работает в разных окружениях

### Development (без Nginx):

```javascript
// .env:
NUXT_PUBLIC_API_BASE=http://localhost:3000

// Результат:
fetch('http://localhost:3000/api/game/create')
// Прямой запрос на backend
```

### Production (с Nginx):

```javascript
// .env.production:
NUXT_PUBLIC_API_BASE=

// Результат:
fetch('/api/game/create')
// Относительный запрос
// Nginx проксирует на backend
```

---

## 💡 Почему WebSocket тоже нужна пустая строка

### С абсолютным URL:

```javascript
wsBase = 'wss://pokerscrum.ru'
new WebSocket('wss://pokerscrum.ru/ws')
// Может не матчиться с location /ws
```

### С пустой строкой:

```javascript
wsBase = ''
// Код автоматически определяет протокол по window.location
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const wsUrl = `${protocol}://${window.location.host}/ws`;
// Результат: 'wss://pokerscrum.ru/ws'
// Nginx корректно проксирует на backend
```

---

## 📝 Правило для разных конфигураций

### Если используете Nginx reverse proxy:

```env
# ✅ Используйте ПУСТЫЕ значения
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_WS_BASE=
```

### Если НЕТ Nginx (прямой доступ к приложению):

```env
# ✅ Используйте ПОЛНЫЕ URL
NUXT_PUBLIC_API_BASE=https://yourdomain.com
NUXT_PUBLIC_WS_BASE=wss://yourdomain.com
```

### Для локальной разработки:

```env
# ✅ Используйте localhost URL
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_WS_BASE=ws://localhost:3000
```

---

## 🎓 Вывод

**Для Nginx reverse proxy всегда используйте относительные пути (пустые переменные)!**

Это позволяет Nginx корректно обрабатывать routing и проксировать запросы на нужные сервисы.

---

## 📚 См. также

- [NGINX_FIX_FINAL.md](NGINX_FIX_FINAL.md) - инструкция по исправлению
- [QUICK_FIX_NGINX.txt](QUICK_FIX_NGINX.txt) - быстрая шпаргалка
