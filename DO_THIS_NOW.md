# 🚨 ВЫПОЛНИТЕ ЭТО ПРЯМО СЕЙЧАС

```
╔═══════════════════════════════════════════════════════════════╗
║                                                                ║
║               PRODUCTION САЙТ НЕ РАБОТАЕТ                      ║
║                                                                ║
║   Frontend пытается подключиться к localhost вместо прода     ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🎯 ЧТО ДЕЛАТЬ

### 📍 ВЫ СЕЙЧАС ЗДЕСЬ (на development машине)

```
┌─────────────────────────────────────────────┐
│  c:\Projects\planning-poker\                 │
│                                              │
│  ✅ Все исправления уже сделаны              │
│  ✅ Код готов к деплою                       │
│  ✅ Скрипты созданы                          │
│                                              │
│  ⚠️  НО! Production сервер использует        │
│      старую сборку с localhost               │
└─────────────────────────────────────────────┘
```

### 📍 ЧТО НУЖНО СДЕЛАТЬ НА PRODUCTION СЕРВЕРЕ

```
┌─────────────────────────────────────────────┐
│  Production Server (где запущен PM2)         │
│                                              │
│  1️⃣  git pull origin main                    │
│  2️⃣  ./build-production.sh                   │
│  3️⃣  pm2 restart all                         │
│                                              │
│  ✅ Готово! (5 минут)                        │
└─────────────────────────────────────────────┘
```

---

## 🚀 КОМАНДЫ (скопируйте и выполните)

### На production сервере (Linux/macOS):

```bash
# Перейти в проект
cd /path/to/planning-poker

# Получить обновления
git pull origin main

# Перейти в frontend
cd frontend

# УДАЛИТЬ старую сборку полностью
rm -rf .output .nuxt node_modules/.cache

# Собрать для Nginx (пустые переменные = относительные пути)
npm run build:prod

# Проверить что localhost НЕ в сборке
grep -r "localhost:3000" .output/ && echo "❌ ОШИБКА!" || echo "✅ OK"

# Вернуться и перезапустить
cd ..
pm2 restart pokerscrum-frontend

# Проверить
pm2 logs pokerscrum-frontend --lines 20
```

---

### На production сервере (Windows):

```powershell
# Перейти в проект
cd C:\path\to\planning-poker

# Получить обновления
git pull origin main

# Запустить сборку
.\build-production.bat

# Перезапустить PM2
pm2 restart all

# Проверить
pm2 logs pokerscrum-frontend --lines 20
```

---

## ⏱️ ВРЕМЯ ВЫПОЛНЕНИЯ

```
┌──────────────────────────────────────┐
│  git pull         │  10 сек          │
│  build script     │  3-5 мин         │
│  pm2 restart      │  5 сек           │
│  ────────────────────────────────    │
│  ИТОГО:           │  ~5 минут        │
│  ДАУНТАЙМ:        │  ~5 секунд       │
└──────────────────────────────────────┘
```

---

## ✅ КАК ПРОВЕРИТЬ

### 1. Проверка логов PM2

```bash
pm2 logs pokerscrum-frontend

# Должно быть:
# ✅ Server running on http://localhost:3001
# ✅ Без ошибок
```

### 2. Проверка в браузере

1. Откройте `https://pokerscrum.ru`
2. Попробуйте создать игру
3. **Должно работать! ✅**

### 3. Проверка API

DevTools → Network:
- ✅ Запросы идут на `https://pokerscrum.ru/api/...`
- ✅ НЕТ запросов к `localhost:3000`

---

## 🆘 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

### Скрипт не запускается?

```bash
# Linux/macOS
chmod +x build-production.sh
./build-production.sh

# Windows
powershell -ExecutionPolicy Bypass -File build-production.bat
```

### PM2 не перезапускается?

```bash
pm2 delete all
pm2 start ecosystem.config.js
```

### Всё ещё localhost?

Проверьте `.env.production`:

```bash
cat frontend/.env.production

# Должно быть:
# NUXT_PUBLIC_API_BASE=https://pokerscrum.ru
# NUXT_PUBLIC_WS_BASE=wss://pokerscrum.ru
```

---

## 📚 ДЕТАЛИ

Если нужны подробности, см:

- [EMERGENCY_FIX_NOW.txt](EMERGENCY_FIX_NOW.txt) - шпаргалка
- [FIX_LOCALHOST_ISSUE_FINAL.md](FIX_LOCALHOST_ISSUE_FINAL.md) - полная инструкция
- [ALL_FIXES_SUMMARY.md](ALL_FIXES_SUMMARY.md) - резюме всех изменений

---

## 🎯 КОРОТКО

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  cd /path/to/planning-poker                     │
│  git pull origin main                           │
│  ./build-production.sh                          │
│  pm2 restart all                                │
│                                                  │
│  ✅ ГОТОВО!                                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## ❓ ЧТО ПРОИЗОЙДЁТ

```
СЕЙЧАС (до исправления):
─────────────────────────
https://pokerscrum.ru
    │
    └─► ❌ Failed to fetch
        └─► Пытается подключиться к localhost


ПОСЛЕ ИСПРАВЛЕНИЯ:
─────────────────────────
https://pokerscrum.ru
    │
    └─► ✅ https://pokerscrum.ru/api/game/create
        └─► Всё работает!
```

---

**🚨 ВСЁ ГОТОВО К ДЕПЛОЮ - ОСТАЛОСЬ ТОЛЬКО ВЫПОЛНИТЬ КОМАНДЫ! 🚨**
