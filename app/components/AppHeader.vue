<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-logo">
        <button class="logo-button" @click="goToHome">
          <NuxtImg src="/images/logo.png" sizes="35px" />
        </button>
      </div>

      <div class="header-actions">
        <button
          class="icon-button"
          @click="toggleTheme"
          :title="themeButtonTitle"
        >
          <Icon :name="themeIcon" size="20" />
        </button>

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

        <button class="user-avatar" @click="goToProfile" title="Профиль">
          <Icon name="lucide:user" size="20" />
        </button>
      </div>
    </div>
  </header>

  <NotificationsModal />
</template>

<script setup lang="ts">
import NotificationsModal from '~/components/Notifications/NotificationsModal.vue'

const notificationsStore = useNotificationsStore()
const unreadCount = computed(() => notificationsStore.unreadCount)

// Theme management
const theme = ref<'dark' | 'light'>('dark')

const themeIcon = computed(() => {
  return theme.value === 'dark' ? 'lucide:sun' : 'lucide:moon'
})

const themeButtonTitle = computed(() => {
  return theme.value === 'dark' ? 'Светлая тема' : 'Тёмная тема'
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
}

const openNotifications = () => {
  notificationsStore.openModal()
}

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
  @include glass(20px, 0.05);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
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
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

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

.user-avatar {
  @include button-reset;
  @include flex-center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}
</style>
