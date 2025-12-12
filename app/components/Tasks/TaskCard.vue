<template>
  <div class="task-card" :class="cardClasses">
    <!-- Header with actions -->
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
            <span class="category-icon">{{ categoryIcon }}</span>
            <span class="category-name">{{ categoryName }}</span>
          </div>
        </div>
      </div>

      <div class="task-actions">
        <button
          v-if="task.status === 'active'"
          class="action-button timer"
          @click="toggleTimer"
          :title="timerRunning ? 'Остановить таймер' : 'Запустить таймер'"
        >
          <Icon
            :name="timerRunning ? 'lucide:pause' : 'lucide:play'"
            size="16"
          />
        </button>
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

    <!-- Subtasks (placeholder) -->
    <div v-if="hasSubtasks" class="task-subtasks">
      <div class="subtasks-header">
        <Icon name="lucide:list-checks" size="14" />
        <span>Подзадачи</span>
        <span class="subtasks-count"
          >{{ completedSubtasks }}/{{ totalSubtasks }}</span
        >
      </div>
      <div class="subtasks-list">
        <div v-for="subtask in subtasks" :key="subtask.id" class="subtask-item">
          <button class="subtask-toggle" @click="toggleSubtask(subtask.id)">
            <Icon
              :name="
                subtask.completed ? 'lucide:check-square' : 'lucide:square'
              "
              size="14"
            />
          </button>
          <span class="subtask-title" :class="{ completed: subtask.completed }">
            {{ subtask.title }}
          </span>
        </div>
      </div>
    </div>

    <!-- Timer -->
    <TaskTimer
      v-if="showTimer"
      ref="timerRef"
      :task-id="task.id"
      :initial-time="25 * 60"
      @complete="onTimerComplete"
    />

    <!-- Tags -->
    <div v-if="task.tags.length > 0" class="task-tags">
      <div v-for="tag in task.tags" :key="tag" class="tag">
        <Icon name="lucide:tag" size="10" />
        <span>{{ tag }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="footer-left">
        <div class="priority-badge" :class="task.priority">
          <Icon :name="priorityIcon" size="12" />
          <span>{{ priorityLabel }}</span>
        </div>

        <div v-if="task.dueAt" class="due-date" :class="{ overdue: isOverdue }">
          <Icon name="lucide:calendar" size="12" />
          <span>{{ formatDueDate(task.dueAt) }}</span>
        </div>
      </div>

      <div class="footer-right">
        <div class="task-meta">
          <div
            class="time-spent"
            v-if="task.spentMinutes && task.spentMinutes > 0"
          >
            <Icon name="lucide:clock" size="12" />
            <span>{{ formatTime(task.spentMinutes) }}</span>
          </div>
          <div class="task-created" v-if="showCreatedDate">
            <Icon name="lucide:calendar-plus" size="12" />
            <span>{{ formatDate(task.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

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
const emit = defineEmits(['toggle-status', 'edit', 'delete', 'timer-start'])

// Refs
const timerRef = ref()
const timerRunning = ref(false)

// Subtasks (заглушка для будущей реализации)
const subtasks = ref([
  { id: '1', title: 'Исследовать тему', completed: true },
  { id: '2', title: 'Набросать план', completed: true },
  { id: '3', title: 'Реализовать функционал', completed: false },
])

// Computed
const categoryInfo = computed(() => {
  const tasksStore = useTasksStore()
  return tasksStore.getCategoryById(props.task.category)
})

const categoryName = computed(() => {
  return categoryInfo.value?.name || 'Без категории'
})

const categoryIcon = computed(() => {
  return categoryInfo.value?.icon || '📁'
})

const categoryColor = computed(() => {
  return categoryInfo.value?.color || 'var(--text-secondary)'
})

const cardClasses = computed(() => ({
  completed: props.task.status === 'completed',
  [`priority-${props.task.priority}`]: true,
  'has-timer': showTimer.value,
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
  const icons = {
    high: 'lucide:flag',
    medium: 'lucide:flag',
    low: 'lucide:flag',
  }
  return icons[props.task.priority]
})

const showTimer = computed(() => {
  return props.task.status === 'active' && timerRunning.value
})

const hasSubtasks = computed(() => {
  return subtasks.value.length > 0
})

const totalSubtasks = computed(() => {
  return subtasks.value.length
})

const completedSubtasks = computed(() => {
  return subtasks.value.filter((s) => s.completed).length
})

const isOverdue = computed(() => {
  if (!props.task.dueAt) return false
  return (
    new Date(props.task.dueAt) < new Date() && props.task.status === 'active'
  )
})

const showCreatedDate = computed(() => {
  const created = new Date(props.task.createdAt)
  const today = new Date()
  return created.toDateString() !== today.toDateString()
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
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dueDate.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else if (dueDate.toDateString() === tomorrow.toDateString()) {
    return 'Завтра'
  } else if (dueDate.toDateString() === yesterday.toDateString()) {
    return 'Вчера'
  }

  return dueDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

const toggleTimer = () => {
  timerRunning.value = !timerRunning.value
  emit('timer-start', props.task.id)
}

const onTimerComplete = () => {
  timerRunning.value = false
  // Здесь можно добавить логику обновления времени задачи
}

const toggleSubtask = (id: string) => {
  const subtask = subtasks.value.find((s) => s.id === id)
  if (subtask) {
    subtask.completed = !subtask.completed
  }
}

// Expose timer methods
defineExpose({
  startTimer: () => {
    timerRunning.value = true
    timerRef.value?.startTimer()
  },
  pauseTimer: () => {
    timerRunning.value = false
    timerRef.value?.pauseTimer()
  },
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

  &.has-timer {
    border-color: rgba(93, 95, 239, 0.2);
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
  padding: 4px 8px;
  border-radius: var(--radius-sm);

  .category-icon {
    font-size: 14px;
  }

  .category-name {
    opacity: 0.9;
  }
}

.task-actions {
  display: flex;
  gap: var(--space-1);
}

.action-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &.timer:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

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

.task-subtasks {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-base);
}

.subtasks-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.subtasks-count {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.subtasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
}

.subtask-toggle {
  @include button-reset;
  @include flex-center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;

  :deep(svg) {
    color: var(--text-secondary);
    transition: all var(--duration-base);
  }

  &:hover :deep(svg) {
    color: var(--accent-primary);
  }
}

.subtask-title {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &.completed {
    text-decoration: line-through;
    color: var(--text-muted);
  }
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: var(--radius-sm);

  :deep(svg) {
    opacity: 0.6;
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
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
  padding: 4px 8px;
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

  &.overdue {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
  }

  :deep(svg) {
    color: var(--text-muted);
  }
}

.footer-right {
  .task-meta {
    display: flex;
    gap: var(--space-3);
  }

  .time-spent,
  .task-created {
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

// Light theme adjustments
[data-theme='light'] {
  .task-category,
  .tag {
    background: rgba(0, 0, 0, 0.05);
  }

  .task-description,
  .task-subtasks {
    background: rgba(0, 0, 0, 0.03);
  }

  .priority-badge {
    &.high {
      background: rgba(248, 113, 113, 0.1);
    }

    &.medium {
      background: rgba(250, 204, 21, 0.1);
    }

    &.low {
      background: rgba(93, 242, 126, 0.1);
    }
  }
}
</style>
