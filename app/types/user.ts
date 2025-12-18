// Интерфейсы для пользователя и настроек
export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  dailyTargetHours: number
  theme: 'light' | 'dark'
  notifications: {
    taskReminders: boolean
    dailySummary: boolean
    weeklyReport: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface UserSettingsUpdate {
  name?: string
  avatar?: string | null
  dailyTargetHours?: number
  theme?: 'light' | 'dark'
  notifications?: {
    taskReminders?: boolean
    dailySummary?: boolean
    weeklyReport?: boolean
  }
}
