<template>
  <nav class="bottom-nav">
    <button
      v-for="nav in navigation"
      :key="nav.name"
      class="nav-item"
      :class="{ active: activeNav === nav.name }"
      @click="navigateTo(nav.route)"
    >
      <Icon :name="nav.icon" size="20" />
      <span class="nav-label">{{ nav.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const activeNav = computed(() => {
  return route.name?.toString().split('___')[0] || 'dashboard'
})

const navigation = [
  { name: 'dashboard', icon: 'lucide:home', label: 'Главная', route: '/' },
  {
    name: 'tasks',
    icon: 'lucide:check-square',
    label: 'Задачи',
    route: '/tasks',
  },
  { name: 'timer', icon: 'lucide:clock', label: 'Таймер', route: '/timer' },
  {
    name: 'analytics',
    icon: 'lucide:bar-chart',
    label: 'Аналитика',
    route: '/analytics',
  },
  { name: 'profile', icon: 'lucide:user', label: 'Профиль', route: '/profile' },
]

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 15, 15, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  padding: var(--space-2) var(--space-3);
  z-index: var(--z-fixed);
}

.nav-item {
  @include button-reset;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  font-size: var(--text-xs);

  &.active {
    color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);

    :deep(svg) {
      color: var(--accent-primary);
    }
  }

  &:hover:not(.active) {
    background: var(--surface-bg);
  }
}

.nav-label {
  font-size: 10px;
  font-weight: var(--font-medium);
}
</style>
