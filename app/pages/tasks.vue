<template>
  <div class="tasks-page">
    <div class="page-container">
      <!-- Mobile Header -->
      <div class="mobile-header" v-if="isMobile">
        <button class="menu-toggle" @click="toggleMobileMenu">
          <Icon
            :name="showMobileMenu ? 'lucide:x' : 'lucide:filter'"
            size="20"
          />
        </button>
        <h1 class="mobile-title">
          <Icon name="lucide:check-square" size="20" />
          <span>Задачи</span>
          <span class="task-count">{{ filteredTasks.length }}</span>
        </h1>
        <button class="mobile-add-btn" @click="openCreateModal">
          <Icon name="lucide:plus" size="20" />
        </button>
      </div>

      <!-- Desktop Header -->
      <div class="page-header" v-else>
        <div class="header-content">
          <h1 class="page-title">
            <Icon name="lucide:check-square" size="24" />
            <span>Мои задачи</span>
          </h1>
          <div class="header-actions">
            <div class="stats">
              <span class="stat active">{{ activeTasks }} активных</span>
              <span class="stat completed">{{ completedTasks }} выполнено</span>
            </div>
            <button class="create-button" @click="openCreateModal">
              <Icon name="lucide:plus" size="20" />
              <span>Новая задача</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="tasks-content">
        <!-- Filters Sidebar (Desktop) -->
        <aside class="filters-sidebar" v-if="!isMobile">
          <div class="sidebar-content">
            <h3 class="sidebar-title">Фильтры</h3>
            <TaskFilters />

            <div class="sidebar-section">
              <h4 class="section-title">Категории</h4>
              <CategoriesManager />
            </div>
          </div>
        </aside>

        <!-- Mobile Filters Overlay -->
        <div
          v-if="isMobile"
          class="mobile-filters-overlay"
          :class="{ active: showMobileMenu }"
        >
          <div class="overlay-header">
            <h3>Фильтры и категории</h3>
            <button class="close-overlay" @click="showMobileMenu = false">
              <Icon name="lucide:x" size="20" />
            </button>
          </div>
          <div class="overlay-content">
            <TaskFilters />
            <div class="divider"></div>
            <h4 class="section-title">Категории</h4>
            <CategoriesManager />
          </div>
        </div>

        <!-- Tasks Main Area -->
        <main class="tasks-main">
          <!-- Mobile Quick Filters -->
          <div class="mobile-quick-filters" v-if="isMobile && !showMobileMenu">
            <div class="quick-filter-buttons">
              <button
                v-for="filter in quickFilters"
                :key="filter.label"
                class="filter-button"
                :class="{ active: filter.active }"
                @click="filter.action"
              >
                <Icon :name="filter.icon" size="14" />
                <span>{{ filter.label }}</span>
              </button>
            </div>
            <button class="search-toggle" @click="toggleSearch">
              <Icon name="lucide:search" size="16" />
            </button>
          </div>

          <!-- Search Bar -->
          <div v-if="showSearch" class="search-container">
            <div class="search-input">
              <Icon name="lucide:search" size="18" />
              <input
                type="text"
                placeholder="Поиск задач..."
                v-model="searchQuery"
                @input="handleSearch"
              />
              <button
                class="clear-search"
                @click="clearSearch"
                v-if="searchQuery"
              >
                <Icon name="lucide:x" size="16" />
              </button>
            </div>
          </div>
          <!-- Timer Section -->
          <div v-if="activeTimerTask" class="timer-section">
            <TimerProgress :task="activeTimerTask" />
          </div>

          <!-- Tasks Grid -->
          <div class="tasks-grid">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="task-wrapper"
            >
              <TaskCard
                :task="task"
                @toggle-status="toggleTaskStatus"
                @edit="openEditModal"
                @delete="deleteTask"
                @start-timer="setActiveTimerTask"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredTasks.length === 0" class="empty-state">
            <div class="empty-icon">
              <Icon name="lucide:clipboard" size="48" />
            </div>
            <div class="empty-content">
              <h3>{{ searchQuery ? 'Задачи не найдены' : 'Нет задач' }}</h3>
              <p>
                {{
                  searchQuery
                    ? 'Попробуйте изменить поисковый запрос'
                    : 'Создайте первую задачу'
                }}
              </p>
            </div>
            <div class="empty-actions">
              <button
                class="action-button secondary"
                @click="clearSearch"
                v-if="searchQuery"
              >
                <Icon name="lucide:x" size="16" />
                <span>Очистить поиск</span>
              </button>
              <button class="action-button primary" @click="openCreateModal">
                <Icon name="lucide:plus" size="16" />
                <span>Создать задачу</span>
              </button>
            </div>
          </div>

          <!-- Load More (for pagination) -->
          <div
            v-if="filteredTasks.length > 0 && showLoadMore"
            class="load-more"
          >
            <button class="load-more-btn" @click="loadMoreTasks">
              <Icon name="lucide:chevron-down" size="20" />
              <span>Показать еще</span>
            </button>
          </div>
        </main>
      </div>
    </div>

    <!-- Task Form Modal -->
    <TaskForm
      v-if="showFormModal"
      :task="editingTask"
      @close="closeFormModal"
      @save="saveTask"
    />

    <!-- Mobile Bottom Action Bar -->
    <div class="mobile-action-bar" v-if="isMobile && !showMobileMenu">
      <button class="action-item" @click="scrollToToday">
        <Icon name="lucide:calendar" size="20" />
        <span>Сегодня</span>
      </button>
      <button class="action-item primary" @click="openCreateModal">
        <Icon name="lucide:plus" size="24" />
      </button>
      <button class="action-item" @click="goToTimer">
        <Icon name="lucide:clock" size="20" />
        <span>Таймер</span>
      </button>
    </div>

    <!-- Mobile Overlay Backdrop -->
    <div
      v-if="isMobile && showMobileMenu"
      class="mobile-overlay-backdrop"
      @click="showMobileMenu = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const router = useRouter()

// Reactive state
const activeTimerTask = ref<any>(null)
const showFormModal = ref(false)
const editingTask = ref<any>(null)
const showMobileMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const showLoadMore = ref(true)

// Responsive
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Quick filters for mobile
const quickFilters = ref([
  {
    label: 'Все',
    icon: 'lucide:list',
    active: true,
    action: () => {},
  },
  {
    label: 'Активные',
    icon: 'lucide:circle',
    active: false,
    action: () => {},
  },
  {
    label: 'Выполнено',
    icon: 'lucide:check-circle',
    active: false,
    action: () => {},
  },
])

// Computed
const filteredTasks = computed(() => {
  let tasks = tasksStore.filteredTasks

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }

  return tasks
})

const activeTasks = computed(() => tasksStore.activeTasks.length)
const completedTasks = computed(() => tasksStore.completedTasks.length)

// Methods
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    clearSearch()
  }
}

const handleSearch = () => {
  // Debounce search if needed
  console.log('Searching:', searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  showSearch.value = false
}

const openCreateModal = () => {
  editingTask.value = null
  showFormModal.value = true
  showMobileMenu.value = false
}

const openEditModal = (task: any) => {
  editingTask.value = { ...task }
  showFormModal.value = true
  showMobileMenu.value = false
}

const closeFormModal = () => {
  showFormModal.value = false
  editingTask.value = null
}

const saveTask = (taskData: any) => {
  if (editingTask.value) {
    tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    tasksStore.addTask(taskData)
  }
  closeFormModal()
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const deleteTask = (taskId: string) => {
  if (confirm('Удалить задачу?')) {
    tasksStore.deleteTask(taskId)
  }
}

const setActiveTimerTask = (task: any) => {
  activeTimerTask.value = task
  showMobileMenu.value = false
}

const scrollToToday = () => {
  // Scroll to today's tasks section
  const todaySection = document.querySelector('.timer-section')
  if (todaySection) {
    todaySection.scrollIntoView({ behavior: 'smooth' })
  }
}

const goToTimer = () => {
  router.push('/timer')
}

const loadMoreTasks = () => {
  // TODO: Implement pagination
  console.log('Load more tasks')
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.tasks-page {
  min-height: 100vh;
  background: var(--primary-bg);
  padding-bottom: 80px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;

  @include breakpoint(lg) {
    padding: 0;
  }
}

// Mobile Header
.mobile-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  backdrop-filter: blur(20px);

  margin-bottom: var(--space-4);

  @include breakpoint(sm) {
    padding: var(--space-3);
  }
}

.menu-toggle {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }
}

.mobile-title {
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

.task-count {
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: var(--space-1);
}

.mobile-add-btn {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: var(--accent-primary);
  color: white;

  &:hover {
    background: var(--accent-secondary);
  }
}

// Desktop Header
.page-header {
  padding: 0 var(--space-6);
  margin-bottom: var(--space-6);

  @include breakpoint(lg) {
    padding: 0 var(--space-4);
    margin-bottom: var(--space-4);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @include breakpoint(lg) {
    padding: var(--space-4) 0;
  }
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;

  @include breakpoint(lg) {
    font-size: var(--text-2xl);
  }

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);

  @include breakpoint(lg) {
    gap: var(--space-4);
  }
}

.stats {
  display: flex;
  gap: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);

  .stat {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);

    &.active {
      background: rgba(93, 95, 239, 0.1);
      color: var(--accent-primary);
    }

    &.completed {
      background: rgba(93, 242, 126, 0.1);
      color: var(--success);
    }
  }
}

.create-button {
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

// Main Content Layout
.tasks-content {
  display: flex;
  padding: 0 var(--space-1);

  @include breakpoint(lg) {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: 0 var(--space-1);
  }

  @include breakpoint(sm) {
    padding: 0;
  }
}

// Filters Sidebar (Desktop)
.filters-sidebar {
  position: sticky;
  top: 120px;
  height: fit-content;

  @include breakpoint(lg) {
    display: none;
  }

  .sidebar-content {
    @include card;
    padding: var(--space-4);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.sidebar-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.sidebar-section {
  margin-top: var(--space-5);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3);
}

// Mobile Filters Overlay
.mobile-filters-overlay {
  position: fixed;
  top: 0;
  left: -100%;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: var(--card-bg);
  z-index: var(--z-modal);
  transition: left 0.3s ease;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &.active {
    left: 0;
  }
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.close-overlay {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.overlay-content {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
}

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: var(--space-4) 0;
}

// Tasks Main Area
.tasks-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  @include breakpoint(sm) {
    padding: 0 var(--space-3);
  }
}

.timer-section {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin: 0;
}

// Mobile Quick Filters
.mobile-quick-filters {
  display: flex;
  position: sticky;
  top: 10px;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin: 0;
}

.quick-filter-buttons {
  display: flex;
  gap: var(--space-2);
  flex: 1;
  overflow-x: auto;
  padding-right: var(--space-2);

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
  }
}

.search-toggle {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  flex-shrink: 0;

  &:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }
}

// Search Container
.search-container {
  @include card;
  padding: var(--space-3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin: 0;
}

.search-input {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border-radius: var(--radius-button);
  border: 1px solid rgba(255, 255, 255, 0.05);

  :deep(svg) {
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: var(--text-base);
    min-width: 0;

    &::placeholder {
      color: var(--text-secondary);
    }

    &:focus {
      outline: none;
    }
  }
}

.clear-search {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

// Tasks Grid
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
  width: 100%;

  @include breakpoint(lg) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  @include breakpoint(md) {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}

.task-wrapper {
  transition: transform var(--duration-base);
  width: 100%;

  &:hover {
    transform: translateY(-2px);
  }
}

// Empty State
.empty-state {
  @include card;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin: 0;

  @include breakpoint(sm) {
    padding: var(--space-6) var(--space-3);
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
}

.empty-icon {
  @include flex-center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(93, 95, 239, 0.1);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.empty-content {
  margin-bottom: var(--space-6);

  h3 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    max-width: 300px;
  }
}

.empty-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
  justify-content: center;
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.primary {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

// Load More
.load-more {
  text-align: center;
  padding: var(--space-6) 0;
  width: 100%;
}

.load-more-btn {
  @include button-reset;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  background: var(--surface-bg);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }
}

// Mobile Bottom Action Bar
.mobile-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background: rgba(31, 31, 31, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: var(--z-fixed);
}

.action-item {
  @include button-reset;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--space-2);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  span {
    font-size: 10px;
    font-weight: var(--font-medium);
  }

  &:hover {
    color: var(--accent-primary);
  }

  &.primary {
    position: relative;
    top: -8px;
    width: 56px;
    height: 56px;
    border-radius: var(--radius-full);
    background: var(--accent-primary);
    color: white;
    box-shadow: var(--glow-primary);

    :deep(svg) {
      width: 24px;
      height: 24px;
    }

    span {
      display: none;
    }

    &:hover {
      background: var(--accent-secondary);
      transform: scale(1.05);
    }
  }
}

// Mobile Overlay Backdrop
.mobile-overlay-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: calc(var(--z-modal) - 1);
}

// Light theme adjustments
[data-theme='light'] {
  .mobile-header {
    background: var(--card-bg);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .mobile-overlay-backdrop {
    background: rgba(0, 0, 0, 0.3);
  }

  .mobile-action-bar {
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .filter-button {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .search-toggle,
  .clear-search,
  .close-overlay,
  .menu-toggle {
    background: rgba(0, 0, 0, 0.05);
  }

  .mobile-quick-filters,
  .search-container,
  .timer-section,
  .filters-sidebar .sidebar-content {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .search-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .empty-state,
  .load-more-btn {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}

// Mobile view optimizations
@include breakpoint(xs) {
  .mobile-header {
    padding: var(--space-2) var(--space-3);
  }

  .tasks-main {
    padding: 0 var(--space-2);
  }

  .mobile-quick-filters {
    padding: var(--space-2);
  }

  .filter-button {
    padding: var(--space-2);
    font-size: var(--text-xs);

    span {
      display: none;
    }
  }
}
</style>
