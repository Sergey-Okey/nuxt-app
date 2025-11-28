<template>
  <div class="tasks-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Мои задачи</h1>
      <div class="header-actions">
        <button class="search-button" @click="showSearch = !showSearch">
          <Icon name="lucide:search" size="20" />
        </button>
        <button class="filter-button" @click="showFilters = !showFilters">
          <Icon name="lucide:filter" size="20" />
        </button>
        <button class="add-button" @click="openCreateModal">
          <Icon name="lucide:plus" size="20" />
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div v-if="showSearch" class="search-bar">
      <div class="search-input-wrapper">
        <Icon name="lucide:search" size="18" />
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
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div v-if="showFilters" class="filters-bar">
      <div class="filters-content">
        <div class="filter-group">
          <label>Статус</label>
          <div class="filter-options">
            <button
              v-for="status in statusFilters"
              :key="status.value"
              class="filter-option"
              :class="{ active: activeFilters.status === status.value }"
              @click="activeFilters.status = status.value"
            >
              {{ status.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>Приоритет</label>
          <div class="filter-options">
            <button
              v-for="priority in priorityFilters"
              :key="priority.value"
              class="filter-option"
              :class="{ active: activeFilters.priority === priority.value }"
              @click="activeFilters.priority = priority.value"
            >
              <Icon :name="priority.icon" size="14" />
              {{ priority.label }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <label>Категория</label>
          <div class="filter-options">
            <button
              v-for="category in categoryFilters"
              :key="category.id"
              class="filter-option"
              :class="{ active: activeFilters.category === category.id }"
              @click="activeFilters.category = category.id"
            >
              <div
                class="category-color"
                :style="{ backgroundColor: category.color }"
              ></div>
              {{ category.name }}
            </button>
          </div>
        </div>

        <button class="clear-filters" @click="clearFilters">
          Сбросить фильтры
        </button>
      </div>
    </div>

    <!-- Tasks Stats -->
    <div class="tasks-stats">
      <div class="stat-card">
        <div class="stat-value">{{ activeTasksCount }}</div>
        <div class="stat-label">Активные</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ completedTasksCount }}</div>
        <div class="stat-label">Выполненные</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todayTasksCount }}</div>
        <div class="stat-label">Сегодня</div>
      </div>
    </div>

    <!-- Tasks List -->
    <div class="tasks-container">
      <div v-if="filteredTasks.length > 0" class="tasks-list">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-item"
          :class="{
            completed: task.status === 'completed',
            [`priority-${task.priority}`]: true,
          }"
        >
          <div class="task-main" @click="toggleTaskStatus(task.id)">
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
                size="20"
              />
            </div>
            <div class="task-content">
              <div class="task-header">
                <h3 class="task-title">{{ task.title }}</h3>
                <div class="task-priority" :class="task.priority">
                  <Icon :name="getPriorityIcon(task.priority)" size="14" />
                </div>
              </div>

              <div class="task-meta">
                <div class="task-category">
                  <div
                    class="category-color"
                    :style="{
                      backgroundColor: getCategoryColor(task.category),
                    }"
                  ></div>
                  <span>{{ getCategoryName(task.category) }}</span>
                </div>

                <div v-if="task.dueAt" class="task-due">
                  <Icon name="lucide:calendar" size="12" />
                  <span>{{ formatDueDate(task.dueAt) }}</span>
                </div>

                <div v-if="task.estimatedMinutes" class="task-estimate">
                  <Icon name="lucide:clock" size="12" />
                  <span>{{ formatTime(task.estimatedMinutes) }}</span>
                </div>

                <div v-if="task.spentMinutes" class="task-spent">
                  <Icon name="lucide:play" size="12" />
                  <span>{{ formatTime(task.spentMinutes) }}</span>
                </div>
              </div>

              <div v-if="task.description" class="task-description">
                {{ task.description }}
              </div>

              <div v-if="task.tags.length > 0" class="task-tags">
                <span v-for="tag in task.tags" :key="tag" class="task-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <button
              class="task-action"
              @click="startTaskTimer(task)"
              title="Запустить таймер"
            >
              <Icon name="lucide:play" size="16" />
            </button>
            <button
              class="task-action"
              @click="editTask(task)"
              title="Редактировать"
            >
              <Icon name="lucide:edit-3" size="16" />
            </button>
            <button
              class="task-action delete"
              @click="deleteTask(task.id)"
              title="Удалить"
            >
              <Icon name="lucide:trash-2" size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <Icon name="lucide:check-circle" size="48" />
        </div>
        <h3>Задачи не найдены</h3>
        <p>{{ emptyStateMessage }}</p>
        <button class="add-task-button" @click="openCreateModal">
          <Icon name="lucide:plus" size="16" />
          <span>Создать задачу</span>
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <CreateTaskModal
      :is-open="showCreateModal"
      :task="editingTask"
      @close="closeCreateModal"
      @saved="handleTaskSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { Task } from '~/stores/tasks'

const tasksStore = useTasksStore()
const timerStore = useTimerStore()
const router = useRouter()

// Initialize store
onMounted(() => {
  tasksStore.initialize()
})

// UI State
const showSearch = ref(false)
const showFilters = ref(false)
const showCreateModal = ref(false)
const searchQuery = ref('')
const editingTask = ref<Task | null>(null)

// Filters
const activeFilters = reactive({
  status: 'all' as 'all' | 'active' | 'completed',
  priority: 'all' as 'all' | 'low' | 'medium' | 'high',
  category: 'all' as string,
})

const statusFilters = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

const priorityFilters = [
  { value: 'all', label: 'Все', icon: 'lucide:list' },
  { value: 'low', label: 'Низкий', icon: 'lucide:arrow-down' },
  { value: 'medium', label: 'Средний', icon: 'lucide:minus' },
  { value: 'high', label: 'Высокий', icon: 'lucide:arrow-up' },
]

// Computed properties
const categoryFilters = computed(() => [
  { id: 'all', name: 'Все категории', color: '#6b7280' },
  ...tasksStore.categories,
])

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks

  // Apply search
  if (searchQuery.value) {
    tasks = tasksStore.searchTasks(searchQuery.value)
  }

  // Apply filters
  if (activeFilters.status !== 'all') {
    tasks = tasks.filter((task) => task.status === activeFilters.status)
  }

  if (activeFilters.priority !== 'all') {
    tasks = tasks.filter((task) => task.priority === activeFilters.priority)
  }

  if (activeFilters.category !== 'all') {
    tasks = tasks.filter((task) => task.category === activeFilters.category)
  }

  return tasks
})

const activeTasksCount = computed(() => tasksStore.activeTasks.length)
const completedTasksCount = computed(() => tasksStore.completedTasks.length)
const todayTasksCount = computed(() => tasksStore.todayTasks.length)

const emptyStateMessage = computed(() => {
  if (searchQuery.value) return 'Попробуйте изменить поисковый запрос'
  if (Object.values(activeFilters).some((filter) => filter !== 'all')) {
    return 'Попробуйте изменить фильтры'
  }
  return 'Создайте свою первую задачу'
})

// Methods
const openCreateModal = () => {
  editingTask.value = null
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingTask.value = null
}

const editTask = (task: Task) => {
  editingTask.value = task
  showCreateModal.value = true
}

const handleTaskSaved = (task: Task) => {
  // Task was saved, modal will close automatically
  console.log('Task saved:', task)
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const deleteTask = (taskId: string) => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    tasksStore.deleteTask(taskId)
  }
}

const startTaskTimer = (task: Task) => {
  timerStore.setCurrentTask(task.id)
  router.push('/timer')
}

const clearFilters = () => {
  activeFilters.status = 'all'
  activeFilters.priority = 'all'
  activeFilters.category = 'all'
  searchQuery.value = ''
}

const getCategoryName = (categoryId: string) => {
  const category = tasksStore.getCategoryById(categoryId)
  return category?.name || 'Без категории'
}

const getCategoryColor = (categoryId: string) => {
  const category = tasksStore.getCategoryById(categoryId)
  return category?.color || '#6b7280'
}

const getPriorityIcon = (priority: string) => {
  const icons = {
    low: 'lucide:arrow-down',
    medium: 'lucide:minus',
    high: 'lucide:arrow-up',
  }
  return icons[priority as keyof typeof icons] || 'lucide:circle'
}

const formatDueDate = (date: Date) => {
  const dueDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dueDate.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else if (dueDate.toDateString() === tomorrow.toDateString()) {
    return 'Завтра'
  } else {
    return dueDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }
}

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}
</script>

<style scoped lang="scss">
.tasks-page {
  padding: var(--space-4);
  padding-bottom: calc(80px + var(--space-4));
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.search-button,
.filter-button,
.add-button {
  @include button-reset;
  @include flex-center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.add-button {
  background: var(--accent-primary);
  color: white;

  &:hover {
    background: var(--accent-secondary);
  }
}

.search-bar {
  margin-bottom: var(--space-4);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  padding: var(--space-3) var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:focus-within {
    border-color: var(--accent-primary);
  }
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-base);
  margin: 0 var(--space-3);
  padding: 0;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.clear-search {
  @include button-reset;
  @include flex-center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.filters-bar {
  @include card;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-group label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
  }
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.clear-filters {
  @include button-reset;
  align-self: flex-start;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  padding: var(--space-2);

  &:hover {
    color: var(--text-primary);
  }
}

.tasks-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.stat-card {
  @include card;
  text-align: center;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.tasks-container {
  min-height: 400px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.task-item {
  @include card;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);
  position: relative;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &.completed {
    opacity: 0.7;

    .task-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
  }

  // Priority indicators
  &.priority-high {
    border-left: 4px solid var(--error);
  }

  &.priority-medium {
    border-left: 4px solid var(--warning);
  }

  &.priority-low {
    border-left: 4px solid var(--success);
  }
}

.task-main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
  cursor: pointer;
}

.task-checkbox {
  @include flex-center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--duration-base);

  &:hover {
    transform: scale(1.1);
  }

  &.completed {
    :deep(svg) {
      color: var(--success);
    }
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
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.task-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  line-height: var(--leading-tight);
  flex: 1;
  margin: 0;
}

.task-priority {
  @include flex-center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);

  &.low {
    color: var(--success);
    background: rgba(93, 242, 126, 0.1);
  }

  &.medium {
    color: var(--warning);
    background: rgba(250, 204, 21, 0.1);
  }

  &.high {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.task-category,
.task-due,
.task-estimate,
.task-spent {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.task-category {
  .category-color {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}

.task-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-2);
  @include text-truncate-multiline(2);
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.task-tag {
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.task-actions {
  display: flex;
  gap: var(--space-1);
  margin-left: var(--space-3);
}

.task-action {
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

    &.delete {
      background: rgba(248, 113, 113, 0.1);
      color: var(--error);
    }
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-12) var(--space-4);
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
  margin-bottom: var(--space-4);
  color: var(--text-secondary);
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

// Light theme adjustments
[data-theme='light'] {
  .search-input-wrapper,
  .filters-bar,
  .stat-card,
  .task-item {
    background: var(--card-bg);
    border-color: rgba(0, 0, 0, 0.05);
  }

  .search-button,
  .filter-button {
    background: var(--surface-bg);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .filter-option {
    background: var(--surface-bg);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .task-action {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .tasks-page {
    padding: var(--space-3);
    padding-bottom: calc(80px + var(--space-3));
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .task-actions {
    flex-direction: column;
  }

  .filters-content {
    gap: var(--space-3);
  }

  .filter-options {
    gap: var(--space-1);
  }

  .filter-option {
    font-size: var(--text-xs);
    padding: var(--space-2);
  }
}
</style>
