<template>
  <div class="task-list">
    <!-- Header с фильтрами -->
    <div class="list-header">
      <div class="filter-controls">
        <div class="filter-group">
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            class="filter-button"
            :class="{ active: activeStatus === filter.value }"
            @click="setStatusFilter(filter.value)"
          >
            <Icon :name="filter.icon" size="16" />
            <span>{{ filter.label }}</span>
            <span v-if="filter.count !== undefined" class="filter-count">
              {{ filter.count }}
            </span>
          </button>
        </div>

        <div class="search-container">
          <Icon name="lucide:search" size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск задач..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            class="clear-search"
            @click="searchQuery = ''"
          >
            <Icon name="lucide:x" size="14" />
          </button>
        </div>
      </div>

      <!-- Категории фильтры -->
      <div class="category-filters">
        <button
          class="category-filter"
          :class="{ active: activeCategory === 'all' }"
          @click="setCategoryFilter('all')"
        >
          <Icon name="lucide:layout-grid" size="16" />
          <span>Все</span>
        </button>

        <button
          v-for="category in availableCategories"
          :key="category.id"
          class="category-filter"
          :class="{ active: activeCategory === category.id }"
          @click="setCategoryFilter(category.id)"
          :style="{ '--category-color': category.color }"
        >
          <Icon :name="category.icon" size="16" />
          <span>{{ category.name }}</span>
          <span v-if="category.taskCount > 0" class="category-count">
            {{ category.taskCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Список задач -->
    <div class="tasks-container">
      <div v-if="filteredTasks.length > 0" class="tasks-scroll">
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :is-timer-active="isTaskTimerActive(task.id)"
          :timer-display="timerDisplay"
          @toggle="toggleTaskStatus(task.id)"
          @timer-start="startTaskTimer(task.id)"
          @timer-pause="pauseTimer"
          @timer-resume="resumeTimer"
          @timer-stop="stopTimer"
          @edit="openEditModal(task)"
          @delete="deleteTask(task.id)"
        />
      </div>

      <!-- Состояние пустого списка -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <Icon name="lucide:clipboard-check" size="48" />
        </div>
        <h3>Задачи не найдены</h3>
        <p v-if="searchQuery">Попробуйте изменить критерии поиска</p>
        <p v-else>Добавьте первую задачу</p>
        <button class="add-button" @click="$emit('add-task')">
          <Icon name="lucide:plus" size="16" />
          <span>Добавить задачу</span>
        </button>
      </div>
    </div>

    <!-- Сводка по задачам -->
    <div v-if="filteredTasks.length > 0" class="list-summary">
      <div class="summary-item">
        <Icon name="lucide:check-circle" size="16" />
        <span>{{ completedCount }} выполнено</span>
      </div>
      <div class="summary-item">
        <Icon name="lucide:clock" size="16" />
        <span>{{ totalTimeSpent }}</span>
      </div>
      <div class="summary-item">
        <Icon name="lucide:bar-chart" size="16" />
        <span>{{ completionRate }}% завершено</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task } from '~/stores/tasks'

const tasksStore = useTasksStore()

// Фильтры
const activeStatus = ref<'all' | 'active' | 'completed'>('all')
const activeCategory = ref<string>('all')
const searchQuery = ref('')
const timerDisplay = ref('00:00')

// Доступные категории
const availableCategories = computed(() => {
  return tasksStore.categories.filter(
    (cat) => cat.taskCount > 0 || cat.id === 'uncategorized'
  )
})

// Фильтры по статусу
const statusFilters = computed(() => [
  {
    value: 'all' as const,
    label: 'Все',
    icon: 'lucide:layout-grid',
    count: tasksStore.tasks.length,
  },
  {
    value: 'active' as const,
    label: 'Активные',
    icon: 'lucide:circle',
    count: tasksStore.activeTasks.length,
  },
  {
    value: 'completed' as const,
    label: 'Выполнено',
    icon: 'lucide:check-circle',
    count: tasksStore.completedTasks.length,
  },
])

// Отфильтрованные задачи
const filteredTasks = computed(() => {
  let filtered = tasksStore.tasks

  if (activeStatus.value !== 'all') {
    filtered = filtered.filter((task) => task.status === activeStatus.value)
  }

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter((task) => task.category === activeCategory.value)
  }

  if (searchQuery.value) {
    const searchLower = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
    )
  }

  return filtered.sort((a, b) => {
    // Приоритет по статусу (активные сверху)
    if (a.status === 'active' && b.status === 'completed') return -1
    if (a.status === 'completed' && b.status === 'active') return 1

    // Затем по приоритету
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff

    // Затем по дате создания (новые сверху)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

// Статистика
const completedCount = computed(() => {
  return filteredTasks.value.filter((task) => task.status === 'completed')
    .length
})

const totalTimeSpent = computed(() => {
  const totalMinutes = filteredTasks.value.reduce(
    (sum, task) => sum + task.spentMinutes,
    0
  )
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
})

const completionRate = computed(() => {
  if (filteredTasks.value.length === 0) return 0
  return Math.round((completedCount.value / filteredTasks.value.length) * 100)
})

// Методы
const setStatusFilter = (status: 'all' | 'active' | 'completed') => {
  activeStatus.value = status
}

const setCategoryFilter = (categoryId: string) => {
  activeCategory.value = categoryId
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const isTaskTimerActive = (taskId: string) => {
  return tasksStore.activeTimer.taskId === taskId
}

const startTaskTimer = (taskId: string) => {
  tasksStore.startTimer(taskId)
  startTimerDisplay()
}

const pauseTimer = () => {
  tasksStore.pauseTimer()
}

const resumeTimer = () => {
  tasksStore.resumeTimer()
  startTimerDisplay()
}

const stopTimer = () => {
  tasksStore.stopTimer()
  timerDisplay.value = '00:00'
}

const deleteTask = (taskId: string) => {
  tasksStore.deleteTask(taskId)
}

// Обновление отображения таймера
const startTimerDisplay = () => {
  const updateDisplay = () => {
    if (tasksStore.activeTimer.taskId) {
      tasksStore.updateTimer()
      timerDisplay.value = tasksStore.getTimerDisplay()
    }
  }

  const interval = setInterval(updateDisplay, 1000)

  // Остановить обновление, когда таймер остановлен
  watch(
    () => tasksStore.activeTimer.taskId,
    (newVal) => {
      if (!newVal) {
        clearInterval(interval)
        timerDisplay.value = '00:00'
      }
    }
  )
}

// Инициализация отображения таймера
onMounted(() => {
  if (tasksStore.activeTimer.taskId) {
    startTimerDisplay()
  }
})

defineEmits<{
  'add-task': []
  'edit-task': [task: Task]
}>()
</script>

<style scoped lang="scss">
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.list-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @include breakpoint(sm) {
    flex-direction: row;
    align-items: center;
  }
}

.filter-group {
  display: flex;
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  padding: var(--space-1);
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  transition: all var(--duration-base);

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: var(--accent-primary);
    color: white;

    .filter-count {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.filter-count {
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.search-container {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3)
    calc(var(--space-3) * 2 + 16px);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: var(--glow-primary);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.clear-search {
  @include button-reset;
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    color: var(--text-primary);
  }
}

.category-filters {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-2);

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
}

.category-filter {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover:not(.active) {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &.active {
    background: rgba(var(--category-color, 93, 95, 239), 0.1);
    border-color: rgba(var(--category-color, 93, 95, 239), 0.3);
    color: var(--category-color, var(--accent-primary));

    :deep(svg) {
      color: var(--category-color, var(--accent-primary));
    }
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.category-count {
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}

.tasks-container {
  min-height: 400px;
}

.tasks-scroll {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 600px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--text-secondary);
}

.empty-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--text-secondary);
    opacity: 0.5;
  }
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-4);
  color: var(--text-secondary);
}

.add-button {
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

.list-summary {
  display: flex;
  justify-content: space-around;
  padding: var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  font-size: var(--text-sm);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--text-muted);
  }
}

[data-theme='light'] {
  .filter-button {
    &:hover:not(.active) {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .search-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .category-filter {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover:not(.active) {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .category-count {
    background: rgba(0, 0, 0, 0.05);
  }

  .list-summary {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
}
</style>
