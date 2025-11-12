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
        title: 'Добро пожаловать в TaskFlow! 🎉',
        message:
          'Начните управлять своими задачами эффективно. Создайте первую задачу или настройте профиль.',
        type: 'info',
        category: 'system',
        read: false,
        timestamp: new Date(),
        actionUrl: '/onboarding',
        actionType: 'navigate',
      },
      {
        id: '2',
        title: 'Время для фокус-сессии 🎯',
        message:
          'Вы давно не использовали таймер Pomodoro. Начните сессию для повышения продуктивности.',
        type: 'warning',
        category: 'productivity',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        actionUrl: '/timer',
        actionType: 'navigate',
      },
      {
        id: '3',
        title: 'Задача выполнена! ✅',
        message:
          'Задача "Прототип интерфейса" успешно завершена. Перейдите к следующим задачам.',
        type: 'success',
        category: 'tasks',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        actionUrl: '/tasks',
        actionType: 'navigate',
      },
      {
        id: '4',
        title: 'Новый рекорд продуктивности 📈',
        message:
          'Вы достигли 85% продуктивности на этой неделе! Посмотрите подробную статистику.',
        type: 'success',
        category: 'analytics',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        actionUrl: '/analytics',
        actionType: 'navigate',
      },
      {
        id: '5',
        title: 'Напоминание о перерыве ☕',
        message:
          'Вы работаете уже 2 часа без перерыва. Рекомендуем сделать 5-минутный перерыв.',
        type: 'info',
        category: 'health',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        actionType: 'dismiss', // Просто закрывается без перехода
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

    // Специальные методы для разных типов уведомлений
    addTaskCompletedNotification(taskTitle: string) {
      this.addNotification({
        title: 'Задача выполнена! ✅',
        message: `Задача "${taskTitle}" успешно завершена.`,
        type: 'success',
        category: 'tasks',
        read: false,
        actionUrl: '/tasks',
        actionType: 'navigate',
      })
    },

    addFocusTimeNotification(minutes: number) {
      this.addNotification({
        title: 'Фокус-сессия завершена 🎯',
        message: `Вы сфокусировались ${minutes} минут. Отличная работа!`,
        type: 'success',
        category: 'productivity',
        read: false,
        actionUrl: '/analytics',
        actionType: 'navigate',
      })
    },

    addBreakReminderNotification() {
      this.addNotification({
        title: 'Время для перерыва ☕',
        message:
          'Вы работаете долгое время. Сделайте перерыв для поддержания продуктивности.',
        type: 'warning',
        category: 'health',
        read: false,
        actionType: 'dismiss',
      })
    },

    addDailySummaryNotification(completedTasks: number, focusTime: string) {
      this.addNotification({
        title: 'Итоги дня 📊',
        message: `Сегодня вы выполнили ${completedTasks} задач и сфокусировались ${focusTime}.`,
        type: 'info',
        category: 'analytics',
        read: false,
        actionUrl: '/analytics',
        actionType: 'navigate',
      })
    },

    // For demo purposes - add sample notifications
    addSampleNotification() {
      const types: Notification['type'][] = [
        'info',
        'success',
        'warning',
        'error',
      ]
      const categories = [
        'system',
        'tasks',
        'productivity',
        'analytics',
        'health',
      ]
      const actions: Notification['actionType'][] = ['navigate', 'dismiss']

      const randomType = types[Math.floor(Math.random() * types.length)]
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)]
      const randomAction = actions[Math.floor(Math.random() * actions.length)]

      this.addNotification({
        title: 'Тестовое уведомление',
        message: 'Это пример уведомления для демонстрации функциональности',
        type: randomType,
        category: randomCategory,
        read: false,
        actionUrl: randomAction === 'navigate' ? '/' : undefined,
        actionType: randomAction,
      })
    },
  },
})
