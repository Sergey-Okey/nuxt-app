// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-12',

  devtools: { enabled: true },

  typescript: {
    strict: true,
    shim: false,
  },

  imports: {
    dirs: ['stores', 'composables'],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'nuxt-icons',
    '@nuxtjs/color-mode',
    '@nuxtjs/google-fonts',
  ],

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
      Roboto: [300, 400, 500],
      'Segoe UI': [400, 600, 700],
      'JetBrains Mono': [400, 500],
    },
    display: 'swap',
    preload: true,
    download: true,
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'app-theme',
  },

  // Основные стили - подключаем main.scss
  css: ['~/assets/scss/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Подключаем только переменные и миксины глобально
          // Остальные стили будут через main.scss
          additionalData: (content: string) => {
            return `@use "~/assets/scss/_variables.scss" as *; @use "~/assets/scss/_mixins.scss" as *;\n${content}`;
          },
        },
      },
    },
  },

  sourcemap: {
    server: process.env.NODE_ENV !== 'production',
    client: process.env.NODE_ENV !== 'production',
  },

  ssr: true,

  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/_nuxt/**': { headers: { 'cache-control': 'max-age=31536000' } },
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Toka',
      meta: [{ name: 'description', content: 'Toka Application' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  runtimeConfig: {
    public: {
      appName: 'Toka',
      appVersion: process.env.npm_package_version || '1.0.0',
    },
  },
})
