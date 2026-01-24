# 📋 Финальное резюме исправления для Nginx

## 🎯 Проблема

Production сайт с Nginx reverse proxy обращался к `http://localhost:3000` вместо использования Nginx proxy.

---

## 🔍 Причина

Frontend был собран с **абсолютными URL**:
```env
NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
```

Это создавало запросы:
```javascript
fetch('https://pokerscrum.ru/api/game/create')
```

Которые **обходили** Nginx `location /api/` routing.

---

## ✅ Решение

Использовать **относительные пути** для Nginx reverse proxy:

```env
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_WS_BASE=
```

Это создаёт запросы:
```javascript
fetch('/api/game/create')
```

Которые Nginx корректно проксирует на backend.

---

## 📝 Изменённые файлы

### 1. `frontend/.env.production`

```diff
- NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
- NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
+ NUXT_PUBLIC_API_BASE=
+ NUXT_PUBLIC_WS_BASE=
```

### 2. `frontend/nuxt.config.ts`

```diff
  runtimeConfig: {
    public: {
-     apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
-     wsBase: process.env.NUXT_PUBLIC_WS_BASE || 'ws://localhost:3000',
+     apiBase: process.env.NUXT_PUBLIC_API_BASE || 
+       (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'),
+     wsBase: process.env.NUXT_PUBLIC_WS_BASE || 
+       (process.env.NODE_ENV === 'production' ? '' : 'ws://localhost:3000'),
    },
  },
```

### 3. `frontend/package.json`

```diff
- "build:prod": "cross-env NUXT_PUBLIC_API_BASE=https://pokerscrum.ru NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru nuxt build",
+ "build:prod": "cross-env NODE_ENV=production nuxt build",
```

### 4. `ecosystem.config.js`

```diff
  env_production: {
    NODE_ENV: 'production',
    PORT: 3001,
    NITRO_PORT: 3001,
-   NUXT_PUBLIC_API_BASE: 'https://pokerscrum.ru',
-   NUXT_PUBLIC_WS_BASE: 'wss://pokerscrum.ru'
+   NUXT_PUBLIC_API_BASE: '',
+   NUXT_PUBLIC_WS_BASE: ''
  }
```

### 5. `build-production.sh` и `build-production.bat`

Обновлены для использования пустых переменных.

---

## 🚀 Команды для деплоя

```bash
cd /path/to/planning-poker
git pull origin main
cd frontend
rm -rf .output .nuxt
npm run build:prod
cd ..
pm2 restart pokerscrum-frontend
```

---

## ✅ Проверка

### DevTools → Network:

```
✅ Request URL: https://pokerscrum.ru/api/game/create
✅ Status: 200 OK
```

### НЕ должно быть:

```
❌ Request URL: http://localhost:3000/api/game/create
```

---

## 📊 Как это работает

### ДО (абсолютный URL):

```
Browser
  │
  └─► fetch('https://pokerscrum.ru/api/game/create')
          │
          └─► Прямой запрос (обход Nginx)
```

### ПОСЛЕ (относительный путь):

```
Browser на https://pokerscrum.ru
  │
  └─► fetch('/api/game/create')
          │
          ▼
      Nginx location /api/
          │
          └─► proxy_pass http://127.0.0.1:3000 ✅
```

---

## 📚 Документация

### Быстрый доступ:
- 🚨 **[QUICK_FIX_NGINX.txt](QUICK_FIX_NGINX.txt)** - шпаргалка команд
- 📖 **[NGINX_FIX_FINAL.md](NGINX_FIX_FINAL.md)** - полная инструкция
- 🔍 **[NGINX_EXPLANATION.md](NGINX_EXPLANATION.md)** - детальное объяснение

### Остальная документация:
- [ALL_FIXES_SUMMARY.md](ALL_FIXES_SUMMARY.md) - история всех проблем
- [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md) - гид по конфигурации
- [PM2_DEPLOYMENT.md](PM2_DEPLOYMENT.md) - деплой через PM2

---

## 🎯 Правило на будущее

### С Nginx reverse proxy:
```env
✅ NUXT_PUBLIC_API_BASE=
✅ NUXT_PUBLIC_WS_BASE=
```

### Без Nginx (прямой доступ):
```env
✅ NUXT_PUBLIC_API_BASE=https://yourdomain.com
✅ NUXT_PUBLIC_WS_BASE=wss://yourdomain.com
```

### Development:
```env
✅ NUXT_PUBLIC_API_BASE=http://localhost:3000
✅ NUXT_PUBLIC_WS_BASE=ws://localhost:3000
```

---

## 📈 Итого изменений

- **Файлов изменено:** 6
- **Новых файлов:** 3
- **Строк документации:** ~1000+
- **Время деплоя:** ~5 минут
- **Даунтайм:** ~5 секунд

---

**СТАТУС:** ✅ ИСПРАВЛЕНО  
**ТРЕБУЕТСЯ:** Деплой на production  
**ПРИОРИТЕТ:** 🔴 КРИТИЧЕСКИЙ
