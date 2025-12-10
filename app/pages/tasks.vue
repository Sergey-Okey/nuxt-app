<template>
  <div class="tasks-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Мои задачи</h1>
      <div class="header-actions">
        <button class="add-task-button" @click="openCreateForm">
          <Icon name="lucide:plus" size="18" />
          <span>Новая задача</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <TaskFilters @search="handleSearch" />

    <!-- Task List -->
    <div class="tasks-container">
      <div
        v-if="filteredTasks.length > 0"
        class="tasks-list"
        @dragover.prevent
        @drop="handleDrop"
      >
        <TaskItem
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          @edit="openEditForm"
          @delete="deleteTask"
          @toggle="toggleTaskStatus"
          @timer-start="startTaskTimer"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <Icon name="lucide:clipboard-list" size="48" />
        </div>
        <div class="empty-content">
          <h3>{{ searchQuery ? 'Задачи не найдены' : 'Пока нет задач' }}</h3>
          <p>
            {{
              searchQuery
                ? 'Попробуйте изменить условия поиска'
                : 'Создайте свою первую задачу'
            }}
          </p>
        </div>
        <button
          v-if="!searchQuery"
          class="create-first-task"
          @click="openCreateForm"
        >
          <Icon name="lucide:plus" size="16" />
          <span>Создать задачу</span>
        </button>
      </div>
    </div>

    <!-- Task Timer Widget -->
    <TaskTimerWidget
      v-if="activeTimerTask"
      :task="activeTimerTask"
      @complete="stopTimer"
      @stop="stopTimer"
    />

    <!-- Task Form Modal -->
    <TaskForm
      :isOpen="showForm"
      :task="editingTask"
      @close="closeForm"
      @submit="handleFormSubmit"
    />
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// State
const showForm = ref(false)
const editingTask = ref<Task | null>(null)
const activeTimerTask = ref<Task | null>(null)
const searchQuery = ref('')

// Computed
const filteredTasks = computed(() => {
  const tasks = tasksStore.filteredTasks

  if (!searchQuery.value) return tasks

  const query = searchQuery.value.toLowerCase()
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query)) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query))
  )
})

const totalTasks = computed(() => tasksStore.tasks.length)
const completedTasks = computed(() => tasksStore.completedTasks.length)
const totalTimeSpent = computed(() => {
  return tasksStore.tasks.reduce(
    (total, task) => total + (task.spentMinutes || 0),
    0
  )
})

// Methods
const openCreateForm = () => {
  editingTask.value = null
  showForm.value = true
}

const openEditForm = (task: Task) => {
  editingTask.value = task
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingTask.value = null
}

const handleFormSubmit = (taskData: any) => {
  if (editingTask.value) {
    // Update existing task
    tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    // Create new task
    tasksStore.addTask(taskData)
  }
}

const deleteTask = (taskId: string) => {
  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    tasksStore.deleteTask(taskId)
  }
}

const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const startTaskTimer = (task: Task) => {
  activeTimerTask.value = task
}

const stopTimer = () => {
  activeTimerTask.value = null
}

const handleSearch = (query: string) => {
  searchQuery.value = query
}

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}м`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
}

// Drag & Drop for reordering
const handleDrop = (e: DragEvent) => {
  const taskId = e.dataTransfer?.getData('taskId')
  if (taskId) {
    // Here you could implement task reordering logic
    console.log('Dropped task:', taskId)
  }
}

// Initialize store
onMounted(() => {
  tasksStore.initialize()
})
</script>

<style scoped lang="scss">
.tasks-page {
  padding: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);

  h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: var(--space-3);
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
  font-weight: var(--font-semibold);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-2px);
    box-shadow: var(--glow-primary);
  }

  &:active {
    transform: translateY(0);
  }
}

.tasks-container {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8);
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

.empty-content {
  margin-bottom: var(--space-4);

  h3 {
    font-size: var(--text-xl);
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

.create-first-task {
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
    transform: translateY(-2px);
    box-shadow: var(--glow-primary);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .stat-icon {
    background: rgba(93, 95, 239, 0.08);
  }

  .tasks-container,
  .stat-card {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .empty-icon {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }

  .task-stats {
    grid-template-columns: 1fr;
  }

  .tasks-container {
    padding: var(--space-3);
  }
}
</style>
