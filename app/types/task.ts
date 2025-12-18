// Интерфейсы для системы задач
export interface TaskTag {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface TaskCategory {
  id: string
  name: string
  color: string
  icon?: string
  createdAt: Date
}

export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskSession {
  id: string
  taskId: string
  startTime: Date
  endTime: Date | null
  duration: number // в миллисекундах
}

export interface Task {
  id: string
  title: string
  description: string
  categoryId: string
  tags: string[] // массив ID тегов
  priority: TaskPriority
  estimatedTime: number | null // в минутах
  totalTime: number // в миллисекундах (сумма всех сессий)
  sessions: TaskSession[]
  completed: boolean
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
}

export interface TaskCreateData {
  title: string
  description: string
  categoryId: string
  tags: string[]
  priority: TaskPriority
  estimatedTime: number | null
}

export interface TaskUpdateData {
  title?: string
  description?: string
  categoryId?: string
  tags?: string[]
  priority?: TaskPriority
  estimatedTime?: number | null
  completed?: boolean
}

export interface TaskFilter {
  categoryId?: string
  tagIds?: string[]
  priority?: TaskPriority
  completed?: boolean
  search?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface TaskSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'totalTime' | 'title'
  direction: 'asc' | 'desc'
}
