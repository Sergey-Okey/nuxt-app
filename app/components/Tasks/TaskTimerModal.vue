<template>
  <div class="task-timer-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <div class="modal-content">
        <!-- Header -->
        <div class="timer-header">
          <div class="timer-task">
            <div class="task-icon">
              <Icon :name="categoryIcon" size="20" />
            </div>
            <div class="task-info">
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-category">{{ categoryName }}</p>
            </div>
          </div>
          <button class="close-button" @click="closeModal">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>

        <!-- Timer Display -->
        <div class="timer-display">
          <div class="time-circle">
            <svg class="progress-ring" width="280" height="280">
              <circle
                class="progress-ring-background"
                stroke="rgba(255, 255, 255, 0.1)"
                stroke-width="8"
                fill="transparent"
                r="130"
                cx="140"
                cy="140"
              />
              <circle
                class="progress-ring-foreground"
                :stroke="categoryColor"
                stroke-width="8"
                stroke-linecap="round"
                fill="transparent"
                r="130"
                cx="140"
                cy="140"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="strokeDashoffset"
              />
            </svg>
            <div class="time-text">
              <div class="minutes">{{ formattedMinutes }}</div>
              <div class="seconds">{{ formattedSeconds }}</div>
            </div>
          </div>
        </div>

        <!-- Timer Controls -->
        <div class="timer-controls">
          <button
            class="control-button reset-button"
            :disabled="isRunning"
            @click="resetTimer"
          >
            <Icon name="lucide:rotate-ccw" size="20" />
          </button>

          <button
            class="control-button main-button"
            :class="{ running: isRunning }"
            @click="toggleTimer"
          >
            <Icon
              :name="isRunning ? 'lucide:pause' : 'lucide:play'"
              size="24"
            />
          </button>

          <button
            class="control-button complete-button"
            :disabled="isRunning"
            @click="completeSession"
          >
            <Icon name="lucide:check" size="20" />
          </button>
        </div>

        <!-- Session History -->
        <div class="session-history">
          <h4 class="history-title">Сегодня</h4>
          <div v-if="todaySessions.length > 0" class="sessions-list">
            <div
              v-for="session in todaySessions"
              :key="session.id"
              class="session-item"
            >
              <Icon name="lucide:clock" size="14" />
              <span>{{ formatSessionTime(session) }}</span>
            </div>
          </div>
          <p v-else class="no-sessions">Сессий пока нет</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TimerSession } from '~/stores/tasks'

const tasksStore = useTasksStore()

interface Props {
  task: Task
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'time-tracked': [{ taskId: string; minutes: number }]
}>()

// Состояния таймера
const isRunning = ref(false)
const seconds = ref(0)
const interval = ref<NodeJS.Timeout | null>(null)

// Получаем информацию о категории
const category = computed(() => tasksStore.getCategoryById(props.task.category))
const categoryName = computed(() => category.value?.name || props.task.category)
const categoryIcon = computed(() => category.value?.icon || 'lucide:circle')
const categoryColor = computed(
  () => category.value?.color || 'var(--accent-primary)'
)

// Сессии за сегодня
const todaySessions = computed(() => {
  const today = new Date().toDateString()
  return tasksStore.timerSessions
    .filter(
      (session) =>
        session.taskId === props.task.id &&
        new Date(session.startAt).toDateString() === today
    )
    .sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    )
})

// Таймер и прогресс
const circumference = 2 * Math.PI * 130
const progress = computed(() => {
  const totalSeconds = 25 * 60 // 25 минут в секундах
  return (seconds.value % totalSeconds) / totalSeconds
})

const strokeDashoffset = computed(() => {
  return circumference * (1 - progress.value)
})

const formattedMinutes = computed(() => {
  const mins = Math.floor(seconds.value / 60) % 60
  return mins.toString().padStart(2, '0')
})

const formattedSeconds = computed(() => {
  const secs = seconds.value % 60
  return secs.toString().padStart(2, '0')
})

// Методы
const startTimer = () => {
  if (!isRunning.value) {
    isRunning.value = true
    interval.value = setInterval(() => {
      seconds.value++
    }, 1000)
  }
}

const pauseTimer = () => {
  if (isRunning.value && interval.value) {
    isRunning.value = false
    clearInterval(interval.value)
    interval.value = null
  }
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
  seconds.value = 0
}

const completeSession = () => {
  pauseTimer()

  const minutes = Math.floor(seconds.value / 60)
  if (minutes > 0) {
    // Сохраняем сессию
    tasksStore.addTimerSession({
      taskId: props.task.id,
      startAt: new Date(Date.now() - minutes * 60 * 1000),
      endAt: new Date(),
      duration: minutes,
    })

    // Добавляем время к задаче
    emit('time-tracked', { taskId: props.task.id, minutes })
  }

  resetTimer()
  closeModal()
}

const closeModal = () => {
  if (isRunning.value) {
    pauseTimer()
  }
  emit('close')
}

const formatSessionTime = (session: TimerSession) => {
  const date = new Date(session.startAt)
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')} • ${session.duration} мин`
}

// Автопауза при скрытии страницы
onMounted(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && isRunning.value) {
      pauseTimer()
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Закрытие по Escape
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('keydown', handleEscape)
    if (interval.value) {
      clearInterval(interval.value)
    }
  })
})
</script>

<style scoped lang="scss">
.task-timer-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  animation: backdropFadeIn 0.3s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content {
  @include glass(20px, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.05);
}

.timer-task {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.task-icon {
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.1);
  flex-shrink: 0;

  :deep(svg) {
    color: var(--text-primary);
  }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
  @include text-truncate;
}

.task-category {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  @include text-truncate;
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
  }
}

.timer-display {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.time-circle {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-foreground {
  transition: stroke-dashoffset 0.5s ease-out;
}

.time-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.minutes {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.seconds {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
}

.timer-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
}

.control-button {
  @include button-reset;
  @include flex-center;
  border-radius: var(--radius-full);
  transition: all var(--duration-base);

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: scale(1.1);
  }

  &:not(:disabled):active {
    transform: scale(0.95);
  }
}

.reset-button,
.complete-button {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);

  &:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
  }
}

.main-button {
  width: 64px;
  height: 64px;
  background: var(--accent-primary);
  color: white;

  &.running {
    background: var(--accent-secondary);
  }

  &:not(:disabled):hover {
    box-shadow: var(--glow-primary);
  }
}

.session-history {
  padding: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.history-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.session-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  :deep(svg) {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
}

.no-sessions {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-4);
  margin: 0;
}

// Light theme adjustments
[data-theme='light'] {
  .timer-header {
    background: rgba(0, 0, 0, 0.05);
  }

  .task-icon {
    background: rgba(0, 0, 0, 0.1);
  }

  .close-button {
    background: rgba(0, 0, 0, 0.1);
  }

  .reset-button,
  .complete-button {
    background: rgba(0, 0, 0, 0.1);
  }

  .session-history {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .session-item:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@media (max-width: 640px) {
  .modal-container {
    max-width: none;
  }

  .modal-content {
    border-radius: 0;
  }

  .time-circle {
    width: 240px;
    height: 240px;
  }

  .minutes {
    font-size: var(--text-3xl);
  }

  .seconds {
    font-size: var(--text-base);
  }
}
</style>
