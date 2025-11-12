<template>
  <div class="notifications-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h3>Уведомления</h3>
        <div class="header-actions">
          <button
            v-if="unreadCount > 0"
            class="action-button"
            @click="markAllAsRead"
          >
            Прочитать все
          </button>
          <button class="close-button" @click="$emit('close')">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>
      </div>

      <div class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="[notification.type, { unread: !notification.read }]"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-icon">
            <Icon :name="getNotificationIcon(notification.type)" size="18" />
          </div>

          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-meta">
              <span class="notification-time">{{
                formatTime(notification.timestamp)
              }}</span>
              <span class="notification-category">{{
                notification.category
              }}</span>
            </div>
          </div>

          <div class="notification-actions">
            <button
              class="action-button"
              @click.stop="removeNotification(notification.id)"
            >
              <Icon name="lucide:x" size="14" />
            </button>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="empty-state">
          <Icon name="lucide:bell-off" size="48" />
          <p>Нет уведомлений</p>
          <span>Здесь будут появляться важные уведомления</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: string
  read: boolean
  timestamp: Date
}

// Props & Emits
defineEmits<{
  close: []
}>()

// Store
const notificationsStore = useNotificationsStore()

// Computed
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

// Methods
const getNotificationIcon = (type: string) => {
  const icons = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:alert-octagon',
  }
  return icons[type as keyof typeof icons] || 'lucide:bell'
}

const markAsRead = (id: string) => {
  notificationsStore.markAsRead(id)
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id)
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}д назад`
  if (hours > 0) return `${hours}ч назад`
  if (minutes > 0) return `${minutes}м назад`
  return 'Только что'
}
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
  align-items: flex-start;
  justify-content: flex-end;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--card-bg);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 400px;
  height: 100vh;
  box-shadow: var(--shadow-xl);
  animation: slideInRight 0.3s ease-out;

  @include breakpoint(sm) {
    width: 400px;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0;
    font-size: var(--text-xl);
    color: var(--text-primary);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-button {
  @include button-reset;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--error);
    color: white;
  }
}

.notifications-list {
  height: calc(100vh - 80px);
  overflow-y: auto;
  padding: var(--space-1);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: all var(--duration-base);
  border: 1px solid transparent;

  &:hover {
    background: var(--surface-bg);
    border-color: rgba(255, 255, 255, 0.05);
  }

  &.unread {
    background: rgba(93, 95, 239, 0.05);
    border-left: 3px solid var(--accent-primary);
  }

  // Type styles
  &.info {
    .notification-icon {
      color: var(--accent-primary);
    }
  }

  &.success {
    .notification-icon {
      color: var(--success);
    }
  }

  &.warning {
    .notification-icon {
      color: var(--warning);
    }
  }

  &.error {
    .notification-icon {
      color: var(--error);
    }
  }
}

.notification-icon {
  @include flex-center;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  font-size: var(--text-sm);
}

.notification-message {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
}

.notification-time {
  color: var(--text-muted);
}

.notification-category {
  color: var(--accent-primary);
  background: rgba(93, 95, 239, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.notification-actions {
  flex-shrink: 0;
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--text-secondary);

  :deep(svg) {
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  p {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    margin-bottom: var(--space-2);
    color: var(--text-primary);
  }

  span {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
  }
}
</style>
