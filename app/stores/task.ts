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
  completedAt?: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  isCustom?: boolean
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
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
    ] as Category[],
    activeTimerTaskId: null as string | null,
    timerStartTime: null as number | null,
  }),

  getters: {
    activeTasks: (state) =>
      state.tasks.filter((task) => task.status === 'active'),
    completedTasks: (state) =>
      state.tasks.filter((task) => task.status === 'completed'),
    todayTasks: (state) => {
      const today = new Date().toDateString()
      return state.tasks.filter(
        (task) => new Date(task.createdAt).toDateString() === today
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
    tasksByCategory: (state) => {
      return (categoryId: string) =>
        state.tasks.filter((task) => task.category === categoryId)
    },
    activeTaskWithTimer: (state) => {
      if (!state.activeTimerTaskId) return null
      return state.tasks.find((task) => task.id === state.activeTimerTaskId)
    },
    totalTimeSpent: (state) => {
      return state.tasks.reduce(
        (total, task) => total + (task.spentMinutes || 0),
        0
      )
    },
  },

  actions: {
    // Инициализация из localStorage
    initialize() {
      if (process.client) {
        const savedTasks = localStorage.getItem('taskflow-tasks')
        const savedCategories = localStorage.getItem('taskflow-categories')

        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks)
            this.tasks = parsed.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
              completedAt: task.completedAt
                ? new Date(task.completedAt)
                : undefined,
            }))
          } catch (error) {
            console.error('Error loading tasks from localStorage:', error)
          }
        }

        if (savedCategories) {
          try {
            this.categories = JSON.parse(savedCategories)
          } catch (error) {
            console.error('Error loading categories from localStorage:', error)
          }
        }
      }
    },

    // Сохранение в localStorage
    saveToLocalStorage() {
      if (process.client) {
        localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks))
        localStorage.setItem(
          'taskflow-categories',
          JSON.stringify(this.categories)
        )
      }
    },

    // Добавление задачи
    addTask(task: Omit<Task, 'id' | 'createdAt'>) {
      const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        status: 'active',
        spentMinutes: 0,
        tags: task.tags || [],
      }
      this.tasks.unshift(newTask)
      this.saveToLocalStorage()
      return newTask
    },

    // Обновление задачи
    updateTask(id: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex((task) => task.id === id)
      if (index !== -1) {
        // Если задача помечается как выполненная, добавляем дату завершения
        if (
          updates.status === 'completed' &&
          this.tasks[index].status === 'active'
        ) {
          updates.completedAt = new Date()
        }
        // Если задача активируется, убираем дату завершения
        if (
          updates.status === 'active' &&
          this.tasks[index].status === 'completed'
        ) {
          updates.completedAt = undefined
        }

        this.tasks[index] = { ...this.tasks[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    // Удаление задачи
    deleteTask(id: string) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
      this.saveToLocalStorage()
    },

    // Переключение статуса задачи
    toggleTaskStatus(id: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        const newStatus = task.status === 'active' ? 'completed' : 'active'
        const updates: Partial<Task> = {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : undefined,
        }
        this.updateTask(id, updates)
      }
    },

    // Добавление времени к задаче
    addTimeToTask(id: string, minutes: number) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        task.spentMinutes = (task.spentMinutes || 0) + minutes
        this.saveToLocalStorage()
      }
    },

    // Управление таймером
    startTimer(taskId: string) {
      if (this.activeTimerTaskId) {
        this.stopTimer()
      }
      this.activeTimerTaskId = taskId
      this.timerStartTime = Date.now()
    },

    stopTimer() {
      if (this.activeTimerTaskId && this.timerStartTime) {
        const minutes = Math.floor((Date.now() - this.timerStartTime) / 60000)
        this.addTimeToTask(this.activeTimerTaskId, minutes)
      }
      this.activeTimerTaskId = null
      this.timerStartTime = null
    },

    getTimerElapsedMinutes(): number {
      if (!this.timerStartTime) return 0
      return Math.floor((Date.now() - this.timerStartTime) / 60000)
    },

    // Управление категориями
    addCategory(category: Omit<Category, 'id'>) {
      const newCategory: Category = {
        ...category,
        id: Math.random().toString(36).substr(2, 9),
        isCustom: true,
      }
      this.categories.push(newCategory)
      this.saveToLocalStorage()
      return newCategory
    },

    updateCategory(id: string, updates: Partial<Category>) {
      const index = this.categories.findIndex((cat) => cat.id === id)
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    deleteCategory(id: string) {
      // Нельзя удалить встроенные категории
      const category = this.categories.find((cat) => cat.id === id)
      if (category && !category.isCustom) return

      // Перемещаем задачи в категорию "Личное"
      this.tasks = this.tasks.map((task) =>
        task.category === id ? { ...task, category: 'personal' } : task
      )

      this.categories = this.categories.filter((cat) => cat.id !== id)
      this.saveToLocalStorage()
    },

    // Получение категории по ID
    getCategoryById(id: string): Category | undefined {
      return this.categories.find((cat) => cat.id === id)
    },

    // Поиск задач
    searchTasks(query: string): Task[] {
      if (!query.trim()) return this.tasks

      const searchTerm = query.toLowerCase()
      return this.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      )
    },
  },
})
