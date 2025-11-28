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
  isCustom: boolean
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
        isCustom: false,
      },
      {
        id: 'personal',
        name: 'Личное',
        color: '#5df27e',
        icon: 'lucide:home',
        isCustom: false,
      },
      {
        id: 'health',
        name: 'Здоровье',
        color: '#f87171',
        icon: 'lucide:heart',
        isCustom: false,
      },
      {
        id: 'learning',
        name: 'Обучение',
        color: '#facc15',
        icon: 'lucide:book-open',
        isCustom: false,
      },
    ] as Category[],
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
    customCategories: (state) => state.categories.filter((cat) => cat.isCustom),
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
        const savedCategories = localStorage.getItem(
          'taskflow-custom-categories'
        )
        if (savedCategories) {
          try {
            const customCats = JSON.parse(savedCategories)
            // Добавляем только пользовательские категории, избегая дубликатов
            customCats.forEach((customCat: Category) => {
              if (!this.categories.find((cat) => cat.id === customCat.id)) {
                this.categories.push(customCat)
              }
            })
          } catch (error) {
            console.error(
              'Error loading custom categories from localStorage:',
              error
            )
          }
        }
      }
    },

    // Сохранение в localStorage
    saveToLocalStorage() {
      if (process.client) {
        localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks))
        // Сохраняем только пользовательские категории
        const customCats = this.categories.filter((cat) => cat.isCustom)
        localStorage.setItem(
          'taskflow-custom-categories',
          JSON.stringify(customCats)
        )
      }
    },

    addTask(task: Omit<Task, 'id' | 'createdAt'>) {
      const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
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
    addCustomCategory(name: string, color: string, icon: string) {
      const newCategory: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        color,
        icon,
        isCustom: true,
      }
      this.categories.push(newCategory)
      this.saveToLocalStorage()
      return newCategory
    },

    removeCustomCategory(id: string) {
      this.categories = this.categories.filter(
        (cat) => !cat.isCustom || cat.id !== id
      )
      this.saveToLocalStorage()
    },

    // Получение категории по ID
    getCategoryById(id: string): Category | undefined {
      return this.categories.find((cat) => cat.id === id)
    },

    // Поиск задач
    searchTasks(query: string) {
      const lowerQuery = query.toLowerCase()
      return this.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerQuery) ||
          task.description?.toLowerCase().includes(lowerQuery) ||
          task.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
    },
  },
})
