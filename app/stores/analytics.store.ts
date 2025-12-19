import { defineStore } from 'pinia'
import { useTasksStore } from '~/stores/tasks.store'
import type { StatisticData } from '~/types/analytics.types'

export const useAnalyticsStore = defineStore('analytics', {
  actions: {
    collect(): StatisticData {
      const tasks = useTasksStore().tasks

      const stats: StatisticData = {
        totalTime: 0,
        byCategory: {},
        byDay: {},
      }

      tasks.forEach((task) => {
        task.sessions.forEach((s) => {
          stats.totalTime += s.duration

          const day = new Date(s.start).toDateString()
          stats.byDay[day] = (stats.byDay[day] || 0) + s.duration

          if (task.categoryId) {
            stats.byCategory[task.categoryId] =
              (stats.byCategory[task.categoryId] || 0) + s.duration
          }
        })
      })

      return stats
    },
  },
})
