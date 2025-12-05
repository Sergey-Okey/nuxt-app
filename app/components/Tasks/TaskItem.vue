<template>
  <div
    class="task-item"
    :class="{
      completed: task.status === 'completed',
      [`priority-${task.priority}`]: true,
      dragging: isDragging,
    }"
    @click="toggleTaskStatus"
    @contextmenu.prevent="openContextMenu"
  >
    <!-- Drag Handle -->
    <button
      class="drag-handle"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click.stop
    >
      <Icon name="lucide:grip-vertical" size="16" />
    </button>

    <!-- Checkbox -->
    <div class="task-checkbox" @click.stop="toggleTaskStatus">
      <Icon
        :name="
          task.status === 'completed' ? 'lucide:check-circle' : 'lucide:circle'
        "
        size="20"
      />
    </div>

    <!-- Task Content -->
    <div class="task-content">
      <div class="task-header">
        <h4 class="task-title">{{ task.title }}</h4>
        <div class="task-priority" :class="`priority-${task.priority}`">
          {{ priorityLabel }}
        </div>
      </div>

      <div class="task-meta">
        <!-- Category -->
        <div class="task-category" :style="{ color: category?.color }">
          <Icon :name="category?.icon || 'lucide:tag'" size="12" />
          <span>{{ category?.name || 'Без категории' }}</span>
        </div>

        <!-- Time Spent -->
        <div
          v-if="task.spentMinutes && task.spentMinutes > 0"
          class="task-time"
        >
          <Icon name="lucide:clock" size="12" />
          <span>{{ formatTimeSpent(task.spentMinutes) }}</span>
        </div>

        <!-- Due Date -->
        <div v-if="task.dueAt" class="task-due">
          <Icon name="lucide:calendar" size="12" />
          <span>{{ formatDueDate(task.dueAt) }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="task-actions">
      <button
        class="action-button start-timer"
        @click.stop="startTimer"
        title="Запустить таймер"
      >
        <Icon name="lucide:play" size="16" />
      </button>

      <button
        class="action-button more-actions"
        @click.stop="toggleActionsMenu"
        title="Другие действия"
      >
        <Icon name="lucide:more-vertical" size="16" />
      </button>
    </div>

    <!-- Actions Menu -->
    <div v-if="showActionsMenu" class="actions-menu">
      <button class="menu-item" @click="editTask">
        <Icon name="lucide:edit" size="16" />
        <span>Редактировать</span>
      </button>
      <button class="menu-item delete" @click="deleteTask">
        <Icon name="lucide:trash-2" size="16" />
        <span>Удалить</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

interface Props {
  task: Task
}

const props = defineProps<Props>()
const emit = defineEmits(['toggle', 'edit', 'delete', 'start-timer'])

const tasksStore = useTasksStore()
const router = useRouter()

// Local state
const showActionsMenu = ref(false)
const isDragging = ref(false)

// Computed
const category = computed(() => tasksStore.getCategoryById(props.task.category))
const priorityLabel = computed(() => {
  const labels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
  return labels[props.task.priority]
})

// Methods
const toggleTaskStatus = () => {
  emit('toggle', props.task.id)
}

const editTask = () => {
  emit('edit', props.task)
  showActionsMenu.value = false
}

const deleteTask = () => {
  emit('delete', props.task.id)
  showActionsMenu.value = false
}

const startTimer = () => {
  emit('start-timer', props.task)
  router.push('/timer')
}

const toggleActionsMenu = () => {
  showActionsMenu.value = !showActionsMenu.value
}

const openContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  showActionsMenu.value = true
}

const formatTimeSpent = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}

const formatDueDate = (date: Date) => {
  const due = new Date(date)
  const today = new Date()
  const diff = Math.floor(
    (due.getTime() - today.getTime()) / (1000 * 3600 * 24)
  )

  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Завтра'
  if (diff === -1) return 'Вчера'
  if (diff > 0 && diff < 7) return `через ${diff} д`
  if (diff < 0 && diff > -7) return `${Math.abs(diff)} д назад`

  return due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const startDrag = (event: MouseEvent | TouchEvent) => {
  event.preventDefault()
  isDragging.value = true
  // TODO: Implement drag and drop
}

// Close menu when clicking outside
onClickOutside(() => {
  showActionsMenu.value = false
})
</script>

<style scoped lang="scss">
.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;
  user-select: none;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);
    box-shadow: var(--shadow-sm);

    .drag-handle {
      opacity: 1;
    }
  }

  &.completed {
    opacity: 0.7;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .task-checkbox :deep(svg) {
      color: var(--success);
    }
  }

  &.dragging {
    opacity: 0.5;
    border: 1px dashed var(--accent-primary);
  }
}

.drag-handle {
  @include button-reset;
  @include flex-center;
  width: 20px;
  height: 20px;
  opacity: 0;
  color: var(--text-secondary);
  cursor: grab;
  transition: opacity var(--duration-base);

  &:active {
    cursor: grabbing;
  }
}

.task-checkbox {
  @include flex-center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.1);
    transform: scale(1.1);
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.task-content {
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
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  @include text-truncate;
}

.task-priority {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  white-space: nowrap;

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

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
  flex-wrap: wrap;
}

.task-category,
.task-time,
.task-due {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  font-weight: var(--font-medium);

  :deep(svg) {
    flex-shrink: 0;
  }
}

.task-actions {
  display: flex;
  align-items: center;
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
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
    transform: scale(1.1);
  }

  &.start-timer:hover {
    background: var(--accent-primary);
    color: white;
  }
}

.actions-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: var(--space-4);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  z-index: var(--z-dropdown);
  min-width: 160px;
  animation: slideDown 0.2s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 10px;
    height: 10px;
    background: var(--card-bg);
    transform: rotate(45deg);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
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

.menu-item {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:first-child {
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }

  &:last-child {
    border-radius: 0 0 var(--radius-card) var(--radius-card);
  }

  &.delete {
    color: var(--error);

    :deep(svg) {
      color: var(--error);
    }
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}
</style>
