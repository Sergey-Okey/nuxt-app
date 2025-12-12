<template>
  <div class="task-card" :class="['priority-' + task.priority, task.status]">
    <!-- Task Header -->
    <div class="task-header">
      <div class="task-title-section">
        <button class="status-button" @click="$emit('toggle-status', task.id)">
          <Icon
            :name="
              task.status === 'completed'
                ? 'lucide:check-circle'
                : 'lucide:circle'
            "
            size="18"
          />
        </button>
        <div class="task-title">{{ task.title }}</div>
      </div>
      <div class="task-actions">
        <!-- Timer button - теперь открывает/закрывает таймер -->
        <button
          class="action-button"
          @click.stop="toggleTaskTimer"
          :title="isTimerActive ? 'Остановить таймер' : 'Запустить таймер'"
        >
          <Icon
            :name="isTimerActive ? 'lucide:pause' : 'lucide:play'"
            size="14"
          />
        </button>
        <button class="action-button" @click.stop="$emit('edit', task)">
          <Icon name="lucide:pencil" size="14" />
        </button>
        <button
          class="action-button delete"
          @click.stop="$emit('delete', task.id)"
        >
          <Icon name="lucide:trash-2" size="14" />
        </button>
      </div>
    </div>

    <!-- Task Content -->
    <div class="task-content">
      <div v-if="task.description" class="task-description">
        {{ task.description }}
      </div>

      <div class="task-meta">
        <div class="task-category">
          <Icon name="lucide:folder" size="12" />
          <span>{{ categoryName }}</span>
        </div>

        <div v-if="task.dueAt" class="task-due">
          <Icon name="lucide:calendar" size="12" />
          <span>{{ formatDueDate }}</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="task.estimatedMinutes" class="progress-section">
        <div class="progress-info">
          <span class="progress-text">Прогресс</span>
          <span class="progress-value">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="time-info">
          <span>{{ spentTimeText }}</span>
          <span>{{ estimatedTimeText }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="task-tags">
        <span v-for="tag in task.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>

    <!-- Task Footer -->
    <div class="task-footer">
      <div class="task-info">
        <div class="task-priority" :class="'priority-' + task.priority">
          <Icon :name="priorityIcon" size="12" />
          <span>{{ priorityText }}</span>
        </div>

        <div class="task-date">
          <Icon name="lucide:clock" size="12" />
          <span>{{ formatCreatedAt }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

interface Props {
  task: any
  isTimerActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isTimerActive: false,
})

defineEmits<{
  'toggle-status': [id: string]
  edit: [task: any]
  delete: [id: string]
  'toggle-timer': [task: any]
}>()

// Computed
const categoryName = computed(() => {
  const category = tasksStore.categories.find(
    (cat) => cat.id === props.task.category
  )
  return category?.name || props.task.category || 'Без категории'
})

const formatDueDate = computed(() => {
  if (!props.task.dueAt) return ''

  const date = new Date(props.task.dueAt)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Сегодня'
  if (date.toDateString() === tomorrow.toDateString()) return 'Завтра'

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
})

const formatCreatedAt = computed(() => {
  const date = new Date(props.task.createdAt)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
})

const progressPercentage = computed(() => {
  if (!props.task.estimatedMinutes || !props.task.spentMinutes) return 0
  return Math.min(
    100,
    Math.round((props.task.spentMinutes / props.task.estimatedMinutes) * 100)
  )
})

const spentTimeText = computed(() => {
  const minutes = props.task.spentMinutes || 0
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
})

const estimatedTimeText = computed(() => {
  if (!props.task.estimatedMinutes) return ''
  const hours = Math.floor(props.task.estimatedMinutes / 60)
  const mins = props.task.estimatedMinutes % 60
  return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`
})

const priorityIcon = computed(() => {
  switch (props.task.priority) {
    case 'high':
      return 'lucide:alert-circle'
    case 'medium':
      return 'lucide:alert-triangle'
    case 'low':
      return 'lucide:arrow-down-circle'
    default:
      return 'lucide:circle'
  }
})

const priorityText = computed(() => {
  switch (props.task.priority) {
    case 'high':
      return 'Высокий'
    case 'medium':
      return 'Средний'
    case 'low':
      return 'Низкий'
    default:
      return 'Без приоритета'
  }
})

const toggleTaskTimer = () => {
  emit('toggle-timer', props.task)
}
</script>

<style scoped lang="scss">
.task-card {
  @include card;
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);
  width: 100%;
  box-sizing: border-box;

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
    border-left: 3px solid var(--error);
  }

  &.priority-medium {
    border-left: 3px solid var(--warning);
  }

  &.priority-low {
    border-left: 3px solid var(--success);
  }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
  gap: var(--space-2);
}

.task-title-section {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.status-button {
  @include button-reset;
  @include flex-center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.1);
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.completed .status-button :deep(svg) {
  color: var(--success);
}

.task-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  @include text-truncate;
}

.task-actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.action-button {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
  }

  &.delete:hover {
    background: var(--error);
  }
}

.task-content {
  flex: 1;
  margin-bottom: var(--space-2);
}

.task-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2);
  @include text-truncate-multiline(2);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  font-size: var(--text-xs);
}

.task-category,
.task-due {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--accent-primary);
    flex-shrink: 0;
  }
}

.task-due :deep(svg) {
  color: var(--warning);
}

.progress-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-card);
  padding: var(--space-2);
  margin-bottom: var(--space-2);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
  font-size: var(--text-xs);
}

.progress-text {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.progress-value {
  color: var(--accent-primary);
  font-weight: var(--font-bold);
}

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--space-1);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 2px;
  transition: width var(--duration-slow);
}

.time-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.tag {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.task-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: var(--space-2);
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
}

.task-priority {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: var(--font-medium);

  &.priority-high {
    color: var(--error);
  }

  &.priority-medium {
    color: var(--warning);
  }

  &.priority-low {
    color: var(--success);
  }
}

.task-date {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--text-secondary);
  }
}

// Адаптивность
@include breakpoint(sm) {
  .task-card {
    padding: var(--space-4);
  }

  .task-header {
    margin-bottom: var(--space-3);
  }

  .task-content {
    margin-bottom: var(--space-3);
  }

  .action-button {
    width: 28px;
    height: 28px;

    :deep(svg) {
      size: 16px;
    }
  }

  .status-button {
    :deep(svg) {
      size: 20px;
    }
  }

  .task-category,
  .task-due,
  .task-priority,
  .task-date {
    font-size: var(--text-sm);

    :deep(svg) {
      size: 14px;
    }
  }
}
</style>
