<template>
  <div class="notifications-list">
    <TransitionGroup name="notification-list" tag="div">
      <NotificationItem
        v-for="notification in sortedNotifications"
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick"
        @remove="removeNotification"
      />
    </TransitionGroup>

    <div v-if="notifications.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon name="lucide:bell-off" size="48" />
      </div>
      <h3>Нет уведомлений</h3>
      <p>Здесь появятся важные уведомления и напоминания</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/stores/notifications'

interface Props {
  notifications: Notification[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [notification: Notification]
  remove: [id: string]
}>()

const notificationsStore = useNotificationsStore()

// Sort notifications by date (newest first)
const sortedNotifications = computed(() => {
  return [...props.notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

const handleNotificationClick = (notification: Notification) => {
  emit('click', notification)
}

const removeNotification = (id: string) => {
  emit('remove', id)
}
</script>

<style scoped lang="scss">
.notifications-list {
  position: relative;
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--text-secondary);
}

.empty-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--text-secondary);
    opacity: 0.5;
  }
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin: 0;
  color: var(--text-secondary);
}

// List animations
.notification-list-move,
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.notification-list-leave-active {
  position: absolute;
  width: 100%;
}

// Light theme
[data-theme='light'] {
  .empty-icon {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
