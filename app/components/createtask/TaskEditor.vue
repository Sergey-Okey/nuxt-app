<template>
  <div class="task-editor">
    <!-- Header -->
    <div class="editor-header">
      <button class="header-button" @click="closeEditor">
        <Icon name="lucide:x" size="20" />
      </button>
      <h2 class="editor-title">
        {{ isEditing ? 'Редактировать' : 'Новая задача' }}
      </h2>
      <button
        class="header-button primary"
        :disabled="!canSave"
        @click="saveTask"
      >
        <Icon name="lucide:check" size="20" />
      </button>
    </div>

    <!-- Main Form -->
    <div class="editor-content">
      <!-- Title -->
      <div class="form-section">
        <label class="form-label">Название задачи</label>
        <input
          v-model="taskData.title"
          type="text"
          class="form-input"
          placeholder="Что нужно сделать?"
          maxlength="100"
        />
        <div class="char-counter">{{ taskData.title.length }}/100</div>
      </div>

      <!-- Description -->
      <div class="form-section">
        <label class="form-label">Описание</label>
        <textarea
          v-model="taskData.description"
          class="form-textarea"
          placeholder="Добавьте подробности..."
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="char-counter">{{ taskData.description.length }}/500</div>
      </div>

      <!-- Category -->
      <div class="form-section">
        <label class="form-label">Категория</label>
        <div class="categories-grid">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-option"
            :class="{ active: taskData.category === category.id }"
            @click="taskData.category = category.id"
          >
            <div
              class="category-icon"
              :style="{ backgroundColor: category.color }"
            >
              <Icon :name="category.icon" size="16" />
            </div>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
      </div>

      <!-- Priority -->
      <div class="form-section">
        <label class="form-label">Приоритет</label>
        <div class="priority-options">
          <button
            v-for="priority in priorityOptions"
            :key="priority.value"
            class="priority-option"
            :class="[
              priority.value,
              { active: taskData.priority === priority.value },
            ]"
            @click="taskData.priority = priority.value"
          >
            <Icon :name="priority.icon" size="16" />
            <span>{{ priority.label }}</span>
          </button>
        </div>
      </div>

      <!-- Due Date -->
      <div class="form-section">
        <label class="form-label">Срок выполнения</label>
        <div class="date-options">
          <button
            v-for="option in dateOptions"
            :key="option.value"
            class="date-option"
            :class="{ active: selectedDateOption === option.value }"
            @click="setDueDate(option.value)"
          >
            <Icon :name="option.icon" size="16" />
            <span>{{ option.label }}</span>
          </button>
        </div>

        <div v-if="showCustomDate" class="custom-date">
          <input
            v-model="taskData.dueAt"
            type="datetime-local"
            class="date-input"
            :min="minDate"
          />
        </div>
      </div>

      <!-- Estimated Time -->
      <div class="form-section">
        <label class="form-label">Оценочное время</label>
        <div class="time-options">
          <button
            v-for="time in timeOptions"
            :key="time.value"
            class="time-option"
            :class="{ active: taskData.estimatedMinutes === time.value }"
            @click="taskData.estimatedMinutes = time.value"
          >
            <span>{{ time.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tags -->
      <div class="form-section">
        <label class="form-label">Теги</label>
        <div class="tags-input">
          <div class="tags-list">
            <span
              v-for="tag in taskData.tags"
              :key="tag"
              class="tag"
              @click="removeTag(tag)"
            >
              {{ tag }}
              <Icon name="lucide:x" size="12" />
            </span>
          </div>
          <input
            v-model="newTag"
            type="text"
            class="tag-input"
            placeholder="Добавить тег..."
            @keydown.enter="addTag"
            @keydown.backspace="handleBackspace"
          />
        </div>
      </div>

      <!-- Delete Button (only in edit mode) -->
      <div v-if="isEditing" class="form-section">
        <button class="delete-button" @click="deleteTask">
          <Icon name="lucide:trash-2" size="16" />
          <span>Удалить задачу</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

interface Props {
  task?: Task
  category?: string
}

const props = withDefaults(defineProps<Props>(), {
  task: undefined,
  category: 'work',
})

const emit = defineEmits<{
  close: []
  saved: [task: Task]
}>()

const tasksStore = useTasksStore()

// Reactive data
const taskData = ref({
  title: '',
  description: '',
  category: props.category,
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueAt: undefined as Date | undefined,
  estimatedMinutes: undefined as number | undefined,
  tags: [] as string[],
})

const newTag = ref('')
const selectedDateOption = ref<'today' | 'tomorrow' | 'week' | 'custom' | null>(
  null
)
const showCustomDate = ref(false)

// Computed properties
const isEditing = computed(() => !!props.task)
const categories = computed(() => tasksStore.categories)
const canSave = computed(() => taskData.value.title.trim().length > 0)

const priorityOptions = [
  { value: 'low', label: 'Низкий', icon: 'lucide:arrow-down' },
  { value: 'medium', label: 'Средний', icon: 'lucide:minus' },
  { value: 'high', label: 'Высокий', icon: 'lucide:arrow-up' },
]

const dateOptions = [
  { value: 'today', label: 'Сегодня', icon: 'lucide:calendar' },
  { value: 'tomorrow', label: 'Завтра', icon: 'lucide:sun' },
  { value: 'week', label: 'Через неделю', icon: 'lucide:calendar-range' },
  { value: 'custom', label: 'Выбрать дату', icon: 'lucide:calendar-plus' },
]

const timeOptions = [
  { value: 15, label: '15 мин' },
  { value: 30, label: '30 мин' },
  { value: 45, label: '45 мин' },
  { value: 60, label: '1 час' },
  { value: 90, label: '1.5 часа' },
  { value: 120, label: '2 часа' },
  { value: 180, label: '3 часа' },
]

const minDate = computed(() => {
  return new Date().toISOString().slice(0, 16)
})

// Methods
const closeEditor = () => {
  emit('close')
}

const saveTask = () => {
  if (!canSave.value) return

  const taskToSave = {
    ...taskData.value,
    status: 'active' as const,
    spentMinutes: 0,
  }

  if (isEditing.value && props.task) {
    tasksStore.updateTask(props.task.id, taskToSave)
  } else {
    tasksStore.addTask(taskToSave)
  }

  emit('saved', taskToSave as Task)
  closeEditor()
}

const deleteTask = () => {
  if (props.task) {
    tasksStore.deleteTask(props.task.id)
    closeEditor()
  }
}

const setDueDate = (option: string) => {
  selectedDateOption.value = option as any
  const now = new Date()

  switch (option) {
    case 'today':
      taskData.value.dueAt = new Date(now.setHours(23, 59, 0, 0))
      showCustomDate.value = false
      break
    case 'tomorrow':
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(19, 0, 0, 0)
      taskData.value.dueAt = tomorrow
      showCustomDate.value = false
      break
    case 'week':
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(19, 0, 0, 0)
      taskData.value.dueAt = nextWeek
      showCustomDate.value = false
      break
    case 'custom':
      showCustomDate.value = true
      if (!taskData.value.dueAt) {
        const defaultDate = new Date(now)
        defaultDate.setDate(defaultDate.getDate() + 1)
        defaultDate.setHours(19, 0, 0, 0)
        taskData.value.dueAt = defaultDate
      }
      break
  }
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !taskData.value.tags.includes(tag)) {
    taskData.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  taskData.value.tags = taskData.value.tags.filter((t) => t !== tag)
}

const handleBackspace = (event: KeyboardEvent) => {
  if (newTag.value === '' && taskData.value.tags.length > 0) {
    taskData.value.tags.pop()
  }
}

// Initialize with task data if editing
onMounted(() => {
  if (props.task) {
    taskData.value = {
      title: props.task.title,
      description: props.task.description || '',
      category: props.task.category,
      priority: props.task.priority,
      dueAt: props.task.dueAt,
      estimatedMinutes: props.task.estimatedMinutes,
      tags: [...props.task.tags],
    }

    // Set initial date option based on existing due date
    if (props.task.dueAt) {
      const dueDate = new Date(props.task.dueAt)
      const today = new Date()
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) selectedDateOption.value = 'today'
      else if (diffDays === 1) selectedDateOption.value = 'tomorrow'
      else if (diffDays <= 7) selectedDateOption.value = 'week'
      else {
        selectedDateOption.value = 'custom'
        showCustomDate.value = true
      }
    }
  }
})
</script>

<style scoped lang="scss">
.task-editor {
  background: var(--primary-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--card-bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-button {
  @include button-reset;
  @include flex-center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }

  &.primary {
    color: var(--accent-primary);

    &:hover:not(:disabled) {
      background: rgba(93, 95, 239, 0.1);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

.editor-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.editor-content {
  flex: 1;
  padding: var(--space-4);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
}

.form-section {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: inherit;
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.char-counter {
  text-align: right;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-2);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.category-option {
  @include button-reset;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
  }
}

.category-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-card);
  color: white;
}

.category-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.priority-options {
  display: flex;
  gap: var(--space-2);
}

.priority-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    border-color: currentColor;

    &.low {
      color: var(--success);
      background: rgba(93, 242, 126, 0.05);
    }

    &.medium {
      color: var(--warning);
      background: rgba(250, 204, 21, 0.05);
    }

    &.high {
      color: var(--error);
      background: rgba(248, 113, 113, 0.05);
    }
  }
}

.date-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.date-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
    color: var(--accent-primary);
  }
}

.custom-date {
  .date-input {
    width: 100%;
    padding: var(--space-4);
    background: var(--surface-bg);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-card);
    color: var(--text-primary);
    font-size: var(--text-base);
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: var(--accent-primary);
    }
  }
}

.time-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.time-option {
  @include button-reset;
  padding: var(--space-3) var(--space-2);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
    color: var(--accent-primary);
  }
}

.tags-input {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  background: var(--surface-bg);
  padding: var(--space-3);
  min-height: 52px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.2);
  }
}

.tag-input {
  flex: 1;
  min-width: 100px;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-sm);
  outline: none;

  &::placeholder {
    color: var(--text-secondary);
  }
}

.delete-button {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4);
  background: rgba(248, 113, 113, 0.05);
  color: var(--error);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--radius-card);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    border-color: var(--error);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .form-input,
  .form-textarea,
  .category-option,
  .priority-option,
  .date-option,
  .time-option,
  .tags-input {
    border-color: rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .header-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .date-options {
    grid-template-columns: 1fr;
  }

  .time-options {
    grid-template-columns: repeat(3, 1fr);
  }

  .editor-content {
    padding: var(--space-3);
  }
}
</style>
