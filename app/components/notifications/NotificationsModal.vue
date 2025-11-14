<template>
  <div v-if="isOpen" class="notifications-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Уведомления</h2>
          <div class="header-actions">
            <button
              v-if="unreadCount > 0"
              class="action-button"
              @click="markAllAsRead"
            >
              <Icon name="lucide:check-circle" size="16" />
              Прочитать все
            </button>
            <button class="close-button" @click="closeModal">
              <Icon name="lucide:x" size="20" />
            </button>
          </div>
        </div>

        <div class="notifications-list">
          <NotificationItem
            v-for="notification in sortedNotifications"
            :key="notification.id"
            :notification="notification"
            @click="handleNotificationClick"
            @remove="removeNotification"
          />

          <div v-if="notifications.length === 0" class="empty-state">
            <Icon name="lucide:bell-off" size="32" />
            <h3>Нет уведомлений</h3>
            <p>Здесь появятся важные уведомления</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import NotificationItem from './NotificationItem.vue'

const notificationsStore = useNotificationsStore()
const {
  isModalOpen: isOpen,
  sortedNotifications,
  unreadCount,
} = storeToRefs(notificationsStore)

const notifications = computed(() => notificationsStore.notifications)

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
  if (!notification.read) {
    notificationsStore.markAsRead(notification.id)
  }

  if (notification.actionType === 'navigate' && notification.actionUrl) {
    const router = useRouter()
    router.push(notification.actionUrl)
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
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
  max-width: 480px;
  max-height: 70vh;
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
  @include glass(20px, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
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
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
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
  padding: var(--space-8);
  color: var(--text-secondary);

  :deep(svg) {
    margin-bottom: var(--space-3);
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
    padding: var(--space-4);
  }

  .notifications-list {
    padding: var(--space-3);
  }
}
</style>
