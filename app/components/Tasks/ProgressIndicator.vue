<template>
  <div class="progress-indicator">
    <div class="progress-header">
      <span class="progress-label">Прогресс</span>
      <span class="progress-value">{{ percentage }}%</span>
    </div>

    <div class="progress-visual">
      <!-- Dots Progress -->
      <div class="dots-progress">
        <div
          v-for="(dot, index) in dots"
          :key="index"
          class="progress-dot"
          :class="{
            'dot-completed': index < completedDots,
            'dot-current': index === completedDots && isActive,
          }"
        />
      </div>

      <!-- Bar Progress -->
      <div class="bar-progress">
        <div class="progress-track"></div>
        <div class="progress-fill" :style="{ width: `${percentage}%` }"></div>
      </div>
    </div>

    <div class="progress-stats">
      <div class="stat">
        <Icon name="lucide:clock" size="12" />
        <span>{{ formatTime(completed) }}</span>
        <span class="stat-label">/ {{ formatTime(total) }}</span>
      </div>
      <div class="stat">
        <Icon
          :name="isOnTrack ? 'lucide:trending-up' : 'lucide:trending-down'"
          size="12"
        />
        <span>{{ efficiency }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  completed: number // в минутах
  total: number // в минутах
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

const percentage = computed(() => {
  return Math.min(100, Math.round((props.completed / props.total) * 100))
})

const dots = computed(() => {
  const totalDots = 10
  return Array(totalDots).fill(0)
})

const completedDots = computed(() => {
  return Math.floor(percentage.value / 10)
})

const isOnTrack = computed(() => {
  return percentage.value >= 50
})

const efficiency = computed(() => {
  const expected =
    ((Date.now() - new Date().setHours(0, 0, 0, 0)) / (8 * 60 * 60 * 1000)) *
    props.total
  return Math.round((props.completed / expected) * 100) || 100
})

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${mins.toString().padStart(2, '0')}м`
  }
  return `${mins}м`
}
</script>

<style scoped lang="scss">
.progress-indicator {
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-card);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.progress-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--accent);
}

.progress-visual {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.dots-progress {
  display: flex;
  justify-content: space-between;
  gap: var(--space-1);
}

.progress-dot {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  transition: all var(--transition-base);

  &.dot-completed {
    background: var(--accent);
    box-shadow: 0 0 4px var(--accent);
  }

  &.dot-current {
    background: var(--accent);
    animation: pulse-dot 2s infinite;
  }
}

.bar-progress {
  position: relative;
  height: 4px;
  background: transparent;
  border-radius: 2px;
  overflow: hidden;
}

.progress-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: var(--gradient-primary);
  border-radius: 2px;
  transition: width var(--transition-slow);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);

  :deep(svg) {
    opacity: 0.7;
  }

  .stat-label {
    opacity: 0.6;
  }
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

// Light theme
[data-theme='light'] {
  .progress-indicator {
    background: rgba(0, 0, 0, 0.02);
  }

  .progress-dot {
    background: rgba(0, 0, 0, 0.1);
  }

  .progress-track {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
