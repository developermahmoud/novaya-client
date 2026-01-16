// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false, // Enable SPA mode
  modules: ['@nuxtjs/tailwindcss'],
  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },
  experimental: {
    payloadExtraction: false
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'ar',
        dir: 'rtl'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'صالون بيوتي سنتر - مركز التجميل للسيدات',
      meta: [
        { name: 'description', content: 'صالون بيوتي سنتر - أفضل مركز تجميل للسيدات يقدم خدمات التجميل والعناية بالبشرة والشعر' }
      ]
    }
  },
  css: ['assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
