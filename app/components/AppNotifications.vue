<template>
  <div class="notifications-popover">
    <div class="popover-content">
      <div class="notifications-header">
        <h3>Уведомления</h3>
        <button class="clear-button" @click="markAllAsRead" v-if="unreadCount">
          Прочитать все
        </button>
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
            <Icon :name="getIcon(notification.type)" size="16" />
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">
              {{ formatTime(notification.timestamp) }}
            </div>
          </div>
          <button
            class="notification-close"
            @click.stop="removeNotification(notification.id)"
          >
            <Icon name="lucide:x" size="14" />
          </button>
        </div>

        <div v-if="notifications.length === 0" class="empty-state">
          <Icon name="lucide:bell-off" size="32" />
          <p>Нет уведомлений</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/stores/notifications'

const notificationsStore = useNotificationsStore()

const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'lucide:check-circle'
    case 'warning':
      return 'lucide:alert-triangle'
    case 'error':
      return 'lucide:alert-circle'
    default:
      return 'lucide:info'
  }
}

const markAsRead = (id: string) => {
  notificationsStore.markAsRead(id)
}

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id)
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days} д. назад`
  if (hours > 0) return `${hours} ч. назад`
  if (minutes > 0) return `${minutes} мин. назад`
  return 'Только что'
}

defineEmits<{
  close: []
}>()
</script>

<style scoped lang="scss">
.notifications-popover {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
  width: 320px;
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  z-index: var(--z-popover);
}

.popover-content {
  display: flex;
  flex-direction: column;
  max-height: 400px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--text-primary);
  }
}

.clear-button {
  @include button-reset;
  font-size: var(--text-sm);
  color: var(--accent-primary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    opacity: 0.8;
  }
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--surface-bg);
  }

  &.unread {
    background: rgba(93, 95, 239, 0.05);

    &:hover {
      background: rgba(93, 95, 239, 0.1);
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

  &.info {
    .notification-icon {
      color: var(--accent-primary);
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
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.notification-close {
  @include button-reset;
  @include flex-center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-8);
  color: var(--text-secondary);

  :deep(svg) {
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: var(--text-sm);
  }
}
</style>
