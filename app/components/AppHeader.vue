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
            @click="toggleNotifications"
            title="Уведомления"
          >
            <Icon name="lucide:bell" size="20" />
            <span
              v-if="unreadNotificationsCount > 0"
              class="notification-badge"
            >
              {{ unreadNotificationsCount }}
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div v-if="showNotifications" class="notifications-dropdown">
            <div class="dropdown-header">
              <h3>Уведомления</h3>
              <button class="clear-button" @click="markAllAsRead">
                Прочитать все
              </button>
            </div>

            <div class="notifications-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
                @click="markAsRead(notification.id)"
              >
                <div class="notification-icon">
                  <Icon :name="notification.icon" size="16" />
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">
                    {{ notification.message }}
                  </div>
                </div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>

              <div
                v-if="notifications.length === 0"
                class="empty-notifications"
              >
                <Icon name="lucide:bell-off" size="24" />
                <p>Нет уведомлений</p>
              </div>
            </div>
          </div>
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
</template>

<script setup lang="ts">
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

// Notifications
const showNotifications = ref(false)
const unreadNotificationsCount = ref(3)

const notifications = ref([
  {
    id: '1',
    title: 'Добро пожаловать!',
    message: 'Начните использовать TaskFlow',
    icon: 'lucide:info',
    read: false,
    time: '2м назад',
  },
  {
    id: '2',
    title: 'Время для фокуса',
    message: 'Вы давно не использовали таймер',
    icon: 'lucide:clock',
    read: false,
    time: '30м назад',
  },
  {
    id: '3',
    title: 'Задача выполнена',
    message: 'Прототип интерфейса завершен',
    icon: 'lucide:check-circle',
    read: true,
    time: '2ч назад',
  },
])

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showQuickCreate.value = false // Close other dropdown
}

const markAsRead = (id: string) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification && !notification.read) {
    notification.read = true
    unreadNotificationsCount.value--
  }
}

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    if (!notification.read) {
      notification.read = true
    }
  })
  unreadNotificationsCount.value = 0
}

// Quick Create
const showQuickCreate = ref(false)

const toggleQuickCreate = () => {
  showQuickCreate.value = !showQuickCreate.value
  showNotifications.value = false // Close other dropdown
}

const createQuickTask = () => {
  console.log('Create quick task')
  showQuickCreate.value = false
  // Здесь можно открыть модалку создания задачи
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
  showNotifications.value = false
  showQuickCreate.value = false
}

// Listen for clicks outside
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

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  width: 320px;
  max-height: 400px;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  z-index: var(--z-dropdown);
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

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0;
    font-size: var(--text-lg);
    color: var(--text-primary);
  }
}

.clear-button {
  @include button-reset;
  font-size: var(--text-sm);
  color: var(--accent-primary);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.1);
  }
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
  padding: var(--space-2);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-base);
  border-left: 3px solid transparent;

  &:hover {
    background: var(--surface-bg);
  }

  &.unread {
    border-left-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
  }
}

.notification-icon {
  @include flex-center;
  margin-top: 2px;
  flex-shrink: 0;

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.notification-content {
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
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
  white-space: nowrap;
}

.empty-notifications {
  @include flex-center;
  flex-direction: column;
  padding: var(--space-8) var(--space-4);
  color: var(--text-secondary);
  text-align: center;

  :deep(svg) {
    margin-bottom: var(--space-3);
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: var(--text-sm);
  }
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
