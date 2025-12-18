// Интерфейсы для аналитики
export interface TimePeriod {
  start: Date
  end: Date
}

export interface TimeDistribution {
  categoryId: string
  categoryName: string
  color: string
  totalTime: number // в миллисекундах
  percentage: number
}

export interface DailyStats {
  date: Date
  totalTasks: number
  completedTasks: number
  totalTime: number
  productivityScore: number // 0-100
}

export interface WeeklyStats {
  weekNumber: number
  year: number
  days: DailyStats[]
  totalTime: number
  averageProductivity: number
}

export interface TopTag {
  tagId: string
  tagName: string
  color: string
  totalTime: number
  taskCount: number
}

export interface AnalyticsData {
  today: {
    totalTime: number
    completedTasks: number
    activeTasks: number
  }
  thisWeek: {
    totalTime: number
    completedTasks: number
    averageProductivity: number
  }
  thisMonth: {
    totalTime: number
    completedTasks: number
    productivityTrend: number // процент изменения
  }
  timeDistribution: TimeDistribution[]
  weeklyTrend: DailyStats[]
  topTags: TopTag[]
  mostProductiveDay: {
    day: string
    productivity: number
  }
}

export interface AIInsight {
  id: string
  type: 'positive' | 'negative' | 'suggestion' | 'achievement'
  title: string
  message: string
  data: Record<string, any>
  createdAt: Date
}
