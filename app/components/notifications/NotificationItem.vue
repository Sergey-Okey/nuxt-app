<template>
  <div
    ref="containerRef"
    class="notification-container"
    :class="{ 'is-swiping': isSwiping }"
  >
    <!-- Swipe Action Background -->
    <div
      class="swipe-action-background"
      :class="{ 'swipe-active': swipeProgress > 0 }"
      :style="{ '--swipe-progress': swipeProgress }"
    >
      <div class="delete-action">
        <Icon name="lucide:trash-2" size="24" />
        <span>Удалить</span>
      </div>
    </div>

    <!-- Notification Content -->
    <div
      ref="contentRef"
      class="notification-content"
      :style="contentStyle"
      @click="handleNotificationClick"
    >
      <div class="notification-main">
        <div class="notification-header">
          <div class="notification-icon" :class="notification.type">
            <Icon :name="notificationIcon" size="18" />
          </div>
          <div class="notification-info">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <button
            v-if="!isSwiping"
            class="quick-delete-btn"
            @click.stop="handleQuickDelete"
          >
            <Icon name="lucide:x" size="16" />
          </button>
        </div>

        <div class="notification-footer">
          <span class="notification-time">{{ formattedTime }}</span>
          <span class="notification-category">{{ categoryLabel }}</span>
          <span v-if="hasAction" class="notification-action-hint">
            <Icon name="lucide:arrow-up-right" size="12" />
            Нажмите для перехода
          </span>
        </div>
      </div>

      <!-- Swipe Indicator -->
      <div
        v-if="isSwiping"
        class="swipe-indicator"
        :style="{ opacity: swipeProgress }"
      >
        <Icon name="lucide:chevron-left" size="16" />
      </div>
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
const isSwiping = ref(false)
const swipeProgress = ref(0)

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

const hasAction = computed(
  () =>
    props.notification.actionType === 'navigate' && props.notification.actionUrl
)

const contentStyle = computed(() => ({
  transform: `translateX(${swipeOffset.value}px)`,
  cursor: isSwiping.value ? 'grabbing' : 'pointer',
}))

// Gesture Handling
useGesture(
  {
    onDrag: ({ movement: [mx], first, last, intentional, event }) => {
      event.preventDefault()

      if (!intentional) return

      // Only allow left swiping
      if (mx < 0) {
        isSwiping.value = true
        swipeOffset.value = Math.max(mx, -120)
        swipeProgress.value = Math.min(Math.abs(mx) / 120, 1)

        if (last) {
          if (mx < -80) {
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
      if (isSwiping.value && Math.abs(swipeOffset.value) < 80) {
        resetSwipe()
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
    eventOptions: { passive: false },
  }
)

// Methods
const resetSwipe = () => {
  swipeOffset.value = 0
  isSwiping.value = false
  swipeProgress.value = 0
}

const triggerDelete = () => {
  emit('remove', props.notification.id)
}

const handleNotificationClick = () => {
  if (isSwiping.value || Math.abs(swipeOffset.value) > 10) {
    resetSwipe()
    return
  }

  // Mark as read if not already
  if (!props.notification.read) {
    useNotificationsStore().markAsRead(props.notification.id)
  }

  emit('click', props.notification)
}

const handleQuickDelete = (event: Event) => {
  event.stopPropagation()
  triggerDelete()
}
</script>

<style scoped lang="scss">
.notification-container {
  position: relative;
  margin-bottom: var(--space-3);
  border-radius: var(--radius-card);
  overflow: hidden;
  background: var(--surface-bg);
  transition: all var(--duration-base);

  &.is-swiping {
    z-index: 1;
  }

  &:hover:not(.is-swiping) {
    background: var(--card-bg);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}

.swipe-action-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent calc(100% - 120px),
    var(--error) calc(100% - 120px),
    var(--error) 100%
  );
  opacity: 0;
  transition: opacity var(--duration-base);

  &.swipe-active {
    opacity: calc(var(--swipe-progress, 0) * 0.8);
  }
}

.delete-action {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);

  :deep(svg) {
    opacity: 0.9;
  }
}

.notification-content {
  position: relative;
  background: inherit;
  border-radius: inherit;
  transition: transform var(--duration-base);
  user-select: none;

  // Border based on notification type
  border-left: 4px solid transparent;

  .notification-container.info & {
    border-left-color: var(--accent-primary);
  }

  .notification-container.success & {
    border-left-color: var(--success);
  }

  .notification-container.warning & {
    border-left-color: var(--warning);
  }

  .notification-container.error & {
    border-left-color: var(--error);
  }

  .notification-container.unread & {
    background: rgba(93, 95, 239, 0.03);
  }
}

.notification-main {
  padding: var(--space-4);
}

.notification-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.notification-icon {
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  flex-shrink: 0;

  &.info {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  &.success {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.warning {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.error {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.notification-info {
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
  margin: 0;
}

.quick-delete-btn {
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

  .notification-container:hover & {
    opacity: 1;
  }

  &:hover {
    background: var(--error);
    color: white;
  }
}

.notification-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
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

.notification-action-hint {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--success);
  background: rgba(93, 242, 126, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
  margin-left: auto;
}

.swipe-indicator {
  position: absolute;
  top: 50%;
  right: var(--space-3);
  transform: translateY(-50%);
  color: var(--text-muted);
  transition: opacity var(--duration-base);
}

// Mobile optimizations
@media (max-width: 640px) {
  .notification-main {
    padding: var(--space-3);
  }

  .notification-header {
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .quick-delete-btn {
    opacity: 1; // Always show on mobile
  }

  .notification-action-hint {
    display: none; // Hide on mobile to save space
  }
}
</style>
