<template>
  <div class="tasks-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Задачи</h1>
        <div class="header-actions">
          <button class="category-manager-button" @click="showCategoryManager">
            <Icon name="lucide:folder-plus" size="20" />
            <span>Категории</span>
          </button>
          <button class="add-button" @click="openTaskForm">
            <Icon name="lucide:plus" size="20" />
            <span>Новая задача</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <main class="page-content">
      <TaskList
        ref="taskListRef"
        @add-task="openTaskForm"
        @edit-task="editTask"
      />
    </main>

    <!-- Модальные окна -->
    <TaskForm
      :is-open="isTaskFormOpen"
      :task="editingTask"
      @close="closeTaskForm"
      @submit="handleTaskSubmit"
    />

    <CategoryManager
      :is-open="isCategoryManagerOpen"
      @close="closeCategoryManager"
    />

    <!-- FAB для мобильных -->
    <button class="fab-button" @click="openTaskForm">
      <Icon name="lucide:plus" size="24" />
    </button>
  </div>
</template>

<script setup lang="ts">
import TaskList from '~/components/Tasks/TaskList.vue'
import TaskForm from '~/components/Tasks/TaskForm.vue'
import CategoryManager from '~/components/Tasks/CategoryManager.vue'

const tasksStore = useTasksStore()

// Состояние модальных окон
const isTaskFormOpen = ref(false)
const isCategoryManagerOpen = ref(false)
const editingTask = ref<Task | null>(null)
const taskListRef = ref()

// Инициализация хранилища
onMounted(() => {
  tasksStore.initialize()
})

// Методы для форм
const openTaskForm = () => {
  editingTask.value = null
  isTaskFormOpen.value = true
}

const closeTaskForm = () => {
  isTaskFormOpen.value = false
  editingTask.value = null
}

const editTask = (task: Task) => {
  editingTask.value = task
  isTaskFormOpen.value = true
}

const handleTaskSubmit = (taskData: any) => {
  if (editingTask.value) {
    // Обновление задачи
    tasksStore.updateTask(editingTask.value.id, taskData)
  } else {
    // Создание новой задачи
    tasksStore.addTask(taskData)
  }
}

// Управление категориями
const showCategoryManager = () => {
  isCategoryManagerOpen.value = true
}

const closeCategoryManager = () => {
  isCategoryManagerOpen.value = false
}
</script>

<style scoped lang="scss">
.tasks-page {
  min-height: 100vh;
  background: var(--primary-bg);
}

.page-header {
  padding: var(--space-4) var(--space-4) var(--space-2);
  background: var(--card-bg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  @include breakpoint(md) {
    padding: var(--space-6) var(--space-6) var(--space-4);
  }
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;

  @include breakpoint(md) {
    font-size: var(--text-3xl);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.category-manager-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  @include breakpoint(xs) {
    span {
      display: none;
    }
  }
}

.add-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    box-shadow: var(--glow-primary);
  }

  @include breakpoint(xs) {
    span {
      display: none;
    }
  }
}

.page-content {
  padding: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;

  @include breakpoint(md) {
    padding: var(--space-6);
  }
}

.fab-button {
  @include button-reset;
  @include flex-center;
  position: fixed;
  bottom: calc(var(--space-4) + 80px);
  right: var(--space-4);
  width: 56px;
  height: 56px;
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  transition: all var(--duration-base);
  z-index: var(--z-fixed);

  &:hover {
    background: var(--accent-secondary);
    transform: scale(1.1);
    box-shadow: var(--shadow-xl);
  }

  @include breakpoint(md) {
    display: none;
  }
}

// Light theme adjustments
[data-theme='light'] {
  .page-header {
    background: var(--card-bg);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .category-manager-button {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
