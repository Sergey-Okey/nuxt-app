import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { UserProfile, UserSettingsUpdate } from '@/types/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: useLocalStorage<UserProfile>('productivity-glass-profile', {
      id: 'user_001',
      name: 'Пользователь',
      email: 'user@example.com',
      avatar: null,
      dailyTargetHours: 8,
      theme: 'light',
      notifications: {
        taskReminders: true,
        dailySummary: true,
        weeklyReport: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }),

  getters: {
    // Проверка, выполнена ли дневная цель
    dailyTargetCompleted: (state) => {
      // Здесь будет логика проверки времени за сегодня
      // Пока возвращаем false как заглушку
      return false
    },

    // Получение темы с учетом системных настроек
    effectiveTheme: (state) => {
      if (state.profile.theme === 'system' && typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      return state.profile.theme
    },
  },

  actions: {
    // Обновление профиля
    updateProfile(updates: UserSettingsUpdate): void {
      this.profile = {
        ...this.profile,
        ...updates,
        updatedAt: new Date(),
      }

      // Применяем тему немедленно
      if (updates.theme) {
        this.applyTheme(updates.theme)
      }
    },

    // Обновление аватара
    async updateAvatar(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          this.profile.avatar = dataUrl
          this.profile.updatedAt = new Date()
          resolve(dataUrl)
        }

        reader.onerror = () => {
          reject(new Error('Failed to read avatar file'))
        }

        reader.readAsDataURL(file)
      })
    },

    // Удаление аватара
    removeAvatar(): void {
      this.profile.avatar = null
      this.profile.updatedAt = new Date()
    },

    // Применение темы
    applyTheme(theme: 'light' | 'dark'): void {
      // Удаляем предыдущие классы тем
      document.documentElement.classList.remove('light-theme', 'dark-theme')

      // Добавляем новый класс темы
      document.documentElement.classList.add(`${theme}-theme`)

      // Сохраняем в localStorage для предотвращения мерцания
      localStorage.setItem('productivity-glass-theme', theme)
    },

    // Инициализация темы (вызывается при загрузке приложения)
    initializeTheme(): void {
      const savedTheme = localStorage.getItem('productivity-glass-theme') as
        | 'light'
        | 'dark'
        | null
      const theme = savedTheme || this.profile.theme
      this.applyTheme(theme)
    },

    // Экспорт данных пользователя
    exportUserData(): string {
      const data = {
        profile: this.profile,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }

      return JSON.stringify(data, null, 2)
    },

    // Сброс к настройкам по умолчанию
    resetToDefaults(): void {
      this.profile = {
        id: this.profile.id,
        name: 'Пользователь',
        email: this.profile.email,
        avatar: null,
        dailyTargetHours: 8,
        theme: 'light',
        notifications: {
          taskReminders: true,
          dailySummary: true,
          weeklyReport: false,
        },
        createdAt: this.profile.createdAt,
        updatedAt: new Date(),
      }

      this.applyTheme('light')
    },
  },
})
