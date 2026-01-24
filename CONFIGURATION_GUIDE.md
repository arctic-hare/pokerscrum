# Руководство по конфигурации Planning Poker

## Быстрый старт

### Локальная разработка (Frontend + Backend локально)

```bash
# Терминал 1: Backend
cd backend
npm install
npm run dev

# Терминал 2: Frontend
cd frontend
npm install
npm run dev
```

Откройте браузер: `http://localhost:3001`

---

## Все доступные конфигурации

### 1. 🏠 Локальная разработка (рекомендуется)

**Backend:** `localhost:3000`  
**Frontend:** `localhost:3001`

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### 2. 🌐 Локальный Frontend + Production Backend

**Backend:** `https://pokerscrum.ru`  
**Frontend:** `localhost:3001`

```bash
# Backend не нужен локально

# Frontend
cd frontend
npm run dev:prod
```

### 3. 🔨 Локальный Backend + Production Frontend

**Backend:** `localhost:3000`  
**Frontend:** `https://pokerscrum.ru`

```bash
# Backend с CORS для прода
cd backend
npm run dev:prod

# Frontend деплоится на прод
```

### 4. 🚀 Production сборка

**Backend:** `https://pokerscrum.ru`  
**Frontend:** `https://pokerscrum.ru`

```bash
# Backend
cd backend
npm run build:prod
npm run start:prod

# Frontend
cd frontend
npm run build:prod
```

---

## Структура переменных окружения

### Frontend (`.env`)

```env
# Для локальной разработки (по умолчанию):
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_WS_BASE=ws://localhost:3000

# Для продакшена:
# NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
# NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru

PORT=3001
NITRO_PORT=3001
```

### Backend (`.env`)

```env
DATABASE_URL="mysql://user:password@localhost:3306/planning_poker"
JWT_ACCESS_SECRET=super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000

# Для локальной разработки (по умолчанию):
FRONTEND_URL="http://localhost:3001"

# Для продакшена:
# FRONTEND_URL="https://pokerscrum.ru"

# Для нескольких origins (через запятую):
# FRONTEND_URL="http://localhost:3001,https://pokerscrum.ru"

SESSION_SECRET="your-secret-key"
```

---

## Таблица npm команд

### Frontend

| Команда | Окружение | API URL | Описание |
|---------|-----------|---------|----------|
| `npm run dev` | Development | localhost:3000 | Локальная разработка |
| `npm run dev:prod` | Development | pokerscrum.ru | Разработка с прод API |
| `npm run build:dev` | Development | localhost:3000 | Сборка dev версии |
| `npm run build:prod` | Production | pokerscrum.ru | Сборка prod версии |
| `npm run preview` | - | Из сборки | Просмотр сборки |

### Backend

| Команда | Окружение | CORS Origins | Описание |
|---------|-----------|--------------|----------|
| `npm run dev` | Development | localhost:3001 | Локальная разработка |
| `npm run dev:prod` | Development | pokerscrum.ru | Разработка с прод CORS |
| `npm run build` | - | Из .env | Стандартная сборка |
| `npm run build:prod` | Production | pokerscrum.ru | Сборка для прода |
| `npm run start` | - | Из .env | Запуск сборки |
| `npm run start:prod` | Production | pokerscrum.ru | Запуск прод сборки |

---

## Решение проблем

### ❌ CORS Error: Origin not allowed

**Проблема:**
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:3001' 
has been blocked by CORS policy
```

**Решение:**

1. Проверьте `FRONTEND_URL` в `backend/.env`:
   ```env
   FRONTEND_URL="http://localhost:3001"
   ```

2. Перезапустите backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Если нужны несколько origins:
   ```env
   FRONTEND_URL="http://localhost:3001,https://pokerscrum.ru"
   ```

### ❌ Frontend обращается к неправильному API

**Проблема:** Frontend обращается к `pokerscrum.ru` вместо `localhost:3000`

**Решение:**

1. Проверьте `frontend/.env`:
   ```env
   NUXT_PUBLIC_API_BASE=http://localhost:3000
   NUXT_PUBLIC_WS_BASE=ws://localhost:3000
   ```

2. Перезапустите frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Проверьте в браузере (DevTools → Console):
   ```javascript
   // В app.vue или любом компоненте
   const config = useRuntimeConfig();
   console.log('API Base:', config.public.apiBase);
   ```

### ❌ WebSocket не подключается

**Проблема:** WebSocket соединение не устанавливается

**Решение:**

1. Проверьте `NUXT_PUBLIC_WS_BASE` в `frontend/.env`
2. Убедитесь, что backend поддерживает WebSocket
3. Для локальной разработки: `ws://localhost:3000`
4. Для production: `wss://pokerscrum.ru`

### ❌ База данных не подключается

**Проблема:** Backend не может подключиться к MySQL

**Решение:**

1. Проверьте `DATABASE_URL` в `backend/.env`
2. Убедитесь, что MySQL запущен
3. Проверьте credentials и имя базы данных
4. Запустите миграции:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

---

## Деплой на production

### Подготовка Frontend

```bash
cd frontend

# Создайте production .env или используйте build:prod
npm run build:prod

# Проверьте сборку локально
npm run preview
```

Файлы для деплоя будут в `.output/` директории.

### Подготовка Backend

```bash
cd backend

# Убедитесь что .env настроен для прода
# FRONTEND_URL="https://pokerscrum.ru"
# DATABASE_URL=...production database...

# Соберите проект
npm run build:prod

# Запустите миграции на проде (осторожно!)
npm run prisma:migrate

# Запустите сервер
npm run start:prod
```

### Nginx конфигурация

Примеры конфигурации nginx находятся в корне проекта:
- `nginx-config-example.conf`
- `nginx-config-example-root.conf`

---

## Чеклист перед деплоем

- [ ] Обновлены все environment переменные для production
- [ ] Frontend `.env` указывает на production API
- [ ] Backend `.env` указывает на production базу данных
- [ ] FRONTEND_URL в backend настроен для production домена
- [ ] JWT секреты изменены с дефолтных значений
- [ ] SESSION_SECRET изменен с дефолтного значения
- [ ] Запущены миграции базы данных
- [ ] Проверена работа WebSocket соединения
- [ ] Проверена работа CORS
- [ ] Собраны production версии (build:prod)

---

## Полезные ссылки

- Frontend README: `frontend/README.md`
- Backend README: `backend/README.md`
- Deployment guide: `DEPLOYMENT.md`
