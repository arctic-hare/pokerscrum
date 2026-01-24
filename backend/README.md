# Backend - Planning Poker

## Доступные npm скрипты

### Разработка

#### `npm run dev`
Запускает dev-сервер в режиме watch с CORS для **localhost:3001**.

```bash
npm run dev
```

#### `npm run dev:prod`
Запускает dev-сервер с CORS для **production frontend** (https://pokerscrum.ru).

```bash
npm run dev:prod
```

### Сборка и запуск

#### `npm run build`
Собирает проект (использует настройки из .env файла).

```bash
npm run build
```

#### `npm run build:prod`
Собирает проект с CORS для production.

```bash
npm run build:prod
```

#### `npm run start`
Запускает собранный проект (использует настройки из .env файла).

```bash
npm run start
```

#### `npm run start:prod`
Запускает собранный проект с CORS для production.

```bash
npm run start:prod
```

### Prisma

#### `npm run prisma:generate`
Генерирует Prisma Client.

```bash
npm run prisma:generate
```

#### `npm run prisma:migrate`
Запускает миграции базы данных.

```bash
npm run prisma:migrate
```

#### `npm run prisma:studio`
Открывает Prisma Studio для просмотра базы данных.

```bash
npm run prisma:studio
```

## Переменные окружения

Создайте файл `.env` на основе `env.example`:

```bash
cp env.example .env
```

### Основные переменные:

- `DATABASE_URL` - строка подключения к MySQL
- `FRONTEND_URL` - URL фронтенда для CORS (можно указать несколько через запятую)
- `PORT` - порт backend сервера (по умолчанию 3000)
- `JWT_ACCESS_SECRET` - секрет для JWT access токенов
- `JWT_REFRESH_SECRET` - секрет для JWT refresh токенов
- `SESSION_SECRET` - секрет для сессий

### Примеры:

**Локальная разработка:**
```env
FRONTEND_URL="http://localhost:3001"
```

**Production:**
```env
FRONTEND_URL="https://pokerscrum.ru"
```

**Несколько origins (через запятую):**
```env
FRONTEND_URL="http://localhost:3001,https://pokerscrum.ru"
```

## Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
```bash
# Создайте .env файл с правильным DATABASE_URL
cp env.example .env

# Сгенерируйте Prisma Client
npm run prisma:generate

# Запустите миграции
npm run prisma:migrate
```

### 3. Запуск сервера
```bash
npm run dev
```

## CORS конфигурация

Backend поддерживает гибкую настройку CORS через переменную `FRONTEND_URL`:

1. **Один origin:**
   ```env
   FRONTEND_URL="http://localhost:3001"
   ```

2. **Несколько origins (через запятую):**
   ```env
   FRONTEND_URL="http://localhost:3001,https://pokerscrum.ru,https://staging.pokerscrum.ru"
   ```

3. **Запросы без origin** (мобильные приложения, Postman) разрешены по умолчанию.

## Типичные сценарии использования

### Локальная разработка Frontend + Backend
```bash
# Терминал 1: Backend
cd backend
npm run dev

# Терминал 2: Frontend
cd frontend
npm run dev
```

### Локальный Frontend + Production Backend
Не нужно запускать backend локально, просто используйте:
```bash
cd frontend
npm run dev:prod
```

### Production deploy
```bash
cd backend
npm run build:prod
npm run start:prod
```

## Проверка CORS

Если возникают проблемы с CORS, проверьте:

1. Переменная `FRONTEND_URL` в `.env` файле
2. Логи backend - при неразрешенном origin будет предупреждение:
   ```
   CORS: Origin http://example.com not allowed. Allowed origins: [...]
   ```
3. В браузере DevTools → Network → проверьте заголовки preflight запроса

## Линтинг

```bash
# Проверка кода
npm run lint

# Автоматическое исправление
npm run lint:fix
```
