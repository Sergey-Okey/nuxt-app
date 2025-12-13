<template>
  <div class="task-timer" :class="{ compact }">
    <!-- Timer Display -->
    <div class="timer-display" @click="toggleTimer">
      <div class="timer-circle" :class="{ running: timerStore.isRunning }">
        <div
          class="timer-progress"
          :style="{ '--progress': progressPercentage + '%' }"
        >
          <svg class="progress-ring" viewBox="0 0 100 100">
            <circle class="progress-ring-background" cx="50" cy="50" r="45" />
            <circle
              class="progress-ring-fill"
              cx="50"
              cy="50"
              r="45"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumferenceOffset"
            />
          </svg>
          <div class="timer-content">
            <Icon
              :name="timerStore.isRunning ? 'lucide:pause' : 'lucide:play'"
              size="14"
              class="timer-icon"
            />
            <div class="timer-minutes">{{ currentTimeDisplay }}</div>
          </div>
        </div>
      </div>

      <!-- Timer Info -->
      <div class="timer-info">
        <div class="timer-phase">{{ phaseLabel }}</div>
        <div class="timer-dots">
          <div
            v-for="dot in totalDots"
            :key="dot"
            class="timer-dot"
            :class="{
              active: activeDots >= dot,
              current: activeDots === dot - 1 && timerStore.isRunning,
            }"
          ></div>
        </div>
        <div class="timer-total">
          {{ formatTime(totalTime) }} / {{ formatTime(taskEstimatedTime) }}
        </div>
      </div>
    </div>

    <!-- Timer Controls -->
    <div v-if="showControls" class="timer-controls">
      <button
        class="timer-button"
        :class="{ active: timerStore.isRunning }"
        @click.stop="toggleTimer"
      >
        <Icon
          :name="timerStore.isRunning ? 'lucide:pause' : 'lucide:play'"
          size="14"
        />
        <span>{{ timerStore.isRunning ? 'Пауза' : 'Старт' }}</span>
      </button>

      <button
        class="timer-button reset"
        @click.stop="resetTimer"
        :disabled="!canReset"
      >
        <Icon name="lucide:rotate-ccw" size="14" />
        <span>Сброс</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  taskId: string
  showControls?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControls: true,
  compact: false,
})

const emit = defineEmits(['start', 'pause', 'reset'])

// Stores
const timerStore = useTimerStore()
const tasksStore = useTasksStore()

// Timer constants
const radius = 45
const circumference = 2 * Math.PI * radius

// Computed
const isCurrentTask = computed(() => timerStore.currentTaskId === props.taskId)

const task = computed(() => tasksStore.tasks.find((t) => t.id === props.taskId))

const taskEstimatedTime = computed(
  () => (task.value?.estimatedMinutes || 25) * 60 // в секундах
)

const currentTaskTime = computed(() => {
  if (!isCurrentTask.value) return 0
  return timerStore.timeLeft
})

const totalTime = computed(() => {
  if (!isCurrentTask.value) return taskEstimatedTime.value
  return timerStore.settings[timerStore.currentPhase]
})

const progressPercentage = computed(() => {
  if (!isCurrentTask.value) return 0
  const total = totalTime.value
  const left = currentTaskTime.value
  return ((total - left) / total) * 100
})

const circumferenceOffset = computed(() => {
  const progress = 100 - progressPercentage.value
  return circumference - (progress / 100) * circumference
})

const currentTimeDisplay = computed(() => {
  if (!isCurrentTask.value) {
    return formatTime(taskEstimatedTime.value)
  }

  const minutes = Math.floor(timerStore.timeLeft / 60)
  const seconds = timerStore.timeLeft % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
})

// Dots progress
const totalDots = computed(() => {
  if (!isCurrentTask.value) return 5
  const minutes = totalTime.value / 60
  return Math.min(10, Math.max(3, Math.floor(minutes / 5)))
})

const activeDots = computed(() => {
  if (!isCurrentTask.value) return 0
  return Math.floor((progressPercentage.value / 100) * totalDots.value)
})

const phaseLabel = computed(() => {
  if (!isCurrentTask.value) return 'Готов к работе'

  const phases = {
    work: 'Фокус',
    short_break: 'Короткий перерыв',
    long_break: 'Длинный перерыв',
  }
  return phases[timerStore.currentPhase] || 'Таймер'
})

const canReset = computed(() => {
  return (
    isCurrentTask.value &&
    (timerStore.isRunning || progressPercentage.value > 0)
  )
})

// Methods
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`
}

const toggleTimer = () => {
  if (!isCurrentTask.value) {
    // Set custom time from task
    timerStore.setWorkTime(taskEstimatedTime.value / 60)

    // Set this task as current and start
    timerStore.setTask(props.taskId)
    timerStore.startTimer()
    emit('start')
  } else {
    if (timerStore.isRunning) {
      timerStore.pauseTimer()
      emit('pause')
    } else {
      timerStore.startTimer()
      emit('start')
    }
  }
}

const resetTimer = () => {
  if (isCurrentTask.value) {
    timerStore.resetTimer()

    // Reset to task time
    timerStore.setWorkTime(taskEstimatedTime.value / 60)

    emit('reset')
  }
}

// Auto-save task time when timer completes
const handlePhaseComplete = () => {
  if (isCurrentTask.value && timerStore.currentSession?.endAt) {
    const start = new Date(timerStore.currentSession.startAt).getTime()
    const end = new Date(timerStore.currentSession.endAt).getTime()
    const timeSpent = Math.round((end - start) / 60000)

    if (timeSpent > 0) {
      tasksStore.addTimeToTask(props.taskId, timeSpent)
    }
  }
}

// Watch for phase completion
let unwatch: () => void
onMounted(() => {
  // Initialize timer store
  timerStore.initialize()

  // Watch for phase changes
  unwatch = watch(
    () => timerStore.currentPhase,
    (newPhase, oldPhase) => {
      if (oldPhase === 'work' && newPhase !== 'work' && isCurrentTask.value) {
        handlePhaseComplete()
      }
    }
  )
})

onUnmounted(() => {
  if (unwatch) unwatch()
})

// Watch task estimated time changes
watch(
  () => task.value?.estimatedMinutes,
  (newTime, oldTime) => {
    if (newTime !== oldTime && isCurrentTask.value && !timerStore.isRunning) {
      // Update timer settings if task time changed
      timerStore.setWorkTime(newTime || 25)
    }
  }
)
</script>

<style scoped lang="scss">
.task-timer {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  user-select: none;
  flex: 1;
  min-width: 0;
}

.timer-circle {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;

  @include breakpoint(sm) {
    width: 56px;
    height: 56px;
  }

  &.running {
    .timer-content {
      animation: pulse 2s var(--ease-in-out) infinite;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.timer-progress {
  position: relative;
  width: 100%;
  height: 100%;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);

  circle {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;

    @include breakpoint(sm) {
      stroke-width: 4;
    }
  }
}

.progress-ring-background {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-ring-fill {
  stroke: var(--accent-primary);
  stroke-dasharray: 283;
  stroke-dashoffset: calc(283 - (283 * var(--progress, 0)) / 100);
  transition: stroke-dashoffset 1s linear;
}

.timer-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @include flex-center;
  flex-direction: column;
  gap: 1px;
}

.timer-icon {
  color: var(--accent-primary);
  opacity: 0.8;
}

.timer-minutes {
  font-size: 9px;
  font-weight: var(--font-bold);
  color: var(--accent-primary);

  @include breakpoint(sm) {
    font-size: 10px;
  }
}

.timer-info {
  flex: 1;
  min-width: 0;
}

.timer-phase {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
  @include text-truncate;
}

.timer-dots {
  display: flex;
  gap: 4px;
  margin-bottom: 2px;
}

.timer-dot {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base);

  &.active {
    background: var(--accent-primary);
  }

  &.current {
    background: var(--accent-secondary);
    transform: scaleY(1.5);
    animation: dot-pulse 1.5s var(--ease-in-out) infinite;
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.timer-total {
  font-size: 9px;
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  @include text-truncate;

  @include breakpoint(sm) {
    font-size: var(--text-xs);
  }
}

.timer-controls {
  display: flex;
  gap: var(--space-2);
}

.timer-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-1);
  flex: 1;
  padding: 6px 10px;
  background: rgba(119, 119, 119, 0.1);
  border: 1px solid rgba(119, 119, 119, 0.2);
  border-radius: var(--radius-sm);
  color: var(--accent-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);

  @include breakpoint(sm) {
    padding: 8px 12px;
    font-size: var(--text-sm);
  }

  &:hover:not(:disabled) {
    background: rgba(119, 119, 119, 0.2);
    transform: translateY(-1px);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);

    &:hover {
      background: var(--accent-secondary);
    }
  }

  &.reset {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--text-secondary);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

// Compact mode
.task-timer.compact {
  .timer-display {
    gap: var(--space-2);
  }

  .timer-circle {
    width: 40px;
    height: 40px;
  }

  .timer-minutes {
    font-size: 8px;
  }

  .timer-phase {
    font-size: 10px;
  }

  .timer-dots {
    gap: 2px;
  }

  .timer-dot {
    height: 2px;
  }

  .timer-total {
    font-size: 8px;
  }

  .timer-controls {
    gap: var(--space-1);
  }

  .timer-button {
    padding: 4px 6px;
    font-size: 10px;
    gap: 2px;
  }
}

// Light theme
[data-theme='light'] {
  .progress-ring-background {
    stroke: rgba(0, 0, 0, 0.1);
  }

  .timer-dot {
    background: rgba(0, 0, 0, 0.1);
  }

  .timer-button {
    background: rgba(119, 119, 119, 0.08);
    border-color: rgba(119, 119, 119, 0.15);

    &.reset {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.1);
    }
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .timer-display {
    gap: var(--space-2);
  }

  .timer-circle {
    width: 44px;
    height: 44px;
  }

  .timer-dots {
    display: none;
  }

  .timer-controls {
    flex-direction: column;
    gap: var(--space-1);
  }

  .timer-button {
    padding: 4px 8px;
    font-size: 10px;
  }
}

// Tablet optimizations
@include breakpoint(sm) {
  .task-timer:not(.compact) {
    .timer-circle {
      width: 60px;
      height: 60px;
    }

    .timer-minutes {
      font-size: var(--text-sm);
    }

    .timer-phase {
      font-size: var(--text-sm);
    }

    .timer-total {
      font-size: var(--text-xs);
    }
  }
}

// Desktop optimizations
@include breakpoint(md) {
  .task-timer:not(.compact) {
    .timer-circle {
      width: 70px;
      height: 70px;
    }

    .timer-minutes {
      font-size: var(--text-base);
    }

    .timer-button {
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
    }
  }
}
</style>
