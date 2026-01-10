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
      apiBase: process.env.API_BASE || 'http://localhost:3000',
      wsBase: process.env.WS_BASE || 'ws://localhost:3000',
    },
  },
  ssr: true,
});
