import { defineStore } from 'pinia'
import { useTasksStore } from '~/stores/tasks.store'

export const useTimeTrackerStore = defineStore('timeTracker', {
  state: () => ({
    activeTaskId: null as string | null,
    startTime: null as number | null,
    isRunning: false,
  }),

  actions: {
    start(taskId: string) {
      if (this.isRunning) this.stop()
      this.activeTaskId = taskId
      this.startTime = Date.now()
      this.isRunning = true
    },

    pause() {
      if (!this.isRunning || !this.startTime || !this.activeTaskId) return

      const end = Date.now()
      const duration = end - this.startTime

      useTasksStore().addSession(this.activeTaskId, {
        start: this.startTime,
        end,
        duration,
      })

      this.startTime = null
      this.isRunning = false
    },

    stop() {
      this.pause()
      this.activeTaskId = null
    },
  },

  persist: true,
})
