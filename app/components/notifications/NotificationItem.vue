<template>
  <div class="notification-wrapper">
    <div
      class="notification-item"
      :class="[
        `type-${notification.type}`,
        {
          read: notification.read,
          swiping: isSwiping,
        },
      ]"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="handleClick"
    >
      <!-- Main Content -->
      <div class="notification-content" :style="contentStyle">
        <div class="notification-icon">
          <Icon :name="notificationIcon" size="20" />
        </div>

        <div class="notification-text">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ formattedTime }}</div>
        </div>

        <div class="notification-actions">
          <button
            v-if="!notification.read"
            class="mark-read-btn"
            @click.stop="markAsRead"
            title="Пометить прочитанным"
          >
            <Icon name="lucide:check" size="16" />
          </button>
        </div>
      </div>

      <!-- Swipe Action -->
      <div class="swipe-action" :class="{ visible: showSwipeAction }">
        <div class="swipe-background">
          <Icon name="lucide:trash-2" size="20" />
          <span>Удалить</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/stores/notifications'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()
const emit = defineEmits<{
  click: [notification: Notification]
  remove: [id: string]
  markAsRead: [id: string]
}>()

// Swipe gesture handling
const isSwiping = ref(false)
const startX = ref(0)
const currentX = ref(0)
const swipeDistance = ref(0)
const SWIPE_THRESHOLD = 80

const contentStyle = computed(() => ({
  transform: `translateX(${swipeDistance.value}px)`,
}))

const showSwipeAction = computed(() => {
  return swipeDistance.value < -SWIPE_THRESHOLD
})

const onTouchStart = (e: TouchEvent) => {
  isSwiping.value = true
  startX.value = e.touches[0].clientX
  currentX.value = startX.value
}

const onTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return

  currentX.value = e.touches[0].clientX
  swipeDistance.value = Math.min(0, currentX.value - startX.value)

  // Prevent scrolling when swiping
  if (Math.abs(swipeDistance.value) > 10) {
    e.preventDefault()
  }
}

const onTouchEnd = () => {
  if (swipeDistance.value < -SWIPE_THRESHOLD) {
    // Trigger delete with animation
    swipeDistance.value = -200
    setTimeout(() => {
      emit('remove', props.notification.id)
    }, 300)
  } else {
    // Reset position
    swipeDistance.value = 0
  }

  isSwiping.value = false
}

// Notification data
const notificationIcon = computed(() => {
  const icons = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:alert-circle',
    task: 'lucide:check-square',
    timer: 'lucide:clock',
    achievement: 'lucide:award',
  }
  return icons[props.notification.type] || 'lucide:bell'
})

const formattedTime = computed(() => {
  try {
    // Используем timestamp из хранилища
    const notificationDate = new Date(props.notification.timestamp)

    // Проверяем валидность даты
    if (isNaN(notificationDate.getTime())) {
      return 'Недавно'
    }

    const now = new Date()
    const diff = now.getTime() - notificationDate.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} д назад`

    return notificationDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  } catch (error) {
    console.error('Error formatting notification time:', error)
    return 'Недавно'
  }
})

// Methods
const handleClick = () => {
  emit('click', props.notification)
}

const markAsRead = () => {
  emit('markAsRead', props.notification.id)
}

// Mouse events for desktop testing
const isMouseDown = ref(false)

const onMouseDown = (e: MouseEvent) => {
  isMouseDown.value = true
  startX.value = e.clientX
  currentX.value = startX.value
}

const onMouseMove = (e: MouseEvent) => {
  if (!isMouseDown.value) return

  currentX.value = e.clientX
  swipeDistance.value = Math.min(0, currentX.value - startX.value)
}

const onMouseUp = () => {
  if (!isMouseDown.value) return

  if (swipeDistance.value < -SWIPE_THRESHOLD) {
    swipeDistance.value = -200
    setTimeout(() => {
      emit('remove', props.notification.id)
    }, 300)
  } else {
    swipeDistance.value = 0
  }

  isMouseDown.value = false
}

// Add mouse events for desktop testing
onMounted(() => {
  const element = document.querySelector('.notification-item')
  if (element) {
    element.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
})

onUnmounted(() => {
  const element = document.querySelector('.notification-item')
  if (element) {
    element.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
})
</script>

<style scoped lang="scss">
.notification-wrapper {
  position: relative;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.notification-item {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  transition: all 0.3s ease;

  &.swiping {
    transition: transform 0.1s ease;
  }

  &:active:not(.swiping) {
    transform: scale(0.98);
  }
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;

  .notification-item.read & {
    opacity: 0.7;
  }

  .notification-item:not(.read) & {
    background: rgba(93, 95, 239, 0.03);
    border-color: rgba(93, 95, 239, 0.1);

    &::before {
      content: '';
      position: absolute;
      top: 12px;
      left: 8px;
      width: 6px;
      height: 6px;
      background: var(--accent-primary);
      border-radius: 50%;
    }
  }
}

.notification-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  margin-top: 2px;

  .notification-item.type-info & {
    background: rgba(96, 165, 250, 0.1);

    :deep(svg) {
      color: var(--info);
    }
  }

  .notification-item.type-success & {
    background: rgba(93, 242, 126, 0.1);

    :deep(svg) {
      color: var(--success);
    }
  }

  .notification-item.type-warning & {
    background: rgba(250, 204, 21, 0.1);

    :deep(svg) {
      color: var(--warning);
    }
  }

  .notification-item.type-error & {
    background: rgba(248, 113, 113, 0.1);

    :deep(svg) {
      color: var(--error);
    }
  }

  .notification-item.type-task & {
    background: rgba(93, 95, 239, 0.1);

    :deep(svg) {
      color: var(--accent-primary);
    }
  }

  .notification-item.type-timer & {
    background: rgba(139, 69, 255, 0.1);

    :deep(svg) {
      color: #8b45ff;
    }
  }

  .notification-item.type-achievement & {
    background: rgba(255, 193, 7, 0.1);

    :deep(svg) {
      color: #ffc107;
    }
  }
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
  font-size: var(--text-sm);
}

.notification-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2);
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.notification-actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity 0.3s ease;

  .notification-content:hover & {
    opacity: 1;
  }
}

.mark-read-btn {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  transition: all 0.3s ease;

  &:hover {
    background: var(--success);
    color: white;
    transform: scale(1.1);
  }
}

// Swipe Action
.swipe-action {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;

  &.visible {
    opacity: 1;
  }
}

.swipe-background {
  @include flex-center;
  flex-direction: column;
  gap: var(--space-1);
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, var(--error) 100%);
  color: white;
  padding-left: 60%;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);

  :deep(svg) {
    color: white;
  }
}

// Light theme adjustments
[data-theme='light'] {
  .notification-content {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    .notification-item:not(.read) & {
      background: rgba(93, 95, 239, 0.05);
      border-color: rgba(93, 95, 239, 0.1);
    }
  }

  .mark-read-btn {
    background: rgba(0, 0, 0, 0.05);
  }

  .notification-icon {
    .notification-item.type-info & {
      background: rgba(96, 165, 250, 0.15);
    }

    .notification-item.type-success & {
      background: rgba(93, 242, 126, 0.15);
    }

    .notification-item.type-warning & {
      background: rgba(250, 204, 21, 0.15);
    }

    .notification-item.type-error & {
      background: rgba(248, 113, 113, 0.15);
    }

    .notification-item.type-task & {
      background: rgba(93, 95, 239, 0.15);
    }

    .notification-item.type-timer & {
      background: rgba(139, 69, 255, 0.15);
    }

    .notification-item.type-achievement & {
      background: rgba(255, 193, 7, 0.15);
    }
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .notification-content {
    padding: var(--space-3);
  }

  .notification-actions {
    opacity: 1; // Always show on mobile
  }
}

// Animation for removal
.notification-item {
  &.removing {
    animation: slideOutRight 0.3s ease forwards;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
