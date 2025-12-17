export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxt/image',
  ],
  imports: {
    autoImport: true,
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
  css: ['~/assets/scss/main.scss'],
  googleFonts: {
    families: {
      Montserrat: [300, 400, 500, 600, 700],
      'TT Firs Neue': [400, 500],
    },
    display: 'swap',
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:color";
            @use "~/assets/scss/_variables.scss" as *;
            @use "~/assets/scss/_mixins.scss" as *;
            @use "~/assets/scss/_base.scss" as *;
          `,
        },
      },
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      extensions: ['.vue'],
    },
    {
      path: '~/components/ui',
      pathPrefix: false,
      extensions: ['.vue'],
    },
  ],

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
      title: 'TaskFlow',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }],
      meta: [
        { name: 'theme-color', content: '#0d0d0d' },
        { name: 'description', content: 'Минималистичный менеджер задач' },
      ],
    },
  },

  ssr: false,
})
