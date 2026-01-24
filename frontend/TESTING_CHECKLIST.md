# Чеклист для тестирования конфигурации

## Предварительные требования

- [ ] Backend запущен на `http://localhost:3000`
- [ ] Установлены зависимости: `npm install` в папке frontend

## Тест 1: Локальная разработка (localhost)

```bash
npm run dev
```

**Ожидаемый результат:**
- ✅ Приложение запущено на `http://localhost:3001`
- ✅ API запросы идут на `http://localhost:3000`
- ✅ WebSocket подключается к `ws://localhost:3000`

**Как проверить:**
1. Откройте браузер: `http://localhost:3001`
2. Откройте DevTools → Network
3. Попробуйте создать игру или выполнить действие
4. Проверьте URL в Network tab - должен быть `localhost:3000`

## Тест 2: Локальная разработка с прод API

```bash
npm run dev:prod
```

**Ожидаемый результат:**
- ✅ Приложение запущено на `http://localhost:3001`
- ✅ API запросы идут на `https://pokerscrum.ru`
- ✅ WebSocket подключается к `wss://pokerscrum.ru`

**Как проверить:**
1. Откройте браузер: `http://localhost:3001`
2. Откройте DevTools → Network
3. Попробуйте создать игру
4. Проверьте URL в Network tab - должен быть `pokerscrum.ru`

## Тест 3: Сборка для dev окружения

```bash
npm run build:dev
npm run preview
```

**Ожидаемый результат:**
- ✅ Сборка успешно создана
- ✅ Preview запущен
- ✅ API запросы идут на `http://localhost:3000`

## Тест 4: Сборка для production

```bash
npm run build:prod
npm run preview
```

**Ожидаемый результат:**
- ✅ Сборка успешно создана
- ✅ Preview запущен
- ✅ API запросы идут на `https://pokerscrum.ru`

## Проверка переменных окружения

Добавьте временно в `app.vue` или любой компонент:

```vue
<script setup>
const config = useRuntimeConfig();
console.log('=== CONFIG CHECK ===');
console.log('API Base:', config.public.apiBase);
console.log('WS Base:', config.public.wsBase);
console.log('===================');
</script>
```

Проверьте вывод в консоли браузера.

## Частые проблемы

### Проблема: API запросы все равно идут на прод
**Решение:** 
1. Убедитесь, что `.env` файл содержит правильные значения
2. Перезапустите dev-сервер
3. Очистите кеш браузера

### Проблема: WebSocket не подключается
**Решение:**
1. Проверьте, что backend поддерживает WebSocket
2. Проверьте порт backend (должен быть 3000)
3. Проверьте URL в консоли браузера

### Проблема: cross-env не найден
**Решение:**
```bash
npm install --save-dev cross-env
```

## Успешное завершение

Все тесты пройдены, если:
- ✅ `npm run dev` подключается к localhost:3000
- ✅ `npm run dev:prod` подключается к pokerscrum.ru
- ✅ `npm run build:dev` собирается с localhost:3000
- ✅ `npm run build:prod` собирается с pokerscrum.ru
