# PM2 Deployment Guide

## Обзор конфигурации

`ecosystem.config.js` настроен для запуска приложения через PM2 в production и development режимах.

---

## 🚀 Быстрый старт

### Подготовка

```bash
# 1. Установите PM2 глобально (если еще не установлен)
npm install -g pm2

# 2. Создайте директории для логов
mkdir -p backend/logs
mkdir -p frontend/logs

# 3. Соберите проекты для production
cd backend && npm run build:prod
cd ../frontend && npm run build:prod
```

### Запуск на production

```bash
# Запуск обоих приложений в production режиме
pm2 start ecosystem.config.js --env production

# Или запуск отдельных приложений
pm2 start ecosystem.config.js --only pokerscrum-backend --env production
pm2 start ecosystem.config.js --only pokerscrum-frontend --env production
```

### Запуск в development режиме

```bash
pm2 start ecosystem.config.js --env development
```

---

## 📋 Основные команды PM2

### Управление приложениями

```bash
# Просмотр статуса всех приложений
pm2 status

# Просмотр детальной информации
pm2 show pokerscrum-backend
pm2 show pokerscrum-frontend

# Остановка приложений
pm2 stop pokerscrum-backend
pm2 stop pokerscrum-frontend
pm2 stop all

# Перезапуск приложений
pm2 restart pokerscrum-backend
pm2 restart pokerscrum-frontend
pm2 restart all

# Перезагрузка без даунтайма (0-downtime reload)
pm2 reload pokerscrum-backend
pm2 reload all

# Удаление приложений из PM2
pm2 delete pokerscrum-backend
pm2 delete pokerscrum-frontend
pm2 delete all
```

### Логи

```bash
# Просмотр логов в реальном времени
pm2 logs

# Логи конкретного приложения
pm2 logs pokerscrum-backend
pm2 logs pokerscrum-frontend

# Последние N строк
pm2 logs --lines 100

# Очистка логов
pm2 flush
```

### Мониторинг

```bash
# Мониторинг CPU и памяти
pm2 monit

# Список процессов с использованием ресурсов
pm2 list
```

---

## ⚙️ Конфигурация приложений

### Backend (pokerscrum-backend)

| Параметр | Значение | Описание |
|----------|----------|----------|
| **script** | `./dist/main.js` | Скомпилированное приложение NestJS |
| **cwd** | `./backend` | Рабочая директория |
| **instances** | `1` | Количество инстансов (можно увеличить до `max`) |
| **exec_mode** | `cluster` | Режим кластера для масштабирования |
| **max_memory_restart** | `500M` | Автоперезапуск при превышении памяти |
| **PORT** | `3000` | Порт backend |
| **FRONTEND_URL** (prod) | `https://pokerscrum.ru` | URL фронтенда для CORS |

### Frontend (pokerscrum-frontend)

| Параметр | Значение | Описание |
|----------|----------|----------|
| **script** | `.output/server/index.mjs` | Собранное Nuxt приложение |
| **cwd** | `./frontend` | Рабочая директория |
| **instances** | `1` | Количество инстансов |
| **exec_mode** | `cluster` | Режим кластера |
| **max_memory_restart** | `300M` | Автоперезапуск при превышении памяти |
| **PORT** | `3001` | Порт frontend |
| **NUXT_PUBLIC_API_BASE** (prod) | `https://pokerscrum.ru` | URL API |

---

## 🔧 Настройка для production

### 1. Переменные окружения

**Важно:** Секретные переменные НЕ должны быть в `ecosystem.config.js`!

Создайте `backend/.env` файл с секретными данными:

```env
DATABASE_URL="mysql://user:password@localhost:3306/planning_poker"
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
SESSION_SECRET=your-session-secret-key
```

PM2 автоматически загрузит переменные из `.env` файла в рабочей директории приложения.

### 2. Увеличение количества инстансов

Для использования всех ядер CPU измените в `ecosystem.config.js`:

```javascript
instances: 'max', // Использовать все доступные ядра
```

Или укажите конкретное число:

```javascript
instances: 4, // 4 инстанса
```

### 3. Логирование

Логи сохраняются в:
- Backend: `backend/logs/backend-error.log` и `backend/logs/backend-out.log`
- Frontend: `frontend/logs/frontend-error.log` и `frontend/logs/frontend-out.log`

Убедитесь, что директории `logs` существуют:

```bash
mkdir -p backend/logs frontend/logs
```

---

## 🔄 Деплой и обновление

### Полный процесс деплоя

```bash
# 1. Остановка текущих приложений
pm2 stop all

# 2. Обновление кода (git pull, etc.)
git pull origin main

# 3. Установка зависимостей
cd backend && npm install
cd ../frontend && npm install

# 4. Сборка
cd backend && npm run build:prod
cd ../frontend && npm run build:prod

# 5. Миграции базы данных (если нужно)
cd backend && npm run prisma:migrate

# 6. Запуск приложений
cd ..
pm2 restart all --env production

# 7. Сохранение конфигурации PM2
pm2 save
```

### Быстрое обновление (без даунтайма)

```bash
# Обновление кода и сборка
git pull origin main
cd backend && npm install && npm run build:prod
cd ../frontend && npm install && npm run build:prod

# Перезагрузка без остановки (0-downtime)
cd ..
pm2 reload all
```

---

## 🤖 Автозапуск при перезагрузке сервера

### Linux/macOS

```bash
# Генерация startup скрипта
pm2 startup

# Сохранение текущей конфигурации
pm2 save

# Теперь PM2 автоматически запустится при перезагрузке сервера
```

### Windows

```bash
# Установка pm2-windows-service
npm install -g pm2-windows-service

# Установка сервиса
pm2-service-install

# Сохранение конфигурации
pm2 save
```

---

## 📊 Мониторинг и отладка

### PM2 Plus (платный, но есть free tier)

```bash
# Подключение к PM2 Plus для веб-мониторинга
pm2 link <secret_key> <public_key>
```

### Анализ логов

```bash
# Последние 100 строк логов
pm2 logs --lines 100

# Логи с фильтром по времени
pm2 logs --timestamp

# Экспорт логов
pm2 logs --raw > application.log
```

### Проблемы с памятью

```bash
# Мониторинг использования памяти
pm2 monit

# Если приложение использует слишком много памяти,
# уменьшите max_memory_restart в ecosystem.config.js
```

---

## ⚠️ Важные замечания

### 1. Сборка перед запуском
**Обязательно** собирайте приложения перед запуском PM2:

```bash
cd backend && npm run build:prod
cd ../frontend && npm run build:prod
```

### 2. Переменные окружения
- Публичные переменные (PORT, URL) → `ecosystem.config.js`
- Секретные переменные (пароли, токены) → `.env` файлы

### 3. База данных
Убедитесь, что миграции применены:

```bash
cd backend && npm run prisma:migrate
```

### 4. Nginx
Для production используйте Nginx как reverse proxy:
- Backend: `localhost:3000` → `https://pokerscrum.ru/api`
- Frontend: `localhost:3001` → `https://pokerscrum.ru/`

Примеры конфигурации: `nginx-config-example.conf`

### 5. Логи
Регулярно очищайте логи:

```bash
pm2 flush
# Или вручную
rm -f backend/logs/*.log frontend/logs/*.log
```

---

## 🐛 Устранение неполадок

### Приложение не запускается

```bash
# Проверьте логи
pm2 logs

# Проверьте, что скрипты существуют
ls backend/dist/main.js
ls frontend/.output/server/index.mjs

# Проверьте переменные окружения
pm2 show pokerscrum-backend
pm2 show pokerscrum-frontend
```

### CORS ошибки

Проверьте, что `FRONTEND_URL` в production установлен правильно:

```bash
pm2 show pokerscrum-backend
# Должно быть: FRONTEND_URL: 'https://pokerscrum.ru'
```

### Приложение постоянно перезапускается

```bash
# Увеличьте min_uptime в ecosystem.config.js
min_uptime: '30s', // Вместо 10s

# Проверьте логи ошибок
pm2 logs --err
```

### База данных не подключается

```bash
# Проверьте DATABASE_URL в backend/.env
cat backend/.env

# Проверьте подключение к MySQL
mysql -u user -p planning_poker
```

---

## 📚 Дополнительные ресурсы

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 Environment Variables](https://pm2.keymetrics.io/docs/usage/environment/)

---

## ✅ Чеклист перед production запуском

- [ ] Собраны оба приложения (`build:prod`)
- [ ] Применены миграции базы данных
- [ ] Созданы директории для логов
- [ ] `.env` файлы содержат правильные production значения
- [ ] PM2 установлен глобально
- [ ] Настроен Nginx reverse proxy
- [ ] Настроен автозапуск PM2 (`pm2 startup`)
- [ ] Сохранена конфигурация PM2 (`pm2 save`)
- [ ] Проверены порты 3000 и 3001
- [ ] Проверена работа CORS
- [ ] Настроен SSL/HTTPS
