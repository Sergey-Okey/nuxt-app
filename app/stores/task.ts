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
    categories: [] as Category[],
    filters: {
      status: 'all' as 'all' | 'active' | 'completed',
      category: 'all' as string,
      priority: 'all' as 'all' | 'low' | 'medium' | 'high',
    },
  }),

  getters: {
    activeTasks: (state) =>
      state.tasks.filter((task) => task.status === 'active'),
    completedTasks: (state) =>
      state.tasks.filter((task) => task.status === 'completed'),
    todayTasks: (state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return state.tasks.filter(
        (task) =>
          new Date(task.createdAt).toDateString() === today.toDateString()
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
    filteredTasks: (state) => {
      return state.tasks
        .filter((task) => {
          // Фильтр по статусу
          if (
            state.filters.status !== 'all' &&
            task.status !== state.filters.status
          ) {
            return false
          }

          // Фильтр по категории
          if (
            state.filters.category !== 'all' &&
            task.category !== state.filters.category
          ) {
            return false
          }

          // Фильтр по приоритету
          if (
            state.filters.priority !== 'all' &&
            task.priority !== state.filters.priority
          ) {
            return false
          }

          return true
        })
        .sort((a, b) => {
          // Сначала активные, затем завершенные
          if (a.status === 'active' && b.status === 'completed') return -1
          if (a.status === 'completed' && b.status === 'active') return 1

          // Затем по приоритету (high -> medium -> low)
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          }

          // Затем по дате создания (новые сверху)
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        })
    },
    userCategories: (state) => state.categories.filter((cat) => cat.isCustom),
    defaultCategories: (state) =>
      state.categories.filter((cat) => !cat.isCustom),
  },

  actions: {
    // Инициализация из localStorage
    initialize() {
      if (process.client) {
        // Загружаем задачи
        const savedTasks = localStorage.getItem('taskflow-tasks')
        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks)
            this.tasks = parsed.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
            }))
          } catch (error) {
            console.error('Error loading tasks from localStorage:', error)
          }
        }

        // Загружаем пользовательские категории
        const savedCategories = localStorage.getItem('taskflow-categories')
        if (savedCategories) {
          try {
            const customCategories = JSON.parse(savedCategories)
            this.categories = [...this.categories, ...customCategories]
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
          JSON.stringify(this.userCategories)
        )
      }
    },

    // Управление фильтрами
    setFilter(type: 'status' | 'category' | 'priority', value: string) {
      this.filters[type] = value as any
    },

    resetFilters() {
      this.filters = {
        status: 'all',
        category: 'all',
        priority: 'all',
      }
    },

    // Управление задачами
    addTask(task: Omit<Task, 'id' | 'createdAt'>) {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date(),
        spentMinutes: 0,
      }
      this.tasks.unshift(newTask)
      this.saveToLocalStorage()
      return newTask
    },

    updateTask(id: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex((task) => task.id === id)
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    deleteTask(id: string) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
      this.saveToLocalStorage()
    },

    toggleTaskStatus(id: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        task.status = task.status === 'active' ? 'completed' : 'active'
        this.saveToLocalStorage()
      }
    },

    addTimeToTask(id: string, minutes: number) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        task.spentMinutes = (task.spentMinutes || 0) + minutes
        this.saveToLocalStorage()
      }
    },

    // Управление категориями
    addCategory(name: string, color: string, icon: string) {
      const newCategory: Category = {
        id: `custom-${Date.now()}`,
        name,
        color,
        icon,
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
      // Не удаляем системные категории
      const category = this.categories.find((cat) => cat.id === id)
      if (category?.isCustom) {
        this.categories = this.categories.filter((cat) => cat.id !== id)

        // Удаляем категорию из задач
        this.tasks = this.tasks.map((task) =>
          task.category === id ? { ...task, category: 'personal' } : task
        )

        this.saveToLocalStorage()
      }
    },

    // Получение категории по ID
    getCategoryById(id: string): Category | undefined {
      return this.categories.find((cat) => cat.id === id)
    },
  },
})
