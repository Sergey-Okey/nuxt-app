<template>
  <div class="content-section productivity-metrics">
    <div class="section-header">
      <h2>Продуктивность</h2>
      <button class="action-button secondary" @click="goToAnalytics">
        <span>Подробнее</span>
        <Icon name="lucide:arrow-right" size="16" />
      </button>
    </div>

    <div class="metrics-grid">
      <!-- Focus Time -->
      <div class="metric-widget">
        <div class="widget-header">
          <div class="widget-title">
            <Icon name="lucide:clock" size="20" />
            <h3>Фокус-время</h3>
          </div>
          <div class="progress-value" :class="focusProgressClass">
            {{ focusProgressPercentage }}%
          </div>
        </div>

        <div class="metric-content">
          <div class="time-display">
            <span class="current-time">{{ focusTimeToday }}</span>
            <span class="time-separator">/</span>
            <span class="target-time">4ч</span>
          </div>

          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="focusProgressClass"
              :style="{ width: `${focusProgressPercentage}%` }"
            ></div>
          </div>
        </div>

        <div class="metric-footer">
          <div class="session-count">
            <Icon name="lucide:play-circle" size="14" />
            <span>{{ todaySessionsCount }} сессий</span>
          </div>
          <div class="progress-label">
            <span v-if="focusProgressPercentage >= 80">Отлично!</span>
            <span v-else-if="focusProgressPercentage >= 50">Хорошо!</span>
            <span v-else-if="focusProgressPercentage > 0">Продолжайте!</span>
            <span v-else>Начните работу</span>
          </div>
        </div>
      </div>

      <!-- Task Completion -->
      <div class="metric-widget">
        <div class="widget-header">
          <div class="widget-title">
            <Icon name="lucide:check-circle" size="20" />
            <h3>Выполнено задач</h3>
          </div>
          <div class="progress-value" :class="taskProgressClass">
            {{ taskCompletionPercentage }}%
          </div>
        </div>

        <div class="metric-content">
          <div class="completion-display">
            <div class="completion-circle" :style="taskCompletionStyle">
              <div class="completion-content">
                <span class="completion-text"
                  >{{ completedTasks }}/{{ totalTasks }}</span
                >
              </div>
            </div>
          </div>

          <div class="completion-stats">
            <div class="stat-item">
              <Icon name="lucide:target" size="14" />
              <span>Цель: {{ dailyGoal }} задач</span>
            </div>
          </div>
        </div>

        <div class="metric-footer">
          <div class="streak-count">
            <Icon name="lucide:flame" size="14" />
            <span>Серия: {{ currentStreak }} дней</span>
          </div>
          <div class="progress-label">
            <span v-if="taskCompletionPercentage >= 100">Идеально!</span>
            <span v-else-if="taskCompletionPercentage >= 80">Отлично!</span>
            <span v-else-if="taskCompletionPercentage >= 50">Хорошо!</span>
            <span v-else>В процессе</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timerStore = useTimerStore()
const tasksStore = useTasksStore()
const router = useRouter()

// Daily goal for tasks
const dailyGoal = 8

// Today's sessions count
const todaySessionsCount = computed(() => {
  return timerStore.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  }).length
})

// Focus time calculations
const focusTimeToday = computed(() => {
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

// Focus progress percentage (goal: 4 hours = 240 minutes)
const focusProgressPercentage = computed(() => {
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

  const goalMinutes = 240 // 4 hours
  return Math.min(100, Math.round((totalMinutes / goalMinutes) * 100))
})

const focusProgressClass = computed(() => {
  const percentage = focusProgressPercentage.value
  if (percentage >= 80) return 'excellent'
  if (percentage >= 50) return 'good'
  if (percentage > 0) return 'normal'
  return 'empty'
})

// Task completion calculations
const completedTasks = computed(() => {
  return tasksStore.tasks.filter(
    (task) =>
      task.status === 'completed' &&
      new Date(task.createdAt).toDateString() === new Date().toDateString()
  ).length
})

const totalTasks = computed(() => {
  return tasksStore.tasks.filter(
    (task) =>
      new Date(task.createdAt).toDateString() === new Date().toDateString()
  ).length
})

const taskCompletionPercentage = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.min(
    100,
    Math.round((completedTasks.value / totalTasks.value) * 100)
  )
})

const taskProgressClass = computed(() => {
  const percentage = taskCompletionPercentage.value
  if (percentage >= 100) return 'excellent'
  if (percentage >= 80) return 'good'
  if (percentage >= 50) return 'normal'
  return 'empty'
})

const taskCompletionStyle = computed(() => {
  const percentage = taskCompletionPercentage.value
  return {
    '--progress': `${percentage}%`,
    '--progress-color':
      percentage >= 100
        ? 'var(--success)'
        : percentage >= 80
        ? 'var(--warning)'
        : 'var(--accent-primary)',
  }
})

// Streak calculation (simplified)
const currentStreak = computed(() => {
  // This would normally come from stats store
  // For now, return a mock value based on completion rate
  return taskCompletionPercentage.value >= 50 ? 3 : 0
})

const goToAnalytics = () => {
  router.push('/analytics')
}
</script>

<style scoped lang="scss">
.content-section {
  @include card;
  padding: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);

  @include breakpoint(sm) {
    grid-template-columns: 1fr 1fr;
  }
}

.metric-widget {
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.progress-value {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);

  &.excellent {
    color: var(--success);
    background: rgba(93, 242, 126, 0.1);
  }

  &.good {
    color: var(--warning);
    background: rgba(250, 204, 21, 0.1);
  }

  &.normal {
    color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
  }

  &.empty {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.05);
  }
}

.metric-content {
  flex: 1;
  margin-bottom: var(--space-4);
}

// Focus Time Widget Styles
.time-display {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.current-time {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.time-separator {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.target-time {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-4);
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width var(--duration-slow) var(--ease-bounce);

  &.excellent {
    background: var(--success);
  }

  &.good {
    background: var(--warning);
  }

  &.normal {
    background: var(--accent-primary);
  }

  &.empty {
    background: var(--text-muted);
  }
}

// Task Completion Widget Styles
.completion-display {
  @include flex-center;
  margin: var(--space-4) 0;
}

.completion-circle {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    var(--progress-color, var(--accent-primary)) var(--progress, 0%),
    rgba(255, 255, 255, 0.1) 0%
  );
  @include flex-center;

  &::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    background: var(--surface-bg);
    border-radius: 50%;
  }
}

.completion-content {
  position: relative;
  z-index: 2;
  @include flex-center;
  flex-direction: column;
}

.completion-text {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  text-align: center;
}

.completion-stats {
  margin-top: var(--space-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

// Metric Footer
.metric-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.session-count,
.streak-count {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.progress-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);

  span {
    &.excellent {
      color: var(--success);
    }

    &.good {
      color: var(--warning);
    }

    &.normal {
      color: var(--accent-primary);
    }

    &.empty {
      color: var(--text-secondary);
    }
  }
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }
}

// Light theme adjustments
[data-theme='light'] {
  .completion-circle::before {
    background: var(--card-bg);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .progress-bar {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
