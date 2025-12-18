import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { useLocalStorage } from '@vueuse/core'
import type {
  Task,
  TaskCreateData,
  TaskUpdateData,
  TaskFilter,
  TaskSort,
  TaskCategory,
  TaskTag,
} from '@/types/task'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: useLocalStorage<Task[]>('productivity-glass-tasks', []),
    categories: useLocalStorage<TaskCategory[]>(
      'productivity-glass-categories',
      [
        {
          id: 'work',
          name: 'Работа',
          color: '#3498db',
          createdAt: new Date(),
        },
        {
          id: 'study',
          name: 'Учеба',
          color: '#9b59b6',
          createdAt: new Date(),
        },
        {
          id: 'personal',
          name: 'Личное',
          color: '#1abc9c',
          createdAt: new Date(),
        },
        {
          id: 'health',
          name: 'Здоровье',
          color: '#e74c3c',
          createdAt: new Date(),
        },
      ]
    ),
    tags: useLocalStorage<TaskTag[]>('productivity-glass-tags', []),
    activeFilters: {} as TaskFilter,
    sortBy: { field: 'createdAt', direction: 'desc' } as TaskSort,
  }),

  getters: {
    // Получение задачи по ID
    getTaskById: (state) => (id: string) => {
      return state.tasks.find((task) => task.id === id)
    },

    // Получение категории по ID
    getCategoryById: (state) => (id: string) => {
      return state.categories.find((category) => category.id === id)
    },

    // Получение тега по ID
    getTagById: (state) => (id: string) => {
      return state.tags.find((tag) => tag.id === id)
    },

    // Фильтрация и сортировка задач
    filteredTasks: (state) => {
      let tasks = [...state.tasks]

      // Применение фильтров
      if (state.activeFilters.categoryId) {
        tasks = tasks.filter(
          (task) => task.categoryId === state.activeFilters.categoryId
        )
      }

      if (state.activeFilters.tagIds && state.activeFilters.tagIds.length > 0) {
        tasks = tasks.filter((task) =>
          task.tags.some((tagId) => state.activeFilters.tagIds?.includes(tagId))
        )
      }

      if (state.activeFilters.priority) {
        tasks = tasks.filter(
          (task) => task.priority === state.activeFilters.priority
        )
      }

      if (typeof state.activeFilters.completed === 'boolean') {
        tasks = tasks.filter(
          (task) => task.completed === state.activeFilters.completed
        )
      }

      if (state.activeFilters.search) {
        const searchLower = state.activeFilters.search.toLowerCase()
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
        )
      }

      if (state.activeFilters.dateRange) {
        const { start, end } = state.activeFilters.dateRange
        tasks = tasks.filter((task) => {
          const taskDate = new Date(task.createdAt)
          return taskDate >= start && taskDate <= end
        })
      }

      // Применение сортировки
      tasks.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (state.sortBy.field) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          case 'updatedAt':
            aValue = new Date(a.updatedAt).getTime()
            bValue = new Date(b.updatedAt).getTime()
            break
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            aValue = priorityOrder[a.priority]
            bValue = priorityOrder[b.priority]
            break
          case 'totalTime':
            aValue = a.totalTime
            bValue = b.totalTime
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          default:
            return 0
        }

        if (state.sortBy.direction === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })

      return tasks
    },

    // Статистика по задачам
    tasksStats: (state) => {
      const total = state.tasks.length
      const completed = state.tasks.filter((task) => task.completed).length
      const active = total - completed
      const totalTime = state.tasks.reduce(
        (sum, task) => sum + task.totalTime,
        0
      )

      return {
        total,
        completed,
        active,
        totalTime,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
      }
    },

    // Задачи по категориям
    tasksByCategory: (state) => {
      const result: Record<string, Task[]> = {}

      state.categories.forEach((category) => {
        result[category.id] = state.tasks.filter(
          (task) => task.categoryId === category.id
        )
      })

      return result
    },
  },

  actions: {
    // Создание задачи
    createTask(data: TaskCreateData): string {
      const taskId = uuidv4()
      const now = new Date()

      const newTask: Task = {
        id: taskId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        priority: data.priority,
        estimatedTime: data.estimatedTime,
        totalTime: 0,
        sessions: [],
        completed: false,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      }

      this.tasks.push(newTask)
      return taskId
    },

    // Обновление задачи
    updateTask(id: string, data: TaskUpdateData): boolean {
      const taskIndex = this.tasks.findIndex((task) => task.id === id)

      if (taskIndex === -1) return false

      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...data,
        updatedAt: new Date(),
        completedAt: data.completed
          ? new Date()
          : this.tasks[taskIndex].completedAt,
      }

      return true
    },

    // Удаление задачи
    deleteTask(id: string): boolean {
      const taskIndex = this.tasks.findIndex((task) => task.id === id)

      if (taskIndex === -1) return false

      this.tasks.splice(taskIndex, 1)
      return true
    },

    // Добавление сессии к задаче
    addTaskSession(
      taskId: string,
      sessionId: string,
      startTime: Date,
      endTime: Date | null,
      duration: number
    ): boolean {
      const task = this.getTaskById(taskId)
      if (!task) return false

      const session = {
        id: sessionId,
        taskId,
        startTime,
        endTime,
        duration,
      }

      task.sessions.push(session)
      task.totalTime += duration
      task.updatedAt = new Date()

      return true
    },

    // Создание категории
    createCategory(name: string, color: string, icon?: string): string {
      const categoryId = uuidv4()
      const now = new Date()

      const newCategory: TaskCategory = {
        id: categoryId,
        name,
        color,
        icon,
        createdAt: now,
      }

      this.categories.push(newCategory)
      return categoryId
    },

    // Обновление категории
    updateCategory(id: string, updates: Partial<TaskCategory>): boolean {
      const categoryIndex = this.categories.findIndex((cat) => cat.id === id)

      if (categoryIndex === -1) return false

      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        ...updates,
      }

      // Обновить задачи с этой категорией, если изменилось имя
      if (updates.name) {
        this.tasks.forEach((task) => {
          if (task.categoryId === id) {
            // Можно обновить связанные данные, если нужно
          }
        })
      }

      return true
    },

    // Удаление категории
    deleteCategory(id: string): boolean {
      // Проверить, есть ли задачи с этой категорией
      const hasTasks = this.tasks.some((task) => task.categoryId === id)
      if (hasTasks) return false

      const categoryIndex = this.categories.findIndex((cat) => cat.id === id)
      if (categoryIndex === -1) return false

      this.categories.splice(categoryIndex, 1)
      return true
    },

    // Создание тега
    createTag(name: string, color: string): string {
      const tagId = uuidv4()
      const now = new Date()

      const newTag: TaskTag = {
        id: tagId,
        name,
        color,
        createdAt: now,
      }

      this.tags.push(newTag)
      return tagId
    },

    // Обновление тега
    updateTag(id: string, updates: Partial<TaskTag>): boolean {
      const tagIndex = this.tags.findIndex((tag) => tag.id === id)

      if (tagIndex === -1) return false

      this.tags[tagIndex] = {
        ...this.tags[tagIndex],
        ...updates,
      }

      return true
    },

    // Удаление тега
    deleteTag(id: string): boolean {
      // Удалить тег из всех задач
      this.tasks.forEach((task) => {
        const tagIndex = task.tags.indexOf(id)
        if (tagIndex > -1) {
          task.tags.splice(tagIndex, 1)
        }
      })

      // Удалить сам тег
      const tagIndex = this.tags.findIndex((tag) => tag.id === id)
      if (tagIndex === -1) return false

      this.tags.splice(tagIndex, 1)
      return true
    },

    // Установка фильтров
    setFilters(filters: TaskFilter): void {
      this.activeFilters = { ...this.activeFilters, ...filters }
    },

    // Сброс фильтров
    resetFilters(): void {
      this.activeFilters = {}
    },

    // Установка сортировки
    setSort(sort: TaskSort): void {
      this.sortBy = sort
    },

    // Экспорт данных в JSON
    exportData(): string {
      const data = {
        tasks: this.tasks,
        categories: this.categories,
        tags: this.tags,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }

      return JSON.stringify(data, null, 2)
    },

    // Импорт данных из JSON
    importData(jsonData: string): boolean {
      try {
        const data = JSON.parse(jsonData)

        // Валидация данных
        if (!data.tasks || !data.categories || !data.tags) {
          throw new Error('Invalid data format')
        }

        this.tasks = data.tasks
        this.categories = data.categories
        this.tags = data.tags

        return true
      } catch (error) {
        console.error('Failed to import data:', error)
        return false
      }
    },
  },
})
