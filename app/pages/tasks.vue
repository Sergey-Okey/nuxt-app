<template>
  <div class="tasks-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="dashboard-title">Задачи</h1>
        </div>

        <div class="header-actions">
          <button class="action-button primary" @click="openCreateModal">
            <Icon name="lucide:plus" size="16" />
            <span>Создать</span>
          </button>
        </div>
      </div>

      <!-- Compact Filters -->
      <div class="compact-filters">
        <TasksFilters
          @search="handleSearch"
          @filter-change="handleFilterChange"
        />
      </div>
    </div>

    <!-- Tasks Content -->
    <div class="dashboard-content">
      <!-- Active Filters -->
      <div v-if="hasActiveFilters" class="active-filters-bar">
        <div class="active-filters">
          <span class="filters-label">Фильтры:</span>
          <div class="filter-tags">
            <span
              v-if="activeFilters.status !== 'all'"
              class="filter-tag"
              @click="removeFilter('status')"
            >
              {{ getStatusLabel(activeFilters.status) }}
              <Icon name="lucide:x" size="12" />
            </span>
            <span
              v-if="activeFilters.category !== 'all'"
              class="filter-tag"
              @click="removeFilter('category')"
            >
              {{ getCategoryLabel(activeFilters.category) }}
              <Icon name="lucide:x" size="12" />
            </span>
            <span
              v-if="activeFilters.priority !== 'all'"
              class="filter-tag"
              @click="removeFilter('priority')"
            >
              {{ getPriorityLabel(activeFilters.priority) }}
              <Icon name="lucide:x" size="12" />
            </span>
            <span
              v-if="activeFilters.tag"
              class="filter-tag"
              @click="removeFilter('tag')"
            >
              #{{ activeFilters.tag }}
              <Icon name="lucide:x" size="12" />
            </span>
          </div>
          <button class="clear-filters" @click="clearAllFilters">
            Очистить все
          </button>
        </div>
      </div>

      <!-- Tasks Grid -->
      <div class="tasks-content">
        <div v-if="filteredTasks.length > 0" class="tasks-grid">
          <TaskCard
            v-for="task in paginatedTasks"
            :key="task.id"
            :task="task"
            @toggle-status="toggleTaskStatus(task.id)"
            @start-timer="startTaskTimer(task)"
            @edit="openEditModal(task)"
            @delete="confirmDeleteTask(task.id)"
            @filter-by-tag="filterByTag"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-content">
            <div class="empty-icon">
              <Icon name="lucide:clipboard-list" size="48" />
            </div>
            <h3 class="empty-title">{{ emptyStateTitle }}</h3>
            <p class="empty-description">{{ emptyStateMessage }}</p>
            <button class="empty-action" @click="openCreateModal">
              <Icon name="lucide:plus" size="16" />
              <span>Создать задачу</span>
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <div class="pagination-info">
            Показано {{ paginatedTasks.length }} из {{ filteredTasks.length }}
          </div>
          <div class="pagination-controls">
            <button
              class="pagination-button"
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              <Icon name="lucide:chevron-left" size="16" />
            </button>
            <div class="page-numbers">
              <template v-for="page in visiblePages" :key="page">
                <button
                  v-if="page !== '...'"
                  class="page-button"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="page-dots">...</span>
              </template>
            </div>
            <button
              class="pagination-button"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              <Icon name="lucide:chevron-right" size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TaskForm
      :show="showModal"
      :task="editingTask"
      @close="closeModal"
      @save="saveTask"
    />

    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="modal-overlay"
        @click.self="cancelDelete"
      >
        <div class="confirm-modal">
          <div class="modal-header">
            <Icon name="lucide:trash-2" size="20" />
            <h3>Удалить задачу?</h3>
          </div>
          <p class="modal-message">
            Задача будет удалена без возможности восстановления
          </p>
          <div class="modal-actions">
            <button class="modal-button secondary" @click="cancelDelete">
              Отмена
            </button>
            <button class="modal-button danger" @click="deleteTask">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import TasksFilters from '@/components/Tasks/TaskFilters.vue'
// Stores
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

// State
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const editingTask = ref<any>(null)
const taskToDelete = ref<string | null>(null)
const currentPage = ref(1)
const searchQuery = ref('')
const activeFilters = ref({
  status: 'all',
  category: 'all',
  priority: 'all',
  tag: null as string | null,
})

// Constants
const itemsPerPage = 8
const maxVisiblePages = 5

// Computed
const filteredTasks = computed(() => {
  return tasksStore.filteredTasks.filter((task) => {
    // Search filter
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(searchLower)
      const matchesDesc = task.description?.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesDesc) return false
    }

    // Tag filter
    if (
      activeFilters.value.tag &&
      !task.tags.includes(activeFilters.value.tag)
    ) {
      return false
    }

    return true
  })
})

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTasks.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredTasks.value.length / itemsPerPage)
})

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.status !== 'all' ||
    activeFilters.value.category !== 'all' ||
    activeFilters.value.priority !== 'all' ||
    activeFilters.value.tag !== null
  )
})

const emptyStateTitle = computed(() => {
  if (searchQuery.value) return 'Задачи не найдены'
  if (hasActiveFilters.value) return 'Нет подходящих задач'
  return 'Задач пока нет'
})

const emptyStateMessage = computed(() => {
  if (searchQuery.value) return 'Попробуйте другой запрос'
  if (hasActiveFilters.value) return 'Изменение фильтров поможет'
  return 'Создайте свою первую задачу'
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= maxVisiblePages) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...')
      for (let i = total - 3; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }

  return pages
})

// Methods
const formatTime = (minutes: number) => {
  if (!minutes || minutes === 0) return '0'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

const handleFilterChange = (filters: any) => {
  activeFilters.value = {
    ...activeFilters.value,
    status: filters.status,
    category: filters.category,
    priority: filters.priority,
  }
  currentPage.value = 1
}

const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const filterByTag = (tag: string) => {
  activeFilters.value.tag = tag
  currentPage.value = 1
}

const removeFilter = (type: keyof typeof activeFilters.value) => {
  if (type === 'tag') {
    activeFilters.value[type] = null
  } else {
    activeFilters.value[type] = 'all' as any
  }
  currentPage.value = 1
}

const clearAllFilters = () => {
  activeFilters.value = {
    status: 'all',
    category: 'all',
    priority: 'all',
    tag: null,
  }
  searchQuery.value = ''
  currentPage.value = 1
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    all: 'Все',
    active: 'Активные',
    completed: 'Выполненные',
  }
  return labels[status] || status
}

const getCategoryLabel = (categoryId: string) => {
  if (categoryId === 'all') return 'Все категории'
  const category = tasksStore.categories.find((cat) => cat.id === categoryId)
  return category?.name || categoryId
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    all: 'Все приоритеты',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[priority] || priority
}

// Task actions
const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const startTaskTimer = (task: any) => {
  timerStore.setTask(task.id)
  navigateTo('/timer')
}

const openCreateModal = () => {
  editingTask.value = null
  showModal.value = true
}

const openEditModal = (task: any) => {
  editingTask.value = { ...task }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTask.value = null
}

const saveTask = (taskData: any) => {
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    tasksStore.addTask(taskData)
  }
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
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page: number) => {
  currentPage.value = page
}

// Watch for filter changes
watch([() => activeFilters.value, searchQuery], () => {
  currentPage.value = 1
})

// Initialize stores
onMounted(() => {
  tasksStore.initialize()
  timerStore.initialize()
})
</script>

<style scoped lang="scss">
.tasks-dashboard {
  min-height: 100vh;
  background: var(--primary-bg);
  padding-bottom: var(--space-16);
}

// Dashboard Header
.dashboard-header {
  @include card;
  margin: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;

  @include breakpoint(md) {
    margin: var(--space-6);
  }

  @include breakpoint(lg) {
    margin: var(--space-6) auto;
    max-width: 1400px;
  }
}

.header-content {
  display: flex;
  padding: var(--space-6) var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @include breakpoint(md) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-6);
  }
}

.header-info {
  flex: 1;
}

.dashboard-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
  @include gradient-text;

  @include breakpoint(md) {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-3);
  }
}

.action-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.primary {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-1px);
      @include elevation(2);
    }
  }
}

// Compact Filters
.compact-filters {
  padding: var(--space-4) var(--space-5);
  background: rgba(255, 255, 255, 0.02);

  @include breakpoint(md) {
    padding: var(--space-4) var(--space-6);
  }
}

// Dashboard Content
.dashboard-content {
  padding: var(--space-4);

  @include breakpoint(md) {
    padding: var(--space-6);
  }

  @include breakpoint(lg) {
    max-width: 1400px;
    margin: 0 auto;
  }
}

// Active Filters Bar
.active-filters-bar {
  @include card;
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.active-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @include breakpoint(sm) {
    flex-direction: row;
    align-items: center;
  }
}

.filters-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  flex: 1;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: rgba(119, 119, 119, 0.1);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(119, 119, 119, 0.2);

    :deep(svg) {
      color: var(--error);
    }
  }
}

.clear-filters {
  @include button-reset;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
}

// Tasks Content

.tasks-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  @include breakpoint(sm) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include breakpoint(lg) {
    grid-template-columns: repeat(3, 1fr);
  }

  @include breakpoint(xl) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// Empty State
.empty-state {
  padding: var(--space-16) var(--space-4);
  text-align: center;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-6);
  border-radius: var(--radius-full);
  background: rgba(119, 119, 119, 0.1);

  :deep(svg) {
    color: var(--accent-primary);
    opacity: 0.5;
  }
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-description {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.empty-action {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    @include elevation(2);
  }
}

// Pagination
.pagination {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.pagination-info {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.pagination-controls {
  @include flex-center;
  gap: var(--space-4);
}

.pagination-button {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover:not(:disabled) {
    background: rgba(119, 119, 119, 0.1);
    border-color: var(--accent-primary);
    color: var(--accent-primary);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.page-numbers {
  display: flex;
  gap: var(--space-1);
}

.page-button {
  @include button-reset;
  @include flex-center;
  min-width: 40px;
  height: 40px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
  }
}

.page-dots {
  @include flex-center;
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  @include flex-center;
  padding: var(--space-4);
}

.confirm-modal {
  @include card;
  width: 100%;
  max-width: 400px;
  padding: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: modal-scale var(--duration-base) var(--ease-out);
}

@keyframes modal-scale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--error);
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.modal-message {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
}

.modal-button {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }

  &.danger {
    background: var(--error);
    color: white;

    &:hover {
      background: #ef4444;
      transform: translateY(-1px);
    }
  }
}

// Animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Light Theme
[data-theme='light'] {
  .dashboard-header,
  .active-filters-bar,
  .tasks-content {
    border-color: rgba(0, 0, 0, 0.05);
  }

  .stat-badge {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
  }

  .filter-tag {
    background: rgba(0, 0, 0, 0.1);
  }

  .clear-filters:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .pagination-button,
  .page-button:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .modal-button.secondary {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Responsive Adjustments
@include breakpoint(sm) {
  .header-stats {
    gap: var(--space-4);
  }
}

@include breakpoint(md) {
  .header-content {
    padding: var(--space-6);
  }

  .compact-filters {
    padding: var(--space-4) var(--space-6);
  }
}
</style>
