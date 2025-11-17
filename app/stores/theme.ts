import { defineStore } from 'pinia'

type Theme = 'dark' | 'light'

interface ThemeState {
  currentTheme: Theme
  systemPreference: Theme
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    currentTheme: 'dark',
    systemPreference: 'dark',
  }),

  getters: {
    isDark: (state) => state.currentTheme === 'dark',
    isLight: (state) => state.currentTheme === 'light',
    themeIcon: (state) =>
      state.currentTheme === 'dark' ? 'lucide:sun' : 'lucide:moon',
    themeLabel: (state) =>
      state.currentTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема',
  },

  actions: {
    initializeTheme() {
      // Проверяем сохраненную тему в localStorage
      const savedTheme = localStorage.getItem('taskflow-theme') as Theme

      // Проверяем системные настройки
      this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      if (savedTheme) {
        this.currentTheme = savedTheme
      } else {
        this.currentTheme = this.systemPreference
      }

      this.applyTheme()
    },

    toggleTheme() {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
      this.applyTheme()
      localStorage.setItem('taskflow-theme', this.currentTheme)
    },

    setTheme(theme: Theme) {
      this.currentTheme = theme
      this.applyTheme()
      localStorage.setItem('taskflow-theme', theme)
    },

    applyTheme() {
      const root = document.documentElement
      root.setAttribute('data-theme', this.currentTheme)

      // Обновляем meta theme-color для мобильных браузеров
      const themeColor = this.currentTheme === 'dark' ? '#0d0d0d' : '#ffffff'
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', themeColor)
      }
    },

    // Синхронизация с системными настройками
    watchSystemPreference() {
      if (typeof window !== 'undefined') {
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            this.systemPreference = e.matches ? 'dark' : 'light'
            // Если тема не сохранена вручную, следуем системным настройкам
            if (!localStorage.getItem('taskflow-theme')) {
              this.currentTheme = this.systemPreference
              this.applyTheme()
            }
          })
      }
    },
  },
})
