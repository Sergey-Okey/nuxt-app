export type ThemeMode = 'dark' | 'light'

export interface UserSettings {
  theme: ThemeMode
  userName: string
  dailyTargetHours: number
}
