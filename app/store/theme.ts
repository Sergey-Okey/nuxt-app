import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'dark' as 'light' | 'dark',
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      // Применяем тему к документу
      document.documentElement.setAttribute('data-theme', this.theme)
    },
  },
})
