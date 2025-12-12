<template>
  <div class="tasks-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">Мои задачи</h1>
          <div class="stats-overview">
            <div class="stat">
              <span class="stat-value">{{ activeTasksCount }}</span>
              <span class="stat-label">активных</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ completedTasksCount }}</span>
              <span class="stat-label">выполнено</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ totalTimeSpent }}</span>
              <span class="stat-label">времени</span>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <div class="view-toggle">
            <button
              class="view-button"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              <Icon name="lucide:layout-grid" size="18" />
            </button>
            <button
              class="view-button"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              <Icon name="lucide:list" size="18" />
            </button>
          </div>

          <button class="create-button" @click="openCreateModal">
            <Icon name="lucide:plus" size="18" />
            <span>Новая задача</span>
          </button>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <div class="action-group">
          <button
            v-for="filter in quickFilters"
            :key="filter.value"
            class="quick-filter"
            :class="{ active: filters.status === filter.value }"
            @click="applyQuickFilter(filter.value)"
          >
            <Icon :name="filter.icon" size="14" />
            <span>{{ filter.label }}</span>
          </button>
        </div>

        <div class="search-container">
          <Icon name="lucide:search" size="16" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск задач..."
            class="search-input"
            @input="handleSearch"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">
            <Icon name="lucide:x" size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Panel -->
    <TaskFilters
      v-model:show-filters="showFilters"
      :filters="filters"
      @update:filters="updateFilters"
      @reset="resetFilters"
    />

    <!-- Active Filters -->
    <div v-if="hasActiveFilters" class="active-filters-bar">
      <div class="filters-tags">
        <span
          class="filter-tag"
          v-if="filters.status !== 'all'"
          @click="setFilter('status', 'all')"
        >
          {{ getStatusLabel(filters.status) }}
          <Icon name="lucide:x" size="10" />
        </span>

        <span
          v-for="category in selectedCategories"
          :key="category.id"
          class="filter-tag"
          @click="removeCategoryFilter(category.id)"
        >
          {{ category.name }}
          <Icon name="lucide:x" size="10" />
        </span>

        <span
          class="filter-tag"
          v-if="filters.priority !== 'all'"
          @click="setFilter('priority', 'all')"
        >
          {{ getPriorityLabel(filters.priority) }}
          <Icon name="lucide:x" size="10" />
        </span>
      </div>

      <button class="clear-filters" @click="resetFilters">
        <Icon name="lucide:x-circle" size="14" />
        <span>Очистить</span>
      </button>
    </div>

    <!-- Tasks Content -->
    <div class="tasks-content">
      <div
        v-if="filteredTasks.length > 0"
        class="tasks-container"
        :class="viewMode"
      >
        <TaskCard
          v-for="task in paginatedTasks"
          :key="task.id"
          :task="task"
          @toggle-status="toggleTaskStatus(task.id)"
          @start-timer="startTaskTimer(task)"
          @edit="openEditModal(task)"
          @delete="confirmDeleteTask(task.id)"
          @select="openTaskDetails(task)"
          @duplicate="duplicateTask(task)"
          @archive="archiveTask(task)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-illustration">
          <Icon name="lucide:clipboard-check" size="64" />
          <div class="empty-dots">
            <div class="dot" style="--delay: 0"></div>
            <div class="dot" style="--delay: 0.2"></div>
            <div class="dot" style="--delay: 0.4"></div>
          </div>
        </div>

        <div class="empty-content">
          <h3>Задачи не найдены</h3>
          <p>{{ emptyStateMessage }}</p>
        </div>

        <div class="empty-actions">
          <button class="primary-action" @click="openCreateModal">
            <Icon name="lucide:plus" size="16" />
            <span>Создать задачу</span>
          </button>
          <button
            class="secondary-action"
            @click="resetFilters"
            v-if="hasActiveFilters"
          >
            <Icon name="lucide:filter-x" size="16" />
            <span>Сбросить фильтры</span>
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-button prev"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <Icon name="lucide:chevron-left" size="16" />
        </button>

        <div class="page-info">
          <span class="page-current">{{ currentPage }}</span>
          <span class="page-total">/ {{ totalPages }}</span>
        </div>

        <button
          class="pagination-button next"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <Icon name="lucide:chevron-right" size="16" />
        </button>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="openCreateModal">
      <Icon name="lucide:plus" size="20" />
    </button>

    <!-- Modals -->
    <TaskModal
      v-if="showTaskModal"
      :task="editingTask"
      :mode="modalMode"
      @close="closeTaskModal"
      @save="saveTask"
    />

    <TaskDetailsModal
      v-if="showDetailsModal"
      :task="selectedTask"
      @close="closeDetailsModal"
      @save="updateTask"
      @delete="confirmDeleteTask"
    />

    <DeleteConfirmModal
      v-if="showDeleteConfirm"
      @confirm="deleteTask"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
// Stores
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

// State
const viewMode = ref<'grid' | 'list'>('grid')
const showFilters = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

// Modal states
const showTaskModal = ref(false)
const showDetailsModal = ref(false)
const showDeleteConfirm = ref(false)
const editingTask = ref<any>(null)
const selectedTask = ref<any>(null)
const taskToDelete = ref<string | null>(null)
const modalMode = ref<'create' | 'edit'>('create')

// Quick filters
const quickFilters = [
  { value: 'all', label: 'Все', icon: 'lucide:list' },
  { value: 'active', label: 'Активные', icon: 'lucide:clock' },
  { value: 'completed', label: 'Выполненные', icon: 'lucide:check-circle' },
  { value: 'today', label: 'Сегодня', icon: 'lucide:calendar' },
]

// Computed
const filters = computed(() => tasksStore.filters)

const filteredTasks = computed(() => {
  let tasks = tasksStore.tasks

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }

  // Apply filters
  return tasks
    .filter((task) => {
      // Status filter
      if (filters.value.status === 'today') {
        const today = new Date().toDateString()
        return new Date(task.createdAt).toDateString() === today
      }
      if (
        filters.value.status !== 'all' &&
        task.status !== filters.value.status
      ) {
        return false
      }

      // Category filter
      if (
        filters.value.category !== 'all' &&
        task.category !== filters.value.category
      ) {
        return false
      }

      // Priority filter
      if (
        filters.value.priority !== 'all' &&
        task.priority !== filters.value.priority
      ) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Sort by priority (high -> medium -> low)
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }

      // Then by due date (closest first)
      if (a.dueAt && b.dueAt) {
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      }
      if (a.dueAt) return -1
      if (b.dueAt) return 1

      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTasks.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / itemsPerPage)
})

const activeTasksCount = computed(() => {
  return tasksStore.tasks.filter((t) => t.status === 'active').length
})

const completedTasksCount = computed(() => {
  return tasksStore.tasks.filter((t) => t.status === 'completed').length
})

const totalTimeSpent = computed(() => {
  const totalMinutes = tasksStore.tasks.reduce(
    (sum, task) => sum + (task.spentMinutes || 0),
    0
  )
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`
})

const hasActiveFilters = computed(() => {
  return (
    filters.value.status !== 'all' ||
    filters.value.category !== 'all' ||
    filters.value.priority !== 'all' ||
    searchQuery.value !== ''
  )
})

const selectedCategories = computed(() => {
  if (filters.value.category === 'all') return []
  const category = tasksStore.categories.find(
    (c) => c.id === filters.value.category
  )
  return category ? [category] : []
})

const emptyStateMessage = computed(() => {
  if (searchQuery.value) return 'Попробуйте изменить условия поиска'
  if (hasActiveFilters.value) return 'Попробуйте сбросить фильтры'
  return 'Создайте свою первую задачу, чтобы начать'
})

// Methods
const applyQuickFilter = (status: string) => {
  tasksStore.setFilter('status', status)
}

const updateFilters = (newFilters: any) => {
  tasksStore.setFilter('status', newFilters.status)
  tasksStore.setFilter('category', newFilters.category)
  tasksStore.setFilter('priority', newFilters.priority)
}

const resetFilters = () => {
  tasksStore.resetFilters()
  searchQuery.value = ''
  currentPage.value = 1
}

const setFilter = (type: 'status' | 'category' | 'priority', value: string) => {
  tasksStore.setFilter(type, value)
}

const removeCategoryFilter = () => {
  tasksStore.setFilter('category', 'all')
}

const handleSearch = debounce(() => {
  currentPage.value = 1
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
}

const getStatusLabel = (status: string) => {
  const filter = quickFilters.find((f) => f.value === status)
  return filter?.label || status
}

const getPriorityLabel = (priority: string) => {
  const labels = { high: 'Высокий', medium: 'Средний', low: 'Низкий' }
  return labels[priority as keyof typeof labels] || priority
}

// Task actions
const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const startTaskTimer = (task: any) => {
  timerStore.setTask(task.id)
  navigateTo('/timer')
}

const openTaskDetails = (task: any) => {
  selectedTask.value = { ...task }
  showDetailsModal.value = true
}

const openCreateModal = () => {
  editingTask.value = null
  modalMode.value = 'create'
  showTaskModal.value = true
}

const openEditModal = (task: any) => {
  editingTask.value = { ...task }
  modalMode.value = 'edit'
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedTask.value = null
}

const saveTask = (taskData: any) => {
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    tasksStore.addTask(taskData)
  }
  closeTaskModal()
}

const updateTask = (taskId: string, updates: any) => {
  tasksStore.updateTask(taskId, updates)
}

const duplicateTask = (task: any) => {
  const { id, createdAt, ...taskData } = task
  tasksStore.addTask({
    ...taskData,
    title: `${task.title} (копия)`,
  })
}

const archiveTask = (task: any) => {
  tasksStore.updateTask(task.id, {
    status: task.status === 'active' ? 'completed' : 'active',
  })
}

const confirmDeleteTask = (taskId: string) => {
  taskToDelete.value = taskId
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  taskToDelete.value = null
}

const deleteTask = () => {
  if (taskToDelete.value) {
    tasksStore.deleteTask(taskToDelete.value)
    showDeleteConfirm.value = false
    taskToDelete.value = null
  }
}

// Pagination
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Watch for changes
watch([() => filters.value, searchQuery], () => {
  currentPage.value = 1
})

// Initialize
onMounted(() => {
  tasksStore.initialize()
  timerStore.initialize()
})
</script>

<style scoped lang="scss">
.tasks-page {
  min-height: 100vh;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
  position: relative;
}

.page-header {
  background: var(--primary-bg);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: var(--space-6) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4);

  @include breakpoint(md) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.title-section {
  h1 {
    font-size: var(--text-3xl);
    font-weight: 700;
    background: linear-gradient(135deg, var(--text-primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: var(--space-3);
  }
}

.stats-overview {
  display: flex;
  gap: var(--space-4);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  .stat-value {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.header-actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.view-toggle {
  display: flex;
  gap: var(--space-1);
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1);
  border-radius: var(--radius-button);
}

.view-button {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--transition-base);

  &.active {
    background: var(--card-bg);
    color: var(--accent);
    box-shadow: var(--shadow-sm);
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }
}

.create-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--accent);
  color: white;
  border-radius: var(--radius-button);
  font-weight: 600;
  font-size: var(--text-sm);
  transition: all var(--transition-base);

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-glow);
  }
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @include breakpoint(sm) {
    flex-direction: row;
    align-items: center;
  }
}

.action-group {
  display: flex;
  gap: var(--space-1);
  overflow-x: auto;
  padding-bottom: var(--space-1);

  &::-webkit-scrollbar {
    display: none;
  }
}

.quick-filter {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all var(--transition-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;

    &:hover {
      background: var(--accent-secondary);
    }
  }
}

.search-container {
  flex: 1;
  position: relative;
  max-width: 400px;

  @include breakpoint(sm) {
    margin-left: auto;
  }
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
  padding: var(--space-3) var(--space-10) var(--space-3) var(--space-9);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--transition-base);

  &:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(93, 95, 239, 0.05);
    box-shadow: 0 0 0 3px rgba(93, 95, 239, 0.1);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.clear-search {
  @include button-reset;
  @include flex-center;
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.1);
  transition: all var(--transition-base);

  &:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.15);
  }
}

.active-filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: rgba(93, 95, 239, 0.05);
  border-bottom: 1px solid rgba(93, 95, 239, 0.1);
  animation: slide-down 0.3s ease-out;
}

.filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(93, 95, 239, 0.15);
  color: var(--accent);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    background: rgba(93, 95, 239, 0.25);
    transform: translateY(-1px);

    :deep(svg) {
      color: var(--error);
    }
  }
}

.clear-filters {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  white-space: nowrap;

  &:hover {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

.tasks-content {
  padding: var(--space-5);
}

.tasks-container {
  &.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);

    @include breakpoint(sm) {
      grid-template-columns: repeat(2, 1fr);
    }

    @include breakpoint(lg) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &.list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-12) var(--space-4);
  color: var(--text-secondary);
}

.empty-illustration {
  position: relative;
  margin-bottom: var(--space-6);

  :deep(svg) {
    color: var(--accent);
    opacity: 0.5;
  }
}

.empty-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: var(--space-2);

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: bounce 1.5s infinite calc(var(--delay) * 1s);
    opacity: 0.7;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-content {
  margin-bottom: var(--space-6);
  max-width: 400px;

  h3 {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.empty-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 300px;

  @include breakpoint(sm) {
    flex-direction: row;
  }
}

.primary-action {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: var(--accent);
  color: white;
  border-radius: var(--radius-button);
  font-weight: 600;
  transition: all var(--transition-base);

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-glow);
  }
}

.secondary-action {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-weight: 500;
  transition: all var(--transition-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-8);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pagination-button {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.page-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: 600;
}

.page-current {
  color: var(--text-primary);
}

.page-total {
  color: var(--text-secondary);
}

.fab {
  @include button-reset;
  @include flex-center;
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom) + var(--space-4));
  right: var(--space-4);
  width: 56px;
  height: 56px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-fab);
  box-shadow: var(--shadow-glow);
  transition: all var(--transition-base);
  z-index: 90;

  &:hover {
    background: var(--accent-secondary);
    transform: scale(1.1) rotate(90deg);
  }

  &:active {
    transform: scale(0.95);
  }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Light theme
[data-theme='light'] {
  .page-header {
    background: var(--surface-bg);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .view-toggle {
    background: rgba(0, 0, 0, 0.05);
  }

  .view-button {
    &.active {
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .quick-filter {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.2);
    }
  }

  .search-input {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:focus {
      background: rgba(93, 95, 239, 0.05);
    }
  }

  .clear-search {
    background: rgba(0, 0, 0, 0.1);
  }

  .active-filters-bar {
    background: rgba(93, 95, 239, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .filter-tag {
    background: rgba(93, 95, 239, 0.1);
  }

  .clear-filters:hover {
    background: rgba(248, 113, 113, 0.1);
  }

  .pagination {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .pagination-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .secondary-action {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Responsive
@include breakpoint(sm) {
  .page-header {
    padding: var(--space-6) var(--space-6) var(--space-4);
  }

  .tasks-content {
    padding: var(--space-6);
  }

  .fab {
    bottom: calc(80px + env(safe-area-inset-bottom) + var(--space-6));
    right: var(--space-6);
  }
}

@include breakpoint(lg) {
  .tasks-container.grid {
    gap: var(--space-5);
  }
}
</style>
