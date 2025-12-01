<template>
  <div
    class="task-item"
    :class="[
      `priority-${task.priority}`,
      { completed: task.status === 'completed', 'has-timer': hasTimer },
    ]"
    @click="$emit('click', task)"
  >
    <!-- Timer Indicator -->
    <div v-if="hasTimer" class="timer-indicator">
      <div class="timer-pulse"></div>
      <Icon name="lucide:zap" size="12" />
    </div>

    <!-- Checkbox -->
    <button class="task-checkbox" @click.stop="$emit('toggle')">
      <Icon
        :name="
          task.status === 'completed' ? 'lucide:check-circle' : 'lucide:circle'
        "
        size="20"
      />
    </button>

    <!-- Content -->
    <div class="task-content">
      <div class="task-header">
        <h3 class="task-title">{{ task.title }}</h3>
        <div class="task-badges">
          <span v-if="task.estimatedMinutes" class="time-badge">
            <Icon name="lucide:clock" size="12" />
            {{ task.estimatedMinutes }}м
          </span>
          <span
            v-if="task.spentMinutes && task.spentMinutes > 0"
            class="time-spent"
          >
            <Icon name="lucide:play" size="12" />
            {{ task.spentMinutes }}м
          </span>
        </div>
      </div>

      <p v-if="task.description" class="task-description">
        {{ task.description }}
      </p>

      <div class="task-footer">
        <!-- Category -->
        <div
          class="task-category"
          :style="{ backgroundColor: category?.color + '20' }"
        >
          <Icon v-if="category?.icon" :name="category.icon" size="12" />
          <span>{{ category?.name || 'Без категории' }}</span>
        </div>

        <!-- Tags -->
        <div v-if="task.tags && task.tags.length > 0" class="task-tags">
          <span v-for="tag in task.tags.slice(0, 2)" :key="tag" class="tag">
            {{ tag }}
          </span>
          <span v-if="task.tags.length > 2" class="tag-more">
            +{{ task.tags.length - 2 }}
          </span>
        </div>

        <!-- Due Date -->
        <div v-if="task.dueAt" class="task-due">
          <Icon name="lucide:calendar" size="12" />
          <span :class="{ overdue: isOverdue }">
            {{ formatDueDate(task.dueAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="task-actions">
      <button
        class="action-button"
        :class="{ active: hasTimer }"
        @click.stop="$emit('timer')"
        :title="hasTimer ? 'Остановить таймер' : 'Запустить таймер'"
      >
        <Icon :name="hasTimer ? 'lucide:pause' : 'lucide:play'" size="16" />
      </button>
      <button
        class="action-button"
        @click.stop="$emit('edit')"
        title="Редактировать"
      >
        <Icon name="lucide:edit-2" size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  click: [task: Task]
  toggle: []
  timer: []
  edit: []
}>()

// Computed
const category = computed<Category | undefined>(() => {
  return tasksStore.getCategoryById(props.task.category)
})

const hasTimer = computed(() => {
  return tasksStore.activeTimerTaskId === props.task.id
})

const isOverdue = computed(() => {
  if (!props.task.dueAt || props.task.status === 'completed') return false
  return new Date(props.task.dueAt) < new Date()
})

// Methods
const formatDueDate = (date: Date) => {
  const now = new Date()
  const taskDate = new Date(date)

  // Сегодня
  if (taskDate.toDateString() === now.toDateString()) {
    return taskDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Завтра
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (taskDate.toDateString() === tomorrow.toDateString()) {
    return 'Завтра'
  }

  // Эта неделя
  const weekLater = new Date(now)
  weekLater.setDate(weekLater.getDate() + 7)
  if (taskDate < weekLater) {
    return taskDate.toLocaleDateString('ru-RU', { weekday: 'short' })
  }

  // Другое
  return taskDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}
</script>

<style scoped lang="scss">
.task-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--card-bg);
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

  &.completed {
    opacity: 0.7;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .task-category,
    .task-tags {
      opacity: 0.5;
    }
  }

  &.has-timer {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
  }

  // Priority borders
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

.timer-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  @include flex-center;
  width: 24px;
  height: 24px;
  background: var(--accent-primary);
  border-radius: 50%;
  z-index: 2;
  box-shadow: var(--glow-primary);

  .timer-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--accent-primary);
    animation: pulse 2s infinite;
  }

  :deep(svg) {
    color: white;
    position: relative;
    z-index: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.task-checkbox {
  @include button-reset;
  @include flex-center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.1);
  }

  :deep(svg) {
    color: var(--text-secondary);
  }

  .completed & {
    :deep(svg) {
      color: var(--success);
    }
  }
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.task-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  margin: 0;
  flex: 1;
  @include text-truncate;
}

.task-badges {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.time-badge,
.time-spent {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-sm);
}

.time-badge {
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.time-spent {
  background: rgba(93, 242, 126, 0.1);
  color: var(--success);

  :deep(svg) {
    color: var(--success);
  }
}

.task-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-xs);
}

.task-category {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);

  :deep(svg) {
    flex-shrink: 0;
  }
}

.task-tags {
  display: flex;
  gap: var(--space-1);

  .tag {
    padding: var(--space-1) var(--space-2);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
  }

  .tag-more {
    padding: var(--space-1) var(--space-2);
    color: var(--text-muted);
  }
}

.task-due {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);

  &.overdue {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }

  :deep(svg) {
    color: currentColor;
  }
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex-shrink: 0;
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

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: var(--accent-secondary);
    }
  }
}

// Light Theme
[data-theme='light'] {
  .task-item {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .time-badge {
    background: rgba(93, 95, 239, 0.08);
  }

  .time-spent {
    background: rgba(93, 242, 126, 0.08);
  }

  .task-tags .tag {
    background: rgba(0, 0, 0, 0.05);
  }

  .task-due {
    background: rgba(0, 0, 0, 0.05);
  }

  .action-button {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile Optimizations
@include breakpoint(xs) {
  .task-item {
    padding: var(--space-3);
  }

  .task-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-actions {
    flex-direction: row;
  }
}
</style>
