<template>
  <div v-if="isOpen" class="notifications-overlay">
    <!-- Backdrop с blur эффектом -->
    <div class="backdrop" @click="closeModal"></div>

    <!-- Модальное окно -->
    <div class="notifications-modal">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <Icon name="lucide:bell" size="20" class="title-icon" />
            <h2 class="modal-title">Уведомления</h2>
            <div v-if="unreadCount > 0" class="unread-badge">
              {{ unreadCount }}
            </div>
          </div>

          <div class="header-actions">
            <button
              v-if="unreadCount > 0"
              class="mark-all-button"
              @click="markAllAsRead"
              title="Отметить все как прочитанные"
            >
              <Icon name="lucide:check-circle" size="16" />
            </button>
            <button class="close-button" @click="closeModal" title="Закрыть">
              <Icon name="lucide:x" size="20" />
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <div class="notifications-container">
          <!-- Список уведомлений -->
          <div v-if="notifications.length > 0" class="notifications-list">
            <div
              v-for="notification in sortedNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{
                unread: !notification.read,
                [notification.type]: true,
              }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon">
                <Icon
                  :name="getNotificationIcon(notification.type)"
                  size="18"
                />
              </div>

              <div class="notification-content">
                <div class="notification-title">
                  {{ notification.title }}
                </div>
                <div class="notification-message">
                  {{ notification.message }}
                </div>
                <div class="notification-time">
                  {{ formatTime(notification.timestamp) }}
                </div>
              </div>

              <div class="notification-actions">
                <button
                  v-if="!notification.read"
                  class="read-button"
                  @click.stop="markAsRead(notification.id)"
                  title="Отметить как прочитанное"
                >
                  <Icon name="lucide:check" size="14" />
                </button>
                <button
                  class="delete-button"
                  @click.stop="removeNotification(notification.id)"
                  title="Удалить уведомление"
                >
                  <Icon name="lucide:x" size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Пустое состояние -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <Icon name="lucide:bell-off" size="48" />
            </div>
            <div class="empty-content">
              <h3>Уведомлений нет</h3>
              <p>Здесь будут появляться важные уведомления и события</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div v-if="notifications.length > 0" class="modal-footer">
        <div class="footer-stats">
          <span class="total-count"
            >{{ notifications.length }} уведомлений</span
          >
          <span class="unread-count" v-if="unreadCount > 0">
            • {{ unreadCount }} непрочитанных
          </span>
        </div>
        <button class="clear-all-button" @click="clearAllNotifications">
          <Icon name="lucide:trash-2" size="16" />
          Очистить все
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const notificationsStore = useNotificationsStore()

// Реактивные данные из хранилища
const {
  isModalOpen: isOpen,
  notifications,
  sortedNotifications,
  unreadCount,
} = storeToRefs(notificationsStore)

// Методы хранилища
const { closeModal, markAllAsRead, removeNotification, markAsRead } =
  notificationsStore

// Локальные методы
const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    info: 'lucide:info',
    success: 'lucide:check-circle',
    warning: 'lucide:alert-triangle',
    error: 'lucide:alert-circle',
    task: 'lucide:check-square',
    timer: 'lucide:clock',
    achievement: 'lucide:award',
  }
  return icons[type] || 'lucide:bell'
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (hours < 24) return `${hours} ч назад`
  if (days < 7) return `${days} д назад`

  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

const handleNotificationClick = (notification: any) => {
  // Отмечаем как прочитанное при клике
  if (!notification.read) {
    markAsRead(notification.id)
  }

  // Обрабатываем действие уведомления
  if (notification.actionType === 'navigate' && notification.actionUrl) {
    const router = useRouter()
    router.push(notification.actionUrl)
    closeModal()
  }
}

const clearAllNotifications = () => {
  // Удаляем все уведомления
  notifications.value.forEach((notification) => {
    removeNotification(notification.id)
  })
}

// Закрытие по ESC
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped lang="scss">
.notifications-overlay {
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
  animation: overlayAppear 0.3s ease-out;
}

@keyframes overlayAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.notifications-modal {
  @include glass(20px, 0.1);
  position: relative;
  width: 100%;
  max-width: 440px;
  max-height: 80vh;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: modalSlideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Header
.modal-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: var(--space-4) var(--space-5);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.title-icon {
  color: var(--accent-primary);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.unread-badge {
  background: var(--error);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.mark-all-button,
.close-button {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  transition: all var(--duration-base);
}

.mark-all-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }
}

.close-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

// Content
.modal-content {
  max-height: 400px;
  overflow: hidden;
}

.notifications-container {
  height: 100%;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  gap: var(--space-2);
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(2px);
  }

  &.unread {
    background: rgba(93, 95, 239, 0.05);
    border-color: rgba(93, 95, 239, 0.1);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -2px;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background: var(--accent-primary);
      border-radius: var(--radius-full);
    }
  }

  // Типы уведомлений
  &.info {
    .notification-icon {
      color: var(--accent-primary);
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
}

.notification-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: var(--font-medium);
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

.notification-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.notification-actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity var(--duration-base);

  .notification-item:hover & {
    opacity: 1;
  }
}

.read-button,
.delete-button {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);
}

.read-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }
}

.delete-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

// Empty state
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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
    opacity: 0.5;
  }
}

.empty-content {
  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    margin: 0;
    color: var(--text-secondary);
  }
}

// Footer
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-stats {
  font-size: var(--text-sm);
  color: var(--text-secondary);

  .total-count {
    font-weight: var(--font-medium);
  }

  .unread-count {
    color: var(--accent-primary);
    font-weight: var(--font-medium);
  }
}

.clear-all-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(248, 113, 113, 0.1);
  color: var(--error);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.2);
    transform: translateY(-1px);
  }
}

// Light theme
[data-theme='light'] {
  .backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .notifications-modal {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    background: rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .notification-item {
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.1);
    }

    &.unread {
      background: rgba(93, 95, 239, 0.05);
      border-color: rgba(93, 95, 239, 0.1);
    }
  }

  .notification-icon {
    background: rgba(0, 0, 0, 0.05);
  }

  .modal-footer {
    background: rgba(0, 0, 0, 0.03);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .mark-all-button,
  .close-button,
  .read-button,
  .delete-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .empty-icon {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile responsive
@include breakpoint(sm) {
  .notifications-overlay {
    padding: var(--space-2);
  }

  .notifications-modal {
    max-width: none;
    max-height: none;
    height: calc(100vh - var(--space-4));
  }

  .modal-header {
    padding: var(--space-4);
  }

  .modal-content {
    max-height: none;
    flex: 1;
  }

  .notifications-list {
    max-height: none;
    padding: var(--space-2);
  }

  .modal-footer {
    padding: var(--space-4);
  }
}

@include breakpoint(xs) {
  .notifications-overlay {
    padding: 0;
  }

  .notifications-modal {
    height: 100vh;
    border-radius: 0;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .header-actions {
    align-self: flex-end;
  }
}
</style>
