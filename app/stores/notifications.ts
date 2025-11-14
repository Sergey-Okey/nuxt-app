import { defineStore } from 'pinia'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: string
  read: boolean
  timestamp: Date
  actionUrl?: string
  actionType?: 'navigate' | 'open_modal' | 'dismiss'
}

interface NotificationsState {
  notifications: Notification[]
  isModalOpen: boolean
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: [
      {
        id: '1',
        title: 'Добро пожаловать в TaskFlow',
        message: 'Начните управлять своими задачами эффективно',
        type: 'info',
        category: 'system',
        read: false,
        timestamp: new Date(),
        actionUrl: '/',
        actionType: 'navigate',
      },
      {
        id: '2',
        title: 'Время для фокус-сессии',
        message: 'Вы давно не использовали таймер Pomodoro',
        type: 'warning',
        category: 'productivity',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        actionUrl: '/timer',
        actionType: 'navigate',
      },
      {
        id: '3',
        title: 'Задача выполнена',
        message: 'Задача "Прототип интерфейса" завершена',
        type: 'success',
        category: 'tasks',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        actionUrl: '/tasks',
        actionType: 'navigate',
      },
    ],
    isModalOpen: false,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.read).length,
    sortedNotifications: (state) =>
      [...state.notifications].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
  },

  actions: {
    openModal() {
      this.isModalOpen = true
    },

    closeModal() {
      this.isModalOpen = false
    },

    addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      }
      this.notifications.unshift(newNotification)
    },

    markAsRead(id: string) {
      const notification = this.notifications.find((n) => n.id === id)
      if (notification) {
        notification.read = true
      }
    },

    markAllAsRead() {
      this.notifications.forEach((n) => (n.read = true))
    },

    removeNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },

    clearAll() {
      this.notifications = []
    },
  },
})
