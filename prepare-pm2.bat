@echo off
REM Скрипт подготовки к запуску через PM2 (Windows)

echo 🚀 Подготовка к запуску через PM2...

REM Создание директорий для логов
echo 📁 Создание директорий для логов...
if not exist "backend\logs" mkdir backend\logs
if not exist "frontend\logs" mkdir frontend\logs

REM Проверка установки PM2
where pm2 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PM2 не установлен!
    echo Установите PM2 глобально: npm install -g pm2
    exit /b 1
)

echo ✅ PM2 установлен

REM Проверка наличия сборок
echo.
echo 📦 Проверка сборок...

if not exist "backend\dist\main.js" (
    echo ⚠️  Backend не собран!
    echo Запустите: cd backend ^&^& npm run build:prod
    set BACKEND_BUILT=false
) else (
    echo ✅ Backend собран
    set BACKEND_BUILT=true
)

if not exist "frontend\.output\server\index.mjs" (
    echo ⚠️  Frontend не собран!
    echo Запустите: cd frontend ^&^& npm run build:prod
    set FRONTEND_BUILT=false
) else (
    echo ✅ Frontend собран
    set FRONTEND_BUILT=true
)

REM Проверка .env файлов
echo.
echo 🔐 Проверка .env файлов...

if not exist "backend\.env" (
    echo ⚠️  backend\.env не найден!
    echo Создайте файл на основе backend\env.example
    set BACKEND_ENV=false
) else (
    echo ✅ backend\.env существует
    set BACKEND_ENV=true
)

if not exist "frontend\.env" (
    echo ⚠️  frontend\.env не найден!
    echo Создайте файл на основе frontend\.env.example
    set FRONTEND_ENV=false
) else (
    echo ✅ frontend\.env существует
    set FRONTEND_ENV=true
)

REM Итоговая проверка
echo.
echo 📋 Итого:

if "%BACKEND_BUILT%"=="true" if "%FRONTEND_BUILT%"=="true" if "%BACKEND_ENV%"=="true" if "%FRONTEND_ENV%"=="true" (
    echo ✅ Все готово к запуску!
    echo.
    echo Запустите PM2:
    echo   Development: pm2 start ecosystem.config.js --env development
    echo   Production:  pm2 start ecosystem.config.js --env production
    echo.
    echo Автозапуск при перезагрузке сервера:
    echo   pm2 startup
    echo   pm2 save
) else (
    echo ❌ Есть проблемы, которые нужно исправить!
    exit /b 1
)
