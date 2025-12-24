import { defineStore } from 'pinia'
import type { Task } from '~/types/task.types'
import type { TimeSession } from '~/types/time.types'
import { v4 as uuidv4 } from 'uuid'

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
  }),

  getters: {
    activeTasks: (s) => s.tasks.filter((t) => t.status === 'active'),
    completedTasks: (s) => s.tasks.filter((t) => t.status === 'completed'),
  },

  actions: {
    addTask(data: Omit<Task, 'id' | 'sessions' | 'status' | 'createdAt'>) {
      this.tasks.push({
        ...data,
        id: uuidv4(),
        sessions: [],
        status: 'active',
        createdAt: Date.now(),
      })
    },

    updateTask(id: string, data: Partial<Task>) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) Object.assign(task, data)
    },

    completeTask(id: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (!task) return
      task.status = 'completed'
      task.completedAt = Date.now()
    },

    removeTask(id: string) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },

    addSession(taskId: string, session: TimeSession) {
      const task = this.tasks.find((t) => t.id === taskId)
      if (task) task.sessions.push(session)
    },
  },

  persist: true,
})
