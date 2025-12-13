<template>
  <div class="task-card" :class="cardClasses">
    <!-- Header with actions -->
    <div class="card-header">
      <div class="task-main">
        <button
          class="status-toggle"
          @click="$emit('toggle-status')"
          :title="task.status === 'completed' ? 'Активировать' : 'Завершить'"
        >
          <div class="status-circle" :class="task.status">
            <Icon
              v-if="task.status === 'completed'"
              name="lucide:check"
              size="12"
            />
          </div>
        </button>

        <div class="task-info">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="task-meta">
            <div
              class="category-badge"
              :style="{
                background: categoryColor + '20',
                color: categoryColor,
              }"
            >
              <span class="category-icon">{{ categoryIcon }}</span>
              <span class="category-name">{{ categoryName }}</span>
            </div>
            <div class="priority-badge" :class="task.priority">
              <Icon name="lucide:flag" size="10" />
              <span>{{ priorityLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button
          v-if="task.status === 'active'"
          class="action-btn timer-toggle"
          @click="toggleTaskTimer"
          :title="isTimerActive ? 'Остановить таймер' : 'Запустить таймер'"
          :class="{ active: isTimerActive }"
        >
          <Icon
            :name="isTimerActive ? 'lucide:pause' : 'lucide:play'"
            size="16"
          />
        </button>
        <button
          class="action-btn edit"
          @click="$emit('edit')"
          title="Редактировать"
        >
          <Icon name="lucide:edit-2" size="16" />
        </button>
        <button
          class="action-btn delete"
          @click="$emit('delete')"
          title="Удалить"
        >
          <Icon name="lucide:trash-2" size="16" />
        </button>
      </div>
    </div>

    <!-- Timer Display (compact) -->
    <div v-if="task.status === 'active' && showTimer" class="compact-timer">
      <div class="timer-content">
        <!-- Timer circle -->
        <div class="timer-circle" @click="toggleTaskTimer">
          <div
            class="timer-progress"
            :style="{ '--progress': timerProgress + '%' }"
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
            <div class="timer-time">
              {{ timerFormattedTime }}
            </div>
          </div>
        </div>

        <!-- Timer info and controls -->
        <div class="timer-details">
          <div class="timer-info">
            <div class="phase-label">{{ phaseLabel }}</div>
            <div class="timer-meta">
              <div class="time-meta">
                <Icon name="lucide:clock" size="12" />
                <span class="time-text">{{ getTaskTimeText() }}</span>
              </div>
              <div class="timer-dots">
                <div
                  v-for="dot in totalDots"
                  :key="dot"
                  class="timer-dot"
                  :class="{
                    active: activeTimerDots >= dot,
                    current: activeTimerDots === dot - 1 && isTimerActive,
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="timer-controls">
            <button
              class="timer-button"
              :class="{ active: isTimerActive }"
              @click.stop="toggleTaskTimer"
            >
              <Icon
                :name="isTimerActive ? 'lucide:pause' : 'lucide:play'"
                size="14"
              />
              <span>{{ isTimerActive ? 'Пауза' : 'Старт' }}</span>
            </button>

            <button
              class="timer-button reset"
              @click.stop="resetTaskTimer"
              :disabled="!isTimerActive && timerProgress === 0"
            >
              <Icon name="lucide:rotate-ccw" size="14" />
              <span>Сброс</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div v-if="task.description" class="task-description">
      <Icon name="lucide:align-left" size="14" class="desc-icon" />
      <p>{{ task.description }}</p>
    </div>

    <!-- Subtasks -->
    <TaskSubtasks
      v-if="hasSubtasks"
      :subtasks="mockSubtasks"
      @complete="updateSubtask"
      @add="addSubtask"
    />

    <!-- Tags -->
    <div v-if="task.tags.length > 0" class="tags-section">
      <div class="tags-header">
        <Icon name="lucide:tags" size="14" />
        <span>Теги</span>
      </div>
      <div class="tags-list">
        <div
          v-for="tag in task.tags"
          :key="tag"
          class="tag"
          @click="$emit('filter-by-tag', tag)"
        >
          <Icon name="lucide:tag" size="12" />
          <span>{{ tag }}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="footer-left">
        <div v-if="task.dueAt" class="due-date" :class="{ overdue: isOverdue }">
          <Icon name="lucide:calendar" size="12" />
          <span>{{ formatDueDate(task.dueAt) }}</span>
        </div>
        <div class="time-spent">
          <Icon name="lucide:clock" size="12" />
          <span>{{ formatTime(task.spentMinutes || 0) }}</span>
        </div>
      </div>

      <div class="footer-right">
        <div class="task-stats">
          <div v-if="progressPercentage > 0" class="progress-indicator">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ progressPercentage }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TaskSubtasks from './TaskSubtasks.vue'

interface Props {
  task: {
    id: string
    title: string
    description?: string
    category: string
    priority: 'low' | 'medium' | 'high'
    status: 'active' | 'completed'
    createdAt: Date
    dueAt?: Date
    estimatedMinutes?: number
    spentMinutes?: number
    tags: string[]
  }
  showTimer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTimer: true,
})

const emit = defineEmits(['toggle-status', 'edit', 'delete', 'filter-by-tag'])

// Stores
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

// Mock subtasks for now
const mockSubtasks = ref([
  { id: '1', title: 'Исследование материала', completed: true },
  { id: '2', title: 'Создание черновика', completed: false },
  { id: '3', title: 'Редактирование', completed: false },
])

// Timer constants
const radius = 40
const circumference = 2 * Math.PI * radius

// Computed
const categoryInfo = computed(() =>
  tasksStore.getCategoryById(props.task.category)
)

const categoryName = computed(() => categoryInfo.value?.name || 'Без категории')

const categoryIcon = computed(() => categoryInfo.value?.icon || '📁')

const categoryColor = computed(
  () => categoryInfo.value?.color || 'var(--text-secondary)'
)

const priorityLabel = computed(() => {
  const labels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
  return labels[props.task.priority]
})

const isTimerActive = computed(
  () => timerStore.currentTaskId === props.task.id && timerStore.isRunning
)

const cardClasses = computed(() => ({
  completed: props.task.status === 'completed',
  'timer-active': isTimerActive.value,
}))

const hasSubtasks = computed(() => mockSubtasks.value.length > 0)

const isOverdue = computed(() => {
  if (!props.task.dueAt) return false
  return (
    new Date(props.task.dueAt) < new Date() && props.task.status === 'active'
  )
})

const progressPercentage = computed(() => {
  if (!props.task.estimatedMinutes || !props.task.spentMinutes) return 0
  return Math.min(
    100,
    Math.round((props.task.spentMinutes / props.task.estimatedMinutes) * 100)
  )
})

// Timer computed
const timerFormattedTime = computed(() => {
  if (!isTimerActive.value) {
    // Показываем время задачи, если оно есть
    return props.task.estimatedMinutes
      ? `${Math.floor(props.task.estimatedMinutes / 60)
          .toString()
          .padStart(2, '0')}:${(props.task.estimatedMinutes % 60)
          .toString()
          .padStart(2, '0')}`
      : '25:00'
  }
  return timerStore.formattedTime
})

const timerProgress = computed(() => {
  if (!isTimerActive.value) return 0
  return timerStore.progress
})

const circumferenceOffset = computed(() => {
  const progress = 100 - timerProgress.value
  return circumference - (progress / 100) * circumference
})

// Рассчитываем количество точек в зависимости от времени
const totalDots = computed(() => {
  if (!props.task.estimatedMinutes) return 5

  // 1 точка на каждые 5 минут, минимум 3, максимум 10
  const dots = Math.min(
    10,
    Math.max(3, Math.floor(props.task.estimatedMinutes / 5))
  )
  return dots
})

const activeTimerDots = computed(() => {
  if (!isTimerActive.value) return 0
  return Math.floor((timerProgress.value / 100) * totalDots.value)
})

const phaseLabel = computed(() => {
  if (!isTimerActive.value) return 'Готов к работе'

  const phases = {
    work: 'Фокус-сессия',
    short_break: 'Короткий перерыв',
    long_break: 'Длинный перерыв',
  }
  return phases[timerStore.currentPhase] || 'Таймер'
})

// Methods
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
}

const formatDueDate = (date: Date) => {
  const dueDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dueDate.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else if (dueDate.toDateString() === tomorrow.toDateString()) {
    return 'Завтра'
  }

  return dueDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

const getTaskTimeText = () => {
  if (props.task.estimatedMinutes) {
    return `${props.task.estimatedMinutes} мин`
  }
  return '25 мин'
}

const updateSubtask = (subtaskId: string) => {
  const subtask = mockSubtasks.value.find((s) => s.id === subtaskId)
  if (subtask) {
    subtask.completed = !subtask.completed
  }
}

const addSubtask = (title: string) => {
  mockSubtasks.value.push({
    id: Date.now().toString(),
    title,
    completed: false,
  })
}

const toggleTaskTimer = () => {
  if (isTimerActive.value) {
    // Pause current timer
    timerStore.pauseTimer()
  } else {
    // If another timer is active, stop it first
    if (timerStore.isRunning && timerStore.currentTaskId !== props.task.id) {
      timerStore.pauseTimer()
    }

    // Set this task as current and start timer
    timerStore.setTask(props.task.id)
    timerStore.startTimer()
  }
}

const resetTaskTimer = () => {
  if (isTimerActive.value) {
    timerStore.resetTimer()
  }
}

// Initialize timer store
onMounted(() => {
  timerStore.initialize()
})

// Auto-add time when timer completes
const unwatch = watch(
  () => timerStore.currentPhase,
  (newPhase, oldPhase) => {
    if (
      oldPhase === 'work' &&
      newPhase !== 'work' &&
      isTimerActive.value &&
      timerStore.currentSession?.endAt
    ) {
      const start = new Date(timerStore.currentSession.startAt).getTime()
      const end = new Date(timerStore.currentSession.endAt).getTime()
      const timeSpent = Math.round((end - start) / 60000)

      if (timeSpent > 0) {
        tasksStore.addTimeToTask(props.task.id, timeSpent)
      }
    }
  }
)

// Watch for task updates to refresh timer
watch(
  () => props.task.estimatedMinutes,
  (newTime) => {
    if (isTimerActive.value && timerStore.currentPhase === 'work') {
      // Если задача активна в таймере, обновляем время
      timerStore.updateTimeFromTask(props.task.id)
    }
  }
)

onUnmounted(() => {
  if (unwatch) unwatch()
})
</script>

<style scoped lang="scss">
.task-card {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    @include elevation(3);
  }

  &.completed {
    opacity: 0.8;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .compact-timer {
      opacity: 0.5;
    }
  }

  &.timer-active {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 1px var(--accent-primary), var(--glow-primary);

    .timer-circle {
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

// Header
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.status-toggle {
  @include button-reset;
  @include flex-center;
  margin-top: 2px;
  flex-shrink: 0;

  .status-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    @include flex-center;
    transition: all var(--duration-base);

    &.active {
      border-color: var(--accent-primary);
      background: rgba(119, 119, 119, 0.1);

      &:hover {
        background: rgba(119, 119, 119, 0.2);
      }
    }

    &.completed {
      border-color: var(--success);
      background: var(--success);
      color: white;

      &:hover {
        background: rgba(93, 242, 126, 0.9);
      }
    }
  }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
  @include text-truncate;

  @include breakpoint(sm) {
    font-size: var(--text-lg);
  }
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  flex-shrink: 0;

  .category-icon {
    font-size: var(--text-sm);
  }

  .category-name {
    opacity: 0.9;
    @include text-truncate;
    max-width: 80px;
  }
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  flex-shrink: 0;

  &.high {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.medium {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.low {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }
}

// Header actions
.header-actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.action-btn {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  @include breakpoint(sm) {
    width: 32px;
    height: 32px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.timer-toggle {
    &.active {
      color: var(--accent-primary);
      background: rgba(119, 119, 119, 0.1);

      &:hover {
        background: rgba(119, 119, 119, 0.2);
      }
    }
  }

  &.edit:hover {
    color: var(--accent-primary);
  }

  &.delete:hover {
    color: var(--error);
  }
}

// Compact Timer
.compact-timer {
  margin: var(--space-3) 0;
  padding: var(--space-3);
  background: rgba(119, 119, 119, 0.03);
  border-radius: var(--radius-base);
  border: 1px solid rgba(119, 119, 119, 0.1);
  flex-shrink: 0;
}

.timer-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);

  @include breakpoint(sm) {
    gap: var(--space-4);
  }
}

.timer-circle {
  position: relative;
  width: 60px;
  height: 60px;
  cursor: pointer;
  flex-shrink: 0;

  @include breakpoint(sm) {
    width: 70px;
    height: 70px;
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
  stroke-dasharray: 251.2;
  stroke-dashoffset: calc(251.2 - (251.2 * var(--progress, 0)) / 100);
  transition: stroke-dashoffset 1s linear;
}

.timer-time {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  @include flex-center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--accent-primary);

  @include breakpoint(sm) {
    font-size: var(--text-sm);
  }
}

.timer-details {
  flex: 1;
  min-width: 0;
}

.timer-info {
  margin-bottom: var(--space-2);
}

.phase-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
  @include text-truncate;
}

.timer-dots {
  display: flex;
  gap: 4px;
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

.timer-controls {
  display: flex;
  gap: var(--space-2);

  @include breakpoint(sm) {
    gap: var(--space-3);
  }
}

.timer-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-1);
  flex: 1;
  padding: 6px 8px;
  background: rgba(119, 119, 119, 0.1);
  border: 1px solid rgba(119, 119, 119, 0.2);
  border-radius: var(--radius-sm);
  color: var(--accent-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  white-space: nowrap;

  @include breakpoint(sm) {
    padding: var(--space-2) var(--space-3);
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

// Description
.task-description {
  margin: var(--space-3) 0;
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-base);
  flex-shrink: 0;

  .desc-icon {
    display: none;
  }

  p {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    margin: 0;
    @include text-truncate-multiline(2);
  }

  @include breakpoint(sm) {
    .desc-icon {
      display: block;
      float: left;
      margin-right: var(--space-2);
      margin-top: 1px;
      color: var(--text-secondary);
      opacity: 0.6;
    }

    p {
      overflow: hidden;
    }
  }
}

// Tags section
.tags-section {
  margin: var(--space-3) 0;
  flex-shrink: 0;
}

.tags-header {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(119, 119, 119, 0.1);
    color: var(--accent-primary);
  }
}

// Footer
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  flex-wrap: wrap;
}

.due-date {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);

  &.overdue {
    color: var(--error);
  }
}

.time-spent {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.progress-bar {
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;

  @include breakpoint(sm) {
    width: 50px;
    height: 4px;
  }
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width var(--duration-slow);
}

.progress-text {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
  min-width: 24px;

  @include breakpoint(sm) {
    font-size: var(--text-sm);
    min-width: 28px;
  }
}

// Light theme
[data-theme='light'] {
  .task-card {
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .action-btn:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .compact-timer {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .progress-ring-background {
    stroke: rgba(0, 0, 0, 0.1);
  }

  .timer-dot {
    background: rgba(0, 0, 0, 0.1);
  }

  .timer-button {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);

    &.reset {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .task-description {
    background: rgba(0, 0, 0, 0.02);
  }

  .tag {
    background: rgba(0, 0, 0, 0.05);
  }

  .progress-bar {
    background: rgba(0, 0, 0, 0.1);
  }

  .card-footer {
    border-top-color: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .timer-controls {
    flex-direction: column;
    gap: var(--space-2);
  }

  .timer-button {
    padding: 4px 6px;
    font-size: 11px;
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .category-badge .category-name {
    max-width: 60px;
  }
}

// Tablet optimizations
@include breakpoint(sm) {
  .compact-timer {
    padding: var(--space-4);
  }

  .timer-circle {
    width: 70px;
    height: 70px;
  }

  .timer-time {
    font-size: var(--text-sm);
  }

  .phase-label {
    font-size: var(--text-sm);
  }
}

// Desktop optimizations
@include breakpoint(md) {
  .timer-circle {
    width: 80px;
    height: 80px;
  }

  .timer-time {
    font-size: var(--text-base);
  }

  .timer-button {
    font-size: var(--text-sm);
  }
}
</style>
