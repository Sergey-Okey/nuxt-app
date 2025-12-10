<template>
  <div v-if="activeTask" class="task-timer-widget">
    <div class="timer-header">
      <h4>Таймер задачи</h4>
      <button class="close-timer" @click="stopTimer">
        <Icon name="lucide:x" size="16" />
      </button>
    </div>

    <div class="timer-content">
      <!-- Timer Display -->
      <div class="timer-display">
        <div class="time-circle">
          <svg class="progress-ring" width="120" height="120">
            <circle
              class="progress-ring-background"
              stroke-width="6"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              class="progress-ring-foreground"
              stroke-width="6"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
              stroke-linecap="round"
            />
          </svg>
          <div class="time-text">
            <div class="minutes">{{ formattedMinutes }}</div>
            <div class="seconds">{{ formattedSeconds }}</div>
          </div>
        </div>
      </div>

      <!-- Task Info -->
      <div class="task-info">
        <h5>{{ activeTask.title }}</h5>
        <div class="task-meta">
          <span class="category">{{
            getCategoryName(activeTask.category)
          }}</span>
          <span class="estimated"
            >Оценка: {{ formatMinutes(activeTask.estimatedMinutes || 0) }}</span
          >
        </div>
      </div>

      <!-- Timer Controls -->
      <div class="timer-controls">
        <button
          v-if="!isRunning"
          class="control-button start"
          @click="startTimer"
        >
          <Icon name="lucide:play" size="20" />
          <span>Старт</span>
        </button>

        <button v-else class="control-button pause" @click="pauseTimer">
          <Icon name="lucide:pause" size="20" />
          <span>Пауза</span>
        </button>

        <button class="control-button reset" @click="resetTimer">
          <Icon name="lucide:refresh-cw" size="20" />
          <span>Сброс</span>
        </button>

        <button class="control-button complete" @click="completeTimer">
          <Icon name="lucide:check" size="20" />
          <span>Завершить</span>
        </button>
      </div>

      <!-- Time Log -->
      <div class="time-log">
        <div class="log-header">
          <span>Потрачено времени:</span>
          <span class="total-time">{{ formatMinutes(elapsedMinutes) }}</span>
        </div>
        <div class="log-entries">
          <div
            v-for="(entry, index) in timeEntries"
            :key="index"
            class="log-entry"
          >
            <Icon name="lucide:clock" size="12" />
            <span
              >{{ formatTime(entry.start) }} - {{ formatTime(entry.end) }}</span
            >
            <span class="duration">{{ formatMinutes(entry.duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

interface Props {
  task: Task
}

interface TimeEntry {
  start: Date
  end: Date
  duration: number // in minutes
}

const props = defineProps<Props>()
const emit = defineEmits(['complete', 'stop'])

const tasksStore = useTasksStore()

// Timer state
const isRunning = ref(false)
const timeLeft = ref(
  props.task.estimatedMinutes ? props.task.estimatedMinutes * 60 : 0
)
const elapsedMinutes = ref(props.task.spentMinutes || 0)
const timeEntries = ref<TimeEntry[]>([])
const currentEntry = ref<{ start: Date; intervalId?: NodeJS.Timeout } | null>(
  null
)

// Computed
const activeTask = computed(() => props.task)

const circumference = 2 * Math.PI * 52
const progress = computed(() => {
  const totalSeconds = (props.task.estimatedMinutes || 0) * 60
  if (totalSeconds === 0) return 0
  return (timeLeft.value / totalSeconds) * 100
})

const strokeDashoffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})

const formattedMinutes = computed(() => {
  return Math.floor(timeLeft.value / 60)
    .toString()
    .padStart(2, '0')
})

const formattedSeconds = computed(() => {
  return (timeLeft.value % 60).toString().padStart(2, '0')
})

// Methods
const getCategoryName = (categoryId: string) => {
  const category = tasksStore.categories.find((cat) => cat.id === categoryId)
  return category?.name || 'Без категории'
}

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}м`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const startTimer = () => {
  if (!isRunning.value) {
    isRunning.value = true
    currentEntry.value = { start: new Date() }

    const intervalId = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        completeTimer()
      }
    }, 1000)

    if (currentEntry.value) {
      currentEntry.value.intervalId = intervalId
    }
  }
}

const pauseTimer = () => {
  if (isRunning.value && currentEntry.value) {
    isRunning.value = false
    const end = new Date()
    const duration = Math.round(
      (end.getTime() - currentEntry.value.start.getTime()) / 60000
    )

    // Add time entry
    timeEntries.value.push({
      start: currentEntry.value.start,
      end,
      duration,
    })

    // Add to elapsed time
    elapsedMinutes.value += duration

    // Clear interval
    if (currentEntry.value.intervalId) {
      clearInterval(currentEntry.value.intervalId)
    }

    currentEntry.value = null
  }
}

const resetTimer = () => {
  // Stop current timer if running
  if (isRunning.value && currentEntry.value?.intervalId) {
    clearInterval(currentEntry.value.intervalId)
  }

  // Reset state
  isRunning.value = false
  timeLeft.value = props.task.estimatedMinutes
    ? props.task.estimatedMinutes * 60
    : 0
  currentEntry.value = null
}

const stopTimer = () => {
  // Save any current time entry
  if (isRunning.value) {
    pauseTimer()
  }

  // Save total time to task
  if (elapsedMinutes.value > 0) {
    tasksStore.addTimeToTask(props.task.id, elapsedMinutes.value)
  }

  emit('stop')
}

const completeTimer = () => {
  // Stop timer
  if (isRunning.value) {
    pauseTimer()
  }

  // Mark task as completed
  tasksStore.toggleTaskStatus(props.task.id)

  // Add time to task
  if (elapsedMinutes.value > 0) {
    tasksStore.addTimeToTask(props.task.id, elapsedMinutes.value)
  }

  emit('complete', props.task.id)
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (currentEntry.value?.intervalId) {
    clearInterval(currentEntry.value.intervalId)
  }
})
</script>

<style scoped lang="scss">
.task-timer-widget {
  @include card;
  position: fixed;
  bottom: 80px;
  right: var(--space-4);
  width: 320px;
  z-index: var(--z-modal);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease-out;

  @include breakpoint(xs) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    border-radius: 0;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.timer-header h4 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.close-timer {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.timer-content {
  padding: var(--space-4);
}

.timer-display {
  @include flex-center;
  margin-bottom: var(--space-4);
}

.time-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-background {
  stroke: rgba(255, 255, 255, 0.1);
}

.progress-ring-foreground {
  stroke: var(--accent-primary);
  transition: stroke-dashoffset 1s linear;
}

.time-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-primary);
}

.minutes {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: 1;
}

.seconds {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.task-info {
  text-align: center;
  margin-bottom: var(--space-4);
}

.task-info h5 {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  @include text-truncate;
}

.task-meta {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.category,
.estimated {
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
}

.timer-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.control-button {
  @include button-reset;
  @include flex-center;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &.start {
    background: var(--success);
    color: white;

    &:hover {
      background: rgba(93, 242, 126, 0.9);
    }
  }

  &.pause {
    background: var(--warning);
    color: var(--primary-bg);

    &:hover {
      background: rgba(250, 204, 21, 0.9);
    }
  }

  &.reset {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &.complete {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: rgba(93, 95, 239, 0.9);
    }
  }
}

.time-log {
  padding: var(--space-3);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.total-time {
  font-weight: var(--font-semibold);
  color: var(--accent-primary);
}

.log-entries {
  max-height: 120px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
}

.log-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  :deep(svg) {
    color: var(--text-muted);
  }

  .duration {
    font-weight: var(--font-medium);
    color: var(--accent-primary);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .progress-ring-background {
    stroke: rgba(0, 0, 0, 0.1);
  }

  .category,
  .estimated {
    background: rgba(0, 0, 0, 0.05);
  }

  .control-button.reset {
    background: rgba(0, 0, 0, 0.05);
  }

  .time-log {
    background: var(--surface-bg);
  }

  .log-entry:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .timer-controls {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
