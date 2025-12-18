<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

interface Props {
  time: number // в миллисекундах
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  pulsating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  time: 0,
  active: false,
  size: 'md',
  showLabels: false,
  pulsating: true,
})

const emit = defineEmits<{
  'update:time': [time: number]
}>()

const isRunning = ref(false)
const startTime = ref<number | null>(null)
const timerInterval = ref<number | null>(null)

// Форматированное время
const formattedTime = computed(() => {
  const totalSeconds = Math.floor(props.time / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
})

// Классы таймера
const timerClasses = computed(() => [
  'timer',
  `timer--${props.size}`,
  {
    'timer--active': props.active,
    'timer--running': isRunning.value,
    'timer--pulsating': props.pulsating && props.active,
  },
])

// Запуск таймера
const start = () => {
  if (isRunning.value) return

  isRunning.value = true
  startTime.value = Date.now() - props.time

  timerInterval.value = window.setInterval(() => {
    if (startTime.value) {
      const elapsed = Date.now() - startTime.value
      emit('update:time', elapsed)
    }
  }, 1000)
}

// Пауза таймера
const pause = () => {
  if (!isRunning.value) return

  isRunning.value = false
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// Сброс таймера
const reset = () => {
  isRunning.value = false
  startTime.value = null

  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }

  emit('update:time', 0)
}

// Тоггл таймера
const toggle = () => {
  if (isRunning.value) {
    pause()
  } else {
    start()
  }
}

// Следим за изменениями active
watch(
  () => props.active,
  (active) => {
    if (active) {
      start()
    } else {
      pause()
    }
  }
)

// Очистка интервала при размонтировании
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

defineExpose({ start, pause, reset, toggle })
</script>

<template>
  <div :class="timerClasses">
    <!-- Метки времени -->
    <div v-if="showLabels" class="timer__labels">
      <span class="timer__label">Время</span>
    </div>

    <!-- Дисплей -->
    <div class="timer__display">
      <span class="timer__time">
        {{ formattedTime }}
      </span>

      <!-- Индикатор активности -->
      <span v-if="active" class="timer__indicator">
        <span class="timer__dot" />
      </span>
    </div>

    <!-- Управление (опционально) -->
    <div v-if="$slots.controls" class="timer__controls">
      <slot name="controls" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);

  // Размеры
  &--sm {
    .timer__display {
      font-size: var(--font-lg);
      padding: var(--spacing-xs) var(--spacing-md);
    }
  }

  &--md {
    .timer__display {
      font-size: var(--font-xl);
      padding: var(--spacing-sm) var(--spacing-lg);
    }
  }

  &--lg {
    .timer__display {
      font-size: var(--font-2xl);
      padding: var(--spacing-md) var(--spacing-xl);
    }
  }

  // Состояния
  &--active {
    .timer__display {
      border-color: var(--color-accent-medium);
    }
  }

  &--running {
    .timer__display {
      animation: timer-active 2s infinite;
    }
  }

  &--pulsating {
    .timer__dot {
      @include pulse-animation(var(--color-accent-medium));
    }
  }
}

.timer {
  &__labels {
    display: flex;
    gap: var(--spacing-md);
  }

  &__label {
    font-size: var(--font-sm);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__display {
    @include glass-container();
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-lg);
    font-family: 'Roboto Mono', monospace;
    font-weight: var(--font-weight-medium);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    transition: all var(--transition-medium);
    position: relative;
  }

  &__time {
    line-height: 1;
  }

  &__indicator {
    display: flex;
    align-items: center;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--color-accent-medium);
  }

  &__controls {
    display: flex;
    gap: var(--spacing-sm);
  }
}

// Анимации
@keyframes timer-active {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(var(--color-accent-medium-rgb), 0.2),
      var(--shadow-glass);
  }
  50% {
    box-shadow: 0 0 30px rgba(var(--color-accent-medium-rgb), 0.4),
      var(--shadow-glass);
  }
}

// Темная тема
.dark-theme {
  .timer {
    &--active {
      .timer__display {
        border-color: var(--color-accent-medium);
      }
    }
  }
}

// Адаптивность
@media (max-width: 640px) {
  .timer {
    &--lg {
      .timer__display {
        font-size: var(--font-xl);
        padding: var(--spacing-sm) var(--spacing-lg);
      }
    }
  }
}
</style>
