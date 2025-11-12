<template>
  <div class="page-content">
    <div class="container">
      <div class="content-card">
        <h2>Все уведомления</h2>
        <p>История всех системных уведомлений</p>

        <div class="notifications-actions">
          <button
            class="action-button"
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
          >
            <Icon name="lucide:check-circle" size="16" />
            Прочитать все
          </button>
          <button
            class="action-button"
            @click="clearAll"
            :disabled="notifications.length === 0"
          >
            <Icon name="lucide:trash-2" size="16" />
            Очистить все
          </button>
        </div>

        <div class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="[notification.type, { unread: !notification.read }]"
          >
            <div class="notification-content">
              <div class="notification-header">
                <div class="notification-icon">
                  <Icon
                    :name="getNotificationIcon(notification.type)"
                    size="18"
                  />
                </div>
                <div class="notification-info">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">
                    {{ notification.message }}
                  </div>
                </div>
                <button
                  class="delete-button"
                  @click="removeNotification(notification.id)"
                >
                  <Icon name="lucide:trash-2" size="14" />
                </button>
              </div>

              <div class="notification-footer">
                <span class="notification-category">{{
                  notification.category
                }}</span>
                <span class="notification-time">{{
                  formatTime(notification.timestamp)
                }}</span>
              </div>
            </div>
          </div>

          <div v-if="notifications.length === 0" class="empty-state">
            <Icon name="lucide:bell-off" size="48" />
            <p>Нет уведомлений</p>
            <span>Все уведомления будут отображаться здесь</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id)
}

const clearAll = () => {
  notificationsStore.clearAll()
}

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped lang="scss">
.page-content {
  padding: var(--space-4);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  @include card;
  padding: var(--space-6);
}

.notifications-actions {
  display: flex;
  gap: var(--space-3);
  margin: var(--space-5) 0;
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover:not(:disabled) {
    background: var(--accent-primary);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-item {
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  border-left: 4px solid transparent;
  transition: all var(--duration-base);

  &.unread {
    border-left-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
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

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.notification-icon {
  @include flex-center;
  margin-top: 2px;
  flex-shrink: 0;
}

.notification-info {
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
  line-height: var(--leading-relaxed);
}

.delete-button {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: var(--error);
  color: white;
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.1);
  }
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
}

.notification-category {
  color: var(--accent-primary);
  background: rgba(93, 95, 239, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.notification-time {
  color: var(--text-muted);
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
