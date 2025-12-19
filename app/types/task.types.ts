import type { TimeSession } from './time.types'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'active' | 'completed'

export interface Task {
  id: string
  title: string
  description?: string
  categoryId?: string
  tagIds: string[]
  priority: TaskPriority
  estimatedTime?: number // minutes
  sessions: TimeSession[]
  status: TaskStatus
  createdAt: number
  completedAt?: number
}
