<template>
  <div
    ref="containerRef"
    class="notification-item"
    :class="{ read: notification.read, unread: !notification.read }"
  >
    <div
      ref="contentRef"
      class="notification-content"
      :style="contentStyle"
      @click="handleClick"
    >
      <div class="notification-icon">
        <Icon :name="notificationIcon" size="18" />
      </div>

      <div class="notification-body">
        <div class="notification-title">{{ notification.title }}</div>
        <div class="notification-message">{{ notification.message }}</div>
        <div class="notification-meta">
          <span class="notification-time">{{ formattedTime }}</span>
          <span class="notification-category">{{ categoryLabel }}</span>
        </div>
      </div>

      <button class="delete-button" @click.stop="handleDelete">
        <Icon name="lucide:x" size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGesture } from '@vueuse/gesture'

interface Notification {
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

interface Props {
  notification: Notification
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [notification: Notification]
  remove: [id: string]
}>()

// Refs
const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const swipeOffset = ref(0)

// Computed
const notificationIcon = computed(() => {
  const icons = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:alert-octagon',
  }
  return icons[props.notification.type]
})

const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    system: 'Система',
    tasks: 'Задачи',
    productivity: 'Продуктивность',
    analytics: 'Аналитика',
    health: 'Здоровье',
  }
  return labels[props.notification.category] || props.notification.category
})

const formattedTime = computed(() => {
  const now = new Date()
  const diff = now.getTime() - props.notification.timestamp.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}д назад`
  if (hours > 0) return `${hours}ч назад`
  if (minutes > 0) return `${minutes}м назад`
  return 'Только что'
})

const contentStyle = computed(() => ({
  transform: `translateX(${swipeOffset.value}px)`,
  opacity: Math.max(1 - Math.abs(swipeOffset.value) / 200, 0),
}))

// Gesture Handling
useGesture(
  {
    onDrag: ({ movement: [mx], last, intentional }) => {
      if (!intentional) return

      // Only allow left swiping
      if (mx < 0) {
        swipeOffset.value = Math.max(mx, -120)

        if (last && mx < -80) {
          handleDelete()
        } else if (last) {
          swipeOffset.value = 0
        }
      }
    },
  },
  {
    target: contentRef,
    drag: {
      axis: 'x',
      filterTaps: true,
      pointer: { touch: true },
    },
  }
)

// Methods
const handleClick = () => {
  if (Math.abs(swipeOffset.value) > 10) {
    swipeOffset.value = 0
    return
  }

  if (!props.notification.read) {
    useNotificationsStore().markAsRead(props.notification.id)
  }

  emit('click', props.notification)
}

const handleDelete = () => {
  emit('remove', props.notification.id)
}
</script>

<style scoped lang="scss">
.notification-item {
  margin-bottom: var(--space-3);
  border-radius: var(--radius-card);
  overflow: hidden;

  &.read {
    opacity: 0.6;
  }

  &.unread {
    opacity: 1;
  }
}

.notification-content {
  @include glass;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);
  cursor: pointer;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.notification-icon {
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
}

.notification-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
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
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.delete-button {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-muted);
  transition: all var(--duration-base);
  flex-shrink: 0;
  opacity: 0;

  .notification-content:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

// Mobile optimizations
@media (max-width: 640px) {
  .notification-content {
    padding: var(--space-3);
    @include glass;
  }

  .delete-button {
    opacity: 1;
  }
}
</style>
