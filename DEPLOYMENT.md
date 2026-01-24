# Инструкция по развертыванию на production сервере

## Шаги развертывания

1. **Обновите конфигурацию nginx**
   
   Вариант 1: приложение в подпапке `/scrumpoker/` — используйте `nginx-config-example.conf`.
   
   Вариант 2: приложение в корне домена `/` — используйте `nginx-config-example-root.conf`.

2. **Перезапустите nginx**:
   ```bash
   sudo nginx -t  # Проверка конфигурации
   sudo systemctl reload nginx
   ```

3. **Настройте переменные окружения**:

   **`./backend/.env`** должен содержать:
   ```env
   DATABASE_URL="mysql://root:ваш_пароль@172.17.0.1:3306/planning_poker"
   SESSION_SECRET="your-secret-key"
   FRONTEND_URL="https://pokerscrum.ru"
   ```
   
   **Важно:** 
   - Найдите IP Docker bridge: `ip addr show docker0 | grep inet` (обычно `172.17.0.1`)
   - MySQL должен слушать на всех интерфейсах (`*:3306` или `0.0.0.0:3306`)
   - Нужно разрешить подключения из Docker сети в MySQL (см. ниже)

   **`./frontend/.env`** (опционально, переменные уже в docker-compose.yml):
   ```env
   API_BASE="https://pokerscrum.ru"
   WS_BASE="wss://pokerscrum.ru/ws"
   ```
   
   Если приложение развернуто в подпапке `/scrumpoker/`, укажите:
   ```env
   API_BASE="https://pokerscrum.ru/scrumpoker"
   WS_BASE="wss://pokerscrum.ru/scrumpoker/ws"
   ```

4. **Настройте MySQL для работы с Docker**:

   **a) Убедитесь, что MySQL слушает на всех интерфейсах:**
   ```bash
   sudo ss -tlnp | grep 3306
   ```
   Должно показать: `LISTEN ... *:3306` (не только `127.0.0.1:3306`)
   
   Если нет, измените в `/etc/mysql/mysql.conf.d/mysqld.cnf`:
   ```ini
   bind-address = 0.0.0.0
   ```
   Перезапустите: `sudo systemctl restart mysql`

   **b) Разрешите подключения из Docker сети:**
   ```bash
   mysql -u root -p
   ```
   ```sql
   -- Разрешить root подключаться из Docker сети
   CREATE USER IF NOT EXISTS 'root'@'172.17.%' IDENTIFIED BY 'ваш_пароль';
   CREATE USER IF NOT EXISTS 'root'@'172.18.%' IDENTIFIED BY 'ваш_пароль';
   GRANT ALL PRIVILEGES ON planning_poker.* TO 'root'@'172.17.%';
   GRANT ALL PRIVILEGES ON planning_poker.* TO 'root'@'172.18.%';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Соберите и запустите контейнеры**:
   ```bash
   docker-compose down
   docker-compose build --no-cache frontend  # Важно для применения переменных окружения
   docker-compose up -d
   ```

6. **Проверьте логи**:
   ```bash
   docker logs pokerscrum_frontend_1 --tail 50
   docker logs pokerscrum_backend_1 --tail 50
   ```

## Важные замечания

- **API_BASE**: Полный URL без `/api` (в коде уже добавляется `/api/game/...`)
- **WS_BASE**: Полный URL для WebSocket (не поддерживает относительные пути)
- **DATABASE_URL**: Используйте IP Docker bridge (`172.17.0.1`) для доступа к MySQL на хосте
- Frontend использует `prisma db push` вместо миграций (для тестовой среды)
- При изменении переменных окружения нужно пересобрать frontend с `--no-cache`

## Проверка работы

1. Откройте `http://XX.XXX.XXX.XX/scrumpoker/` - должна загрузиться главная страница
2. Проверьте в консоли браузера (F12 → Network), что запросы идут на правильный URL через nginx
3. Проверьте, что WebSocket подключается (в Network → WS)
