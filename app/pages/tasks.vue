<template>
  <div class="tasks-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Задачи</h1>
      <button class="search-button" @click="toggleSearch">
        <Icon name="lucide:search" size="20" />
      </button>
    </div>

    <!-- Search Bar -->
    <div v-if="showSearch" class="search-bar">
      <div class="search-input">
        <Icon name="lucide:search" size="18" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск задач..."
          @input="handleSearch"
        />
        <button class="clear-search" @click="clearSearch" v-if="searchQuery">
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </div>

    <!-- Filters -->
    <TaskFilters />

    <!-- Tasks List -->
    <div class="tasks-container">
      <div v-if="filteredTasks.length > 0" class="tasks-list">
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @toggle="toggleTaskStatus"
          @edit="openEditModal"
          @delete="deleteTask"
          @start-timer="startTaskTimer"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <Icon name="lucide:check-square" size="48" />
        </div>
        <h3>{{ searchQuery ? 'Задачи не найдены' : 'Нет задач' }}</h3>
        <p v-if="!searchQuery">Создайте свою первую задачу</p>
        <button class="create-button" @click="openCreateModal">
          <Icon name="lucide:plus" size="16" />
          <span>Создать задачу</span>
        </button>
      </div>
    </div>

    <!-- Task Stats -->
    <div v-if="filteredTasks.length > 0" class="task-stats">
      <div class="stat-item">
        <div class="stat-value">{{ activeCount }}</div>
        <div class="stat-label">Активных</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ completedCount }}</div>
        <div class="stat-label">Выполненных</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ totalTime }}</div>
        <div class="stat-label">Потрачено времени</div>
      </div>
    </div>

    <!-- Floating Action Button -->
    <button class="fab-button" @click="openCreateModal">
      <Icon name="lucide:plus" size="20" />
    </button>

    <!-- Task Modal -->
    <TaskModal
      :is-open="showModal"
      :task="editingTask"
      @close="closeModal"
      @submit="handleTaskSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import TaskFilters from '~/components/Tasks/TaskFilters.vue'
import TaskItem from '~/components/Tasks/TaskItem.vue'
import TaskModal from '~/components/Tasks/TaskModal.vue'
import type { Task } from '~/stores/tasks'

const tasksStore = useTasksStore()
const router = useRouter()

// Инициализируем хранилище
onMounted(() => {
  tasksStore.initialize()
})

// Local state
const showSearch = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingTask = ref<Task | null>(null)

// Computed
const filteredTasks = computed(() => {
  let tasks = tasksStore.filteredTasks

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    tasks = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }

  return tasks
})

const activeCount = computed(
  () => filteredTasks.value.filter((task) => task.status === 'active').length
)

const completedCount = computed(
  () => filteredTasks.value.filter((task) => task.status === 'completed').length
)

const totalTime = computed(() => {
  const totalMinutes = filteredTasks.value.reduce(
    (total, task) => total + (task.spentMinutes || 0),
    0
  )

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м`
})

// Methods
const toggleSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    clearSearch()
  }
}

const handleSearch = useDebounce(() => {
  // Поиск уже работает через computed
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const openCreateModal = () => {
  editingTask.value = null
  showModal.value = true
}

const openEditModal = (task: Task) => {
  editingTask.value = task
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTask.value = null
}

const handleTaskSubmit = (taskData: any) => {
  if (editingTask.value) {
    // Обновляем существующую задачу
    tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    // Создаем новую задачу
    tasksStore.addTask(taskData)
  }
  closeModal()
}

const deleteTask = (taskId: string) => {
  if (confirm('Удалить эту задачу?')) {
    tasksStore.deleteTask(taskId)
  }
}

const startTaskTimer = (task: Task) => {
  // TODO: Сохраняем текущую задачу для таймера
  router.push('/timer')
}
</script>

<style scoped lang="scss">
.tasks-page {
  padding: var(--space-4);
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.search-button {
  @include button-reset;
  @include flex-center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.search-bar {
  margin-bottom: var(--space-4);
  animation: slideDown 0.2s ease-out;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;

  :deep(svg) {
    position: absolute;
    left: var(--space-4);
    color: var(--text-secondary);
  }

  input {
    @include button-reset;
    width: 100%;
    padding: var(--space-3) var(--space-4) var(--space-3) 44px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-button);
    color: var(--text-primary);
    font-family: var(--font-family-primary);
    font-size: var(--text-base);
    transition: all var(--duration-base);

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
      background: rgba(93, 95, 239, 0.05);
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
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    transition: all var(--duration-base);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }
}

.tasks-container {
  min-height: 200px;
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
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
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

.task-stats {
  @include card;
  display: flex;
  justify-content: space-around;
  padding: var(--space-4);
  margin-top: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  text-align: center;
}

.fab-button {
  position: fixed;
  bottom: calc(80px + var(--space-4));
  right: var(--space-4);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--accent-primary);
  color: white;
  border: none;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: all var(--duration-base);
  @include flex-center;
  z-index: var(--z-fixed);

  &:hover {
    background: var(--accent-secondary);
    transform: scale(1.1) rotate(90deg);
    box-shadow: var(--glow-primary);
  }

  &:active {
    transform: scale(0.95) rotate(90deg);
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

// Responsive adjustments
@include breakpoint(sm) {
  .tasks-page {
    max-width: 600px;
    margin: 0 auto;
  }
}

@include breakpoint(md) {
  .tasks-page {
    max-width: 800px;
  }
}
</style>
