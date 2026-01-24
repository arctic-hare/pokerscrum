# Конфигурация Frontend

## Резюме изменений

Настроена система для работы с разными окружениями через npm скрипты.

## Доступные команды

| Команда | Описание | API URL | WebSocket URL |
|---------|----------|---------|---------------|
| `npm run dev` | Локальная разработка (по умолчанию) | http://localhost:3000 | ws://localhost:3000 |
| `npm run dev:prod` | Локальная разработка с прод API | https://pokerscrum.ru | wss://pokerscrum.ru |
| `npm run build:dev` | Сборка для dev окружения | http://localhost:3000 | ws://localhost:3000 |
| `npm run build:prod` | Сборка для production | https://pokerscrum.ru | wss://pokerscrum.ru |
| `npm run build` | Стандартная сборка | Из .env файла | Из .env файла |

## Что было изменено

### 1. `package.json`
Добавлены новые npm скрипты:
- `dev:prod` - для разработки с продакшн API
- `build:dev` - для сборки dev версии
- `build:prod` - для сборки production версии

Добавлена зависимость `cross-env` для кроссплатформенной работы с переменными окружения.

### 2. `.env`
Обновлен файл окружения по умолчанию:
- `NUXT_PUBLIC_API_BASE=http://localhost:3000`
- `NUXT_PUBLIC_WS_BASE=ws://localhost:3000`

Теперь по умолчанию при локальной разработке используется локальный бэкенд.

### 3. `nuxt.config.ts`
Упрощена логика определения API URL:
- Используются переменные `NUXT_PUBLIC_API_BASE` и `NUXT_PUBLIC_WS_BASE`
- По умолчанию localhost:3000

### 4. Новые файлы
- `.env.example` - пример конфигурации
- `README.md` - документация по использованию
- `CONFIGURATION.md` - этот файл

## Примеры использования

### Локальная разработка с локальным бэкендом
```bash
# Запустите бэкенд на порту 3000
cd backend
npm run start:dev

# В другом терминале запустите фронтенд
cd frontend
npm run dev
```

### Локальная разработка с продакшн API
```bash
cd frontend
npm run dev:prod
```

### Сборка для деплоя

#### Development версия
```bash
cd frontend
npm run build:dev
npm run preview
```

#### Production версия
```bash
cd frontend
npm run build:prod
npm run preview
```

## Переменные окружения

### Приоритет переменных

1. Переменные из командной строки (через `cross-env`)
2. Переменные из `.env` файла
3. Значения по умолчанию в `nuxt.config.ts`

### Доступные переменные

- `NUXT_PUBLIC_API_BASE` - базовый URL API (без trailing slash)
- `NUXT_PUBLIC_WS_BASE` - базовый URL WebSocket (без trailing slash)
- `PORT` - порт для dev-сервера Nuxt (по умолчанию 3001)
- `NITRO_PORT` - порт для Nitro сервера (по умолчанию 3001)

## Проверка конфигурации

Чтобы убедиться, что правильный API URL используется, проверьте:

1. В браузере откройте DevTools → Console
2. Найдите API запросы в Network tab
3. Проверьте URL запросов к API

Или добавьте в код:
```javascript
const config = useRuntimeConfig();
console.log('API Base:', config.public.apiBase);
console.log('WS Base:', config.public.wsBase);
```
