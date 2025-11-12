<template>
  <div v-if="isModalOpen" class="notifications-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h2>Уведомления</h2>
        <div class="header-actions">
          <button
            v-if="unreadCount > 0"
            class="action-button"
            @click="markAllAsRead"
          >
            Прочитать все
          </button>
          <button class="close-button" @click="closeModal">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>
      </div>

      <div class="notifications-list">
        <div
          v-for="notification in sortedNotifications"
          :key="notification.id"
          class="notification-item"
          :class="[notification.type, { unread: !notification.read }]"
          @click="handleNotificationClick(notification)"
          @touchstart="onTouchStart(notification, $event)"
          @touchmove="onTouchMove(notification, $event)"
          @touchend="onTouchEnd(notification)"
        >
          <!-- Delete Button (shown on swipe) -->
          <button
            v-if="swipeStates[notification.id]?.isSwiping"
            class="delete-button"
            :style="{
              transform: `translateX(${
                swipeStates[notification.id]?.offset
              }px)`,
            }"
            @click.stop="removeNotification(notification.id)"
          >
            <Icon name="lucide:trash-2" size="18" />
          </button>

          <!-- Notification Content -->
          <div
            class="notification-content"
            :style="{
              transform: `translateX(${
                swipeStates[notification.id]?.offset || 0
              }px)`,
            }"
          >
            <div class="notification-icon">
              <Icon :name="getNotificationIcon(notification.type)" size="20" />
            </div>

            <div class="notification-details">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-meta">
                <span class="notification-time">{{
                  formatTime(notification.timestamp)
                }}</span>
                <span class="notification-category">{{
                  getCategoryLabel(notification.category)
                }}</span>
                <span v-if="notification.actionUrl" class="notification-action">
                  <Icon name="lucide:arrow-up-right" size="12" />
                  Перейти
                </span>
              </div>
            </div>

            <!-- Always visible delete icon -->
            <button
              class="delete-icon"
              @click.stop="removeNotification(notification.id)"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>

        <div v-if="sortedNotifications.length === 0" class="empty-state">
          <Icon name="lucide:bell-off" size="48" />
          <p>Нет уведомлений</p>
          <span>Здесь будут появляться важные уведомления</span>
        </div>
      </div>

      <!-- Demo buttons for testing -->
      <div class="demo-actions">
        <div class="demo-buttons-grid">
          <button class="demo-button" @click="addTaskCompletedNotification">
            <Icon name="lucide:check-circle" size="16" />
            Задача выполнена
          </button>
          <button class="demo-button" @click="addFocusTimeNotification">
            <Icon name="lucide:clock" size="16" />
            Фокус-сессия
          </button>
          <button class="demo-button" @click="addBreakReminder">
            <Icon name="lucide:coffee" size="16" />
            Напоминание
          </button>
          <button class="demo-button" @click="addDailySummary">
            <Icon name="lucide:bar-chart" size="16" />
            Итоги дня
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Импортируем store
const notificationsStore = useNotificationsStore()

// Получаем состояние из store
const { isModalOpen, sortedNotifications, unreadCount } =
  storeToRefs(notificationsStore)

// Swipe state for each notification
interface SwipeState {
  startX: number
  currentX: number
  offset: number
  isSwiping: boolean
}

const swipeStates = ref<Record<string, SwipeState>>({})

// Methods
const closeModal = () => {
  notificationsStore.closeModal()
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id)
  // Remove swipe state
  delete swipeStates.value[id]
}

// Demo methods
const addTaskCompletedNotification = () => {
  notificationsStore.addTaskCompletedNotification('Тестовая задача')
}

const addFocusTimeNotification = () => {
  notificationsStore.addFocusTimeNotification(25)
}

const addBreakReminder = () => {
  notificationsStore.addBreakReminderNotification()
}

const addDailySummary = () => {
  notificationsStore.addDailySummaryNotification(5, '2ч 15м')
}

// Гарантируем что всегда возвращаем валидную иконку
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:alert-octagon',
  }
  return icons[type] || 'lucide:bell'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    system: 'Система',
    tasks: 'Задачи',
    productivity: 'Продуктивность',
    analytics: 'Аналитика',
    health: 'Здоровье',
  }
  return labels[category] || category
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}д назад`
  if (hours > 0) return `${hours}ч назад`
  if (minutes > 0) return `${minutes}м назад`
  return 'Только что'
}

const handleNotificationClick = (notification: any) => {
  // Mark as read
  if (!notification.read) {
    notificationsStore.markAsRead(notification.id)
  }

  // Handle different action types
  switch (notification.actionType) {
    case 'navigate':
      if (notification.actionUrl) {
        const router = useRouter()
        router.push(notification.actionUrl)
        closeModal()
      }
      break

    case 'open_modal':
      // Здесь можно открыть специфическую модалку
      console.log('Open modal for:', notification.id)
      break

    case 'dismiss':
      // Просто закрываем уведомление
      removeNotification(notification.id)
      break

    default:
      // Для уведомлений без actionType просто закрываем модалку
      closeModal()
  }
}

// Swipe handlers
const onTouchStart = (notification: any, event: TouchEvent) => {
  if (!swipeStates.value[notification.id]) {
    swipeStates.value[notification.id] = {
      startX: event.touches[0].clientX,
      currentX: event.touches[0].clientX,
      offset: 0,
      isSwiping: false,
    }
  } else {
    swipeStates.value[notification.id].startX = event.touches[0].clientX
    swipeStates.value[notification.id].currentX = event.touches[0].clientX
  }
}

const onTouchMove = (notification: any, event: TouchEvent) => {
  const state = swipeStates.value[notification.id]
  if (!state) return

  state.currentX = event.touches[0].clientX
  const deltaX = state.currentX - state.startX

  // Only allow left swiping (negative deltaX)
  if (deltaX < 0) {
    state.offset = Math.max(deltaX, -80) // Limit swipe distance
    state.isSwiping = true
  }
}

const onTouchEnd = (notification: any) => {
  const state = swipeStates.value[notification.id]
  if (!state) return

  // If swiped more than 50px, keep it open, otherwise reset
  if (state.offset < -50) {
    state.offset = -80
  } else {
    state.offset = 0
    state.isSwiping = false
  }
}
</script>

<style scoped lang="scss">
.notifications-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h2 {
    margin: 0;
    font-size: var(--text-xl);
    color: var(--text-primary);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-button {
  @include button-reset;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--error);
    color: white;
  }
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-2);
}

.notification-item {
  position: relative;
  margin-bottom: var(--space-2);
  border-radius: var(--radius-card);
  overflow: hidden;
  cursor: pointer;
  user-select: none;

  // Type styles
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

  &.unread {
    background: rgba(93, 95, 239, 0.05);
  }
}

.delete-button {
  @include button-reset;
  @include flex-center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 80px;
  background: var(--error);
  color: white;
  transition: transform var(--duration-base);

  &:hover {
    background: #dc2626;
  }
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);
  position: relative;
}

.notification-icon {
  @include flex-center;
  flex-shrink: 0;
  margin-top: 2px;

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.notification-details {
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
  line-height: var(--leading-tight);
  margin-bottom: var(--space-2);
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  flex-wrap: wrap;
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

.notification-action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--success);
  background: rgba(93, 242, 126, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.delete-icon {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    background: var(--error);
    color: white;
  }
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

.demo-actions {
  padding: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.demo-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.demo-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: var(--surface-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
}
</style>
