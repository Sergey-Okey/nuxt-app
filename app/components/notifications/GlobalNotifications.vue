<template>
  <div class="notifications-container">
    <transition-group name="notification-slide">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="notification.type"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <Icon :name="notification.icon" size="20" />
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
        </div>
        <button
          class="notification-close"
          @click.stop="removeNotification(notification.id)"
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  icon: string
  duration?: number
}

const notifications = ref<Notification[]>([])

const showNotification = (notification: Omit<Notification, 'id'>) => {
  const id = Date.now().toString()
  const newNotification = { ...notification, id }

  notifications.value.push(newNotification)

  // Автоматическое удаление
  if (notification.duration) {
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration)
  }

  return id
}

const removeNotification = (id: string) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

// Предоставляем функции для использования в других компонентах
provide('notifications', {
  showNotification,
  removeNotification,
})
</script>

<style scoped lang="scss">
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 350px;
  pointer-events: none;
}

.notification {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--card-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    transform: translateX(-4px);
    box-shadow: var(--shadow-xl);
  }

  &.info {
    border-left: 3px solid var(--accent-primary);
  }

  &.success {
    border-left: 3px solid var(--success);
  }

  &.warning {
    border-left: 3px solid var(--warning);
  }

  &.error {
    border-left: 3px solid var(--error);
  }
}

.notification-icon {
  @include flex-center;
  flex-shrink: 0;

  .info & {
    color: var(--accent-primary);
  }
  .success & {
    color: var(--success);
  }
  .warning & {
    color: var(--warning);
  }
  .error & {
    color: var(--error);
  }
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
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
}

.notification-close {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
  opacity: 0.7;
  transition: all var(--duration-base);

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
}

// Анимации
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s ease;
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
