<template>
  <div v-if="isOpen" class="notifications-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <!-- iOS-style Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Уведомления</h2>
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
      </div>

      <!-- Notifications Content -->
      <div class="notifications-content">
        <NotificationsList
          :notifications="notifications"
          @click="handleNotificationClick"
          @remove="removeNotification"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/stores/notifications'

const notificationsStore = useNotificationsStore()

// Use store state
const isOpen = computed(() => notificationsStore.isModalOpen)
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)

// Methods
const closeModal = () => {
  notificationsStore.closeModal()
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const removeNotification = (id: string) => {
  notificationsStore.removeNotification(id)
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    notificationsStore.markAsRead(notification.id)
  }

  // Handle navigation if needed
  if (notification.actionUrl) {
    const router = useRouter()
    router.push(notification.actionUrl)
    closeModal()
  }
}

// Keyboard and gesture handlers
onMounted(() => {
  // Escape key handler
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      closeModal()
    }
  }

  // Swipe down to close (mobile)
  const modalContainer = document.querySelector('.modal-container')
  let startY = 0

  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!modalContainer) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 50) {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)
  modalContainer?.addEventListener('touchstart', handleTouchStart)
  modalContainer?.addEventListener('touchmove', handleTouchMove)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    modalContainer?.removeEventListener('touchstart', handleTouchStart)
    modalContainer?.removeEventListener('touchmove', handleTouchMove)
  })
})
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
  flex-direction: column;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  animation: backdropFadeIn 0.3s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal-container {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  margin-top: auto;
  border-radius: 24px 24px 0 0;
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  max-height: 85vh;

  @include breakpoint(md) {
    max-width: 480px;
    max-height: 70vh;
    margin: auto;
    border-radius: 24px;
    animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--card-bg);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  @include breakpoint(md) {
    &::after {
      display: none;
    }
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
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
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
  }
}

.notifications-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// Mobile full-screen styles
@include breakpoint(xs) {
  .modal-container {
    border-radius: 0;
    max-height: none;
    margin-top: 0;
  }

  .modal-header {
    padding-top: calc(var(--space-4) + env(safe-area-inset-top));

    &::after {
      display: block;
    }
  }
}

// Light theme adjustments
[data-theme='light'] {
  .modal-backdrop {
    background: rgba(0, 0, 0, 0.2);
  }

  .modal-header::after {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
