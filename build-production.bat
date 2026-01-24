@echo off
REM Скрипт для сборки Production версии Planning Poker (Windows)
REM Использование: build-production.bat

setlocal enabledelayedexpansion

echo ================================================================
echo   Production Build - Planning Poker
echo ================================================================
echo.

REM Проверка, что мы в корне проекта
if not exist "ecosystem.config.js" (
    echo [ERROR] ecosystem.config.js не найден!
    echo Запустите скрипт из корня проекта
    exit /b 1
)

REM 1. Backend
echo.
echo [INFO] Сборка Backend...
cd backend

if not exist "package.json" (
    echo [ERROR] backend\package.json не найден!
    exit /b 1
)

REM Установка зависимостей если нужно
if not exist "node_modules" (
    echo [INFO] Установка зависимостей backend...
    call npm install
)

REM Сборка backend
echo [INFO] Компиляция backend...
call npm run build

if not exist "dist\main.js" (
    echo [ERROR] Backend сборка не удалась: dist\main.js не найден
    exit /b 1
)

echo [OK] Backend собран успешно
cd ..

REM 2. Frontend
echo.
echo [INFO] Сборка Frontend...
cd frontend

if not exist "package.json" (
    echo [ERROR] frontend\package.json не найден!
    exit /b 1
)

REM Установка зависимостей если нужно
if not exist "node_modules" (
    echo [INFO] Установка зависимостей frontend...
    call npm install
)

REM Удаление старой сборки
echo [INFO] Удаление старой сборки...
if exist ".output" rmdir /s /q .output
if exist ".nuxt" rmdir /s /q .nuxt
if exist "node_modules\.cache" rmdir /s /q node_modules\.cache

REM Создание .env.production если его нет
if not exist ".env.production" (
    echo [WARN] .env.production не найден, создаю...
    (
        echo # Production Environment Variables
        echo # Для Nginx reverse proxy используем пустые значения
        echo NUXT_PUBLIC_API_BASE=
        echo NUXT_PUBLIC_WS_BASE=
        echo PORT=3001
        echo NITRO_PORT=3001
        echo NODE_ENV=production
    ) > .env.production
    echo [OK] .env.production создан
)

REM Сборка frontend с production переменными
echo [INFO] Компиляция frontend для Nginx (относительные пути)...
set NODE_ENV=production
set NUXT_PUBLIC_API_BASE=
set NUXT_PUBLIC_WS_BASE=

call npm run build

REM Проверка сборки
if not exist ".output" (
    echo [ERROR] Frontend сборка не удалась: .output не создан
    exit /b 1
)

if not exist ".output\server\index.mjs" (
    echo [ERROR] Frontend сборка не удалась: .output\server\index.mjs не найден
    exit /b 1
)

echo [OK] Frontend собран успешно
cd ..

REM 3. Создание директорий для логов
echo.
echo [INFO] Создание директорий для логов...
if not exist "backend\logs" mkdir backend\logs
if not exist "frontend\logs" mkdir frontend\logs
echo [OK] Директории созданы

REM 4. Итоги
echo.
echo ================================================================
echo   Сборка завершена успешно!
echo ================================================================
echo.
echo Следующие шаги:
echo.
echo 1. Перезапустите PM2:
echo    pm2 restart all
echo    или
echo    pm2 reload all  (0-downtime)
echo.
echo 2. Проверьте логи:
echo    pm2 logs
echo.
echo 3. Проверьте статус:
echo    pm2 status
echo.
echo 4. Откройте сайт:
echo    https://pokerscrum.ru
echo.
echo Готово!

endlocal
