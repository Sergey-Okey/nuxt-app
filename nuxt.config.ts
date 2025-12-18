export default defineNuxtConfig({
  // TypeScript настройки
  typescript: {
    strict: true,
    shim: false,
  },

  // Auto-imports настройки
  imports: {
    dirs: ['stores', 'composables', 'types', 'components/**/*'],
  },

  // Компоненты
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      extensions: ['vue'],
    },
  ],

  // Модули
  modules: ['@vueuse/nuxt', '@pinia/nuxt', 'nuxt-icons'],

  // Vueuse настройки
  vueuse: {
    ssrHandlers: true,
  },

  // Сборка
  build: {
    transpile: ['pinia'],
  },

  // CSS
  css: ['@/assets/scss/main.scss'],

  // Vite настройки
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/assets/scss/variables";
            @import "@/assets/scss/mixins";
          `,
        },
      },
    },
  },

  // SSR
  ssr: true,

  // Sourcemap для разработки
  sourcemap: {
    server: true,
    client: true,
  },
})
