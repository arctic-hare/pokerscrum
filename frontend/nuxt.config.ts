export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/base.scss'],
  app: {
    head: {
      title: 'Planning Poker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      // Переменные окружения с префиксом NUXT_PUBLIC_
      // Пустая строка = относительные пути (для Nginx proxy)
      // Для разработки без Nginx используйте полный URL
      apiBase: process.env.NUXT_PUBLIC_API_BASE || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000'),
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || (process.env.NODE_ENV === 'production' ? '' : 'ws://localhost:3000'),
    },
  },
  ssr: true,
});
