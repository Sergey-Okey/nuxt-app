<template>
  <div class="today-tasks-widget">
    <div class="widget-header">
      <h3 class="widget-title">
        <Icon name="lucide:calendar" size="20" />
        <span>Задачи на сегодня</span>
      </h3>
      <div class="task-stats">
        <span class="completed-count">{{ completedTasks }}</span>
        <span class="divider">/</span>
        <span class="total-count">{{ totalTasks }}</span>
      </div>
    </div>

    <div class="tasks-container">
      <div v-if="todaysTasks.length > 0" class="tasks-list">
        <div
          v-for="task in todaysTasks"
          :key="task.id"
          class="task-card"
          :class="{
            completed: task.status === 'completed',
            [`priority-${task.priority}`]: true,
          }"
          @click="toggleTaskStatus(task.id)"
        >
          <div class="task-main">
            <div
              class="task-checkbox"
              :class="{ completed: task.status === 'completed' }"
            >
              <Icon
                :name="
                  task.status === 'completed'
                    ? 'lucide:check-circle'
                    : 'lucide:circle'
                "
                size="18"
              />
            </div>
            <div class="task-info">
              <div class="task-title">{{ task.title }}</div>
              <div class="task-details">
                <span class="task-category">{{
                  getCategoryName(task.category)
                }}</span>
                <span v-if="task.dueAt" class="task-time">
                  <Icon name="lucide:clock" size="12" />
                  {{ formatTime(task.dueAt) }}
                </span>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button
              class="quick-action"
              @click.stop="startTaskTimer(task)"
              title="Начать фокус-сессию"
            >
              <Icon name="lucide:play" size="14" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <Icon name="lucide:check-circle" size="32" />
        </div>
        <div class="empty-content">
          <h4>Планов на сегодня нет</h4>
          <p>Добавьте задачи, чтобы начать продуктивный день</p>
        </div>
        <button class="add-task-button" @click="goToTasks">
          <Icon name="lucide:plus" size="16" />
          <span>Добавить задачу</span>
        </button>
      </div>
    </div>

    <div v-if="todaysTasks.length > 0" class="widget-footer">
      <button class="view-all-button" @click="goToTasks">
        <span>Смотреть все задачи</span>
        <Icon name="lucide:arrow-right" size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const router = useRouter()

// Получаем задачи на сегодня (первые 5)
const todaysTasks = computed(() => {
  return tasksStore.todayTasks?.slice(0, 5) || []
})

// Статистика задач
const completedTasks = computed(() => {
  return (
    tasksStore.todayTasks?.filter((task) => task.status === 'completed')
      .length || 0
  )
})

const totalTasks = computed(() => {
  return tasksStore.todayTasks?.length || 0
})

// Методы
const getCategoryName = (categoryId: string) => {
  const category = tasksStore.categories.find((cat) => cat.id === categoryId)
  return category?.name || 'Без категории'
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
  // TODO: Реализовать запуск таймера для конкретной задачи
  console.log('Start timer for task:', task.title)
  router.push('/timer')
}

const goToTasks = () => {
  router.push('/tasks')
}
</script>

<style scoped lang="scss">
.today-tasks-widget {
  @include card;
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.widget-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.task-stats {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);

  .completed-count {
    color: var(--success);
  }

  .divider {
    color: var(--text-secondary);
  }

  .total-count {
    color: var(--text-primary);
  }
}

.tasks-container {
  min-height: 120px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.task-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &.completed {
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

  // Приоритеты через левую границу
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

.task-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.task-checkbox {
  @include flex-center;
  flex-shrink: 0;
  transition: all var(--duration-base);

  :deep(svg) {
    color: var(--text-secondary);
  }

  &:hover {
    transform: scale(1.1);
  }

  &.completed {
    :deep(svg) {
      color: var(--success);
    }
  }
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: var(--leading-tight);
  @include text-truncate;
}

.task-details {
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
  font-weight: var(--font-medium);
}

.task-time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--accent-primary);
  font-weight: var(--font-medium);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.task-actions {
  display: flex;
  gap: var(--space-2);
}

.quick-action {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: scale(1.1);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--text-secondary);
}

.empty-icon {
  @include flex-center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: rgba(93, 242, 126, 0.1);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--success);
  }
}

.empty-content {
  margin-bottom: var(--space-4);

  h4 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
  }
}

.add-task-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    box-shadow: var(--glow-primary);
  }
}

.widget-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.view-all-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    color: var(--accent-primary);
    background: rgba(255, 255, 255, 0.05);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .task-category {
    background: rgba(0, 0, 0, 0.05);
  }

  .quick-action {
    background: rgba(0, 0, 0, 0.05);
  }

  .view-all-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
