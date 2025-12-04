import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

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
  spentMinutes: number
  tags: string[]
}

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  isCustom: boolean
  taskCount: number
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
        taskCount: 0,
      },
      {
        id: 'personal',
        name: 'Личное',
        color: '#5df27e',
        icon: 'lucide:home',
        isCustom: false,
        taskCount: 0,
      },
      {
        id: 'health',
        name: 'Здоровье',
        color: '#f87171',
        icon: 'lucide:heart',
        isCustom: false,
        taskCount: 0,
      },
      {
        id: 'learning',
        name: 'Обучение',
        color: '#facc15',
        icon: 'lucide:book-open',
        isCustom: false,
        taskCount: 0,
      },
      {
        id: 'uncategorized',
        name: 'Без категории',
        color: '#a0a0a0',
        icon: 'lucide:folder',
        isCustom: false,
        taskCount: 0,
      },
    ] as Category[],
    activeTimer: {
      taskId: null as string | null,
      startTime: null as Date | null,
      elapsedSeconds: 0,
    },
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
    tasksByCategory: (state) => {
      return (categoryId: string) =>
        state.tasks.filter((task) => task.category === categoryId)
    },
    customCategories: (state) => state.categories.filter((cat) => cat.isCustom),
    getTaskById: (state) => (id: string) =>
      state.tasks.find((task) => task.id === id),

    // Для статистики по категориям
    categoryStats: (state) => {
      const stats = new Map<
        string,
        { total: number; active: number; completed: number }
      >()

      state.categories.forEach((category) => {
        const tasks = state.tasks.filter(
          (task) => task.category === category.id
        )
        stats.set(category.id, {
          total: tasks.length,
          active: tasks.filter((t) => t.status === 'active').length,
          completed: tasks.filter((t) => t.status === 'completed').length,
        })
      })

      return stats
    },
  },

  actions: {
    // Инициализация из localStorage
    initialize() {
      if (process.client) {
        // Загрузка задач
        const savedTasks = localStorage.getItem('taskflow-tasks')
        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks)
            this.tasks = parsed.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              dueAt: task.dueAt ? new Date(task.dueAt) : undefined,
              spentMinutes: task.spentMinutes || 0,
            }))
          } catch (error) {
            console.error('Error loading tasks from localStorage:', error)
          }
        }

        // Загрузка категорий
        const savedCategories = localStorage.getItem('taskflow-categories')
        if (savedCategories) {
          try {
            const parsed = JSON.parse(savedCategories)
            this.categories = parsed
          } catch (error) {
            console.error('Error loading categories from localStorage:', error)
          }
        }

        // Загрузка активного таймера
        const savedTimer = localStorage.getItem('taskflow-active-timer')
        if (savedTimer) {
          try {
            const parsed = JSON.parse(savedTimer)
            if (parsed.taskId && parsed.startTime) {
              const now = new Date()
              const startTime = new Date(parsed.startTime)
              this.activeTimer = {
                taskId: parsed.taskId,
                startTime: startTime,
                elapsedSeconds: Math.floor(
                  (now.getTime() - startTime.getTime()) / 1000
                ),
              }
            }
          } catch (error) {
            console.error('Error loading timer from localStorage:', error)
          }
        }

        // Обновляем счетчики задач в категориях
        this.updateCategoryCounts()
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

        if (this.activeTimer.taskId && this.activeTimer.startTime) {
          localStorage.setItem(
            'taskflow-active-timer',
            JSON.stringify({
              taskId: this.activeTimer.taskId,
              startTime: this.activeTimer.startTime.toISOString(),
            })
          )
        } else {
          localStorage.removeItem('taskflow-active-timer')
        }
      }
    },

    // Обновление счетчиков задач в категориях
    updateCategoryCounts() {
      this.categories.forEach((category) => {
        category.taskCount = this.tasks.filter(
          (task) => task.category === category.id
        ).length
      })
    },

    // Добавление задачи
    addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'spentMinutes'>) {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date(),
        spentMinutes: 0,
      }
      this.tasks.unshift(newTask)
      this.updateCategoryCounts()
      this.saveToLocalStorage()
      return newTask
    },

    // Обновление задачи
    updateTask(id: string, updates: Partial<Task>) {
      const index = this.tasks.findIndex((task) => task.id === id)
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updates }
        this.updateCategoryCounts()
        this.saveToLocalStorage()
      }
    },

    // Удаление задачи
    deleteTask(id: string) {
      this.tasks = this.tasks.filter((task) => task.id !== id)
      this.updateCategoryCounts()
      this.saveToLocalStorage()
    },

    // Переключение статуса задачи
    toggleTaskStatus(id: string) {
      const task = this.tasks.find((t) => t.id === id)
      if (task) {
        task.status = task.status === 'active' ? 'completed' : 'active'
        this.updateCategoryCounts()
        this.saveToLocalStorage()
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

    // Таймер для задачи
    startTimer(taskId: string) {
      // Если уже есть активный таймер, останавливаем его
      if (this.activeTimer.taskId && this.activeTimer.startTime) {
        const elapsedMinutes = Math.floor(this.activeTimer.elapsedSeconds / 60)
        this.addTimeToTask(this.activeTimer.taskId, elapsedMinutes)
      }

      this.activeTimer = {
        taskId,
        startTime: new Date(),
        elapsedSeconds: 0,
      }
      this.saveToLocalStorage()
    },

    stopTimer() {
      if (this.activeTimer.taskId && this.activeTimer.startTime) {
        const elapsedMinutes = Math.floor(this.activeTimer.elapsedSeconds / 60)
        this.addTimeToTask(this.activeTimer.taskId, elapsedMinutes)

        this.activeTimer = {
          taskId: null,
          startTime: null,
          elapsedSeconds: 0,
        }
        this.saveToLocalStorage()
      }
    },

    pauseTimer() {
      if (this.activeTimer.taskId && this.activeTimer.startTime) {
        const now = new Date()
        this.activeTimer.elapsedSeconds += Math.floor(
          (now.getTime() - this.activeTimer.startTime.getTime()) / 1000
        )
        this.activeTimer.startTime = null
        this.saveToLocalStorage()
      }
    },

    resumeTimer() {
      if (this.activeTimer.taskId && !this.activeTimer.startTime) {
        this.activeTimer.startTime = new Date()
        this.saveToLocalStorage()
      }
    },

    // Обновление прошедшего времени (вызывается каждую секунду)
    updateTimer() {
      if (this.activeTimer.taskId && this.activeTimer.startTime) {
        const now = new Date()
        this.activeTimer.elapsedSeconds = Math.floor(
          (now.getTime() - this.activeTimer.startTime.getTime()) / 1000
        )
      }
    },

    // Получение отформатированного времени таймера
    getTimerDisplay() {
      if (!this.activeTimer.taskId) return '00:00'

      const totalSeconds = this.activeTimer.elapsedSeconds
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    },

    // Работа с категориями
    addCategory(category: Omit<Category, 'id' | 'isCustom' | 'taskCount'>) {
      const newCategory: Category = {
        ...category,
        id: uuidv4(),
        isCustom: true,
        taskCount: 0,
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
      // Нельзя удалить системные категории
      const category = this.categories.find((cat) => cat.id === id)
      if (category && category.isCustom) {
        // Переносим задачи в "Без категории"
        this.tasks.forEach((task) => {
          if (task.category === id) {
            task.category = 'uncategorized'
          }
        })

        this.categories = this.categories.filter((cat) => cat.id !== id)
        this.updateCategoryCounts()
        this.saveToLocalStorage()
      }
    },

    // Получение категории по ID
    getCategoryById(id: string): Category | undefined {
      return this.categories.find((cat) => cat.id === id)
    },

    // Фильтрация задач
    getFilteredTasks(filters: {
      category?: string
      priority?: string
      status?: string
      search?: string
    }) {
      let filtered = this.tasks

      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((task) => task.category === filters.category)
      }

      if (filters.priority && filters.priority !== 'all') {
        filtered = filtered.filter((task) => task.priority === filters.priority)
      }

      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((task) => task.status === filters.status)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower) ||
            task.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        )
      }

      return filtered
    },
  },
})
