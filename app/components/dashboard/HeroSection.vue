<template>
  <div class="hero-section">
    <div class="hero-background">
      <div class="gradient-orbit"></div>
      <div class="gradient-orbit delay-1"></div>
      <div class="gradient-orbit delay-2"></div>
    </div>

    <div class="hero-content">
      <div class="hero-text">
        <div class="greeting-section">
          <h1 class="hero-title">
            <span class="greeting-text">{{ greeting }}, Сергей!</span>
            <span class="waving-hand">👋</span>
          </h1>
          <div class="hero-subtitle">
            <Icon :name="dailyMotivation.icon" size="18" />
            <span>{{ dailyMotivation.text }}</span>
          </div>
        </div>

        <!-- Current Focus Session -->
        <div
          v-if="currentSession"
          class="focus-session-alert"
          @click="goToTimer"
        >
          <div class="focus-indicator">
            <div class="pulse-dot"></div>
            <Icon name="lucide:zap" size="16" />
          </div>
          <div class="focus-info">
            <div class="focus-header">
              <span class="focus-title">В процессе фокуса</span>
              <span class="focus-badge">{{
                timerStore.currentPhase === 'work' ? 'Работа' : 'Перерыв'
              }}</span>
            </div>
            <span class="focus-task">{{
              currentTaskTitle || 'Общая сессия'
            }}</span>
            <div class="focus-time">
              <Icon name="lucide:clock" size="14" />
              <span>{{ formattedTime }}</span>
            </div>
          </div>
          <button class="action-button primary" @click.stop="goToTimer">
            <Icon name="lucide:arrow-right" size="16" />
          </button>
        </div>

        <!-- Daily Progress -->
        <div v-else class="daily-progress">
          <div class="progress-header">
            <span class="progress-title">Прогресс дня</span>
            <span class="progress-value">{{ dailyProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${dailyProgress}%` }"
              :class="{ complete: dailyProgress === 100 }"
            ></div>
          </div>
          <div class="progress-stats">
            <div class="stat">
              <Icon name="lucide:check-circle" size="14" />
              <span>{{ completedTasks }}/{{ totalTasks }} задач</span>
            </div>
            <div class="stat">
              <Icon name="lucide:clock" size="14" />
              <span>{{ focusTimeToday }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          v-for="(action, index) in quickActions"
          :key="action.label"
          class="quick-action"
          :class="[action.color, { active: action.active }]"
          @click="handleAction(action)"
          :disabled="action.disabled"
        >
          <div class="action-icon" :class="action.color">
            <Icon :name="action.icon" size="20" />
          </div>
          <span class="action-label">{{ action.label }}</span>
          <div v-if="action.badge" class="action-badge">{{ action.badge }}</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timerStore = useTimerStore()
const tasksStore = useTasksStore()
const router = useRouter()

// Computed properties with real data
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
})

// Daily motivation based on user statistics
const dailyMotivation = computed(() => {
  const hour = new Date().getHours()
  const progress = dailyProgress.value
  const completed = completedTasks.value
  const total = totalTasks.value

  // Early morning - focus on planning
  if (hour < 9 && completed === 0) {
    return {
      icon: 'lucide:sunrise',
      text: 'Отличное время для планирования дня!',
    }
  }

  // Morning with good progress
  if (hour < 12 && progress >= 50) {
    return {
      icon: 'lucide:coffee',
      text: 'Отличное утро! Продолжайте в том же духе!',
    }
  }

  // Morning with low progress
  if (hour < 12 && progress < 30) {
    return {
      icon: 'lucide:target',
      text: 'Начните с самой важной задачи дня',
    }
  }

  // Afternoon with good progress
  if (hour < 17 && progress >= 70) {
    return {
      icon: 'lucide:zap',
      text: 'Отличная продуктивность!',
    }
  }

  // Afternoon with medium progress
  if (hour < 17 && progress >= 30) {
    return {
      icon: 'lucide:trending-up',
      text: 'Хорошие результаты! Не сбавляйте темп',
    }
  }

  // Afternoon with low progress
  if (hour < 17 && progress < 30) {
    return {
      icon: 'lucide:clock',
      text: 'Самое время взяться за задачи!',
    }
  }

  // Evening with completed tasks
  if (hour >= 17 && progress === 100) {
    return {
      icon: 'lucide:award',
      text: 'Все задачи выполнены! Отличный день!',
    }
  }

  // Evening with good progress
  if (hour >= 17 && progress >= 70) {
    return {
      icon: 'lucide:check-circle',
      text: 'Почти все готово! Завершите оставшееся',
    }
  }

  // Evening with work to do
  if (hour >= 17 && progress < 70) {
    return {
      icon: 'lucide:moon',
      text: 'Вечер - хорошее время для завершения задач',
    }
  }

  // Night time
  if (hour >= 22) {
    return {
      icon: 'lucide:star',
      text: 'Время отдохнуть и восстановить силы',
    }
  }

  // Default motivation
  return {
    icon: 'lucide:sparkles',
    text: 'Каждый шаг приближает к цели!',
  }
})

const currentSession = computed(() => timerStore.isRunning)
const formattedTime = computed(() => timerStore.formattedTime)

// Real data from stores
const currentTaskTitle = computed(() => {
  // In a real app, this would come from the current timer session
  return 'Разработка интерфейса TaskFlow'
})

const completedTasks = computed(() => {
  return tasksStore.completedTasks.length
})

const totalTasks = computed(() => {
  return tasksStore.tasks.length
})

const dailyProgress = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.min(
    100,
    Math.round((completedTasks.value / totalTasks.value) * 100)
  )
})

const focusTimeToday = computed(() => {
  // Calculate total focus time from today's sessions
  const todaySessions = timerStore.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  const totalMinutes = todaySessions.reduce((total, session) => {
    if (session.endAt) {
      const start = new Date(session.startAt)
      const end = new Date(session.endAt)
      return total + Math.round((end.getTime() - start.getTime()) / 60000)
    }
    return total
  }, 0)

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
})

// Quick Actions with real functionality
const quickActions = computed(() => [
  {
    icon: timerStore.isRunning ? 'lucide:pause' : 'lucide:play',
    label: timerStore.isRunning ? 'Пауза' : 'Фокус',
    color: 'primary',
    badge: timerStore.isRunning ? 'Активно' : null,
    active: timerStore.isRunning,
    handler: () => {
      if (timerStore.isRunning) {
        timerStore.pauseTimer()
      } else {
        timerStore.startTimer()
      }
    },
  },
  {
    icon: 'lucide:plus',
    label: 'Задача',
    color: 'secondary',
    handler: () => {
      // TODO: Open quick task modal
      console.log('Add quick task')
    },
  },
  {
    icon: 'lucide:bar-chart',
    label: 'Анализ',
    color: 'accent',
    badge:
      dailyProgress.value > 70
        ? 'Отлично!'
        : dailyProgress.value > 40
        ? 'Хорошо'
        : null,
    handler: () => router.push('/analytics'),
  },
])

// Methods
const handleAction = (action: any) => {
  action.handler()
}

const goToTimer = () => {
  router.push('/timer')
}
</script>

<style scoped lang="scss">
.hero-section {
  @include card;
  position: relative;
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: var(--shadow-lg);
  }

  @include breakpoint(md) {
    padding: var(--space-8) var(--space-6);
  }
}

.gradient-orbit {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    var(--accent-primary) 0%,
    transparent 70%
  );
  animation: float 12s ease-in-out infinite;
  filter: blur(20px);

  &:nth-child(1) {
    top: -100px;
    right: -50px;
    background: radial-gradient(
      circle,
      var(--accent-primary) 0%,
      transparent 70%
    );
  }

  &:nth-child(2) {
    bottom: -100px;
    left: -50px;
    background: radial-gradient(circle, var(--success) 0%, transparent 70%);
    animation-delay: -4s;
  }

  &:nth-child(3) {
    top: 50%;
    left: 20%;
    width: 150px;
    height: 150px;
    background: radial-gradient(
      circle,
      var(--accent-secondary) 0%,
      transparent 70%
    );
    animation-delay: -8s;
  }

  &.delay-1 {
    animation-delay: -2s;
  }

  &.delay-2 {
    animation-delay: -6s;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.3;
  }
  33% {
    transform: translateY(-20px) scale(1.05) rotate(120deg);
    opacity: 0.5;
  }
  66% {
    transform: translateY(10px) scale(0.95) rotate(240deg);
    opacity: 0.4;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);

  @include breakpoint(md) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }
}

.hero-text {
  flex: 1;
}

.greeting-section {
  margin-bottom: var(--space-5);
}

.hero-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.greeting-text {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @include breakpoint(md) {
    font-size: var(--text-3xl);
  }
}

.waving-hand {
  display: inline-block;
  font-size: var(--text-2xl);

  @include breakpoint(md) {
    font-size: var(--text-3xl);
  }
}

.hero-subtitle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-lg);
  line-height: var(--leading-relaxed);
  max-width: 400px;

  :deep(svg) {
    color: var(--accent-primary);
    flex-shrink: 0;
  }
}

// Focus Session Alert
.focus-session-alert {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(93, 95, 239, 0.1);
  border: 1px solid rgba(93, 95, 239, 0.2);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-primary);
  }

  &:hover {
    background: rgba(93, 95, 239, 0.15);
    transform: translateX(4px);
  }
}

.focus-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.3);
  }
}

.focus-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.focus-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.focus-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.focus-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: var(--space-1) var(--space-2);
  background: rgba(93, 95, 239, 0.2);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
}

.focus-task {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.focus-time {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--accent-primary);
  font-weight: var(--font-bold);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

// Daily Progress
.daily-progress {
  @include glass;
  padding: var(--space-4);

  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.progress-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.progress-value {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 3px;
  transition: width var(--duration-slow) var(--ease-bounce);

  &.complete {
    background: var(--success);
  }
}

.progress-stats {
  display: flex;
  gap: var(--space-4);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--text-muted);
  }
}

// Quick Actions
.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  flex-shrink: 0;

  @include breakpoint(sm) {
    gap: var(--space-4);
  }
}

.quick-action {
  @include button-reset;
  @include glass;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  min-width: 80px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: var(--shadow-md);

    .action-icon {
      transform: scale(1.1);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
  }

  &.primary:hover:not(:disabled) {
    color: var(--accent-primary);
  }

  &.secondary:hover:not(:disabled) {
    color: var(--success);
  }

  &.accent:hover:not(:disabled) {
    color: var(--accent-secondary);
  }
}

.action-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);

  &.primary {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }
}

.action-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.action-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--success);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  padding: 2px 6px;
  border-radius: 8px;
  line-height: 1;
}

.action-button {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  background: var(--accent-primary);
  color: white;
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    transform: scale(1.1);
    box-shadow: var(--glow-primary);
  }

  &.primary {
    background: var(--accent-primary);
  }
}

// Light theme fixes
[data-theme='light'] {
  .hero-section {
    background: linear-gradient(135deg, var(--card-bg) 0%, #f5f7ff 100%);
    border-color: rgba(0, 0, 0, 0.05);
  }

  .gradient-orbit {
    opacity: 0.05;
  }

  .daily-progress {
    background: var(--surface-bg);
    border-color: rgba(0, 0, 0, 0.05);
  }

  .quick-action {
    background: var(--surface-bg);
    border-color: rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .focus-session-alert {
    background: rgba(93, 95, 239, 0.05);
    border-color: rgba(93, 95, 239, 0.1);
  }

  .progress-bar {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
