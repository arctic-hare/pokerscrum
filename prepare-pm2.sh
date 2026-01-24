#!/bin/bash

# Скрипт подготовки к запуску через PM2

echo "🚀 Подготовка к запуску через PM2..."

# Создание директорий для логов
echo "📁 Создание директорий для логов..."
mkdir -p backend/logs
mkdir -p frontend/logs

# Проверка установки PM2
if ! command -v pm2 &> /dev/null
then
    echo "⚠️  PM2 не установлен!"
    echo "Установите PM2 глобально: npm install -g pm2"
    exit 1
fi

echo "✅ PM2 установлен: $(pm2 --version)"

# Проверка наличия сборок
echo ""
echo "📦 Проверка сборок..."

if [ ! -f "backend/dist/main.js" ]; then
    echo "⚠️  Backend не собран!"
    echo "Запустите: cd backend && npm run build:prod"
    BACKEND_BUILT=false
else
    echo "✅ Backend собран"
    BACKEND_BUILT=true
fi

if [ ! -f "frontend/.output/server/index.mjs" ]; then
    echo "⚠️  Frontend не собран!"
    echo "Запустите: cd frontend && npm run build:prod"
    FRONTEND_BUILT=false
else
    echo "✅ Frontend собран"
    FRONTEND_BUILT=true
fi

# Проверка .env файлов
echo ""
echo "🔐 Проверка .env файлов..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env не найден!"
    echo "Создайте файл на основе backend/env.example"
    BACKEND_ENV=false
else
    echo "✅ backend/.env существует"
    BACKEND_ENV=true
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  frontend/.env не найден!"
    echo "Создайте файл на основе frontend/.env.example"
    FRONTEND_ENV=false
else
    echo "✅ frontend/.env существует"
    FRONTEND_ENV=true
fi

# Итоговая проверка
echo ""
echo "📋 Итого:"

if [ "$BACKEND_BUILT" = true ] && [ "$FRONTEND_BUILT" = true ] && [ "$BACKEND_ENV" = true ] && [ "$FRONTEND_ENV" = true ]; then
    echo "✅ Все готово к запуску!"
    echo ""
    echo "Запустите PM2:"
    echo "  Development: pm2 start ecosystem.config.js --env development"
    echo "  Production:  pm2 start ecosystem.config.js --env production"
    echo ""
    echo "Автозапуск при перезагрузке сервера:"
    echo "  pm2 startup"
    echo "  pm2 save"
else
    echo "❌ Есть проблемы, которые нужно исправить!"
    exit 1
fi
