<template>
  <div
    class="notification-item"
    :class="{
      unread: !notification.read,
      [notification.type]: true,
    }"
    @click="handleClick"
  >
    <div
      class="notification-swipe"
      :style="swipeStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="notification-content">
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
            class="mark-read-button"
            @click.stop="markAsRead"
            title="Пометить прочитанным"
          >
            <Icon name="lucide:circle" size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Swipe Action -->
    <div class="swipe-action" :class="{ visible: showSwipeAction }">
      <button class="delete-action" @click="removeNotification">
        <Icon name="lucide:trash-2" size="18" />
        <span>Удалить</span>
      </button>
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
}>()

const notificationsStore = useNotificationsStore()

// Swipe gesture handling
const touchStartX = ref(0)
const currentTranslate = ref(0)
const isSwiping = ref(false)
const showSwipeAction = ref(false)

const swipeStyle = computed(() => ({
  transform: `translateX(${currentTranslate.value}px)`,
  transition: isSwiping.value
    ? 'none'
    : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}))

const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  isSwiping.value = true
}

const onTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return

  const currentX = e.touches[0].clientX
  const diff = currentX - touchStartX.value

  // Only allow left swipe (negative values)
  if (diff < 0) {
    currentTranslate.value = Math.max(diff, -80) // Limit swipe distance
  }
}

const onTouchEnd = () => {
  isSwiping.value = false

  // If swiped more than 60px, show delete action
  if (currentTranslate.value < -60) {
    showSwipeAction.value = true
    currentTranslate.value = -80
  } else {
    // Return to original position
    currentTranslate.value = 0
    showSwipeAction.value = false
  }
}

// Notification icon based on type
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

// Format time
const formattedTime = computed(() => {
  const now = new Date()
  const notificationTime = new Date(props.notification.createdAt)
  const diff = now.getTime() - notificationTime.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} д назад`

  return notificationTime.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
})

// Methods
const handleClick = () => {
  if (!props.notification.read) {
    markAsRead()
  }

  emit('click', props.notification)

  // Handle navigation if needed
  if (props.notification.actionUrl) {
    const router = useRouter()
    router.push(props.notification.actionUrl)
  }
}

const markAsRead = () => {
  notificationsStore.markAsRead(props.notification.id)
}

const removeNotification = () => {
  emit('remove', props.notification.id)
  // Reset swipe state
  currentTranslate.value = 0
  showSwipeAction.value = false
}

// Reset swipe when notification changes
watch(
  () => props.notification,
  () => {
    currentTranslate.value = 0
    showSwipeAction.value = false
  }
)
</script>

<style scoped lang="scss">
.notification-item {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  margin-bottom: var(--space-2);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);

  &.unread {
    background: rgba(93, 95, 239, 0.05);
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
      z-index: 2;
    }
  }

  // Type-based border colors
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

  &.task {
    border-left: 3px solid var(--accent-secondary);
  }

  &.timer {
    border-left: 3px solid var(--info);
  }

  &.achievement {
    border-left: 3px solid var(--warning);
  }
}

.notification-swipe {
  background: inherit;
  border-radius: var(--radius-card);
  cursor: pointer;
  user-select: none;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: inherit;
  border-radius: var(--radius-card);
}

.notification-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.1);

  :deep(svg) {
    color: var(--text-secondary);
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
  gap: var(--space-2);
}

.mark-read-button {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--accent-primary);
  }
}

.swipe-action {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80px;
  background: var(--error);
  border-radius: 0 var(--radius-card) var(--radius-card) 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scaleX(0);
  transform-origin: right;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &.visible {
    opacity: 1;
    transform: scaleX(1);
  }
}

.delete-action {
  @include button-reset;
  @include flex-center;
  flex-direction: column;
  gap: var(--space-1);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-2);

  :deep(svg) {
    color: white;
  }
}

// Hover effects for desktop
@media (hover: hover) {
  .notification-item:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .notification-item {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &.unread {
      background: rgba(93, 95, 239, 0.05);
      border-color: rgba(93, 95, 239, 0.1);
    }
  }

  .notification-icon {
    background: rgba(0, 0, 0, 0.05);
  }

  .mark-read-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
