<template>
  <div class="content-section today-tasks">
    <div class="section-header">
      <h2>Сегодняшние задачи</h2>
      <button class="action-button secondary" @click="goToTasks">
        <span>Все задачи</span>
        <Icon name="lucide:arrow-right" size="16" />
      </button>
    </div>

    <div class="tasks-list">
      <div
        v-for="(task, index) in todaysTasks"
        :key="task.id"
        class="task-item"
        :class="{
          completed: task.status === 'completed',
          [task.priority]: true,
        }"
        @click="toggleTaskStatus(task.id)"
      >
        <div class="task-checkbox">
          <Icon
            :name="
              task.status === 'completed'
                ? 'lucide:check-circle'
                : 'lucide:circle'
            "
            size="18"
          />
        </div>
        <div class="task-content">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-meta">
            <span class="task-category">{{
              getCategoryName(task.category)
            }}</span>
            <span v-if="task.dueAt" class="task-time">{{
              formatTime(task.dueAt)
            }}</span>
          </div>
        </div>
        <button class="task-action" @click.stop="startTaskTimer(task)">
          <Icon name="lucide:play" size="16" />
        </button>
      </div>

      <div v-if="todaysTasks.length === 0" class="empty-state">
        <Icon name="lucide:check-circle" size="48" />
        <p>Все задачи выполнены!</p>
        <button class="action-button primary" @click="addQuickTask">
          <Icon name="lucide:plus" size="16" />
          Добавить задачу
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const router = useRouter()

const todaysTasks = computed(() => tasksStore.todaysTasks.slice(0, 4))

const getCategoryName = (categoryId: string) => {
  const category = tasksStore.categories.find((cat) => cat.id === categoryId)
  return category?.name || categoryId
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const startTaskTimer = (task: any) => {
  console.log('Start timer for task:', task.title)
  router.push('/timer')
}

const goToTasks = () => {
  router.push('/tasks')
}

const addQuickTask = () => {
  console.log('Add quick task')
}
</script>

<style scoped lang="scss">
.content-section {
  @include card;
  padding: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-card);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-primary);
    transform: scaleX(0);
    transition: transform var(--duration-base);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateX(4px);

    &::before {
      transform: scaleX(1);
    }

    .task-action {
      opacity: 1;
      transform: scale(1);
    }
  }

  &.completed {
    opacity: 0.6;

    .task-title {
      text-decoration: line-through;
    }

    &::before {
      background: var(--success);
    }
  }

  &.high::before {
    background: var(--error);
  }
  &.medium::before {
    background: var(--warning);
  }
  &.low::before {
    background: var(--success);
  }
}

.task-checkbox {
  @include flex-center;
  flex-shrink: 0;

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.task-content {
  flex: 1;
}

.task-title {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-xs);
}

.task-category {
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.task-time {
  color: var(--accent-primary);
  font-weight: var(--font-medium);
}

.task-action {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: var(--accent-primary);
  color: white;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);

  :deep(svg) {
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  p {
    margin-bottom: var(--space-4);
    color: var(--text-primary);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
  }
}
</style>
