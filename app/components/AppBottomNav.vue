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
  bottom: 0.5rem;
  left: 0.5rem;
  right: 0.5rem;
  background: rgba(var(--card-bg-rgb), 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-card);
  display: flex;
  padding: var(--space-2) var(--space-3);
  z-index: var(--z-fixed);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
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
  position: relative;
  backdrop-filter: blur(10px);

  &.active {
    color: var(--accent-primary);
    background: rgba(var(--accent-primary-rgb), 0.12);

    :deep(svg) {
      color: var(--accent-primary);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      width: 4px;
      height: 4px;
      background: var(--accent-primary);
      border-radius: var(--radius-full);
      box-shadow: var(--glow-primary);
    }
  }

  &:hover:not(.active) {
    background: rgba(var(--surface-bg-rgb), 0.6);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.nav-label {
  font-size: 10px;
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
}

// Адаптивность для больших экранов
@include breakpoint(lg) {
  .bottom-nav {
    left: 50%;
    transform: translateX(-50%);
    max-width: 400px;
  }
}

// Анимация для активного состояния
.nav-item.active .nav-label {
  font-weight: var(--font-semibold);
}

[data-theme='light'] {
  .bottom-nav {
    background: rgba(var(--card-bg-rgb), 0.85);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .nav-item {
    &:hover:not(.active) {
      background: rgba(var(--surface-bg-rgb), 0.4);
    }
  }
}
</style>
