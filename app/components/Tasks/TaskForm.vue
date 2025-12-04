<template>
  <div class="task-form-modal" v-if="isOpen">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            {{ isEditing ? 'Редактировать задачу' : 'Новая задача' }}
          </h2>
          <button class="close-button" @click="closeModal">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>

        <!-- Форма -->
        <form class="task-form" @submit.prevent="submitForm">
          <div class="form-section">
            <label class="form-label">
              <Icon name="lucide:edit-2" size="16" />
              <span>Название задачи *</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="Что нужно сделать?"
              required
            />
          </div>

          <div class="form-section">
            <label class="form-label">
              <Icon name="lucide:file-text" size="16" />
              <span>Описание</span>
            </label>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              placeholder="Добавьте подробности..."
              rows="3"
            />
          </div>

          <div class="form-grid">
            <!-- Категория -->
            <div class="form-section">
              <label class="form-label">
                <Icon name="lucide:folder" size="16" />
                <span>Категория</span>
              </label>
              <div class="category-select">
                <button
                  type="button"
                  class="select-button"
                  @click="showCategoryPicker = !showCategoryPicker"
                >
                  <div class="selected-category">
                    <Icon :name="selectedCategory.icon" size="16" />
                    <span>{{ selectedCategory.name }}</span>
                  </div>
                  <Icon name="lucide:chevron-down" size="16" />
                </button>

                <div v-if="showCategoryPicker" class="category-picker">
                  <div class="category-list">
                    <button
                      v-for="category in categories"
                      :key="category.id"
                      type="button"
                      class="category-option"
                      :style="{ '--category-color': category.color }"
                      @click="selectCategory(category)"
                    >
                      <Icon :name="category.icon" size="16" />
                      <span>{{ category.name }}</span>
                      <span
                        v-if="category.taskCount > 0"
                        class="category-count"
                      >
                        {{ category.taskCount }}
                      </span>
                    </button>
                  </div>
                  <div class="category-actions">
                    <button
                      type="button"
                      class="action-button secondary"
                      @click="openCategoryManager"
                    >
                      <Icon name="lucide:settings" size="14" />
                      <span>Управление</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Приоритет -->
            <div class="form-section">
              <label class="form-label">
                <Icon name="lucide:flag" size="16" />
                <span>Приоритет</span>
              </label>
              <div class="priority-select">
                <button
                  v-for="priority in priorityOptions"
                  :key="priority.value"
                  type="button"
                  class="priority-option"
                  :class="{ active: formData.priority === priority.value }"
                  @click="formData.priority = priority.value"
                >
                  <Icon :name="priority.icon" size="16" />
                  <span>{{ priority.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="form-grid">
            <!-- Дедлайн -->
            <div class="form-section">
              <label class="form-label">
                <Icon name="lucide:calendar" size="16" />
                <span>Дедлайн</span>
              </label>
              <div class="date-picker">
                <input
                  v-model="formData.dueDate"
                  type="date"
                  class="date-input"
                  :min="todayDate"
                />
                <input
                  v-model="formData.dueTime"
                  type="time"
                  class="time-input"
                />
                <button
                  type="button"
                  class="clear-date"
                  @click="clearDeadline"
                  v-if="formData.dueDate"
                >
                  <Icon name="lucide:x" size="14" />
                </button>
              </div>
            </div>

            <!-- Оценка времени -->
            <div class="form-section">
              <label class="form-label">
                <Icon name="lucide:clock" size="16" />
                <span>Оценка времени</span>
              </label>
              <div class="time-estimate">
                <input
                  v-model="formData.estimatedMinutes"
                  type="number"
                  class="time-input"
                  placeholder="0"
                  min="0"
                />
                <span class="time-label">минут</span>
              </div>
            </div>
          </div>

          <!-- Тэги -->
          <div class="form-section">
            <label class="form-label">
              <Icon name="lucide:tag" size="16" />
              <span>Тэги</span>
            </label>
            <div class="tags-input">
              <div class="tags-list">
                <span v-for="tag in formData.tags" :key="tag" class="tag-item">
                  {{ tag }}
                  <button
                    type="button"
                    class="tag-remove"
                    @click="removeTag(tag)"
                  >
                    <Icon name="lucide:x" size="10" />
                  </button>
                </span>
              </div>
              <div class="tag-input-wrapper">
                <input
                  v-model="newTag"
                  type="text"
                  class="tag-input"
                  placeholder="Добавить тэг..."
                  @keydown.enter.prevent="addTag"
                />
                <button
                  type="button"
                  class="tag-add"
                  @click="addTag"
                  :disabled="!newTag.trim()"
                >
                  <Icon name="lucide:plus" size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="closeModal">
              Отмена
            </button>
            <button type="submit" class="submit-button">
              {{ isEditing ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Task } from '~/stores/tasks'

const props = defineProps<{
  isOpen: boolean
  task?: Task | null
}>()

const emit = defineEmits<{
  close: []
  submit: [taskData: any]
}>()

const tasksStore = useTasksStore()

// Форма
const formData = reactive({
  title: '',
  description: '',
  category: 'uncategorized',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueDate: '',
  dueTime: '',
  estimatedMinutes: undefined as number | undefined,
  tags: [] as string[],
})

const newTag = ref('')
const showCategoryPicker = ref(false)
const todayDate = new Date().toISOString().split('T')[0]

// Вычисляемые свойства
const isEditing = computed(() => !!props.task)
const categories = computed(() => tasksStore.categories)

const selectedCategory = computed(() => {
  return (
    categories.value.find((cat) => cat.id === formData.category) ||
    categories.value[0]
  )
})

const priorityOptions = [
  { value: 'low' as const, label: 'Низкий', icon: 'lucide:chevron-down' },
  { value: 'medium' as const, label: 'Средний', icon: 'lucide:minus' },
  { value: 'high' as const, label: 'Высокий', icon: 'lucide:chevron-up' },
]

// Методы
const resetForm = () => {
  formData.title = ''
  formData.description = ''
  formData.category = 'uncategorized'
  formData.priority = 'medium'
  formData.dueDate = ''
  formData.dueTime = ''
  formData.estimatedMinutes = undefined
  formData.tags = []
  newTag.value = ''
  showCategoryPicker.value = false
}

const loadTaskData = () => {
  if (props.task) {
    formData.title = props.task.title
    formData.description = props.task.description || ''
    formData.category = props.task.category
    formData.priority = props.task.priority
    formData.tags = [...props.task.tags]

    if (props.task.dueAt) {
      const date = new Date(props.task.dueAt)
      formData.dueDate = date.toISOString().split('T')[0]
      formData.dueTime = date.toTimeString().slice(0, 5)
    }

    formData.estimatedMinutes = props.task.estimatedMinutes
  }
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const selectCategory = (category: any) => {
  formData.category = category.id
  showCategoryPicker.value = false
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
  }
  newTag.value = ''
}

const removeTag = (tag: string) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

const clearDeadline = () => {
  formData.dueDate = ''
  formData.dueTime = ''
}

const submitForm = () => {
  // Подготовка данных
  const taskData: any = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    priority: formData.priority,
    estimatedMinutes: formData.estimatedMinutes
      ? parseInt(formData.estimatedMinutes.toString())
      : undefined,
    tags: formData.tags,
  }

  // Добавляем дедлайн если указан
  if (formData.dueDate) {
    let dueAt = new Date(formData.dueDate)
    if (formData.dueTime) {
      const [hours, minutes] = formData.dueTime.split(':')
      dueAt.setHours(parseInt(hours), parseInt(minutes))
    }
    taskData.dueAt = dueAt
  }

  emit('submit', taskData)
  closeModal()
}

const openCategoryManager = () => {
  // TODO: Открыть менеджер категорий
  showCategoryPicker.value = false
  console.log('Open category manager')
}

// Наблюдатели
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm()
      if (props.task) {
        loadTaskData()
      }
    }
  }
)

// Закрытие по клику вне
onClickOutside(document.body, () => {
  if (showCategoryPicker.value) {
    showCategoryPicker.value = false
  }
})
</script>

<style scoped lang="scss">
.task-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content {
  @include glass(20px, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.close-button {
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
  }
}

.task-form {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: var(--glow-primary);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  @include breakpoint(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.category-select {
  position: relative;
}

.select-button {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.selected-category {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  :deep(svg) {
    color: var(--category-color, var(--text-secondary));
  }
}

.category-picker {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-1);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  overflow: hidden;
}

.category-list {
  max-height: 200px;
  overflow-y: auto;
  padding: var(--space-2);
}

.category-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(var(--category-color, 93, 95, 239), 0.1);
    color: var(--category-color, var(--accent-primary));

    :deep(svg) {
      color: var(--category-color, var(--accent-primary));
    }
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.category-count {
  margin-left: auto;
  font-size: var(--text-xs);
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.category-actions {
  padding: var(--space-2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.priority-select {
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
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover:not(.active) {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);

    :deep(svg) {
      color: white;
    }
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.date-picker {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.date-input,
.time-input {
  flex: 1;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.clear-date {
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
  }
}

.time-estimate {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.time-label {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.tag-remove {
  @include button-reset;
  @include flex-center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.tag-input-wrapper {
  display: flex;
  gap: var(--space-2);
}

.tag-input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

.tag-add {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: var(--accent-primary);
  color: white;
  transition: all var(--duration-base);

  &:hover:not(:disabled) {
    background: var(--accent-secondary);
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: auto;
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }
}

.submit-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
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
  .modal-content {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .form-input,
  .form-textarea,
  .select-button,
  .date-input,
  .time-input,
  .tag-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .category-picker {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .category-option:hover {
    background: rgba(var(--category-color, 93, 95, 239), 0.1);
  }

  .priority-option {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .tag-item {
    background: rgba(0, 0, 0, 0.05);
  }

  .cancel-button {
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

@media (max-width: 640px) {
  .task-form-modal {
    padding: 0;
  }

  .modal-container {
    max-width: none;
    max-height: none;
    height: 100vh;
  }

  .modal-content {
    border-radius: 0;
  }

  .modal-header {
    padding: var(--space-4);
  }

  .task-form {
    padding: var(--space-4);
  }
}
</style>
