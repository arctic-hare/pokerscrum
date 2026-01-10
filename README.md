# Planning Poker

Монорепозиторий для приложения Planning Poker.

## Структура проекта

```
planning-poker/
├── backend/     # NestJS приложение
├── frontend/    # Nuxt 3 приложение
├── package.json # Корневой package.json с workspaces
└── .prettierrc  # Общая конфигурация Prettier
```

## Технологии

- **Backend**: NestJS, Prisma, MySQL
- **Frontend**: Nuxt 3, Vue 3 Composition API, Pinia

## Установка

```bash
npm install
```

## Настройка

### Backend

1. Создайте файл `backend/.env` на основе `backend/env.example`:

```env
DATABASE_URL="mysql://user:password@localhost:3306/planning_poker"
```

2. Настройте базу данных MySQL и обновите `DATABASE_URL`

3. Выполните миграции:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Разработка

```bash
# Backend (в отдельном терминале)
npm run dev:backend

# Frontend (в отдельном терминале)
npm run dev:frontend

# Или оба одновременно
npm run dev
```

## Линтинг

```bash
# Проверка кода
npm run lint

# Автоисправление
npm run lint:fix
```

## База данных

```bash
# Генерация Prisma клиента
npm run prisma:generate

# Миграции
npm run prisma:migrate

# Prisma Studio
npm run prisma:studio
```
