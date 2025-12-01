<template>
  <div class="tasks-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Задачи</h1>
        <button class="add-button" @click="openCreateModal">
          <Icon name="lucide:plus" size="20" />
        </button>
      </div>
    </div>

    <!-- Stats & Filters -->
    <div class="page-controls">
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ activeTasks.length }}</div>
          <div class="stat-label">Активные</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedTasks.length }}</div>
          <div class="stat-label">Выполнено</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalTimeSpent }}</div>
          <div class="stat-label">Минут в фокусе</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="search-box">
          <Icon name="lucide:search" size="16" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск задач..."
            class="search-input"
          />
        </div>

        <div class="filter-tabs">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="filter-tab"
            :class="{ active: activeFilter === filter.value }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span v-if="filter.count !== undefined" class="filter-count">
              {{ filter.count }}
            </span>
          </button>
        </div>

        <div class="sort-controls">
          <button class="sort-button" @click="toggleSort">
            <Icon :name="sortIcon" size="16" />
            <span>{{ sortOrder === 'asc' ? 'Старые' : 'Новые' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Task List -->
    <div class="tasks-container">
      <!-- Active Timer Banner -->
      <div v-if="activeTaskWithTimer" class="active-timer-banner">
        <div class="timer-info">
          <div class="timer-indicator">
            <div class="pulse"></div>
            <Icon name="lucide:zap" size="16" />
          </div>
          <div class="timer-details">
            <div class="timer-task">{{ activeTaskWithTimer.title }}</div>
            <div class="timer-time">{{ timerElapsedTime }}</div>
          </div>
        </div>
        <button class="timer-stop" @click="stopTimer">
          <Icon name="lucide:square" size="16" />
          Стоп
        </button>
      </div>

      <!-- Tasks List -->
      <div class="tasks-list">
        <!-- Empty State -->
        <div v-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">
            <Icon name="lucide:check-circle" size="48" />
          </div>
          <h3>Нет задач</h3>
          <p>{{ emptyStateMessage }}</p>
          <button class="primary-button" @click="openCreateModal">
            <Icon name="lucide:plus" size="16" />
            Создать первую задачу
          </button>
        </div>

        <!-- Tasks -->
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @click="openEditModal(task)"
          @toggle="toggleTaskStatus(task.id)"
          @timer="toggleTaskTimer(task.id)"
          @edit="openEditModal(task)"
        />
      </div>
    </div>

    <!-- Modals -->
    <CreateTaskModal
      :is-open="showCreateModal"
      :task="editingTask"
      @close="closeModal"
      @saved="handleTaskSaved"
      @deleted="handleTaskDeleted"
    />
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// Initialize store
onMounted(() => {
  tasksStore.initialize()
})

// State
const activeFilter = ref<'all' | 'active' | 'completed' | 'today'>('all')
const searchQuery = ref('')
const sortOrder = ref<'asc' | 'desc'>('desc')
const showCreateModal = ref(false)
const editingTask = ref<Task | null>(null)

// Computed
const activeTasks = computed(() => tasksStore.activeTasks)
const completedTasks = computed(() => tasksStore.completedTasks)
const todayTasks = computed(() => tasksStore.todayTasks)
const activeTaskWithTimer = computed(() => tasksStore.activeTaskWithTimer)
const totalTimeSpent = computed(() => tasksStore.totalTimeSpent)

const filters = computed(() => [
  { value: 'all', label: 'Все', count: tasksStore.tasks.length },
  { value: 'active', label: 'Активные', count: activeTasks.value.length },
  {
    value: 'completed',
    label: 'Выполнено',
    count: completedTasks.value.length,
  },
  { value: 'today', label: 'Сегодня', count: todayTasks.value.length },
])

const sortIcon = computed(() =>
  sortOrder.value === 'desc' ? 'lucide:arrow-down' : 'lucide:arrow-up'
)

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks

  // Apply filter
  switch (activeFilter.value) {
    case 'active':
      tasks = activeTasks.value
      break
    case 'completed':
      tasks = completedTasks.value
      break
    case 'today':
      tasks = todayTasks.value
      break
  }

  // Apply search
  if (searchQuery.value.trim()) {
    tasks = tasksStore.searchTasks(searchQuery.value)
  }

  // Apply sorting
  return [...tasks].sort((a, b) => {
    const dateA = a.dueAt || a.createdAt
    const dateB = b.dueAt || b.createdAt

    return sortOrder.value === 'desc'
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime()
  })
})

const emptyStateMessage = computed(() => {
  if (searchQuery.value.trim()) {
    return 'По вашему запросу ничего не найдено'
  }
  switch (activeFilter.value) {
    case 'active':
      return 'Нет активных задач'
    case 'completed':
      return 'Нет выполненных задач'
    case 'today':
      return 'Нет задач на сегодня'
    default:
      return 'У вас еще нет задач'
  }
})

const timerElapsedTime = computed(() => {
  const minutes = tasksStore.getTimerElapsedMinutes()
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${remainingMinutes}м`
  }
  return `${minutes}м`
})

// Methods
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const openCreateModal = () => {
  editingTask.value = null
  showCreateModal.value = true
}

const openEditModal = (task: Task) => {
  editingTask.value = task
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingTask.value = null
}

const handleTaskSaved = () => {
  // Refresh or show success message
  console.log('Task saved successfully')
}

const handleTaskDeleted = () => {
  // Refresh or show success message
  console.log('Task deleted successfully')
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const toggleTaskTimer = (taskId: string) => {
  if (tasksStore.activeTimerTaskId === taskId) {
    tasksStore.stopTimer()
  } else {
    tasksStore.startTimer(taskId)
  }
}

const stopTimer = () => {
  tasksStore.stopTimer()
}

// Keyboard shortcuts
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      openCreateModal()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped lang="scss">
.tasks-page {
  padding: var(--space-4);
  padding-bottom: 80px;
  max-width: 800px;
  margin: 0 auto;
}

// Page Header
.page-header {
  margin-bottom: var(--space-6);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.add-button {
  @include button-reset;
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--accent-primary);
  color: white;
  box-shadow: var(--glow-primary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
    transform: scale(1.1);
  }
}

// Page Controls
.page-controls {
  margin-bottom: var(--space-6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.stat-card {
  @include card;
  padding: var(--space-4);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

// Filters
.filters-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.search-box {
  position: relative;

  :deep(svg) {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3)
    calc(var(--space-3) * 2 + 16px);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.filter-tabs {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-1);

  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
  }
}

.filter-tab {
  @include button-reset;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
  }

  .filter-count {
    margin-left: var(--space-1);
    font-size: var(--text-xs);
    opacity: 0.8;
  }
}

.sort-controls {
  display: flex;
  justify-content: flex-end;
}

.sort-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
  }
}

// Tasks Container
.tasks-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.active-timer-banner {
  @include card;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: rgba(93, 95, 239, 0.1);
  border: 1px solid rgba(93, 95, 239, 0.2);
  border-radius: var(--radius-card);
  animation: slideInDown 0.3s ease-out;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timer-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.timer-indicator {
  position: relative;
  @include flex-center;
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  border-radius: 50%;
  box-shadow: var(--glow-primary);

  .pulse {
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

.timer-details {
  .timer-task {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-1);
  }

  .timer-time {
    font-size: var(--text-sm);
    color: var(--accent-primary);
    font-weight: var(--font-medium);
  }
}

.timer-stop {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--radius-button);
  color: var(--error);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.2);
  }
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

.empty-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(93, 242, 126, 0.1);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--success);
  }
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  line-height: var(--leading-relaxed);
}

.primary-button {
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

// Light Theme
[data-theme='light'] {
  .stat-card {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .search-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .filter-tab {
    background: var(--surface-bg);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .sort-button {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      border-color: rgba(0, 0, 0, 0.2);
    }
  }

  .active-timer-banner {
    background: rgba(93, 95, 239, 0.08);
    border: 1px solid rgba(93, 95, 239, 0.1);
  }
}

// Mobile Optimizations
@include breakpoint(xs) {
  .tasks-page {
    padding: var(--space-3);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-wrap: wrap;
    overflow-x: visible;
  }
}

@include breakpoint(sm) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
