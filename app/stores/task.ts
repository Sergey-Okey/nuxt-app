import { defineStore } from 'pinia'

export interface Task {
  id: string
  title: string
  description?: string
  category: string
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed'
  createdAt: Date
  dueAt?: Date
  estimatedMinutes?: number
  spentMinutes?: number
  tags: string[]
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [
      {
        id: '1',
        title: 'Разработка интерфейса TaskFlow',
        category: 'work',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedMinutes: 120,
        spentMinutes: 45,
        tags: ['разработка', 'ui'],
      },
      {
        id: '2',
        title: 'Тестирование компонентов',
        category: 'work',
        priority: 'medium',
        status: 'active',
        createdAt: new Date(),
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedMinutes: 60,
        tags: ['тестирование'],
      },
      {
        id: '3',
        title: 'Утренняя зарядка',
        category: 'health',
        priority: 'low',
        status: 'completed',
        createdAt: new Date(),
        tags: ['здоровье'],
      },
      {
        id: '4',
        title: 'Изучение Nuxt 4',
        category: 'learning',
        priority: 'medium',
        status: 'active',
        createdAt: new Date(),
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedMinutes: 90,
        tags: ['обучение'],
      },
    ] as Task[],
    categories: [
      {
        id: 'work',
        name: 'Работа',
        color: '#5d5fef',
        icon: 'lucide:briefcase',
      },
      { id: 'personal', name: 'Личное', color: '#5df27e', icon: 'lucide:home' },
      {
        id: 'health',
        name: 'Здоровье',
        color: '#f87171',
        icon: 'lucide:heart',
      },
      {
        id: 'learning',
        name: 'Обучение',
        color: '#facc15',
        icon: 'lucide:book-open',
      },
    ],
  }),

  getters: {
    activeTasks: (state) =>
      state.tasks.filter((task) => task.status === 'active'),
    completedTasks: (state) =>
      state.tasks.filter((task) => task.status === 'completed'),
    todaysTasks: (state) => {
      const today = new Date().toDateString()
      return state.tasks.filter(
        (task) => task.dueAt && new Date(task.dueAt).toDateString() === today
      )
    },
    upcomingTasks: (state) => {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      return state.tasks
        .filter(
          (task) =>
            task.dueAt &&
            task.dueAt > today &&
            task.dueAt <= nextWeek &&
            task.status === 'active'
        )
        .sort(
          (a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime()
        )
    },
    tasksByPriority: (state) => {
      return (priority: 'low' | 'medium' | 'high') =>
        state.tasks.filter((task) => task.priority === priority)
    },
  },

  actions: {
    addTask(task: Omit<Task, 'id' | 'createdAt'>) {
      const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      }
      this.tasks.unshift(newTask)
    },

    updateTask(id: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex((task) => task.id === id)
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updates }
      }
    },

    deleteTask(id: string) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
    },

    toggleTaskStatus(id: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        task.status = task.status === 'active' ? 'completed' : 'active'
      }
    },

    addTimeToTask(id: string, minutes: number) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        task.spentMinutes = (task.spentMinutes || 0) + minutes
      }
    },
  },
})
