<template>
  <div v-if="isOpen" class="create-task-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Новая задача</h2>
          <div class="header-actions">
            <button class="close-button" @click="closeModal">
              <Icon name="lucide:x" size="20" />
            </button>
          </div>
        </div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <form @submit.prevent="submitTask" class="task-form">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label">
              <Icon name="lucide:type" size="16" />
              <span>Название задачи *</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Что нужно сделать?"
              required
              maxlength="100"
            />
            <div class="char-counter">{{ form.title.length }}/100</div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">
              <Icon name="lucide:file-text" size="16" />
              <span>Описание</span>
            </label>
            <textarea
              v-model="form.description"
              class="form-textarea"
              placeholder="Дополнительные детали..."
              rows="3"
              maxlength="500"
            ></textarea>
            <div class="char-counter">{{ form.description.length }}/500</div>
          </div>

          <!-- Category & Priority -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:folder" size="16" />
                <span>Категория *</span>
              </label>
              <div class="category-grid">
                <button
                  v-for="category in tasksStore.categories"
                  :key="category.id"
                  type="button"
                  class="category-option"
                  :class="{ active: form.category === category.id }"
                  @click="form.category = category.id"
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

            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:flag" size="16" />
                <span>Приоритет *</span>
              </label>
              <div class="priority-options">
                <button
                  v-for="priority in priorityOptions"
                  :key="priority.value"
                  type="button"
                  class="priority-option"
                  :class="[
                    priority.value,
                    { active: form.priority === priority.value },
                  ]"
                  @click="form.priority = priority.value"
                >
                  <Icon :name="priority.icon" size="16" />
                  <span>{{ priority.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Due Date & Time Estimate -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:calendar" size="16" />
                <span>Срок выполнения</span>
              </label>
              <input
                v-model="form.dueDate"
                type="date"
                class="form-input"
                :min="today"
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:clock" size="16" />
                <span>Оценка времени (мин)</span>
              </label>
              <input
                v-model="form.estimatedMinutes"
                type="number"
                class="form-input"
                placeholder="60"
                min="5"
                max="480"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label class="form-label">
              <Icon name="lucide:tag" size="16" />
              <span>Теги</span>
            </label>
            <div class="tags-input">
              <div class="tags-list">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  class="tag"
                >
                  {{ tag }}
                  <button
                    type="button"
                    class="tag-remove"
                    @click="removeTag(index)"
                  >
                    <Icon name="lucide:x" size="12" />
                  </button>
                </span>
              </div>
              <input
                v-model="tagInput"
                type="text"
                class="tag-input"
                placeholder="Добавить тег..."
                @keydown.enter.prevent="addTag"
                @keydown.backspace="handleBackspace"
                maxlength="20"
              />
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="button"
              class="action-button secondary"
              @click="closeModal"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="action-button primary"
              :disabled="!isFormValid"
            >
              <Icon name="lucide:plus" size="16" />
              <span>Создать задачу</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const emit = defineEmits(['close', 'created'])

// Modal state
const isOpen = defineModel<boolean>({ default: false })

// Form data
const form = reactive({
  title: '',
  description: '',
  category: 'work',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueDate: '',
  estimatedMinutes: undefined as number | undefined,
  tags: [] as string[],
})

const tagInput = ref('')

// Computed
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.title.trim().length > 0 && form.category
})

const priorityOptions = [
  {
    value: 'low',
    label: 'Низкий',
    icon: 'lucide:arrow-down',
    color: 'var(--success)',
  },
  {
    value: 'medium',
    label: 'Средний',
    icon: 'lucide:minus',
    color: 'var(--warning)',
  },
  {
    value: 'high',
    label: 'Высокий',
    icon: 'lucide:arrow-up',
    color: 'var(--error)',
  },
]

// Methods
const closeModal = () => {
  isOpen.value = false
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.category = 'work'
  form.priority = 'medium'
  form.dueDate = ''
  form.estimatedMinutes = undefined
  form.tags = []
  tagInput.value = ''
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const handleBackspace = () => {
  if (!tagInput.value && form.tags.length > 0) {
    form.tags.pop()
  }
}

const submitTask = () => {
  if (!isFormValid.value) return

  const taskData = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    category: form.category,
    priority: form.priority,
    status: 'active' as const,
    dueAt: form.dueDate ? new Date(form.dueDate) : undefined,
    estimatedMinutes: form.estimatedMinutes,
    tags: form.tags,
    spentMinutes: 0,
  }

  tasksStore.addTask(taskData)

  // Show success feedback
  // TODO: Add toast notification

  closeModal()
  emit('created')
}

// Keyboard handlers
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen.value) {
      closeModal()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
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
  max-width: 600px;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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

.form-content {
  padding: var(--space-5);
  overflow-y: auto;
  max-height: calc(90vh - 100px);
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);

  @include breakpoint(sm) {
    gap: var(--space-5);
  }
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.form-input,
.form-textarea {
  @include button-reset;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);
  resize: none;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.2);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.form-textarea {
  line-height: var(--leading-relaxed);
  min-height: 80px;
}

.char-counter {
  font-size: var(--text-xs);
  color: var(--text-muted);
  text-align: right;
}

// Category Grid
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);

  @include breakpoint(sm) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.category-option {
  @include button-reset;
  display: flex;
  flex-direction: column;
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
}

.category-icon {
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-card);
  color: white;
  font-weight: var(--font-semibold);
}

.category-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

// Priority Options
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
  padding: var(--space-3) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    border-color: currentColor;
    background: rgba(255, 255, 255, 0.05);
  }

  &.low {
    color: var(--success);
  }

  &.medium {
    color: var(--warning);
  }

  &.high {
    color: var(--error);
  }
}

// Tags Input
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
}

.tag-remove {
  @include button-reset;
  @include flex-center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  color: inherit;
  opacity: 0.7;
  transition: all var(--duration-base);

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
}

.tag-input {
  @include button-reset;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
}

// Form Actions
.form-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-button);
  font-weight: var(--font-semibold);
  transition: all var(--duration-base);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background: var(--accent-primary);
    color: white;

    &:hover:not(:disabled) {
      background: var(--accent-secondary);
      transform: translateY(-1px);
      box-shadow: var(--glow-primary);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }
}

// Light theme adjustments
[data-theme='light'] {
  .modal-container {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .form-input,
  .form-textarea,
  .tag-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .category-option,
  .priority-option {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(sm) {
  .modal-container {
    max-height: 80vh;
  }

  .form-content {
    padding: var(--space-4);
  }
}

@include breakpoint(xs) {
  .create-task-modal {
    padding: 0;
  }

  .modal-container {
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
