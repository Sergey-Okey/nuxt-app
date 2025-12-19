import type { Task } from '~/types/task.types'

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Дизайн главного экрана',
    description: 'Продумать композицию и иерархию',
    categoryId: 'work',
    tagIds: ['ui', 'ux'],
    priority: 'high',
    estimatedTime: 120,
    sessions: [
      {
        start: Date.now() - 1000 * 60 * 40,
        end: Date.now(),
        duration: 1000 * 60 * 40,
      },
    ],
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: '2',
    title: 'Прочитать документацию Nuxt',
    categoryId: 'study',
    tagIds: ['nuxt'],
    priority: 'medium',
    estimatedTime: 60,
    sessions: [],
    status: 'active',
    createdAt: Date.now(),
  },
]
