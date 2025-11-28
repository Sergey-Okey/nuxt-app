<template>
  <div v-if="isOpen" class="create-task-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <button class="cancel-button" @click="closeModal">Отмена</button>
          <h2 class="modal-title">
            {{ isEditing ? 'Редактировать' : 'Новая задача' }}
          </h2>
          <button class="save-button" :disabled="!canSave" @click="saveTask">
            {{ isEditing ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <div class="form-section">
          <!-- Title -->
          <div class="input-group">
            <label class="input-label">Название задачи</label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="Что нужно сделать?"
              class="text-input"
              maxlength="100"
            />
            <div class="input-counter">{{ formData.title.length }}/100</div>
          </div>

          <!-- Description -->
          <div class="input-group">
            <label class="input-label">Описание (необязательно)</label>
            <textarea
              v-model="formData.description"
              placeholder="Добавьте подробности..."
              class="text-input textarea"
              rows="3"
              maxlength="500"
            ></textarea>
            <div class="input-counter">
              {{ formData.description.length }}/500
            </div>
          </div>

          <!-- Category -->
          <div class="input-group">
            <label class="input-label">Категория</label>
            <div class="category-selector">
              <button
                v-for="category in availableCategories"
                :key="category.id"
                class="category-option"
                :class="{ active: formData.category === category.id }"
                @click="formData.category = category.id"
              >
                <div
                  class="category-color"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="category-name">{{ category.name }}</span>
                <Icon :name="category.icon" size="16" />
              </button>

              <!-- Add Custom Category -->
              <button
                class="category-option add-category"
                @click="showCategoryCreator = true"
              >
                <div class="category-color add-color">
                  <Icon name="lucide:plus" size="16" />
                </div>
                <span class="category-name">Новая категория</span>
              </button>
            </div>
          </div>

          <!-- Priority -->
          <div class="input-group">
            <label class="input-label">Приоритет</label>
            <div class="priority-selector">
              <button
                v-for="priority in priorities"
                :key="priority.value"
                class="priority-option"
                :class="[
                  priority.value,
                  { active: formData.priority === priority.value },
                ]"
                @click="formData.priority = priority.value"
              >
                <Icon :name="priority.icon" size="16" />
                <span>{{ priority.label }}</span>
              </button>
            </div>
          </div>

          <!-- Due Date -->
          <div class="input-group">
            <label class="input-label">Срок выполнения</label>
            <div class="date-selector">
              <button
                class="date-option"
                :class="{ active: formData.dueAt }"
                @click="toggleDatePicker"
              >
                <Icon name="lucide:calendar" size="16" />
                <span>{{ dueDateDisplay }}</span>
                <button
                  v-if="formData.dueAt"
                  class="clear-date"
                  @click.stop="clearDueDate"
                >
                  <Icon name="lucide:x" size="14" />
                </button>
              </button>
            </div>

            <!-- Date Picker -->
            <div v-if="showDatePicker" class="date-picker">
              <input
                v-model="formData.dueAt"
                type="datetime-local"
                class="date-input"
                :min="minDate"
              />
            </div>
          </div>

          <!-- Time Estimation -->
          <div class="input-group">
            <label class="input-label">Оценка времени (минуты)</label>
            <div class="time-estimation">
              <button
                v-for="time in timeOptions"
                :key="time.value"
                class="time-option"
                :class="{ active: formData.estimatedMinutes === time.value }"
                @click="formData.estimatedMinutes = time.value"
              >
                {{ time.label }}
              </button>
              <input
                v-model.number="formData.estimatedMinutes"
                type="number"
                placeholder="Другое..."
                class="time-input"
                min="1"
                max="480"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="input-group">
            <label class="input-label">Теги</label>
            <div class="tags-input">
              <div class="tags-list">
                <span v-for="tag in formData.tags" :key="tag" class="tag">
                  {{ tag }}
                  <button @click="removeTag(tag)" class="tag-remove">
                    <Icon name="lucide:x" size="12" />
                  </button>
                </span>
              </div>
              <input
                v-model="newTag"
                type="text"
                placeholder="Добавить тег..."
                class="tag-input"
                @keydown.enter="addTag"
                @keydown.backspace="handleBackspace"
                maxlength="20"
              />
            </div>
          </div>

          <!-- Timer Section (only when editing and task has timer) -->
          <div v-if="isEditing && task?.spentMinutes" class="input-group">
            <label class="input-label">Затраченное время</label>
            <div class="time-spent">
              <Icon name="lucide:clock" size="16" />
              <span>{{ formatTimeSpent(task.spentMinutes) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Category Creator -->
    <div v-if="showCategoryCreator" class="category-creator-modal">
      <div class="modal-backdrop" @click="showCategoryCreator = false"></div>
      <div class="modal-container small">
        <div class="modal-header">
          <h3>Новая категория</h3>
          <button class="close-button" @click="showCategoryCreator = false">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>
        <div class="modal-content">
          <div class="input-group">
            <label>Название категории</label>
            <input
              v-model="newCategory.name"
              type="text"
              placeholder="Название"
              class="text-input"
              maxlength="20"
            />
          </div>
          <div class="input-group">
            <label>Цвет</label>
            <div class="color-picker">
              <button
                v-for="color in availableColors"
                :key="color"
                class="color-option"
                :class="{ active: newCategory.color === color }"
                :style="{ backgroundColor: color }"
                @click="newCategory.color = color"
              ></button>
            </div>
          </div>
          <div class="input-group">
            <label>Иконка</label>
            <div class="icon-picker">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                class="icon-option"
                :class="{ active: newCategory.icon === icon }"
                @click="newCategory.icon = icon"
              >
                <Icon :name="icon" size="20" />
              </button>
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="button secondary"
              @click="showCategoryCreator = false"
            >
              Отмена
            </button>
            <button
              class="button primary"
              :disabled="!newCategory.name"
              @click="createCustomCategory"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task, Category } from '~/stores/tasks'

interface Props {
  isOpen: boolean
  task?: Task | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tasksStore = useTasksStore()

// Form data
const formData = reactive({
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueAt: '' as string | undefined,
  estimatedMinutes: undefined as number | undefined,
  tags: [] as string[],
})

// UI state
const showDatePicker = ref(false)
const showCategoryCreator = ref(false)
const newTag = ref('')

// New category form
const newCategory = reactive({
  name: '',
  color: '#5d5fef',
  icon: 'lucide:tag',
})

// Computed properties
const isEditing = computed(() => !!props.task)
const canSave = computed(() => formData.title.trim().length > 0)

const availableCategories = computed(() => tasksStore.categories)

const dueDateDisplay = computed(() => {
  if (!formData.dueAt) return 'Без срока'
  const date = new Date(formData.dueAt)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const minDate = computed(() => {
  return new Date().toISOString().slice(0, 16)
})

// Options
const priorities = [
  { value: 'low', label: 'Низкий', icon: 'lucide:arrow-down' },
  { value: 'medium', label: 'Средний', icon: 'lucide:minus' },
  { value: 'high', label: 'Высокий', icon: 'lucide:arrow-up' },
]

const timeOptions = [
  { value: 15, label: '15м' },
  { value: 30, label: '30м' },
  { value: 60, label: '1ч' },
  { value: 120, label: '2ч' },
  { value: 240, label: '4ч' },
]

const availableColors = [
  '#5d5fef',
  '#5df27e',
  '#f87171',
  '#facc15',
  '#60a5fa',
  '#a78bfa',
  '#f472b6',
  '#fb923c',
]

const availableIcons = [
  'lucide:tag',
  'lucide:star',
  'lucide:heart',
  'lucide:shopping-cart',
  'lucide:utensils',
  'lucide:car',
  'lucide:home',
  'lucide:briefcase',
  'lucide:book',
  'lucide:music',
  'lucide:film',
  'lucide:gamepad',
]

// Methods
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  if (props.task) {
    // Editing mode - reset to task data
    Object.assign(formData, {
      title: props.task.title,
      description: props.task.description || '',
      category: props.task.category,
      priority: props.task.priority,
      dueAt: props.task.dueAt
        ? new Date(props.task.dueAt).toISOString().slice(0, 16)
        : undefined,
      estimatedMinutes: props.task.estimatedMinutes,
      tags: [...props.task.tags],
    })
  } else {
    // Create mode - reset to defaults
    Object.assign(formData, {
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueAt: undefined,
      estimatedMinutes: undefined,
      tags: [],
    })
  }
  showDatePicker.value = false
  newTag.value = ''
}

const saveTask = () => {
  if (!canSave.value) return

  const taskData = {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined,
    category: formData.category,
    priority: formData.priority,
    dueAt: formData.dueAt ? new Date(formData.dueAt) : undefined,
    estimatedMinutes: formData.estimatedMinutes,
    tags: formData.tags,
    status: 'active' as const,
  }

  let savedTask: Task
  if (isEditing.value && props.task) {
    tasksStore.updateTask(props.task.id, taskData)
    savedTask = { ...props.task, ...taskData }
  } else {
    savedTask = tasksStore.addTask(taskData)
  }

  emit('saved', savedTask)
  closeModal()
}

const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value
}

const clearDueDate = () => {
  formData.dueAt = undefined
  showDatePicker.value = false
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  formData.tags = formData.tags.filter((t) => t !== tag)
}

const handleBackspace = (event: KeyboardEvent) => {
  if (newTag.value === '' && formData.tags.length > 0) {
    formData.tags.pop()
  }
}

const createCustomCategory = () => {
  if (!newCategory.name.trim()) return

  const category = tasksStore.addCustomCategory(
    newCategory.name.trim(),
    newCategory.color,
    newCategory.icon
  )

  formData.category = category.id
  showCategoryCreator.value = false

  // Reset new category form
  Object.assign(newCategory, {
    name: '',
    color: '#5d5fef',
    icon: 'lucide:tag',
  })
}

const formatTimeSpent = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}ч ${mins}м`
  }
  return `${mins}м`
}

// Watch for task changes
watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      resetForm()
    }
  },
  { immediate: true }
)

// Initialize form when modal opens
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm()
    }
  }
)
</script>

<style scoped lang="scss">
.create-task-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  animation: backdropFadeIn 0.3s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

.modal-container {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  margin-top: auto;
  border-radius: 24px 24px 0 0;
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  max-height: 90vh;

  &.small {
    max-height: 70vh;
    margin: auto;
    border-radius: 24px;
    max-width: 400px;
    animation: scaleIn 0.3s ease-out;
  }

  @include breakpoint(md) {
    max-width: 600px;
    max-height: 80vh;
    margin: auto;
    border-radius: 24px;
    animation: scaleIn 0.3s ease-out;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--card-bg);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  @include breakpoint(md) {
    &::after {
      display: none;
    }
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.cancel-button {
  @include button-reset;
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  padding: var(--space-2);

  &:hover {
    color: var(--text-primary);
  }
}

.save-button {
  @include button-reset;
  color: var(--accent-primary);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: var(--space-2);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    color: var(--accent-secondary);
  }
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.text-input {
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  padding: var(--space-3) var(--space-4);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.1);
  }

  &.textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.input-counter {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: right;
}

// Category Selector
.category-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);

  @include breakpoint(sm) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.category-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
  }

  &.add-category {
    border-style: dashed;
    border-color: rgba(255, 255, 255, 0.3);

    &:hover {
      border-color: var(--accent-primary);
    }
  }
}

.category-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;

  &.add-color {
    background: rgba(255, 255, 255, 0.1);
    @include flex-center;
    color: var(--text-secondary);
  }
}

.category-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  flex: 1;
  text-align: left;
}

// Priority Selector
.priority-selector {
  display: flex;
  gap: var(--space-2);
}

.priority-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    border-color: currentColor;

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
}

// Date Selector
.date-selector {
  display: flex;
  gap: var(--space-2);
}

.date-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
  }
}

.clear-date {
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

.date-picker {
  margin-top: var(--space-2);
}

.date-input {
  width: 100%;
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  padding: var(--space-3);
  color: var(--text-primary);
  font-size: var(--text-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

// Time Estimation
.time-estimation {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.time-option {
  @include button-reset;
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

.time-input {
  flex: 1;
  min-width: 100px;
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  padding: var(--space-2) var(--space-3);
  color: var(--text-primary);
  font-size: var(--text-sm);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

// Tags Input
.tags-input {
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  padding: var(--space-2);
  transition: all var(--duration-base);

  &:focus-within {
    border-color: var(--accent-primary);
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.tag-remove {
  @include button-reset;
  @include flex-center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  color: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.tag-input {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-sm);
  padding: var(--space-1);

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

// Time Spent
.time-spent {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

// Category Creator
.category-creator-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--z-modal) + 10);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.color-option {
  @include button-reset;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  transition: all var(--duration-base);

  &.active {
    transform: scale(1.1);
    box-shadow: 0 0 0 3px white, 0 0 0 5px currentColor;
  }
}

.icon-picker {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-2);
}

.icon-option {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &.active {
    background: var(--accent-primary);
    color: white;
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-weight: var(--font-semibold);
  transition: all var(--duration-base);

  &.primary {
    background: var(--accent-primary);
    color: white;

    &:hover:not(:disabled) {
      background: var(--accent-secondary);
    }
  }

  &.secondary {
    background: var(--surface-bg);
    color: var(--text-primary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Light theme adjustments
[data-theme='light'] {
  .text-input,
  .category-option,
  .priority-option,
  .date-option,
  .time-option,
  .time-input,
  .tags-input,
  .time-spent {
    background: var(--surface-bg);
    border-color: rgba(0, 0, 0, 0.1);
  }

  .color-option.active {
    box-shadow: 0 0 0 3px white, 0 0 0 5px currentColor;
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .modal-container {
    border-radius: 0;
    max-height: none;
    margin-top: 0;
  }

  .modal-header {
    padding-top: calc(var(--space-4) + env(safe-area-inset-top));

    &::after {
      display: block;
    }
  }

  .modal-content {
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  }

  .category-selector {
    grid-template-columns: 1fr;
  }

  .priority-selector {
    flex-direction: column;
  }
}
</style>
