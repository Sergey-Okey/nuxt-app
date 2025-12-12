<template>
  <div class="task-timer" :class="{ active: isActive }">
    <!-- Таймер с точками прогресса -->
    <div class="timer-display">
      <div class="timer-dots">
        <div
          v-for="(dot, index) in dots"
          :key="index"
          class="timer-dot"
          :class="{
            filled: dot.filled,
            current: dot.current,
            past: dot.past,
          }"
          @click="setProgress((index + 1) * 10)"
        >
          <div class="dot-fill" :style="dotFillStyle(dot)"></div>
        </div>
      </div>

      <!-- Время и управление -->
      <div class="timer-controls">
        <div class="timer-time">
          <span class="time-minutes">{{ minutes }}</span>
          <span class="time-colon">:</span>
          <span class="time-seconds">{{ seconds }}</span>
        </div>

        <div class="timer-buttons">
          <button
            class="timer-button play-pause"
            @click="toggleTimer"
            :title="isRunning ? 'Пауза' : 'Старт'"
          >
            <Icon
              :name="isRunning ? 'lucide:pause' : 'lucide:play'"
              size="16"
            />
          </button>

          <button
            class="timer-button reset"
            @click="resetTimer"
            title="Сбросить"
          >
            <Icon name="lucide:rotate-ccw" size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Прогресс-бар -->
    <div class="timer-progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      <div class="progress-markers">
        <div
          v-for="marker in 10"
          :key="marker"
          class="progress-marker"
          :style="{ left: `${marker * 10}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

interface Props {
  taskId: string
  initialTime?: number // в секундах
  autoStart?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialTime: 25 * 60, // 25 минут
  autoStart: false,
})

const emit = defineEmits(['start', 'pause', 'complete', 'progress'])

// Состояние таймера
const isRunning = ref(false)
const timeLeft = ref(props.initialTime)
const totalTime = ref(props.initialTime)
const intervalId = ref<NodeJS.Timeout | null>(null)
const isActive = ref(false)

// Точки прогресса (10 точек = 100%)
const dots = computed(() => {
  const totalDots = 10
  const filledDots = Math.floor((progress.value / 100) * totalDots)

  return Array.from({ length: totalDots }, (_, index) => {
    const dotProgress = (index + 1) * 10
    return {
      index,
      filled: dotProgress <= progress.value,
      current: Math.floor(progress.value / 10) === index,
      past: index < filledDots - 1,
    }
  })
})

// Прогресс в процентах
const progress = computed(() => {
  return ((totalTime.value - timeLeft.value) / totalTime.value) * 100
})

// Форматированное время
const minutes = computed(() => {
  return Math.floor(timeLeft.value / 60)
    .toString()
    .padStart(2, '0')
})

const seconds = computed(() => {
  return (timeLeft.value % 60).toString().padStart(2, '0')
})

// Стили для заполнения точки
const dotFillStyle = (dot: any) => {
  if (!dot.filled) return {}

  const fillProgress = Math.min(
    100,
    ((progress.value - dot.index * 10) / 10) * 100
  )

  return {
    width: `${fillProgress}%`,
    height: `${fillProgress}%`,
  }
}

// Методы управления таймером
const startTimer = () => {
  if (isRunning.value || timeLeft.value <= 0) return

  isRunning.value = true
  isActive.value = true

  intervalId.value = setInterval(() => {
    timeLeft.value--
    emit('progress', progress.value)

    if (timeLeft.value <= 0) {
      completeTimer()
    }
  }, 1000)

  emit('start')
}

const pauseTimer = () => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
  isRunning.value = false
  emit('pause')
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const resetTimer = () => {
  pauseTimer()
  timeLeft.value = totalTime.value
  isActive.value = false
  emit('progress', 0)
}

const completeTimer = () => {
  pauseTimer()
  isActive.value = true
  emit('complete')
}

const setProgress = (percent: number) => {
  if (isRunning.value) return

  const newProgress = Math.max(0, Math.min(100, percent))
  timeLeft.value = totalTime.value * (1 - newProgress / 100)
  isActive.value = newProgress > 0
  emit('progress', newProgress)
}

// Установка времени в минутах
const setTime = (minutes: number) => {
  totalTime.value = minutes * 60
  timeLeft.value = totalTime.value
  resetTimer()
}

// Автозапуск
if (props.autoStart) {
  startTimer()
}

// Очистка интервала при размонтировании
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

// Сохранение состояния в localStorage
const saveState = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      `task-timer-${props.taskId}`,
      JSON.stringify({
        timeLeft: timeLeft.value,
        totalTime: totalTime.value,
        isActive: isActive.value,
      })
    )
  }
}

const loadState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`task-timer-${props.taskId}`)
    if (saved) {
      try {
        const state = JSON.parse(saved)
        timeLeft.value = state.timeLeft || props.initialTime
        totalTime.value = state.totalTime || props.initialTime
        isActive.value = state.isActive || false
      } catch (e) {
        console.error('Error loading timer state:', e)
      }
    }
  }
}

// Загрузка состояния при монтировании
onMounted(() => {
  loadState()
})

// Автосохранение при изменениях
watch([timeLeft, isActive], () => {
  saveState()
})

defineExpose({
  startTimer,
  pauseTimer,
  resetTimer,
  setTime,
  progress,
  isRunning,
})
</script>

<style scoped lang="scss">
.task-timer {
  --timer-accent: var(--accent);
  --timer-bg: rgba(93, 95, 239, 0.05);
  --timer-border: rgba(93, 95, 239, 0.1);
  --dot-size: 32px;
  --dot-gap: 8px;

  background: var(--timer-bg);
  border: 1px solid var(--timer-border);
  border-radius: var(--radius-card);
  padding: var(--space-4);
  transition: all var(--duration-base);

  &.active {
    --timer-bg: rgba(93, 95, 239, 0.1);
    --timer-border: rgba(93, 95, 239, 0.2);
    box-shadow: 0 0 0 1px rgba(93, 95, 239, 0.1);
  }
}

.timer-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.timer-dots {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 calc(var(--dot-gap) / 2);
}

.timer-dot {
  position: relative;
  width: var(--dot-size);
  height: var(--dot-size);
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.1);
    border-color: var(--timer-accent);
  }

  &.filled {
    border-color: var(--timer-accent);
  }

  &.current {
    border-color: var(--timer-accent);
    box-shadow: 0 0 12px rgba(93, 95, 239, 0.3);
  }

  &.past .dot-fill {
    background: var(--timer-accent);
  }
}

.dot-fill {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(93, 95, 239, 0.3);
  border-radius: 50%;
  transition: all var(--duration-base);
  width: 0%;
  height: 0%;
}

.timer-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timer-time {
  display: flex;
  align-items: baseline;
  font-family: 'Inter', monospace;
  font-variant-numeric: tabular-nums;
}

.time-minutes {
  font-size: 32px;
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.time-colon {
  font-size: 24px;
  color: var(--timer-accent);
  margin: 0 2px;
}

.time-seconds {
  font-size: 20px;
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.timer-buttons {
  display: flex;
  gap: var(--space-2);
}

.timer-button {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--timer-accent);
  color: white;
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(93, 95, 239, 0.3);
  }

  &.reset {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
}

.timer-progress-bar {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 2px;
  transition: width 1s linear;
}

.progress-markers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.progress-marker {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-50%);

  &:nth-child(5) {
    height: 8px;
    top: -2px;
    background: rgba(255, 255, 255, 0.2);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .task-timer {
    --timer-bg: rgba(93, 95, 239, 0.03);
    --timer-border: rgba(93, 95, 239, 0.1);
  }

  .timer-dot {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .timer-progress-bar {
    background: rgba(0, 0, 0, 0.05);
  }

  .progress-marker {
    background: rgba(0, 0, 0, 0.1);

    &:nth-child(5) {
      background: rgba(0, 0, 0, 0.2);
    }
  }
}
</style>
