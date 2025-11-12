<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="header-logo">
        <button class="logo-button" @click="goToHome">
          <Icon name="lucide:rocket" size="24" />
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

        <!-- Quick Create -->
        <div class="quick-create-wrapper">
          <button
            class="icon-button"
            @click="toggleQuickCreate"
            title="Быстрое создание"
          >
            <Icon name="lucide:plus" size="20" />
          </button>

          <!-- Quick Create Dropdown -->
          <div v-if="showQuickCreate" class="quick-create-dropdown">
            <button class="dropdown-item" @click="createQuickTask">
              <Icon name="lucide:check-square" size="16" />
              <span>Быстрая задача</span>
            </button>
            <button class="dropdown-item" @click="startFocusSession">
              <Icon name="lucide:clock" size="16" />
              <span>Фокус-сессия</span>
            </button>
            <button class="dropdown-item" @click="addQuickNote">
              <Icon name="lucide:sticky-note" size="16" />
              <span>Быстрая заметка</span>
            </button>
          </div>
        </div>

        <!-- User Profile -->
        <button class="user-avatar" @click="goToProfile" title="Профиль">
          <span>С</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Notifications Modal -->
  <AppNotificationsModal />
</template>

<script setup lang="ts">
// Импортируем store
const notificationsStore = useNotificationsStore()

// Theme management - исправляем инициализацию
const theme = ref<'dark' | 'light'>('dark')

// Гарантируем что themeIcon всегда будет строкой
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

// Notifications
const unreadCount = computed(() => notificationsStore.unreadCount)

const openNotifications = () => {
  notificationsStore.openModal()
}

// Quick Create
const showQuickCreate = ref(false)

const toggleQuickCreate = () => {
  showQuickCreate.value = !showQuickCreate.value
}

const createQuickTask = () => {
  console.log('Create quick task')
  showQuickCreate.value = false
}

const startFocusSession = () => {
  console.log('Start focus session')
  showQuickCreate.value = false
  navigateTo('/timer')
}

const addQuickNote = () => {
  console.log('Add quick note')
  showQuickCreate.value = false
}

// Navigation
const router = useRouter()

const goToHome = () => {
  router.push('/')
}

const goToProfile = () => {
  router.push('/profile')
}

const navigateTo = (route: string) => {
  router.push(route)
}

// Close dropdowns when clicking outside
const closeDropdowns = () => {
  showQuickCreate.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.header-actions')) {
      closeDropdowns()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns)
})
</script>

<style scoped lang="scss">
.app-header {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
    width: 44px;
    height: 44px;
    border-radius: var(--radius-button);
    background: var(--gradient-primary);
    color: white;
    transition: all var(--duration-base);

    &:hover {
      transform: scale(1.05);
      box-shadow: var(--glow-primary);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
}

.icon-button {
  @include button-reset;
  @include flex-center;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
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

// Quick Create
.quick-create-wrapper {
  position: relative;
}

.quick-create-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  padding: var(--space-2);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  z-index: var(--z-dropdown);
  min-width: 180px;
  animation: slideDown 0.2s ease-out;
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

.dropdown-item {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  border-radius: var(--radius-base);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover {
    background: var(--surface-bg);
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

// User Profile
.user-avatar {
  @include button-reset;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  @include flex-center;
  font-weight: var(--font-bold);
  color: white;
  box-shadow: var(--glow-primary);
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--glow-primary), 0 0 20px rgba(93, 95, 239, 0.4);
  }
}

// Responsive
@include breakpoint(sm) {
  .header-actions {
    gap: var(--space-3);
  }
}
</style>
