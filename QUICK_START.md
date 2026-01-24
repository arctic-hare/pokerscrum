# Quick Start Guide 🚀

## Локальная разработка (за 3 шага)

### 1️⃣ Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2️⃣ Настройка .env файлов

**Backend** (`backend/.env`):
```env
DATABASE_URL="mysql://root:password@localhost:3306/planning_poker"
FRONTEND_URL="http://localhost:3001"
PORT=3000
SESSION_SECRET="your-secret-key"
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

**Frontend** (`frontend/.env`):
```env
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_WS_BASE=ws://localhost:3000
PORT=3001
```

### 3️⃣ Запуск

```bash
# Терминал 1: Backend
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run dev

# Терминал 2: Frontend
cd frontend
npm run dev
```

**Готово!** Откройте `http://localhost:3001` 🎉

---

## Шпаргалка по командам

### 💻 Локальная разработка
```bash
# Backend + Frontend локально
cd backend && npm run dev
cd frontend && npm run dev
```

### 🌐 Frontend локально, Backend на проде
```bash
# Только Frontend (backend на pokerscrum.ru)
cd frontend && npm run dev:prod
```

### 🏭 Production сборка
```bash
# Frontend
cd frontend && npm run build:prod

# Backend
cd backend && npm run build:prod && npm run start:prod
```

---

## Частые команды

```bash
# Просмотр базы данных
cd backend && npm run prisma:studio

# Линтинг и форматирование
cd frontend && npm run lint:fix
cd backend && npm run lint:fix

# Очистка и переустановка
rm -rf node_modules package-lock.json
npm install
```

---

## Если что-то не работает

### CORS ошибка?
```bash
# Проверьте backend/.env
echo "FRONTEND_URL=\"http://localhost:3001\"" >> backend/.env
cd backend && npm run dev
```

### Frontend подключается к неправильному API?
```bash
# Проверьте frontend/.env
cat frontend/.env
# Должно быть: NUXT_PUBLIC_API_BASE=http://localhost:3000
```

### База данных не подключается?
```bash
# Проверьте MySQL и запустите миграции
cd backend
npm run prisma:migrate
```

---

## Полная документация

- 📖 [Полное руководство по конфигурации](CONFIGURATION_GUIDE.md)
- 🎨 [Frontend README](frontend/README.md)
- ⚙️ [Backend README](backend/README.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
