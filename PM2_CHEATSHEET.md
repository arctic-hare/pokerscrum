# PM2 Cheat Sheet 📝

Быстрая шпаргалка по командам PM2 для Planning Poker.

---

## 🚀 Запуск

```bash
# Production (рекомендуется)
pm2 start ecosystem.config.js --env production

# Development
pm2 start ecosystem.config.js --env development

# Только backend
pm2 start ecosystem.config.js --only pokerscrum-backend --env production

# Только frontend
pm2 start ecosystem.config.js --only pokerscrum-frontend --env production
```

---

## 📊 Мониторинг

```bash
# Статус всех приложений
pm2 status

# Интерактивный мониторинг (CPU, память)
pm2 monit

# Детальная информация
pm2 show pokerscrum-backend
pm2 show pokerscrum-frontend

# Список с использованием ресурсов
pm2 list
```

---

## 📝 Логи

```bash
# Все логи в реальном времени
pm2 logs

# Логи конкретного приложения
pm2 logs pokerscrum-backend
pm2 logs pokerscrum-frontend

# Последние N строк
pm2 logs --lines 100

# Только ошибки
pm2 logs --err

# Очистка логов
pm2 flush
```

---

## 🔄 Управление

```bash
# Перезапуск
pm2 restart all
pm2 restart pokerscrum-backend
pm2 restart pokerscrum-frontend

# Перезагрузка без даунтайма (0-downtime)
pm2 reload all
pm2 reload pokerscrum-backend

# Остановка
pm2 stop all
pm2 stop pokerscrum-backend

# Запуск остановленных
pm2 start all
pm2 start pokerscrum-backend

# Удаление из PM2
pm2 delete all
pm2 delete pokerscrum-backend
```

---

## 🤖 Автозапуск

```bash
# Генерация startup скрипта
pm2 startup

# Сохранение текущей конфигурации
pm2 save

# Отключение автозапуска
pm2 unstartup
```

---

## 🔧 Конфигурация

```bash
# Показать конфигурацию PM2
pm2 conf

# Обновить PM2
npm install -g pm2
pm2 update
```

---

## 🐛 Отладка

```bash
# Детальная информация о приложении
pm2 describe pokerscrum-backend

# Переменные окружения
pm2 show pokerscrum-backend | grep -A 50 "env:"

# Перезапуск с логированием
pm2 restart pokerscrum-backend && pm2 logs pokerscrum-backend

# Убить все процессы PM2
pm2 kill
```

---

## 📦 Деплой (Quick)

```bash
# 1. Обновление кода
git pull origin main

# 2. Установка и сборка
cd backend && npm install && npm run build:prod
cd ../frontend && npm install && npm run build:prod

# 3. Перезагрузка (0-downtime)
cd ..
pm2 reload all

# 4. Проверка
pm2 status
pm2 logs --lines 50
```

---

## 🆘 Быстрое решение проблем

### Приложение не запускается
```bash
pm2 logs --err --lines 100
```

### CORS ошибка
```bash
pm2 show pokerscrum-backend | grep FRONTEND_URL
pm2 restart pokerscrum-backend --env production
```

### Высокое использование памяти
```bash
pm2 monit
pm2 restart all
```

### Проверка работы
```bash
# Backend
curl http://localhost:3000

# Frontend
curl http://localhost:3001

# Статус
pm2 status
```

---

## 📁 Файлы логов

- Backend ошибки: `backend/logs/backend-error.log`
- Backend вывод: `backend/logs/backend-out.log`
- Frontend ошибки: `frontend/logs/frontend-error.log`
- Frontend вывод: `frontend/logs/frontend-out.log`

---

## ⚙️ Переменные окружения

### Development
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- CORS: `http://localhost:3001`

### Production
- Backend: `http://localhost:3000` (за Nginx)
- Frontend: `http://localhost:3001` (за Nginx)
- CORS: `https://pokerscrum.ru`
- Public API: `https://pokerscrum.ru`

---

## 🎯 Горячие клавиши (pm2 monit)

- `↑/↓` - навигация
- `Enter` - детали процесса
- `Ctrl+C` - выход

---

## 💡 Полезные алиасы (добавьте в ~/.bashrc)

```bash
alias pm2s='pm2 status'
alias pm2l='pm2 logs'
alias pm2r='pm2 restart all'
alias pm2m='pm2 monit'
alias pm2reload='pm2 reload all'
```

---

## 📚 Документация

- [PM2_DEPLOYMENT.md](PM2_DEPLOYMENT.md) - полная документация
- [PM2_CHECKLIST.md](PM2_CHECKLIST.md) - чеклист деплоя
- [PM2_SUMMARY.md](PM2_SUMMARY.md) - резюме изменений

---

## 🔗 Официальная документация

https://pm2.keymetrics.io/docs/
