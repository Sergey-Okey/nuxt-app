<template>
  <div
    class="task-item"
    :class="{
      'task-completed': task.status === 'completed',
      'task-high': task.priority === 'high',
      'task-medium': task.priority === 'medium',
      'task-low': task.priority === 'low',
      'task-timer-active': isTimerActive,
    }"
    @click="$emit('toggle')"
  >
    <!-- Основной контент -->
    <div class="task-content">
      <!-- Чекбокс -->
      <div class="task-checkbox" @click.stop="$emit('toggle')">
        <Icon
          :name="
            task.status === 'completed'
              ? 'lucide:check-circle'
              : 'lucide:circle'
          "
          size="20"
        />
      </div>

      <!-- Информация о задаче -->
      <div class="task-info">
        <div class="task-header">
          <h4 class="task-title">{{ task.title }}</h4>
          <div class="task-priority" :class="`priority-${task.priority}`">
            <Icon :name="priorityIcon" size="12" />
          </div>
        </div>

        <p v-if="task.description" class="task-description">
          {{ task.description }}
        </p>

        <div class="task-meta">
          <!-- Категория -->
          <span
            class="task-category"
            :style="{ '--category-color': categoryColor }"
          >
            <Icon :name="categoryIcon" size="12" />
            {{ categoryName }}
          </span>

          <!-- Время -->
          <span v-if="task.spentMinutes > 0" class="task-time">
            <Icon name="lucide:clock" size="12" />
            {{ formatTime(task.spentMinutes) }}
          </span>

          <!-- Дедлайн -->
          <span
            v-if="task.dueAt"
            class="task-deadline"
            :class="{ 'task-overdue': isOverdue }"
          >
            <Icon name="lucide:calendar" size="12" />
            {{ formatDate(task.dueAt) }}
          </span>
        </div>

        <!-- Тэги -->
        <div v-if="task.tags.length > 0" class="task-tags">
          <span v-for="tag in task.tags" :key="tag" class="task-tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Действия -->
    <div class="task-actions" @click.stop>
      <!-- Таймер -->
      <div class="timer-section" v-if="!isTimerActive">
        <button
          class="timer-button"
          @click="$emit('timer-start')"
          :title="`Затрачено: ${formatTime(task.spentMinutes)}`"
        >
          <Icon name="lucide:play" size="16" />
        </button>
        <span class="timer-display">{{ formatTime(task.spentMinutes) }}</span>
      </div>

      <!-- Активный таймер -->
      <div class="timer-section active" v-else>
        <div class="active-timer">
          <div class="timer-pulse"></div>
          <span class="timer-display">{{ timerDisplay }}</span>
        </div>
        <div class="timer-controls">
          <button class="timer-control" @click="$emit('timer-pause')">
            <Icon name="lucide:pause" size="14" />
          </button>
          <button class="timer-control stop" @click="$emit('timer-stop')">
            <Icon name="lucide:square" size="14" />
          </button>
        </div>
      </div>

      <!-- Другие действия -->
      <div class="action-buttons">
        <button class="action-button" @click="$emit('edit')">
          <Icon name="lucide:edit-2" size="16" />
        </button>
        <button class="action-button delete" @click="$emit('delete')">
          <Icon name="lucide:trash-2" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task } from '~/stores/tasks'
import { computed } from 'vue'

const props = defineProps<{
  task: Task
  isTimerActive: boolean
  timerDisplay: string
}>()

const emit = defineEmits<{
  toggle: []
  'timer-start': []
  'timer-pause': []
  'timer-resume': []
  'timer-stop': []
  edit: []
  delete: []
}>()

const tasksStore = useTasksStore()

// Получаем информацию о категории
const category = computed(() => {
  return tasksStore.categories.find((cat) => cat.id === props.task.category)
})

const categoryName = computed(() => {
  return category.value?.name || 'Без категории'
})

const categoryIcon = computed(() => {
  return category.value?.icon || 'lucide:folder'
})

const categoryColor = computed(() => {
  return category.value?.color || '#a0a0a0'
})

// Иконка приоритета
const priorityIcon = computed(() => {
  switch (props.task.priority) {
    case 'high':
      return 'lucide:chevron-up'
    case 'medium':
      return 'lucide:minus'
    case 'low':
      return 'lucide:chevron-down'
    default:
      return 'lucide:minus'
  }
})

// Проверка просроченности
const isOverdue = computed(() => {
  if (!props.task.dueAt) return false
  return (
    new Date(props.task.dueAt) < new Date() && props.task.status === 'active'
  )
})

// Форматирование времени
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}

const formatDate = (date: Date) => {
  const today = new Date()
  const taskDate = new Date(date)

  if (taskDate.toDateString() === today.toDateString()) {
    return 'Сегодня'
  }

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (taskDate.toDateString() === yesterday.toDateString()) {
    return 'Вчера'
  }

  return taskDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}
</script>

<style scoped lang="scss">
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active {
    transform: translateY(0);
  }

  &.task-completed {
    opacity: 0.7;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .task-checkbox {
      :deep(svg) {
        color: var(--success);
      }
    }
  }

  &.task-high {
    border-left: 4px solid var(--error);
  }

  &.task-medium {
    border-left: 4px solid var(--warning);
  }

  &.task-low {
    border-left: 4px solid var(--success);
  }

  &.task-timer-active {
    background: rgba(93, 95, 239, 0.05);
    border-color: rgba(93, 95, 239, 0.2);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(93, 95, 239, 0.1),
        transparent
      );
      animation: shimmer 2s infinite;
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.task-checkbox {
  @include flex-center;
  flex-shrink: 0;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.task-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  @include text-truncate;
}

.task-priority {
  @include flex-center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);

  &.priority-high {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.priority-medium {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.priority-low {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }
}

.task-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2);
  @include text-truncate-multiline(2);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  margin-bottom: var(--space-2);
  flex-wrap: wrap;
}

.task-category {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(var(--category-color, 93, 95, 239), 0.1);
  color: var(--category-color, var(--accent-primary));
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);

  :deep(svg) {
    color: var(--category-color, var(--accent-primary));
  }
}

.task-time,
.task-deadline {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-weight: var(--font-medium);

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.task-deadline.task-overdue {
  color: var(--error);

  :deep(svg) {
    color: var(--error);
  }
}

.task-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.task-tag {
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.task-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.timer-section {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  &.active {
    .active-timer {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--accent-primary);
      color: white;
      border-radius: var(--radius-button);
      font-weight: var(--font-bold);
    }
  }
}

.timer-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: scale(1.1);
  }
}

.timer-display {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);

  .active & {
    color: white;
  }
}

.timer-pulse {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.timer-controls {
  display: flex;
  gap: var(--space-1);
}

.timer-control {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &.stop {
    background: rgba(248, 113, 113, 0.2);

    &:hover {
      background: var(--error);
    }
  }
}

.action-buttons {
  display: flex;
  gap: var(--space-1);
}

.action-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  opacity: 0;

  .task-item:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    transform: scale(1.1);
  }

  &.delete:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

[data-theme='light'] {
  .task-item {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }

    &.task-timer-active {
      background: rgba(93, 95, 239, 0.05);
      border-color: rgba(93, 95, 239, 0.1);
    }
  }

  .task-checkbox:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .task-tag {
    background: rgba(0, 0, 0, 0.05);
  }

  .action-button {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
