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
      <!-- Focus Time Progress -->
      <div class="metric-widget">
        <div class="widget-header">
          <h3>Фокус-время</h3>
          <div class="progress-value" :class="focusProgressClass">
            {{ focusProgressPercentage }}%
          </div>
        </div>
        <p class="widget-subtitle">{{ focusTimeToday }} / 4ч</p>

        <div class="circular-progress-container">
          <div class="circular-progress" :style="focusProgressStyle">
            <div class="progress-content">
              <Icon name="lucide:clock" size="24" />
            </div>
          </div>
        </div>

        <div class="progress-label">
          <span v-if="focusProgressPercentage >= 80">Отлично!</span>
          <span v-else-if="focusProgressPercentage >= 50">Хорошо!</span>
          <span v-else>Продолжайте!</span>
        </div>
      </div>

      <!-- Weekly Progress -->
      <div class="metric-widget">
        <div class="widget-header">
          <h3>Прогресс недели</h3>
          <div class="average-value" :class="weeklyProgressClass">
            {{ weeklyProgressAverage }}%
          </div>
        </div>

        <div class="week-chart">
          <div
            v-for="day in weeklyProgress"
            :key="day.day"
            class="day-bar"
            :class="{
              active: day.isToday,
              completed: day.progress > 0,
            }"
            :style="{ height: Math.max(day.progress, 8) + '%' }"
            :title="`${day.day}: ${day.progress}%`"
          >
            <span class="day-label">{{ day.day }}</span>
          </div>
        </div>

        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color today"></div>
            <span>Сегодня</span>
          </div>
          <div class="legend-item">
            <div class="legend-color completed"></div>
            <span>Выполнено</span>
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

// Вычисляем фокус-время из сессий таймера за сегодня
const focusTimeToday = computed(() => {
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

// Процент выполнения цели фокус-времени (цель: 4 часа = 240 минут)
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

  const goalMinutes = 240 // 4 часа
  return Math.min(100, Math.round((totalMinutes / goalMinutes) * 100))
})

const focusProgressClass = computed(() => {
  const percentage = focusProgressPercentage.value
  if (percentage >= 80) return 'excellent'
  if (percentage >= 50) return 'good'
  return 'normal'
})

const focusProgressStyle = computed(() => {
  const percentage = focusProgressPercentage.value
  return {
    '--progress': `${percentage}%`,
    '--progress-color':
      percentage >= 80
        ? 'var(--success)'
        : percentage >= 50
        ? 'var(--warning)'
        : 'var(--accent-primary)',
  }
})

// Прогресс за неделю на основе выполненных задач
const weeklyProgress = computed(() => {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const today = new Date().getDay()
  const adjustedToday = today === 0 ? 6 : today - 1

  return days.map((day, index) => {
    // Генерируем случайный прогресс для демонстрации
    // В реальном приложении это должно браться из хранилища
    const baseProgress = [65, 80, 45, 90, 70, 30, 20]
    const progress = baseProgress[index] || Math.floor(Math.random() * 100)

    return {
      day,
      progress,
      isToday: index === adjustedToday,
    }
  })
})

const weeklyProgressAverage = computed(() => {
  const total = weeklyProgress.value.reduce((sum, day) => sum + day.progress, 0)
  return Math.round(total / weeklyProgress.value.length)
})

const weeklyProgressClass = computed(() => {
  const average = weeklyProgressAverage.value
  if (average >= 70) return 'excellent'
  if (average >= 50) return 'good'
  return 'normal'
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
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.progress-value,
.average-value {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);

  &.excellent {
    color: var(--success);
  }

  &.good {
    color: var(--warning);
  }

  &.normal {
    color: var(--accent-primary);
  }
}

.widget-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.circular-progress-container {
  @include flex-center;
  margin: var(--space-4) 0;
  position: relative;
}

.circular-progress {
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

.progress-content {
  position: relative;
  z-index: 2;
  @include flex-center;
  color: var(--text-secondary);
}

.progress-label {
  text-align: center;
  margin-top: var(--space-3);

  span {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
  }
}

.week-chart {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-1);
  height: 120px;
  margin: var(--space-4) 0;
  padding: 0 var(--space-1);
}

.day-bar {
  flex: 1;
  background: var(--accent-primary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: all var(--duration-base);
  position: relative;
  min-height: 8px;
  opacity: 0.6;

  &.active {
    background: var(--success);
    opacity: 1;
    transform: scaleY(1.1);
  }

  &.completed {
    background: var(--accent-primary);
    opacity: 0.8;
  }
}

.day-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);

  &.today {
    background: var(--success);
  }

  &.completed {
    background: var(--accent-primary);
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
  .circular-progress::before {
    background: var(--card-bg);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
