import { defineStore } from 'pinia'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: string
  read: boolean
  timestamp: Date
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([
    {
      id: '1',
      title: 'Добро пожаловать в TaskFlow!',
      message: 'Начните управлять своими задачами эффективно',
      type: 'info',
      category: 'system',
      read: false,
      timestamp: new Date(),
    },
    {
      id: '2',
      title: 'Время для фокус-сессии',
      message: 'Вы давно не использовали таймер Pomodoro',
      type: 'warning',
      category: 'productivity',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '3',
      title: 'Задача выполнена!',
      message: 'Задача "Прототип интерфейса" завершена',
      type: 'success',
      category: 'tasks',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  ])

  // Getters
  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length
  )

  // Actions
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    notifications.value.unshift(newNotification)
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((n) => (n.read = true))
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const clearAll = () => {
    notifications.value = []
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  }
})
