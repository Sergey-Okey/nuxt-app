import { defineStore } from 'pinia'

interface FocusSession {
  id: string
  startTime: Date
  endTime?: Date
  taskId?: string
  duration: number // in minutes
  type: 'work' | 'break'
}

interface DailyStats {
  date: string
  focusTime: number
  completedTasks: number
  productivity: number
}

export const useStatsStore = defineStore('stats', {
  state: () => ({
    focusSessions: [] as FocusSession[],
    dailyStats: [] as DailyStats[],
    currentStreak: 7,
    weeklyGoal: 25 * 60, // 25 hours in minutes
    dailyGoal: 4 * 60, // 4 hours in minutes
  }),

  getters: {
    todayStats(): DailyStats {
      const today = new Date().toDateString()
      return (
        this.dailyStats.find((stat) => stat.date === today) || {
          date: today,
          focusTime: 0,
          completedTasks: 0,
          productivity: 0,
        }
      )
    },

    totalFocusTime(): number {
      return this.focusSessions.reduce(
        (total, session) => total + session.duration,
        0
      )
    },

    todayFocusTime(): number {
      const today = new Date().toDateString()
      return this.focusSessions
        .filter(
          (session) => new Date(session.startTime).toDateString() === today
        )
        .reduce((total, session) => total + session.duration, 0)
    },

    weekProgress(): Array<{ day: string; progress: number; isToday: boolean }> {
      const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
      const today = new Date()
      const dayOfWeek = today.getDay()

      return days.map((day, index) => {
        const date = new Date(today)
        date.setDate(
          today.getDate() - dayOfWeek + index + (dayOfWeek === 0 ? -6 : 1)
        )
        const dateStr = date.toDateString()

        const dayStats = this.dailyStats.find((stat) => stat.date === dateStr)
        const progress = dayStats
          ? (dayStats.focusTime / this.dailyGoal) * 100
          : 0

        return {
          day,
          progress: Math.min(progress, 100),
          isToday: date.toDateString() === today.toDateString(),
        }
      })
    },

    focusProgress(): { percentage: number; total: string; goal: string } {
      const percentage = (this.todayFocusTime / this.dailyGoal) * 100
      return {
        percentage: Math.min(Math.round(percentage), 100),
        total: this.formatTime(this.todayFocusTime),
        goal: this.formatTime(this.dailyGoal),
      }
    },

    quickStats(): Array<{
      icon: string
      value: string
      label: string
      color: string
      trend?: { type: string; icon: string; value: string }
    }> {
      const tasksStore = useTasksStore()
      return [
        {
          icon: 'lucide:check-circle',
          value: `${tasksStore.completedTasks.length}/${tasksStore.tasks.length}`,
          label: 'Выполнено задач',
          color: 'success',
          trend: { type: 'positive', icon: 'lucide:trending-up', value: '+2' },
        },
        {
          icon: 'lucide:clock',
          value: this.formatTime(this.todayFocusTime),
          label: 'Фокус-время',
          color: 'accent',
          trend: {
            type: 'positive',
            icon: 'lucide:trending-up',
            value: '+15м',
          },
        },
        {
          icon: 'lucide:trending-up',
          value: `${this.todayStats.productivity || 78}%`,
          label: 'Продуктивность',
          color: 'warning',
          trend: { type: 'positive', icon: 'lucide:trending-up', value: '+5%' },
        },
        {
          icon: 'lucide:flame',
          value: `${this.currentStreak} дней`,
          label: 'Текущий стрик',
          color: 'error',
          trend: { type: 'positive', icon: 'lucide:trending-up', value: '+1' },
        },
      ]
    },
  },

  actions: {
    addFocusSession(session: Omit<FocusSession, 'id'>) {
      const newSession: FocusSession = {
        ...session,
        id: Math.random().toString(36).substr(2, 9),
      }
      this.focusSessions.push(newSession)

      // Update daily stats
      this.updateDailyStats()
    },

    updateDailyStats() {
      const today = new Date().toDateString()
      const tasksStore = useTasksStore()

      const todayCompletedTasks = tasksStore.tasks.filter(
        (task) =>
          task.status === 'completed' && task.createdAt.toDateString() === today
      ).length

      const todayFocusTime = this.todayFocusTime
      const productivity =
        todayFocusTime > 0
          ? Math.min((todayCompletedTasks / (todayFocusTime / 60)) * 10, 100)
          : 0

      const existingStatIndex = this.dailyStats.findIndex(
        (stat) => stat.date === today
      )

      if (existingStatIndex !== -1) {
        this.dailyStats[existingStatIndex] = {
          date: today,
          focusTime: todayFocusTime,
          completedTasks: todayCompletedTasks,
          productivity: Math.round(productivity),
        }
      } else {
        this.dailyStats.push({
          date: today,
          focusTime: todayFocusTime,
          completedTasks: todayCompletedTasks,
          productivity: Math.round(productivity),
        })
      }
    },

    formatTime(minutes: number): string {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
    },
  },
})
