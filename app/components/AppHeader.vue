<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Left Section: Greeting & Theme Toggle -->
      <div class="header-left">
        <div class="greeting-section">
          <h1 class="greeting">{{ greeting }}, Сергей!</h1>
          <p class="date-info">{{ currentDate }}</p>
        </div>
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
        <button
          class="icon-button"
          @click="toggleNotifications"
          title="Уведомления"
        >
          <Icon name="lucide:bell" size="20" />
          <span v-if="unreadNotifications" class="notification-badge">
            {{ unreadNotifications }}
          </span>
        </button>

        <!-- Quick Actions Menu -->
        <div class="dropdown">
          <button
            class="icon-button"
            @click="toggleQuickMenu"
            title="Быстрые действия"
          >
            <Icon name="lucide:plus" size="20" />
          </button>

          <div v-if="showQuickMenu" class="dropdown-menu">
            <button class="dropdown-item" @click="addQuickTask">
              <Icon name="lucide:plus-circle" size="16" />
              <span>Быстрая задача</span>
            </button>
            <button class="dropdown-item" @click="startFocusSession">
              <Icon name="lucide:play" size="16" />
              <span>Фокус-сессия</span>
            </button>
            <button class="dropdown-item" @click="showStats">
              <Icon name="lucide:bar-chart" size="16" />
              <span>Статистика</span>
            </button>
          </div>
        </div>

        <!-- User Profile -->
        <div class="user-profile">
          <button class="user-avatar" @click="goToProfile" title="Профиль">
            <span>С</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Status Bar (for notifications/messages) -->
    <div v-if="statusMessage" class="status-bar" :class="statusType">
      <Icon :name="statusIcon" size="16" />
      <span>{{ statusMessage }}</span>
      <button class="status-close" @click="clearStatus">
        <Icon name="lucide:x" size="14" />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
// Theme management
const theme = ref<'dark' | 'light' | 'auto'>('dark')

const themeIcon = computed(() => {
  switch (theme.value) {
    case 'dark':
      return 'lucide:moon'
    case 'light':
      return 'lucide:sun'
    case 'auto':
      return 'lucide:monitor'
    default:
      return 'lucide:moon'
  }
})

const themeButtonTitle = computed(() => {
  switch (theme.value) {
    case 'dark':
      return 'Тёмная тема'
    case 'light':
      return 'Светлая тема'
    case 'auto':
      return 'Системная тема'
    default:
      return 'Переключить тему'
  }
})

const toggleTheme = () => {
  const themes: ('dark' | 'light' | 'auto')[] = ['dark', 'light', 'auto']
  const currentIndex = themes.indexOf(theme.value)
  theme.value = themes[(currentIndex + 1) % themes.length]

  // Apply theme to document
  document.documentElement.setAttribute('data-theme', theme.value)
}

// Greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
})

// Current date
const currentDate = computed(() => {
  return new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
})

// Notifications
const unreadNotifications = ref(3)

const toggleNotifications = () => {
  // TODO: Implement notifications panel
  console.log('Open notifications')
  unreadNotifications.value = 0
}

// Quick Actions Menu
const showQuickMenu = ref(false)

const toggleQuickMenu = () => {
  showQuickMenu.value = !showQuickMenu.value
}

const addQuickTask = () => {
  // TODO: Implement quick task creation
  console.log('Add quick task')
  showQuickMenu.value = false
}

const startFocusSession = () => {
  // TODO: Navigate to timer and start session
  console.log('Start focus session')
  showQuickMenu.value = false
  navigateTo('/timer')
}

const showStats = () => {
  // TODO: Show quick stats modal
  console.log('Show stats')
  showQuickMenu.value = false
  navigateTo('/analytics')
}

// Status Bar
const statusMessage = ref('Время для фокус-сессии! 🎯')
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

const goToProfile = () => {
  router.push('/profile')
}

const navigateTo = (route: string) => {
  router.push(route)
}

// Close dropdown when clicking outside
onClickOutside(document.body, () => {
  if (showQuickMenu.value) {
    showQuickMenu.value = false
  }
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
  padding: var(--space-4) var(--space-4) var(--space-3);
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  flex: 1;
}

.greeting-section {
  .greeting {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: var(--space-1);
    line-height: 1.2;
  }

  .date-info {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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

// Dropdown Menu
.dropdown {
  position: relative;
}

.dropdown-menu {
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
.user-profile {
  margin-left: var(--space-1);
}

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

// Status Bar
.status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  &.info {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  &.success {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.warning {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.error {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.status-close {
  @include button-reset;
  @include flex-center;
  margin-left: auto;
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

// Responsive Design
@include breakpoint(sm) {
  .header-actions {
    gap: var(--space-3);
  }

  .greeting {
    font-size: var(--text-2xl) !important;
  }
}

@include breakpoint(md) {
  .greeting-section {
    .greeting {
      font-size: var(--text-2xl);
    }

    .date-info {
      font-size: var(--text-base);
    }
  }
}
</style>
