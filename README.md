# Planning Poker

Онлайн-инструмент для проведения сессий Scrum Poker и получения Story Points (оценки сложности задачи).

## 🚀 Быстрый старт

```bash
# 1. Установка зависимостей
cd backend && npm install
cd ../frontend && npm install

# 2. Настройка .env файлов (см. раздел "Настройка")

# 3. Миграции базы данных
cd backend
npm run prisma:generate
npm run prisma:migrate

# 4. Запуск
cd backend && npm run dev       # Терминал 1
cd frontend && npm run dev      # Терминал 2
```

**Готово!** Откройте `http://localhost:3001` 🎉

Подробнее: [QUICK_START.md](QUICK_START.md) | [Полное резюме изменений](FINAL_SUMMARY.md)

---

## 📁 Структура проекта

```
planning-poker/
├── backend/              # NestJS приложение (порт 3000)
│   ├── src/             # Исходный код
│   ├── prisma/          # Схема БД и миграции
│   ├── .env             # Конфигурация
│   └── package.json
│
├── frontend/            # Nuxt 4 приложение (порт 3001)
│   ├── pages/           # Страницы приложения
│   ├── components/      # Vue компоненты
│   ├── stores/          # Pinia stores
│   ├── .env             # Конфигурация
│   └── package.json
│
├── ecosystem.config.js  # PM2 конфигурация
├── docker-compose.yml   # Docker конфигурация
└── README.md           # Этот файл
```

---

## 🛠 Технологии

- **Backend**: NestJS, Prisma, MySQL, WebSocket
- **Frontend**: Nuxt 4, Vue 3 Composition API, Pinia
- **Deploy**: PM2, Docker, Nginx

---

## ⚙️ Настройка

### Backend (`backend/.env`)

```env
DATABASE_URL="mysql://root:password@localhost:3306/planning_poker"
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=3000

# Для локальной разработки:
FRONTEND_URL="http://localhost:3001"

# Для production:
# FRONTEND_URL="https://pokerscrum.ru"

SESSION_SECRET="your-secret-key"
```

### Frontend (`frontend/.env`)

```env
# Для локальной разработки:
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_WS_BASE=ws://localhost:3000

# Для production:
# NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
# NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru

PORT=3001
```

---

## 💻 Разработка

### Локальная разработка

```bash
# Backend
cd backend
npm run dev

# Frontend (в другом терминале)
cd frontend
npm run dev
```

### Доступные npm скрипты

#### Frontend
- `npm run dev` - разработка с localhost API
- `npm run dev:prod` - разработка с production API
- `npm run build:dev` - сборка для dev
- `npm run build:prod` - сборка для production

#### Backend
- `npm run dev` - разработка с CORS для localhost
- `npm run dev:prod` - разработка с CORS для production
- `npm run build:prod` - сборка для production
- `npm run start:prod` - запуск production

Подробнее: [CONFIGURATION_GUIDE.md](CONFIGURATION_GUIDE.md)

---

## 🗄 База данных

```bash
# Генерация Prisma клиента
cd backend
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Открыть Prisma Studio (GUI для БД)
npm run prisma:studio
```

---

## 🚢 Production Deploy

### Вариант 1: PM2 (рекомендуется)

```bash
# 1. Подготовка
./prepare-pm2.sh  # Linux/macOS
prepare-pm2.bat   # Windows

# 2. Сборка
cd backend && npm run build:prod
cd ../frontend && npm run build:prod

# 3. Запуск через PM2
pm2 start ecosystem.config.js --env production

# 4. Автозапуск при перезагрузке
pm2 startup
pm2 save
```

**Команды PM2:**
```bash
pm2 status              # Статус приложений
pm2 logs                # Просмотр логов
pm2 restart all         # Перезапуск
pm2 stop all            # Остановка
pm2 monit               # Мониторинг
```

Подробнее: [PM2_DEPLOYMENT.md](PM2_DEPLOYMENT.md)

### Вариант 2: Docker

```bash
# Запуск с Docker Compose
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

Подробнее: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔧 Линтинг

```bash
# Проверка кода
cd frontend && npm run lint
cd backend && npm run lint

# Автоматическое исправление
cd frontend && npm run lint:fix
cd backend && npm run lint:fix
```

---

## 📚 Документация

### Общая
- 📖 [Quick Start Guide](QUICK_START.md) - быстрый старт
- 📖 [Configuration Guide](CONFIGURATION_GUIDE.md) - полное руководство по конфигурации
- 📖 [Changes Summary](CHANGES_SUMMARY.md) - резюме изменений
- 🏗️ [Architecture](ARCHITECTURE.md) - архитектура проекта
- 📚 [Documentation Index](DOCUMENTATION_INDEX.md) - индекс всей документации

### Deploy
- 🚀 [PM2 Deployment](PM2_DEPLOYMENT.md) - полное руководство по PM2
- 📝 [PM2 Cheat Sheet](PM2_CHEATSHEET.md) - шпаргалка по командам PM2
- ✅ [PM2 Checklist](PM2_CHECKLIST.md) - чеклист для деплоя
- 📊 [PM2 Summary](PM2_SUMMARY.md) - резюме изменений PM2
- 🐳 [Docker Deployment](DEPLOYMENT.md) - деплой через Docker

### Компоненты
- 🎨 [Frontend README](frontend/README.md) - документация frontend
- ⚙️ [Backend README](backend/README.md) - документация backend

---

## 🐛 Решение проблем

### CORS ошибка

```
Access to fetch blocked by CORS policy
```

**Решение:** Проверьте `FRONTEND_URL` в `backend/.env`:
```env
FRONTEND_URL="http://localhost:3001"
```

### Frontend подключается к неправильному API

**Решение:** Проверьте `frontend/.env`:
```env
NUXT_PUBLIC_API_BASE=http://localhost:3000
```

### База данных не подключается

**Решение:**
1. Проверьте, что MySQL запущен
2. Проверьте `DATABASE_URL` в `backend/.env`
3. Примените миграции: `npm run prisma:migrate`

Подробнее: [CONFIGURATION_GUIDE.md#решение-проблем](CONFIGURATION_GUIDE.md#решение-проблем)

---

## 📝 License

MIT

---

## 🔗 Ссылки

- Production: https://pokerscrum.ru
- GitHub: (ваш репозиторий)
