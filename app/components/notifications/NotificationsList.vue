<template>
  <div class="notifications-list">
    <TransitionGroup name="notification-list" tag="div">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick"
        @remove="removeNotification"
        @markAsRead="markAsRead"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/stores/notifications'

interface Props {
  notifications: Notification[]
}

interface Emits {
  (e: 'click', notification: Notification): void
  (e: 'remove', id: string): void
  (e: 'markAsRead', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleNotificationClick = (notification: Notification) => {
  emit('click', notification)
}

const removeNotification = (id: string) => {
  emit('remove', id)
}

const markAsRead = (id: string) => {
  emit('markAsRead', id)
}
</script>

<style scoped lang="scss">
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

// List animations
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
