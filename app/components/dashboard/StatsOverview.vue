<template>
  <div class="stats-overview">
    <!-- Completed Tasks -->
    <div class="stat-card success">
      <div class="stat-icon">
        <Icon name="lucide:check-circle" size="20" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ completedTasks }}</div>
        <div class="stat-label">Выполнено задач</div>
        <div class="stat-trend" :class="tasksTrend.type">
          <Icon :name="tasksTrend.icon" size="12" />
          <span>{{ tasksTrend.value }}</span>
        </div>
      </div>
    </div>

    <!-- Focus Time -->
    <div class="stat-card accent">
      <div class="stat-icon">
        <Icon name="lucide:clock" size="20" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ focusTime }}</div>
        <div class="stat-label">Фокус-время</div>
        <div class="stat-trend" :class="focusTrend.type">
          <Icon :name="focusTrend.icon" size="12" />
          <span>{{ focusTrend.value }}</span>
        </div>
      </div>
    </div>

    <!-- Active Tasks -->
    <div class="stat-card warning">
      <div class="stat-icon">
        <Icon name="lucide:list" size="20" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ activeTasks }}</div>
        <div class="stat-label">Активные задачи</div>
        <div class="stat-trend" :class="activeTasksTrend.type">
          <Icon :name="activeTasksTrend.icon" size="12" />
          <span>{{ activeTasksTrend.value }}</span>
        </div>
      </div>
    </div>

    <!-- Completion Rate -->
    <div class="stat-card info">
      <div class="stat-icon">
        <Icon name="lucide:bar-chart" size="20" />
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ completionRate }}%</div>
        <div class="stat-label">Выполнение</div>
        <div class="stat-trend" :class="completionTrend.type">
          <Icon :name="completionTrend.icon" size="12" />
          <span>{{ completionTrend.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

// Выполненные задачи сегодня
const completedTasks = computed(() => {
  return (
    tasksStore.todayTasks?.filter((task) => task.status === 'completed')
      .length || 0
  )
})

// Активные задачи сегодня
const activeTasks = computed(() => {
  return (
    tasksStore.todayTasks?.filter((task) => task.status === 'active').length ||
    0
  )
})

// Общее количество задач сегодня
const totalTasks = computed(() => {
  return tasksStore.todayTasks?.length || 0
})

// Процент выполнения
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
})

// Фокус-время сегодня (в часах и минутах)
const focusTime = computed(() => {
  const todaySessions = timerStore.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  const totalMinutes = todaySessions.reduce((total, session) => {
    if (session.endAt && session.phase === 'work') {
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

// Тренд выполнения задач
const tasksTrend = computed(() => {
  const completed = completedTasks.value
  if (completed >= 8)
    return { type: 'positive', value: 'Отлично!', icon: 'lucide:trending-up' }
  if (completed >= 5)
    return { type: 'positive', value: 'Хорошо', icon: 'lucide:trending-up' }
  if (completed >= 3)
    return { type: 'neutral', value: 'Норма', icon: 'lucide:minus' }
  return { type: 'negative', value: 'Мало', icon: 'lucide:trending-down' }
})

// Тренд фокус-времени
const focusTrend = computed(() => {
  const todaySessions = timerStore.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  const totalMinutes = todaySessions.reduce((total, session) => {
    if (session.endAt && session.phase === 'work') {
      const start = new Date(session.startAt)
      const end = new Date(session.endAt)
      return total + Math.round((end.getTime() - start.getTime()) / 60000)
    }
    return total
  }, 0)

  if (totalMinutes >= 180)
    return { type: 'positive', value: 'Много', icon: 'lucide:trending-up' }
  if (totalMinutes >= 120)
    return { type: 'positive', value: 'Хорошо', icon: 'lucide:trending-up' }
  if (totalMinutes >= 60)
    return { type: 'neutral', value: 'Норма', icon: 'lucide:minus' }
  return { type: 'negative', value: 'Мало', icon: 'lucide:trending-down' }
})

// Тренд активных задач
const activeTasksTrend = computed(() => {
  const active = activeTasks.value
  if (active === 0)
    return {
      type: 'positive',
      value: 'Все сделано!',
      icon: 'lucide:check-circle',
    }
  if (active <= 3)
    return { type: 'positive', value: 'Мало', icon: 'lucide:trending-down' }
  if (active <= 6)
    return { type: 'neutral', value: 'Норма', icon: 'lucide:minus' }
  return { type: 'negative', value: 'Много', icon: 'lucide:alert-circle' }
})

// Тренд процента выполнения
const completionTrend = computed(() => {
  const rate = completionRate.value
  if (rate >= 90)
    return { type: 'positive', value: 'Отлично!', icon: 'lucide:trending-up' }
  if (rate >= 70)
    return { type: 'positive', value: 'Хорошо', icon: 'lucide:trending-up' }
  if (rate >= 50)
    return { type: 'neutral', value: 'Норма', icon: 'lucide:minus' }
  return { type: 'negative', value: 'Низко', icon: 'lucide:trending-down' }
})
</script>

<style scoped lang="scss">
.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);

  @include breakpoint(sm) {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-5);
  }
}

.stat-card {
  @include card;
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
  }

  &.success::before {
    background: var(--success);
  }

  &.accent::before {
    background: var(--accent-primary);
  }

  &.warning::before {
    background: var(--warning);
  }

  &.info::before {
    background: var(--info);
  }
}

.stat-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-card);
  margin-bottom: var(--space-3);

  .stat-card.success & {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  .stat-card.accent & {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  .stat-card.warning & {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  .stat-card.info & {
    background: rgba(96, 165, 250, 0.1);
    color: var(--info);
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  font-weight: var(--font-medium);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  width: fit-content;

  &.positive {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.negative {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.neutral {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .stat-trend {
    &.neutral {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
