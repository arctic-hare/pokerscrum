# PM2 - Что было исправлено ✅

## 📋 Краткое резюме

Файл `ecosystem.config.js` был **полностью переработан** для корректной работы на production.

---

## ❌ Проблемы ДО исправления

1. **Неправильные пути к .env**
   ```javascript
   env_file: './.env'  // ❌ Не работает с cwd: './backend'
   ```

2. **Отсутствие production переменных**
   ```javascript
   env_production: { NODE_ENV: 'production' }  // ❌ Нет FRONTEND_URL!
   ```

3. **Нет логирования**
   - Логи не сохранялись
   - Невозможно отладить проблемы

4. **Fork mode вместо cluster**
   ```javascript
   exec_mode: 'fork'  // ❌ Не масштабируется
   ```

5. **Нет защиты от падений**
   - Нет лимита памяти
   - Нет автоперезапуска
   - Нет контроля перезапусков

---

## ✅ Что ИСПРАВЛЕНО

### 1. Переменные окружения

**Backend - Development:**
```javascript
env: {
  NODE_ENV: 'development',
  PORT: 3000,
  FRONTEND_URL: 'http://localhost:3001'  // ✅ CORS для localhost
}
```

**Backend - Production:**
```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3000,
  FRONTEND_URL: 'https://pokerscrum.ru'  // ✅ CORS для прода
}
```

**Frontend - Development:**
```javascript
env: {
  NODE_ENV: 'development',
  PORT: 3001,
  NUXT_PUBLIC_API_BASE: 'http://localhost:3000',  // ✅ Локальный API
  NUXT_PUBLIC_WS_BASE: 'ws://localhost:3000'
}
```

**Frontend - Production:**
```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3001,
  NUXT_PUBLIC_API_BASE: 'https://pokerscrum.ru',  // ✅ Прод API
  NUXT_PUBLIC_WS_BASE: 'wss://pokerscrum.ru'
}
```

### 2. Логирование

```javascript
error_file: './logs/backend-error.log',     // ✅ Ошибки
out_file: './logs/backend-out.log',         // ✅ Вывод
log_date_format: 'YYYY-MM-DD HH:mm:ss Z',  // ✅ Timestamp
merge_logs: true                            // ✅ Объединение
```

### 3. Cluster Mode

```javascript
instances: 1,              // ✅ Можно увеличить до 'max'
exec_mode: 'cluster',      // ✅ Cluster для масштабирования
```

### 4. Мониторинг и защита

```javascript
autorestart: true,              // ✅ Автоперезапуск
max_restarts: 10,               // ✅ Максимум 10 перезапусков
min_uptime: '10s',              // ✅ Минимум 10 сек работы
max_memory_restart: '500M',     // ✅ Restart при 500MB (backend)
max_memory_restart: '300M',     // ✅ Restart при 300MB (frontend)
```

---

## 📊 Сравнение ДО и ПОСЛЕ

| Параметр | ДО | ПОСЛЕ |
|----------|------|--------|
| **CORS для localhost** | ❌ Нет | ✅ Настроен |
| **CORS для production** | ❌ Нет | ✅ Настроен |
| **Логирование** | ❌ Нет | ✅ В отдельных файлах |
| **Cluster mode** | ❌ Fork | ✅ Cluster |
| **Автоперезапуск** | ❌ Нет | ✅ Есть |
| **Лимит памяти** | ❌ Нет | ✅ 500M/300M |
| **Переменные для Nuxt** | ❌ Нет | ✅ Настроены |

---

## 🚀 Как использовать

### Development

```bash
pm2 start ecosystem.config.js --env development
```

**Результат:**
- Backend CORS: `http://localhost:3001` ✅
- Frontend API: `http://localhost:3000` ✅

### Production

```bash
pm2 start ecosystem.config.js --env production
```

**Результат:**
- Backend CORS: `https://pokerscrum.ru` ✅
- Frontend API: `https://pokerscrum.ru` ✅

---

## 📝 Созданная документация

1. **PM2_DEPLOYMENT.md** (195 строк) - полное руководство
2. **PM2_CHECKLIST.md** (150+ строк) - чеклист деплоя
3. **PM2_SUMMARY.md** (200+ строк) - резюме изменений
4. **PM2_CHEATSHEET.md** (80+ строк) - шпаргалка команд
5. **prepare-pm2.sh** - скрипт подготовки (Linux/macOS)
6. **prepare-pm2.bat** - скрипт подготовки (Windows)

---

## ✅ Итог

### Было:
```javascript
{
  name: 'pokerscrum-backend',
  script: './dist/main.js',
  env_file: './.env',           // ❌ Не работает
  env_production: {
    NODE_ENV: 'production'       // ❌ Нет FRONTEND_URL
  }
}
```

### Стало:
```javascript
{
  name: 'pokerscrum-backend',
  script: './dist/main.js',
  instances: 1,
  exec_mode: 'cluster',          // ✅ Cluster mode
  autorestart: true,             // ✅ Автоперезапуск
  max_memory_restart: '500M',    // ✅ Лимит памяти
  error_file: './logs/backend-error.log',  // ✅ Логи
  env: {
    NODE_ENV: 'development',
    PORT: 3000,
    FRONTEND_URL: 'http://localhost:3001'  // ✅ Dev CORS
  },
  env_production: {
    NODE_ENV: 'production',
    PORT: 3000,
    FRONTEND_URL: 'https://pokerscrum.ru'  // ✅ Prod CORS
  }
}
```

---

## 🎯 Теперь PM2 готов к production! 🎉

- ✅ Правильные переменные окружения
- ✅ CORS настроен для dev и prod
- ✅ Логирование работает
- ✅ Cluster mode включен
- ✅ Автоперезапуск настроен
- ✅ Защита от утечек памяти
- ✅ Полная документация

---

## 📚 Дополнительно

- Полная документация: [PM2_DEPLOYMENT.md](PM2_DEPLOYMENT.md)
- Чеклист: [PM2_CHECKLIST.md](PM2_CHECKLIST.md)
- Команды: [PM2_CHEATSHEET.md](PM2_CHEATSHEET.md)
- Архитектура: [ARCHITECTURE.md](ARCHITECTURE.md)
