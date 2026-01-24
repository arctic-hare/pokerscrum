# Frontend - Planning Poker

## Доступные npm скрипты

### Разработка

#### `npm run dev`
Запускает dev-сервер на порту 3001 с подключением к **локальному бэкенду** (http://localhost:3000).

```bash
npm run dev
```

#### `npm run dev:prod`
Запускает dev-сервер на порту 3001 с подключением к **продакшн бэкенду** (https://pokerscrum.ru).

```bash
npm run dev:prod
```

### Сборка

#### `npm run build:dev`
Собирает проект для development окружения с подключением к **локальному бэкенду** (http://localhost:3000).

```bash
npm run build:dev
```

#### `npm run build:prod` 
Собирает проект для production окружения с подключением к **продакшн бэкенду** (https://pokerscrum.ru).

```bash
npm run build:prod
```

#### `npm run build`
Стандартная сборка (без указания окружения, использует значения из .env).

```bash
npm run build
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

### Основные переменные:

- `NUXT_PUBLIC_API_BASE` - URL бэкенда (например: http://localhost:3000 или https://pokerscrum.ru)
- `NUXT_PUBLIC_WS_BASE` - URL WebSocket (например: ws://localhost:3000 или wss://pokerscrum.ru)
- `PORT` - порт для dev-сервера (по умолчанию 3001)

## Установка зависимостей

```bash
npm install
```

## Другие команды

- `npm run generate` - генерация статического сайта
- `npm run preview` - предпросмотр production сборки
- `npm run lint` - проверка кода линтером
- `npm run lint:fix` - автоматическое исправление ошибок линтера
