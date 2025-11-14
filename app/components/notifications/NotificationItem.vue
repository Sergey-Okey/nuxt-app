<template>
  <div
    ref="containerRef"
    class="notification-item"
    :class="[
      notification.type,
      { unread: !notification.read, read: notification.read },
    ]"
  >
    <!-- Swipe Delete Area -->
    <div class="swipe-delete-area" :class="{ active: swipeProgress > 0 }">
      <Icon name="lucide:trash-2" size="20" />
    </div>

    <!-- Notification Content -->
    <div
      ref="contentRef"
      class="notification-content"
      :style="contentStyle"
      @click="handleClick"
    >
      <div class="notification-icon" :class="notification.type">
        <Icon :name="notificationIcon" size="18" />
      </div>

      <div class="notification-body">
        <div class="notification-header">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <span class="notification-time">{{ formattedTime }}</span>
        </div>
        <p class="notification-message">{{ notification.message }}</p>
      </div>

      <button class="delete-btn" @click.stop="handleDelete">
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
const swipeProgress = ref(0)
const isSwiping = ref(false)

// Computed
const notificationIcon = computed(() => {
  const icons = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:alert-octagon',
  }
  return icons[props.notification.type] || 'lucide:bell'
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
  transition: isSwiping.value
    ? 'none'
    : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}))

// Gesture Handling
useGesture(
  {
    onDrag: ({ movement: [mx], first, last, intentional }) => {
      if (!intentional) return

      // Only allow left swiping
      if (mx < 0) {
        isSwiping.value = true
        swipeOffset.value = Math.max(mx, -80)
        swipeProgress.value = Math.min(Math.abs(mx) / 80, 1)

        if (last) {
          if (mx < -60) {
            // Swiped enough - trigger delete
            triggerDelete()
          } else {
            // Not enough - reset
            resetSwipe()
          }
        }
      }
    },

    onDragEnd: () => {
      isSwiping.value = false
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
const resetSwipe = () => {
  swipeOffset.value = 0
  swipeProgress.value = 0
}

const triggerDelete = () => {
  emit('remove', props.notification.id)
}

const handleClick = () => {
  if (Math.abs(swipeOffset.value) > 10) {
    resetSwipe()
    return
  }

  // Mark as read if not already
  if (!props.notification.read) {
    useNotificationsStore().markAsRead(props.notification.id)
  }

  emit('click', props.notification)
}

const handleDelete = (event: Event) => {
  event.stopPropagation()
  triggerDelete()
}
</script>

<style scoped lang="scss">
.notification-item {
  position: relative;
  margin-bottom: var(--space-3);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base);

  &.read {
    opacity: 0.7;
    background: rgba(255, 255, 255, 0.03);

    .notification-title,
    .notification-message {
      color: var(--text-secondary);
    }
  }

  &.unread {
    background: rgba(93, 95, 239, 0.08);
    border-left: 3px solid var(--accent-primary);
  }

  // Type-specific borders for unread
  &.success.unread {
    border-left-color: var(--success);
    background: rgba(93, 242, 126, 0.08);
  }

  &.warning.unread {
    border-left-color: var(--warning);
    background: rgba(250, 204, 21, 0.08);
  }

  &.error.unread {
    border-left-color: var(--error);
    background: rgba(248, 113, 113, 0.08);
  }
}

.swipe-delete-area {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80px;
  background: var(--error);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity var(--duration-base);

  &.active {
    opacity: v-bind(swipeProgress);
  }
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: inherit;
  border-radius: inherit;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.notification-icon {
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  margin-top: 2px;

  &.info {
    background: rgba(93, 95, 239, 0.15);
    color: var(--accent-primary);
  }

  &.success {
    background: rgba(93, 242, 126, 0.15);
    color: var(--success);
  }

  &.warning {
    background: rgba(250, 204, 21, 0.15);
    color: var(--warning);
  }

  &.error {
    background: rgba(248, 113, 113, 0.15);
    color: var(--error);
  }
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.notification-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin: 0;
  flex: 1;
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.delete-btn {
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

  .notification-item:hover & {
    opacity: 1;
  }

  &:hover {
    background: var(--error);
    color: white;
  }
}

// Mobile optimizations
@media (max-width: 640px) {
  .notification-content {
    padding: var(--space-3);
  }

  .delete-btn {
    opacity: 1;
  }
}
</style>
