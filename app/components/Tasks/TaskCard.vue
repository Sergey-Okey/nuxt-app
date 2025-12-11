<template>
  <div class="task-card" :class="cardClasses">
    <!-- Header -->
    <div class="card-header">
      <div class="task-main-info">
        <button class="status-toggle" @click="$emit('toggle-status')">
          <Icon
            :name="
              task.status === 'completed'
                ? 'lucide:check-circle'
                : 'lucide:circle'
            "
            size="20"
          />
        </button>

        <div class="task-title-section">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="task-category" :style="{ color: categoryColor }">
            <Icon :name="categoryIcon" size="12" />
            <span>{{ categoryName }}</span>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button
          class="action-button edit"
          @click="$emit('edit')"
          title="Редактировать"
        >
          <Icon name="lucide:edit-2" size="16" />
        </button>
        <button
          class="action-button delete"
          @click="$emit('delete')"
          title="Удалить"
        >
          <Icon name="lucide:trash-2" size="16" />
        </button>
      </div>
    </div>

    <!-- Description -->
    <div v-if="task.description" class="task-description">
      <p>{{ task.description }}</p>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section" v-if="showProgress">
      <div class="progress-header">
        <span class="progress-label">Прогресс</span>
        <span class="progress-value">{{ progressPercentage }}%</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
        <div class="progress-dots">
          <div
            v-for="dot in 10"
            :key="dot"
            class="progress-dot"
            :class="{ active: dot <= Math.floor(progressPercentage / 10) }"
          ></div>
        </div>
      </div>
      <div class="time-info">
        <span class="time-spent"
          >Затрачено: {{ formatTime(task.spentMinutes || 0) }}</span
        >
        <span v-if="task.estimatedMinutes" class="time-remaining">
          Осталось:
          {{
            formatTime(
              Math.max(
                0,
                (task.estimatedMinutes || 0) - (task.spentMinutes || 0)
              )
            )
          }}
        </span>
      </div>
    </div>

    <!-- Timer Section -->
    <div class="timer-section" v-if="task.status === 'active'">
      <div class="timer-header">
        <Icon name="lucide:clock" size="14" />
        <span>Таймер</span>
      </div>
      <div class="timer-controls">
        <button
          class="timer-button"
          :class="{ active: isTimerActiveForTask }"
          @click.stop="toggleTaskTimer"
        >
          <Icon
            :name="isTimerActiveForTask ? 'lucide:pause' : 'lucide:play'"
            size="14"
          />
          <span>{{ isTimerActiveForTask ? 'Пауза' : 'Старт' }}</span>
        </button>

        <button
          class="timer-reset"
          @click.stop="resetTaskTimer"
          title="Сбросить таймер"
        >
          <Icon name="lucide:rotate-ccw" size="14" />
        </button>

        <div class="timer-display" v-if="isTimerActiveForTask">
          <span class="timer-time">{{ timerFormattedTime }}</span>
          <div class="timer-progress">
            <div
              class="timer-progress-fill"
              :style="{ width: `${timerProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="footer-left">
        <div class="priority-badge" :class="task.priority">
          <Icon :name="priorityIcon" size="12" />
          <span>{{ priorityLabel }}</span>
        </div>

        <div v-if="task.dueAt" class="due-date">
          <Icon name="lucide:calendar" size="12" />
          <span>{{ formatDueDate(task.dueAt) }}</span>
        </div>
      </div>

      <div class="footer-right">
        <div class="task-time-spent">
          <Icon name="lucide:clock" size="12" />
          <span>{{ formatTime(task.spentMinutes || 0) }}</span>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="task.tags.length > 0" class="task-tags">
      <div v-for="tag in task.tags" :key="tag" class="tag">
        <Icon name="lucide:tag" size="10" />
        <span>{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
}

const props = defineProps<Props>()
const emit = defineEmits(['toggle-status', 'start-timer', 'edit', 'delete'])

// Stores
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

// Computed
const categoryInfo = computed(() => {
  return tasksStore.getCategoryById(props.task.category)
})

const categoryName = computed(() => {
  return categoryInfo.value?.name || 'Без категории'
})

const categoryIcon = computed(() => {
  return categoryInfo.value?.icon || 'lucide:folder'
})

const categoryColor = computed(() => {
  return categoryInfo.value?.color || 'var(--text-secondary)'
})

const cardClasses = computed(() => ({
  completed: props.task.status === 'completed',
  [`priority-${props.task.priority}`]: true,
}))

const priorityLabel = computed(() => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[props.task.priority]
})

const priorityIcon = computed(() => {
  return 'lucide:flag'
})

const showProgress = computed(() => {
  return props.task.status === 'active' && props.task.estimatedMinutes
})

const progressPercentage = computed(() => {
  if (!props.task.estimatedMinutes || !props.task.spentMinutes) return 0
  return Math.min(
    100,
    Math.round((props.task.spentMinutes / props.task.estimatedMinutes) * 100)
  )
})

// Timer related
const isTimerActiveForTask = computed(() => {
  return timerStore.isRunning && timerStore.currentTaskId === props.task.id
})

const timerFormattedTime = computed(() => {
  if (!isTimerActiveForTask.value) return '25:00'
  return timerStore.formattedTime
})

const timerProgress = computed(() => {
  if (!isTimerActiveForTask.value) return 0
  return timerStore.progress
})

// Methods
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
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

const toggleTaskTimer = () => {
  if (isTimerActiveForTask.value) {
    timerStore.pauseTimer()
  } else {
    // Если другой таймер активен, останавливаем его
    if (timerStore.isRunning) {
      timerStore.pauseTimer()
    }

    // Устанавливаем текущую задачу и запускаем таймер
    timerStore.setTask(props.task.id)
    timerStore.startTimer()

    emit('start-timer')
  }
}

const resetTaskTimer = () => {
  if (isTimerActiveForTask.value) {
    timerStore.resetTimer()
    timerStore.setTask(null)
  }
}

// Инициализация таймера при монтировании
onMounted(() => {
  timerStore.initialize()
})
</script>

<style scoped lang="scss">
.task-card {
  @include card;
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.completed {
    opacity: 0.7;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
  }

  &.priority-high {
    border-left: 4px solid var(--error);
  }

  &.priority-medium {
    border-left: 4px solid var(--warning);
  }

  &.priority-low {
    border-left: 4px solid var(--success);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.task-main-info {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
}

.status-toggle {
  @include button-reset;
  @include flex-center;
  flex-shrink: 0;
  margin-top: 2px;

  :deep(svg) {
    color: var(--text-secondary);
    transition: all var(--duration-base);
  }

  &:hover :deep(svg) {
    color: var(--accent-primary);
    transform: scale(1.1);
  }

  .completed & :deep(svg) {
    color: var(--success);
  }
}

.task-title-section {
  flex: 1;
}

.task-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.task-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);

  :deep(svg) {
    opacity: 0.8;
  }
}

.task-actions {
  display: flex;
  gap: var(--space-1);
}

.action-button {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &.edit:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  &.delete:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.task-description {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-base);

  p {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: var(--leading-relaxed);
    margin: 0;
  }
}

.progress-section {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-base);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.progress-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.progress-value {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-bottom: var(--space-2);
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 3px;
  transition: width var(--duration-slow);
  z-index: 1;
}

.progress-dots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
  z-index: 2;
}

.progress-dot {
  width: 2px;
  height: 6px;
  background: var(--card-bg);
  transition: all var(--duration-base);

  &.active {
    background: white;
  }
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.time-spent {
  color: var(--success);
  font-weight: var(--font-medium);
}

.time-remaining {
  color: var(--accent-primary);
  font-weight: var(--font-medium);
}

// Timer Section
.timer-section {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(93, 95, 239, 0.05);
  border: 1px solid rgba(93, 95, 239, 0.1);
  border-radius: var(--radius-base);
}

.timer-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--accent-primary);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.timer-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.timer-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    background: var(--accent-secondary);
    transform: scale(1.05);
  }

  &.active {
    background: var(--warning);

    &:hover {
      background: #eab308;
    }
  }
}

.timer-reset {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.timer-display {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.timer-time {
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
  min-width: 45px;
}

.timer-progress {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.timer-progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 2px;
  transition: width 1s linear;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.footer-left {
  display: flex;
  gap: var(--space-3);
}

.priority-badge {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);

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

.due-date {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);

  :deep(svg) {
    color: var(--text-muted);
  }
}

.footer-right {
  .task-time-spent {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: var(--font-medium);

    :deep(svg) {
      color: var(--text-muted);
    }
  }
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: var(--radius-sm);

  :deep(svg) {
    opacity: 0.6;
  }
}

// Light theme adjustments
[data-theme='light'] {
  .task-category,
  .tag {
    background: rgba(0, 0, 0, 0.05);
  }

  .task-description,
  .progress-section {
    background: rgba(0, 0, 0, 0.03);
  }

  .progress-bar {
    background: rgba(0, 0, 0, 0.1);
  }

  .progress-dot {
    background: var(--card-bg);
  }

  .timer-section {
    background: rgba(93, 95, 239, 0.03);
    border-color: rgba(93, 95, 239, 0.1);
  }

  .timer-reset {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
