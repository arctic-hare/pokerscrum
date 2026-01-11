export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/base.scss'],
  app: {
    baseURL: '/scrumpoker/',
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
      // В Nuxt переменные для public должны иметь префикс NUXT_PUBLIC_
      apiBase: process.env.NUXT_PUBLIC_API_BASE || process.env.API_BASE || 'http://localhost:3000',
      wsBase: process.env.NUXT_PUBLIC_WS_BASE || process.env.WS_BASE || 'ws://localhost:3000',
    },
  },
  ssr: true,
});
