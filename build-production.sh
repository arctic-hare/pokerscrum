#!/bin/bash

# Скрипт для сборки Production версии Planning Poker
# Использование: ./build-production.sh

set -e  # Остановка при ошибке

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Production Build - Planning Poker                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "ℹ️  $1"
}

# Проверка, что мы в корне проекта
if [ ! -f "ecosystem.config.js" ]; then
    error "Ошибка: ecosystem.config.js не найден!"
    error "Запустите скрипт из корня проекта"
    exit 1
fi

# 1. Backend
echo ""
info "📦 Сборка Backend..."
cd backend

if [ ! -f "package.json" ]; then
    error "backend/package.json не найден!"
    exit 1
fi

# Установка зависимостей если нужно
if [ ! -d "node_modules" ]; then
    info "Установка зависимостей backend..."
    npm install
fi

# Сборка backend
info "Компиляция backend..."
npm run build

if [ ! -f "dist/main.js" ]; then
    error "Backend сборка не удалась: dist/main.js не найден"
    exit 1
fi

success "Backend собран успешно"
cd ..

# 2. Frontend
echo ""
info "🎨 Сборка Frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    error "frontend/package.json не найден!"
    exit 1
fi

# Установка зависимостей если нужно
if [ ! -d "node_modules" ]; then
    info "Установка зависимостей frontend..."
    npm install
fi

# Удаление старой сборки
info "Удаление старой сборки..."
rm -rf .output
rm -rf .nuxt
rm -rf node_modules/.cache

# Создание .env.production если его нет
if [ ! -f ".env.production" ]; then
    warning ".env.production не найден, создаю..."
    cat > .env.production << 'EOF'
# Production Environment Variables
# Для Nginx reverse proxy используем пустые значения (относительные пути)
NUXT_PUBLIC_API_BASE=
NUXT_PUBLIC_WS_BASE=
PORT=3001
NITRO_PORT=3001
NODE_ENV=production
EOF
    success ".env.production создан"
fi

# Сборка frontend с production переменными
info "Компиляция frontend для Nginx (относительные пути)..."
export NODE_ENV=production
export NUXT_PUBLIC_API_BASE=
export NUXT_PUBLIC_WS_BASE=

npm run build

# Проверка сборки
if [ ! -d ".output" ]; then
    error "Frontend сборка не удалась: .output не создан"
    exit 1
fi

if [ ! -f ".output/server/index.mjs" ]; then
    error "Frontend сборка не удалась: .output/server/index.mjs не найден"
    exit 1
fi

# Проверка, что в сборке нет localhost
info "Проверка сборки на localhost..."
if grep -r "localhost:3000" .output/server/ > /dev/null 2>&1; then
    error "ВНИМАНИЕ: В сборке найден localhost:3000!"
    error "Это означает, что переменные окружения не применились"
    exit 1
fi

if grep -r "pokerscrum.ru" .output/server/ > /dev/null 2>&1; then
    success "Сборка содержит pokerscrum.ru - OK"
else
    warning "pokerscrum.ru не найден в сборке - проверьте вручную"
fi

success "Frontend собран успешно"
cd ..

# 3. Создание директорий для логов
echo ""
info "📁 Создание директорий для логов..."
mkdir -p backend/logs
mkdir -p frontend/logs
success "Директории созданы"

# 4. Итоги
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ Сборка завершена успешно!                            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1. Перезапустите PM2:"
echo "   pm2 restart all"
echo "   или"
echo "   pm2 reload all  (0-downtime)"
echo ""
echo "2. Проверьте логи:"
echo "   pm2 logs"
echo ""
echo "3. Проверьте статус:"
echo "   pm2 status"
echo ""
echo "4. Откройте сайт:"
echo "   https://pokerscrum.ru"
echo ""
echo "✨ Готово!"
