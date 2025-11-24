<template>
  <header class="app-header" :class="{ 'header-scrolled': isScrolled }">
    <div class="header-island">
      <div class="header-container">
        <!-- Logo -->
        <div class="header-logo">
          <button class="logo-button" @click="goToHome" title="Главная">
            <div class="logo-container">
              <NuxtImg
                src="/images/logo.png"
                width="32"
                height="32"
                alt="TaskFlow"
                class="logo-image"
                loading="eager"
              />
              <span class="logo-text">TaskFlow</span>
            </div>
          </button>
        </div>

        <!-- Right Section: Actions -->
        <div class="header-actions">
          <!-- Theme Toggle -->
          <button class="icon-button" @click="toggleTheme" :title="themeLabel">
            <Icon :name="themeIcon" size="20" />
          </button>

          <!-- Notifications -->
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

          <!-- User Profile -->
          <button class="user-avatar" @click="goToProfile" title="Профиль">
            <Icon name="lucide:user" size="20" />
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Notifications Modal -->
  <NotificationsModal />
</template>

<script setup lang="ts">
// Import components
import NotificationsModal from '~/components/Notifications/NotificationsModal.vue'

// Используем вашу реализацию уведомлений
const notificationsStore = useNotificationsStore()

// Scroll detection
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Theme management - только dark/light
const theme = ref<'dark' | 'light'>('dark')

const themeIcon = computed(() => {
  return theme.value === 'dark' ? 'lucide:moon' : 'lucide:sun'
})

const themeLabel = computed(() => {
  return theme.value === 'dark' ? 'Светлая тема' : 'Тёмная тема'
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', theme.value)
}

// Notifications - используем вашу реализацию
const unreadCount = computed(() => notificationsStore.unreadCount)

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
  position: fixed;
  top: var(--space-4);
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  padding: 0 var(--space-4);
  transition: top 0.3s ease;

  &.header-scrolled {
    top: 0;
    padding: 0;
  }
}

.header-island {
  @include card;
  @include glass;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  transition: all 0.3s ease;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;

  .header-scrolled & {
    max-width: none;
    border-radius: 0 0 var(--radius-card) var(--radius-card);
    border-left: none;
    border-right: none;
    border-top: none;
  }
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;

  .header-scrolled & {
    padding: var(--space-4) var(--space-6); // Оставляем одинаковый padding
  }

  @include breakpoint(md) {
    padding: var(--space-4) var(--space-6);
  }
}

.header-logo {
  .logo-button {
    @include button-reset;
    padding: var(--space-1);
    border-radius: var(--radius-button);
    transition: all var(--duration-base);

    &:hover {
      transform: scale(1.02);
      background: rgba(255, 255, 255, 0.05);
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-1) var(--space-2);
}

.logo-image {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-base);
  transition: transform var(--duration-base);

  .logo-button:hover & {
    transform: scale(1.1);
  }
}

.logo-text {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
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
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
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

  &:active {
    transform: scale(0.58);
  }

  :deep(svg) {
    position: relative;
    z-index: 1;
    transition: color var(--duration-base);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .header-island {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .logo-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .icon-button {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(93, 95, 239, 0.1);
    }
  }

  .user-avatar {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(sm) {
  .logo-text {
    display: block;
  }
}

@include breakpoint(xs) {
  .logo-text {
    display: none;
  }

  .header-container {
    padding: var(--space-3) var(--space-4);
  }

  .app-header {
    padding: 0 var(--space-2);
  }
}

// Добавляем отступ для контента под фиксированным header
:global(body) {
  padding-top: 100px;

  @include breakpoint(md) {
    padding-top: 120px;
  }
}
</style>
