import { defineStore } from 'pinia'
import type { ThemeMode } from '~/types/settings.types'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'dark' as ThemeMode,
    userName: '',
    dailyTargetHours: 6,
  }),

  actions: {
    setTheme(theme: ThemeMode) {
      this.theme = theme
    },
  },

  persist: true,
})
