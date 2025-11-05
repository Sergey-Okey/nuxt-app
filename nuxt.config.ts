export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image', '@nuxt/eslint', '@nuxt/fonts'],

  css: ['./app/assets/styles/_index.scss'],

  fonts: {
    google: {
      families: {
        Montserrat: [400, 900],
      },
    },
  },
})
