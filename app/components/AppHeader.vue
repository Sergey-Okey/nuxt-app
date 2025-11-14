<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="header-logo">
        <button class="logo-button" @click="goToHome">
          <NuxtImg src="/images/logo.png" />
        </button>
      </div>

      <!-- Right Section: Actions -->
      <div class="header-actions">
        <!-- Theme Toggle -->
        <button
          class="icon-button"
          @click="toggleTheme"
          :title="themeButtonTitle"
        >
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
              {{ unreadCount }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Notifications Modal -->
  <NotificationsModal />
</template>

<script setup lang="ts">
// Components
import NotificationsModal from '~/components/Notifications/NotificationsModal.vue'

// Store
const notificationsStore = useNotificationsStore()
const unreadCount = computed(() => notificationsStore.unreadCount)

// Theme management - integrated with global theme
const theme = ref<'dark' | 'light'>(getCurrentTheme())

function getCurrentTheme(): 'dark' | 'light' {
  if (typeof document === 'undefined') return 'dark'
  return (
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ||
    'dark'
  )
}

const themeIcon = computed(() => {
  return theme.value === 'dark' ? 'lucide:sun' : 'lucide:moon'
})

const themeButtonTitle = computed(() => {
  return theme.value === 'dark' ? 'Светлая тема' : 'Тёмная тема'
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
  // Сохраняем выбор темы в localStorage
  localStorage.setItem('taskflow-theme', theme.value)
}

// Initialize theme from localStorage or system preference
onMounted(() => {
  const savedTheme = localStorage.getItem('taskflow-theme') as
    | 'dark'
    | 'light'
    | null
  const systemPrefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches

  if (savedTheme) {
    theme.value = savedTheme
  } else if (systemPrefersDark) {
    theme.value = 'dark'
  } else {
    theme.value = 'light'
  }

  document.documentElement.setAttribute('data-theme', theme.value)
})

// Notifications
const openNotifications = () => {
  notificationsStore.openModal()
}

// Navigation
const router = useRouter()

const goToHome = () => {
  router.push('/')
}

const goToProfile = () => {
  router.push('/profile')
}
</script>

<style scoped lang="scss">
.app-header {
  background: rgba(31, 31, 31, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

[data-theme='light'] .app-header {
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
    width: 44px;
    height: 44px;

    &:hover {
      transform: scale(1.05);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.icon-button {
  @include button-reset;
  @include flex-center;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

[data-theme='light'] .icon-button {
  background: rgba(0, 0, 0, 0.05);
}

// Notifications
.notifications-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  @include flex-center;
}
</style>
