<template>
  <div v-if="isOpen" class="notifications-modal">
    <!-- Backdrop -->
    <div class="modal-backdrop" @click="closeModal"></div>

    <!-- Modal Content -->
    <div class="modal-container">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-main">
            <h2 class="modal-title">Уведомления</h2>
            <div v-if="unreadCount > 0" class="unread-badge">
              {{ unreadCount }} непрочитанных
            </div>
          </div>

          <div class="header-actions">
            <button
              v-if="unreadCount > 0"
              class="action-btn mark-all-read"
              @click="markAllAsRead"
            >
              <Icon name="lucide:check-circle" size="16" />
              Прочитать все
            </button>

            <button class="action-btn close-btn" @click="closeModal">
              <Icon name="lucide:x" size="20" />
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="notifications-section">
          <div class="section-header">
            <h3>Последние уведомления</h3>
            <button
              v-if="notifications.length > 0"
              class="clear-all-btn"
              @click="clearAllNotifications"
            >
              Очистить все
            </button>
          </div>

          <div class="notifications-list" ref="listRef">
            <NotificationItem
              v-for="notification in sortedNotifications"
              :key="notification.id"
              :notification="notification"
              @click="handleNotificationClick"
              @remove="removeNotification"
            />
          </div>

          <!-- Empty State -->
          <div v-if="notifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <Icon name="lucide:bell-off" size="48" />
            </div>
            <h3>Нет уведомлений</h3>
            <p>
              Здесь будут появляться важные уведомления о вашей продуктивности
            </p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <div class="actions-grid">
            <button class="action-card" @click="addTestNotification('success')">
              <Icon name="lucide:check-circle" size="20" />
              <span>Тест успеха</span>
            </button>
            <button class="action-card" @click="addTestNotification('warning')">
              <Icon name="lucide:alert-triangle" size="20" />
              <span>Тест предупреждения</span>
            </button>
            <button class="action-card" @click="addTestNotification('info')">
              <Icon name="lucide:info" size="20" />
              <span>Тест информации</span>
            </button>
            <button class="action-card" @click="addTestNotification('error')">
              <Icon name="lucide:alert-octagon" size="20" />
              <span>Тест ошибки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Components
import NotificationItem from './NotificationItem.vue'

// Store
const notificationsStore = useNotificationsStore()
const {
  isModalOpen: isOpen,
  sortedNotifications,
  unreadCount,
} = storeToRefs(notificationsStore)

// Refs
const listRef = ref<HTMLElement>()

// Computed
const notifications = computed(() => notificationsStore.notifications)

// Methods
const closeModal = () => {
  notificationsStore.closeModal()
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id)
}

const clearAllNotifications = () => {
  if (confirm('Вы уверены, что хотите удалить все уведомления?')) {
    notificationsStore.clearAll()
  }
}

const handleNotificationClick = (notification: any) => {
  // Handle different action types
  switch (notification.actionType) {
    case 'navigate':
      if (notification.actionUrl) {
        const router = useRouter()
        router.push(notification.actionUrl)
        closeModal()
      }
      break

    case 'open_modal':
      // Здесь можно открыть специфическую модалку
      console.log('Open modal for:', notification.id)
      break

    case 'dismiss':
      // Просто закрываем уведомление
      removeNotification(notification.id)
      break

    default:
      // Для уведомлений без actionType просто закрываем модалку
      closeModal()
  }
}

const addTestNotification = (
  type: 'info' | 'success' | 'warning' | 'error'
) => {
  const messages = {
    info: {
      title: 'Информационное уведомление',
      message: 'Это тестовое информационное уведомление',
    },
    success: {
      title: 'Успешное выполнение!',
      message: 'Задача была успешно завершена',
    },
    warning: {
      title: 'Внимание требуется',
      message: 'Пожалуйста, проверьте этот элемент',
    },
    error: {
      title: 'Произошла ошибка',
      message: 'Что-то пошло не так, проверьте настройки',
    },
  }

  notificationsStore.addNotification({
    ...messages[type],
    type,
    category: 'system',
    read: false,
    actionUrl: '/',
    actionType: 'navigate',
  })
}

// Close on escape key
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped lang="scss">
.notifications-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  background: var(--card-bg);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--surface-bg);
}

.header-main {
  .modal-title {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin-bottom: var(--space-1);
  }

  .unread-badge {
    font-size: var(--text-sm);
    color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    font-weight: var(--font-medium);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-btn {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.mark-all-read {
    background: var(--surface-bg);
    color: var(--text-secondary);

    &:hover {
      background: var(--accent-primary);
      color: white;
    }
  }

  &.close-btn {
    width: 36px;
    height: 36px;
    background: var(--surface-bg);
    color: var(--text-secondary);

    &:hover {
      background: var(--error);
      color: white;
    }
  }
}

.notifications-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5) var(--space-3);

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.clear-all-btn {
  @include button-reset;
  font-size: var(--text-sm);
  color: var(--error);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
  }
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-5) var(--space-4);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--surface-bg);
    border-radius: var(--radius-full);

    &:hover {
      background: var(--text-muted);
    }
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--text-secondary);

  .empty-icon {
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    margin: 0;
    max-width: 280px;
  }
}

.quick-actions {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--surface-bg);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

.action-card {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--card-bg);
  border-radius: var(--radius-card);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: translateY(-1px);
  }
}

// Mobile optimizations
@media (max-width: 640px) {
  .notifications-modal {
    padding: 0;
  }

  .modal-container {
    max-width: none;
    max-height: none;
    height: 100vh;
    border-radius: 0;
  }

  .modal-content {
    border-radius: 0;
  }

  .modal-header,
  .section-header,
  .notifications-list,
  .quick-actions {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
