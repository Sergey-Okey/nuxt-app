<template>
  <div v-if="isOpen" class="notifications-modal">
    <!-- Backdrop -->
    <div class="modal-backdrop" @click="closeModal"></div>

    <!-- Modal Content -->
    <div class="modal-container">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <h2 class="modal-title">Уведомления</h2>
            <div class="header-actions">
              <button
                v-if="unreadCount > 0"
                class="action-btn mark-read-btn"
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

          <div v-if="unreadCount > 0" class="unread-indicator">
            <span class="unread-count">{{ unreadCount }}</span>
            <span class="unread-text">непрочитанных</span>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="notifications-container">
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
              <Icon name="lucide:bell" size="48" />
            </div>
            <h3>Нет уведомлений</h3>
            <p>Здесь появятся важные уведомления о вашей продуктивности</p>
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
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
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
  max-width: 600px;
  max-height: 80vh;
  animation: modalSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
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
  background: rgba(31, 31, 31, 0.9);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.modal-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--text-primary) 0%,
    var(--accent-primary) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-btn {
  @include button-reset;
  @include flex-center;
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.mark-read-btn {
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
    font-size: var(--text-sm);

    &:hover {
      background: var(--accent-primary);
      color: white;
      transform: translateY(-1px);
    }
  }

  &.close-btn {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: var(--error);
      color: white;
    }
  }
}

.unread-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(93, 95, 239, 0.1);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.unread-count {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
}

.unread-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.notifications-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-16) var(--space-6);
  color: var(--text-secondary);

  .empty-icon {
    margin-bottom: var(--space-4);
    opacity: 0.3;
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
    opacity: 0.7;
  }
}

// Light theme support
[data-theme='light'] {
  .modal-content {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    background: rgba(0, 0, 0, 0.02);
  }

  .action-btn.close-btn {
    background: rgba(0, 0, 0, 0.05);
  }

  .notification-item {
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &.unread {
      background: rgba(93, 95, 239, 0.05);
    }

    &.read {
      background: rgba(0, 0, 0, 0.02);
    }
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
  }

  .modal-content {
    border-radius: 0;
  }

  .modal-header {
    padding: var(--space-5);
  }

  .notifications-list {
    padding: var(--space-3);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
