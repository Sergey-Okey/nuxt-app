<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  totalTime: number // в миллисекундах
  estimatedTime?: number // в минутах
  color?: string
  dotSize?: number
  dotSpacing?: number
  maxDots?: number
  showTime?: boolean
  timePerDot?: number // в миллисекундах на точку
}

const props = withDefaults(defineProps<Props>(), {
  totalTime: 0,
  estimatedTime: undefined,
  color: 'var(--color-accent-medium)',
  dotSize: 8,
  dotSpacing: 4,
  maxDots: 20,
  showTime: true,
  timePerDot: 5 * 60 * 1000, // 5 минут по умолчанию
})

// Количество заполненных точек
const filledDots = computed(() => {
  if (props.totalTime <= 0) return 0
  return Math.min(Math.floor(props.totalTime / props.timePerDot), props.maxDots)
})

// Общее количество точек (если есть оценка)
const totalDots = computed(() => {
  if (props.estimatedTime) {
    const estimatedMs = props.estimatedTime * 60 * 1000
    return Math.min(Math.ceil(estimatedMs / props.timePerDot), props.maxDots)
  }

  // Если нет оценки, показываем только заполненные + несколько пустых
  return Math.min(filledDots.value + 5, props.maxDots)
})

// Процент заполнения
const fillPercentage = computed(() => {
  if (!props.estimatedTime) return 0

  const estimatedMs = props.estimatedTime * 60 * 1000
  return Math.min((props.totalTime / estimatedMs) * 100, 100)
})

// Форматирование времени
const formattedTime = computed(() => {
  const totalMinutes = Math.floor(props.totalTime / (60 * 1000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
})

const formattedEstimatedTime = computed(() => {
  if (!props.estimatedTime) return ''

  const hours = Math.floor(props.estimatedTime / 60)
  const minutes = props.estimatedTime % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
})
</script>

<template>
  <div class="progress-dots">
    <!-- Время -->
    <div v-if="showTime" class="progress-dots__time">
      <span class="progress-dots__current-time">
        {{ formattedTime }}
      </span>

      <span v-if="estimatedTime" class="progress-dots__estimated-time">
        / {{ formattedEstimatedTime }}
      </span>
    </div>

    <!-- Точки -->
    <div class="progress-dots__container">
      <div
        v-for="i in totalDots"
        :key="i"
        class="progress-dot"
        :class="{
          'progress-dot--filled': i <= filledDots,
          'progress-dot--estimated': estimatedTime && i > filledDots,
        }"
        :style="{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          margin: `0 ${dotSpacing}px`,
          '--dot-color': color,
        }"
      />
    </div>

    <!-- Прогресс-бар (альтернатива) -->
    <div v-if="estimatedTime" class="progress-dots__bar">
      <div
        class="progress-dots__fill"
        :style="{
          width: `${fillPercentage}%`,
          backgroundColor: color,
        }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.progress-dots {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  &__time {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-family: 'Roboto Mono', monospace;
    font-size: var(--font-sm);
  }

  &__current-time {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  &__estimated-time {
    color: var(--color-text-muted);
  }

  &__container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__bar {
    width: 100%;
    height: 4px;
    background-color: var(--color-bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width var(--transition-medium);
  }
}

.progress-dot {
  border-radius: 50%;
  transition: all var(--transition-fast);
  flex-shrink: 0;

  &--filled {
    background-color: var(--dot-color);
    box-shadow: 0 0 8px var(--dot-color);
    animation: pulse 2s infinite;

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(var(--dot-color-rgb), 0.7);
      }
      70% {
        box-shadow: 0 0 0 4px rgba(var(--dot-color-rgb), 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(var(--dot-color-rgb), 0);
      }
    }
  }

  &--estimated {
    background-color: rgba(var(--dot-color-rgb), 0.2);
    border: 1px solid rgba(var(--dot-color-rgb), 0.3);
  }
}

// Адаптивность
@media (max-width: 640px) {
  .progress-dots__container {
    justify-content: flex-start;
  }
}
</style>
