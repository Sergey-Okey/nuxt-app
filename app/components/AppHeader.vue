<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="header-logo">
        <button class="logo-button" @click="goToHome" title="Главная">
          <NuxtImg
            src="/images/logo.png"
            sizes="35px"
            alt="TaskFlow"
            class="logo-image"
          />
        </button>
      </div>

      <!-- Right Section: Actions -->
      <div class="header-actions">
        <!-- Theme Toggle -->
        <button class="icon-button" @click="toggleTheme" :title="themeLabel">
          <Icon :name="themeIcon" size="20" />
        </button>

        <!-- Notifications -->
        <div class="notifications-wrapper">
          <button
            class="icon-button"
            @click="openNotifications"
            title="Уведомления"
          >
            <Icon name="lucide:bell" size="20" />
            <span v-if="unreadCount > 0" class="notification-badge">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>
        </div>

        <!-- User Profile -->
        <button class="user-avatar" @click="goToProfile" title="Профиль">
          <Icon name="lucide:user" size="20" />
        </button>
      </div>
    </div>

    <!-- Status Bar for important notifications -->
    <div v-if="statusMessage" class="status-bar" :class="statusType">
      <Icon :name="statusIcon" size="16" />
      <span class="status-text">{{ statusMessage }}</span>
      <button class="status-close" @click="clearStatus">
        <Icon name="lucide:x" size="14" />
      </button>
    </div>
  </header>

  <!-- Notifications Modal -->
  <NotificationsModal />
</template>

<script setup lang="ts">
// Import components
import NotificationsModal from '~/components/Notifications/NotificationsModal.vue'

// Import stores
const themeStore = useThemeStore()
const notificationsStore = useNotificationsStore()

// Theme management - используем store
const { themeIcon, themeLabel } = storeToRefs(themeStore)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Notifications
const unreadCount = computed(() => notificationsStore.unreadCount)

const openNotifications = () => {
  notificationsStore.openModal()
}

// Status Bar
const statusMessage = ref('Добро пожаловать в TaskFlow! 🚀')
const statusType = ref('info')

const statusIcon = computed(() => {
  switch (statusType.value) {
    case 'success':
      return 'lucide:check-circle'
    case 'warning':
      return 'lucide:alert-triangle'
    case 'error':
      return 'lucide:alert-circle'
    default:
      return 'lucide:info'
  }
})

const clearStatus = () => {
  statusMessage.value = ''
}

// Navigation
const router = useRouter()

const goToHome = () => {
  router.push('/')
}

const goToProfile = () => {
  router.push('/profile')
}

// Auto-clear status after 5 seconds
onMounted(() => {
  setTimeout(() => {
    statusMessage.value = ''
  }, 5000)
})
</script>

<style scoped lang="scss">
.app-header {
  @include glass(20px, 0.05);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(var(--card-bg-rgb), 0.95);
  border-bottom-right-radius: var(--radius-card);
  border-bottom-left-radius: var(--radius-card);
  transition: all var(--duration-base);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

.header-logo {
  .logo-button {
    @include button-reset;
    @include flex-center;
    padding: var(--space-1);
    border-radius: var(--radius-button);
    transition: all var(--duration-base);
    position: relative;

    &:hover {
      transform: scale(1.05);

      &::after {
        opacity: 0.1;
      }
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  @include breakpoint(sm) {
    gap: var(--space-3);
  }
}

.icon-button {
  @include button-reset;
  @include flex-center;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  background: rgba(var(--surface-bg-rgb), 0.6);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(var(--accent-primary-rgb), 0.1);
    color: var(--accent-primary);
    transform: translateY(-1px);
    box-shadow: var(--glow-primary);
  }

  &:active {
    transform: translateY(0);
  }

  // Pulse animation for notifications when unread
  &.has-notifications {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(var(--accent-primary-rgb), 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(var(--accent-primary-rgb), 0);
  }
}

.notifications-wrapper {
  position: relative;

  .icon-button.has-notifications {
    animation: pulse 2s infinite;
  }
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  @include flex-center;
  padding: 0 var(--space-1);
  box-shadow: 0 0 0 2px var(--card-bg);
  animation: bounce 0.5s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: scale(1);
  }
  40%,
  43% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1.1);
  }
}

.user-avatar {
  @include button-reset;
  @include flex-center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: rgba(var(--surface-bg-rgb), 0.6);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity var(--duration-base);
  }

  &:hover {
    color: white;
    transform: scale(1.05);

    &::before {
      opacity: 1;
    }

    :deep(svg) {
      color: white;
    }
  }

  &:active {
    transform: scale(0.98);
  }

  :deep(svg) {
    position: relative;
    z-index: 1;
    transition: color var(--duration-base);
  }
}

// Status Bar
.status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideDown 0.3s ease-out;

  &.info {
    background: rgba(var(--accent-primary-rgb), 0.1);
    color: var(--accent-primary);
  }

  &.success {
    background: rgba(var(--accent-secondary-rgb), 0.1);
    color: var(--success);
  }

  &.warning {
    background: rgba(var(--accent-warning-rgb), 0.1);
    color: var(--warning);
  }

  &.error {
    background: rgba(var(--accent-error-rgb), 0.1);
    color: var(--error);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-text {
  flex: 1;
  font-weight: var(--font-medium);
}

.status-close {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: inherit;
  opacity: 0.7;
  transition: all var(--duration-base);

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .icon-button {
    background: rgba(var(--surface-bg-rgb), 0.4);

    &:hover {
      background: rgba(var(--accent-primary-rgb), 0.08);
    }
  }

  .user-avatar {
    background: rgba(var(--surface-bg-rgb), 0.4);
  }

  .notification-badge {
    box-shadow: 0 0 0 2px var(--primary-bg);
  }
}

// Responsive improvements
@include breakpoint(md) {
  .header-content {
    padding: var(--space-4);
  }

  .status-text {
    font-size: var(--text-base);
  }
}
</style>
