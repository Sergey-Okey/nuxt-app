<template>
  <div
    class="task-item"
    :class="[
      `priority-${task.priority}`,
      { completed: task.status === 'completed', dragging: isDragging },
    ]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @click="toggleStatus"
  >
    <!-- Priority Indicator -->
    <div class="priority-indicator"></div>

    <!-- Checkbox -->
    <button class="task-checkbox" @click.stop="toggleStatus">
      <Icon
        :name="
          task.status === 'completed' ? 'lucide:check-circle' : 'lucide:circle'
        "
        size="20"
      />
    </button>

    <!-- Task Content -->
    <div class="task-content">
      <div class="task-header">
        <h4
          class="task-title"
          :class="{ completed: task.status === 'completed' }"
        >
          {{ task.title }}
        </h4>
        <div class="task-actions">
          <button
            v-if="task.estimatedMinutes && task.status === 'active'"
            class="action-button timer-button"
            @click.stop="startTimer"
            title="Запустить таймер"
          >
            <Icon name="lucide:play" size="14" />
            <span>{{ formatMinutes(task.estimatedMinutes) }}</span>
          </button>
          <button
            class="action-button edit-button"
            @click.stop="openEdit"
            title="Редактировать"
          >
            <Icon name="lucide:pencil" size="14" />
          </button>
        </div>
      </div>

      <!-- Task Details -->
      <div v-if="showDetails" class="task-details">
        <!-- Description -->
        <p v-if="task.description" class="task-description">
          {{ task.description }}
        </p>

        <!-- Tags & Category -->
        <div class="task-meta">
          <!-- Category -->
          <span
            v-if="taskCategory"
            class="category-badge"
            :style="{ background: taskCategory.color + '20' }"
          >
            <Icon :name="taskCategory.icon" size="12" />
            <span>{{ taskCategory.name }}</span>
          </span>

          <!-- Tags -->
          <span v-for="tag in task.tags" :key="tag" class="tag-badge">
            {{ tag }}
          </span>

          <!-- Due Date -->
          <span
            v-if="task.dueAt"
            class="due-date"
            :class="{ overdue: isOverdue }"
          >
            <Icon name="lucide:calendar" size="12" />
            <span>{{ formatDueDate(task.dueAt) }}</span>
          </span>

          <!-- Time Spent -->
          <span
            v-if="task.spentMinutes && task.spentMinutes > 0"
            class="time-spent"
          >
            <Icon name="lucide:clock" size="12" />
            <span>{{ formatMinutes(task.spentMinutes) }}</span>
          </span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button
          class="quick-action delete"
          @click.stop="deleteTask"
          title="Удалить"
        >
          <Icon name="lucide:trash-2" size="14" />
        </button>
        <button
          v-if="task.status === 'active'"
          class="quick-action complete"
          @click.stop="toggleStatus"
          title="Завершить"
        >
          <Icon name="lucide:check" size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

interface Props {
  task: Task
}

const props = defineProps<Props>()
const emit = defineEmits(['edit', 'delete', 'toggle', 'timer-start'])

const tasksStore = useTasksStore()
const isDragging = ref(false)
const showDetails = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)

// Computed
const taskCategory = computed(() => {
  return tasksStore.categories.find((cat) => cat.id === props.task.category)
})

const isOverdue = computed(() => {
  if (!props.task.dueAt) return false
  return (
    new Date(props.task.dueAt) < new Date() && props.task.status === 'active'
  )
})

// Methods
const toggleStatus = () => {
  emit('toggle', props.task.id)
}

const deleteTask = () => {
  emit('delete', props.task.id)
}

const openEdit = () => {
  emit('edit', props.task)
}

const startTimer = () => {
  emit('timer-start', props.task)
}

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}м`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

const formatDueDate = (date: Date) => {
  const now = new Date()
  const due = new Date(date)
  const diff = due.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Завтра'
  if (days < 7) return `Через ${days} д`

  return due.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  })
}

// Drag & Drop
const handleDragStart = (e: DragEvent) => {
  isDragging.value = true
  e.dataTransfer?.setData('taskId', props.task.id)
}

const handleDragEnd = () => {
  isDragging.value = false
}

// Touch gestures for swipe actions
const handleTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  if (!touchStartX.value) return

  const touchX = e.touches[0].clientX
  const diffX = touchX - touchStartX.value

  if (Math.abs(diffX) > 50) {
    // Swipe detected
    if (diffX > 0) {
      // Swipe right - complete
      if (props.task.status === 'active') {
        toggleStatus()
      }
    } else {
      // Swipe left - delete
      deleteTask()
    }
    touchStartX.value = 0
  }
}

const handleTouchEnd = () => {
  touchStartX.value = 0
  touchStartY.value = 0
}

// Toggle details on long press (mobile)
let longPressTimer: NodeJS.Timeout

const handleLongPress = () => {
  showDetails.value = !showDetails.value
}

const setupLongPress = () => {
  const element = document.querySelector('.task-item')
  if (!element) return

  element.addEventListener('touchstart', () => {
    longPressTimer = setTimeout(handleLongPress, 500)
  })

  element.addEventListener('touchend', () => {
    clearTimeout(longPressTimer)
  })

  element.addEventListener('touchmove', () => {
    clearTimeout(longPressTimer)
  })
}

onMounted(() => {
  setupLongPress()
})

onUnmounted(() => {
  clearTimeout(longPressTimer)
})
</script>

<style scoped lang="scss">
.task-item {
  @include card;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-2);
  border-left: 4px solid transparent;
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);

    .quick-actions {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:active {
    transform: translateY(0);
  }

  &.dragging {
    opacity: 0.5;
    transform: scale(0.98);
    box-shadow: var(--shadow-lg);
  }

  &.completed {
    opacity: 0.6;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .priority-indicator {
      opacity: 0.3;
    }
  }

  // Priority styles
  &.priority-high {
    border-left-color: var(--error);

    .priority-indicator {
      background: var(--error);
    }
  }

  &.priority-medium {
    border-left-color: var(--warning);

    .priority-indicator {
      background: var(--warning);
    }
  }

  &.priority-low {
    border-left-color: var(--success);

    .priority-indicator {
      background: var(--success);
    }
  }
}

.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  opacity: 0.8;
}

.task-checkbox {
  @include button-reset;
  @include flex-center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
    transform: scale(1.1);
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
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.task-title {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  flex: 1;

  &.completed {
    color: var(--text-secondary);
    text-decoration: line-through;
  }
}

.task-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

.action-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.timer-button {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);

    &:hover {
      background: rgba(93, 95, 239, 0.2);
    }
  }

  &.edit-button {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }
}

.task-details {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-description {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-xs);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);

  :deep(svg) {
    opacity: 0.8;
  }
}

.tag-badge {
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.due-date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);

  &.overdue {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.time-spent {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(93, 242, 126, 0.1);
  color: var(--success);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
}

.quick-actions {
  position: absolute;
  top: 50%;
  right: var(--space-4);
  transform: translateY(-50%) translateX(100%);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  opacity: 0;
  transition: all var(--duration-base);
}

.quick-action {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  color: white;
  transition: all var(--duration-base);

  &.delete {
    background: var(--error);

    &:hover {
      background: rgba(248, 113, 113, 0.8);
    }
  }

  &.complete {
    background: var(--success);

    &:hover {
      background: rgba(93, 242, 126, 0.8);
    }
  }

  &:hover {
    transform: scale(1.1);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .task-checkbox {
    background: rgba(0, 0, 0, 0.05);
  }

  .action-button.edit-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .tag-badge,
  .due-date:not(.overdue) {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .task-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-actions {
    align-self: flex-end;
  }

  .quick-actions {
    position: static;
    transform: none;
    opacity: 1;
    flex-direction: row;
    margin-top: var(--space-2);
  }
}
</style>
