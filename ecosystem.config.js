module.exports = {
  apps: [
    {
      name: 'pokerscrum-backend',
      cwd: './backend',
      script: './dist/main.js',
      
      // Режим выполнения
      instances: 1, // Можно увеличить до 'max' для использования всех ядер
      exec_mode: 'cluster', // cluster mode для production
      
      // Мониторинг и перезапуск
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      
      // Логирование
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Переменные окружения для development
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        FRONTEND_URL: 'http://localhost:3001'
      },
      
      // Переменные окружения для production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        FRONTEND_URL: 'https://pokerscrum.ru'
        // Остальные переменные (DATABASE_URL, JWT_*, SESSION_SECRET) должны быть в .env файле
      }
    },
    {
      name: 'pokerscrum-frontend',
      cwd: './frontend',
      script: '.output/server/index.mjs',
      
      // Режим выполнения
      instances: 1,
      exec_mode: 'cluster',
      
      // Мониторинг и перезапуск
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '300M',
      
      // Логирование
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Переменные окружения для development
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        NITRO_PORT: 3001,
        NUXT_PUBLIC_API_BASE: 'http://localhost:3000',
        NUXT_PUBLIC_WS_BASE: 'ws://localhost:3000'
      },
      
      // Переменные окружения для production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        NITRO_PORT: 3001,
        // Пустые значения для Nginx reverse proxy (относительные пути)
        NUXT_PUBLIC_API_BASE: '',
        NUXT_PUBLIC_WS_BASE: ''
      }
    }
  ]
};
