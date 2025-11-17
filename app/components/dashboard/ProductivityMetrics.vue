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
          <div class="progress-value">{{ focusProgress.percentage }}%</div>
        </div>
        <p class="widget-subtitle">
          {{ focusProgress.total }} / {{ focusProgress.goal }}
        </p>

        <div class="circular-progress-container">
          <div class="circular-progress" :style="focusProgressStyle">
            <div class="progress-content">
              <Icon name="lucide:clock" size="24" />
            </div>
          </div>
        </div>
      </div>

      <!-- Weekly Progress -->
      <div class="metric-widget">
        <div class="widget-header">
          <h3>Прогресс недели</h3>
          <div class="average-value">{{ averageProgress }}%</div>
        </div>

        <div class="week-chart">
          <div
            v-for="day in weekProgress"
            :key="day.day"
            class="day-bar"
            :class="{ active: day.isToday }"
            :style="{ height: day.progress + '%' }"
          >
            <span class="day-label">{{ day.day }}</span>
          </div>
        </div>

        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color current"></div>
            <span>Сегодня</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const statsStore = useStatsStore()
const router = useRouter()

const focusProgress = computed(() => statsStore.focusProgress)
const weekProgress = computed(() => statsStore.weekProgress)

const focusProgressStyle = computed(() => {
  const percentage = focusProgress.value.percentage
  return {
    '--progress': `${percentage}%`,
    '--progress-color':
      percentage > 70
        ? 'var(--success)'
        : percentage > 40
        ? 'var(--warning)'
        : 'var(--error)',
  }
})

const averageProgress = computed(() => {
  const total = weekProgress.value.reduce((sum, day) => sum + day.progress, 0)
  return Math.round(total / weekProgress.value.length)
})

const goToAnalytics = () => {
  router.push('/analytics')
}
</script>

<style scoped lang="scss">
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
  color: var(--accent-primary);
}

.widget-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.circular-progress-container {
  @include flex-center;
  margin: var(--space-4) 0;
}

.circular-progress {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    var(--progress-color, var(--accent-primary)) var(--progress, 0%),
    var(--surface-bg) 0%
  );
  @include flex-center;

  &::before {
    content: '';
    position: absolute;
    width: 80px;
    height: 80px;
    background: var(--card-bg);
    border-radius: 50%;
  }
}

.progress-content {
  position: relative;
  z-index: 2;
  @include flex-center;
  color: var(--text-secondary);
}

.week-chart {
  display: flex;
  align-items: end;
  gap: var(--space-2);
  height: 120px;
  margin: var(--space-4) 0;
}

.day-bar {
  flex: 1;
  background: var(--accent-primary);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);
  position: relative;
  min-height: 4px;

  &.active {
    background: var(--success);
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
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: var(--space-4);
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

  &.current {
    background: var(--success);
  }
}
</style>
