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
          <span class="task-count">{{ tasksCount }}</span>
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
              <span class="stat active">{{ activeTasksCount }} активных</span>
              <span class="stat completed"
                >{{ completedTasksCount }} выполнено</span
              >
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

        <!-- Tasks Main Area -->
        <main class="tasks-main">
          <!-- Mobile Quick Filters -->
          <div class="mobile-quick-filters" v-if="isMobile">
            <div class="quick-filter-buttons">
              <button
                v-for="filter in quickFilters"
                :key="filter.id"
                class="filter-button"
                :class="{ active: filter.active }"
                @click="applyQuickFilter(filter)"
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
          <div class="tasks-grid" v-if="hasTasks">
            <div
              v-for="task in displayedTasks"
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
          <div v-if="!hasTasks" class="empty-state">
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

          <!-- Load More -->
          <div v-if="hasMoreTasks" class="load-more">
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
    <div class="mobile-action-bar" v-if="isMobile">
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
  </div>
</template>

<script setup lang="ts">
import { useTasksStore } from '@/stores/tasks'
import TaskCard from '@/components/TaskCard.vue'
import TaskForm from '@/components/TaskForm.vue'
import TaskFilters from '@/components/TaskFilters.vue'
import CategoriesManager from '@/components/CategoriesManager.vue'
import TimerProgress from '@/components/TimerProgress.vue'
import { Icon } from '#components'

const tasksStore = useTasksStore()
const router = useRouter()

// Reactive state
const activeTimerTask = ref<any>(null)
const showFormModal = ref(false)
const editingTask = ref<any>(null)
const showSearch = ref(false)
const searchQuery = ref('')
const isMobile = ref(false)
const currentPage = ref(1)
const tasksPerPage = ref(12)

// Initialize store on mount
onMounted(async () => {
  await initialize()
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Initialize function
const initialize = async () => {
  // Initialize store
  if (typeof tasksStore.initialize === 'function') {
    await tasksStore.initialize()
  }

  // Initialize default categories if needed
  if (tasksStore.categories.length === 0) {
    const defaultCategories = [
      {
        id: 'work',
        name: 'Работа',
        color: '#5d5fef',
        icon: 'lucide:briefcase',
      },
      { id: 'personal', name: 'Личное', color: '#5df27e', icon: 'lucide:home' },
      {
        id: 'health',
        name: 'Здоровье',
        color: '#f87171',
        icon: 'lucide:heart',
      },
      {
        id: 'learning',
        name: 'Обучение',
        color: '#facc15',
        icon: 'lucide:book-open',
      },
    ]
    tasksStore.categories = defaultCategories
  }
}

// Computed properties
const displayedTasks = computed(() => {
  let tasks = tasksStore.tasks || []

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    tasks = tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    )
  }

  // Apply pagination
  const startIndex = (currentPage.value - 1) * tasksPerPage.value
  const endIndex = startIndex + tasksPerPage.value

  return tasks.slice(startIndex, endIndex)
})

const totalTasks = computed(() => {
  let tasks = tasksStore.tasks || []

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    tasks = tasks.filter(
      (task) =>
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    )
  }

  return tasks.length
})

const tasksCount = computed(() => totalTasks.value || 0)

const hasTasks = computed(() => totalTasks.value > 0)

const hasMoreTasks = computed(() => {
  return displayedTasks.value.length < totalTasks.value
})

const activeTasksCount = computed(() => {
  return (
    tasksStore.tasks?.filter((task) => task.status === 'active').length || 0
  )
})

const completedTasksCount = computed(() => {
  return (
    tasksStore.tasks?.filter((task) => task.status === 'completed').length || 0
  )
})

// Quick filters for mobile
const quickFilters = ref([
  {
    id: 'all',
    label: 'Все',
    icon: 'lucide:list',
    active: true,
  },
  {
    id: 'active',
    label: 'Активные',
    icon: 'lucide:circle',
    active: false,
  },
  {
    id: 'completed',
    label: 'Выполнено',
    icon: 'lucide:check-circle',
    active: false,
  },
])

// Methods
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    clearSearch()
  }
}

const handleSearch = () => {
  currentPage.value = 1 // Reset to first page on search
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  showSearch.value = false
}

const applyQuickFilter = (filter: any) => {
  // Update active state
  quickFilters.value.forEach((f) => (f.active = f.id === filter.id))

  // Apply filter to store if method exists
  if (tasksStore.setFilter && typeof tasksStore.setFilter === 'function') {
    if (filter.id === 'all') {
      tasksStore.setFilter('status', 'all')
    } else {
      tasksStore.setFilter('status', filter.id)
    }
  }
}

const openCreateModal = () => {
  editingTask.value = null
  showFormModal.value = true
}

const openEditModal = (task: any) => {
  editingTask.value = { ...task }
  showFormModal.value = true
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
  if (
    tasksStore.toggleTaskStatus &&
    typeof tasksStore.toggleTaskStatus === 'function'
  ) {
    tasksStore.toggleTaskStatus(taskId)
  }
}

const deleteTask = (taskId: string) => {
  if (confirm('Удалить задачу?')) {
    if (tasksStore.deleteTask && typeof tasksStore.deleteTask === 'function') {
      tasksStore.deleteTask(taskId)
    }
  }
}

const setActiveTimerTask = (task: any) => {
  activeTimerTask.value = task
}

const loadMoreTasks = () => {
  currentPage.value++
}

const scrollToToday = () => {
  // Implement scroll to today's tasks
  const todaySection = document.querySelector('.timer-section')
  if (todaySection) {
    todaySection.scrollIntoView({ behavior: 'smooth' })
  }
}

const goToTimer = () => {
  router.push('/timer')
}

// Add some mock data for testing if needed
onMounted(() => {
  // If no tasks, add some sample data
  setTimeout(() => {
    if (!tasksStore.tasks || tasksStore.tasks.length === 0) {
      const sampleTasks = [
        {
          id: '1',
          title: 'Завершить проект TaskFlow',
          description: 'Доделать все компоненты и стили',
          category: 'work',
          priority: 'high',
          status: 'active',
          createdAt: new Date(),
          tags: ['работа', 'проект'],
          estimatedMinutes: 120,
          spentMinutes: 60,
        },
        {
          id: '2',
          title: 'Купить продукты',
          description: 'Молоко, хлеб, яйца, фрукты',
          category: 'personal',
          priority: 'medium',
          status: 'active',
          createdAt: new Date(),
          tags: ['дом', 'покупки'],
          estimatedMinutes: 45,
        },
        {
          id: '3',
          title: 'Занятие спортом',
          description: '30 минут кардио',
          category: 'health',
          priority: 'high',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000),
          tags: ['здоровье', 'спорт'],
          spentMinutes: 30,
        },
      ]

      // Use store methods if available, otherwise set directly
      if (tasksStore.tasks) {
        tasksStore.tasks.push(...sampleTasks)
      }
    }
  }, 100)
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
  padding: 0 16px;
}

// Mobile Header
.mobile-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  backdrop-filter: blur(20px);
  background: rgba(31, 31, 31, 0.9);
  margin-bottom: 16px;
  z-index: 10;
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent);
  }
}

.mobile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.task-count {
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.mobile-add-btn {
  background: var(--accent);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #6d6ff0;
  }
}

// Desktop Header
.page-header {
  padding: 24px 0;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 14px;

  .stat {
    padding: 4px 8px;
    border-radius: 6px;

    &.active {
      background: rgba(93, 95, 239, 0.1);
      color: var(--accent);
    }

    &.completed {
      background: rgba(93, 242, 126, 0.1);
      color: var(--success);
    }
  }
}

.create-button {
  background: var(--accent);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-button);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: #6d6ff0;
    transform: translateY(-1px);
  }
}

// Main Content Layout
.tasks-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// Filters Sidebar
.filters-sidebar {
  @media (max-width: 768px) {
    display: none;
  }
}

.sidebar-content {
  background: var(--card-bg);
  border-radius: var(--radius-card);
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.sidebar-section {
  margin-top: 24px;
}

.section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

// Tasks Main Area
.tasks-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Mobile Quick Filters
.mobile-quick-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.quick-filter-buttons {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-button {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-button);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: var(--accent);
    color: white;
  }
}

.search-toggle {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent);
  }
}

// Search Container
.search-container {
  background: var(--card-bg);
  border-radius: var(--radius-card);
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.search-input {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--secondary-bg);
  border-radius: var(--radius-button);
  border: 1px solid rgba(255, 255, 255, 0.05);

  input {
    flex: 1;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: 14px;

    &::placeholder {
      color: var(--text-secondary);
    }

    &:focus {
      outline: none;
    }
  }
}

.clear-search {
  background: none;
  border: none;
  color: var(--text-secondary);
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

// Timer Section
.timer-section {
  background: var(--card-bg);
  border-radius: var(--radius-card);
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

// Tasks Grid
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.task-wrapper {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

// Empty State
.empty-state {
  background: var(--card-bg);
  border-radius: var(--radius-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(93, 95, 239, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-content {
  margin-bottom: 24px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.5;
  }
}

.empty-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 8px 16px;
  border-radius: var(--radius-button);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;

  &.primary {
    background: var(--accent);
    color: white;

    &:hover {
      background: #6d6ff0;
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
  padding: 20px 0;
}

.load-more-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  padding: 8px 24px;
  border-radius: var(--radius-button);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
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
  padding: 8px 12px;
  background: rgba(31, 31, 31, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  z-index: 100;
}

.action-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  color: var(--text-secondary);
  cursor: pointer;

  span {
    font-size: 10px;
    font-weight: 500;
  }

  &:hover {
    color: var(--accent);
  }

  &.primary {
    position: relative;
    top: -8px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: white;

    &:hover {
      background: #6d6ff0;
    }
  }
}
</style>
