<template>
  <div class="task-form-modal" v-if="isOpen">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Редактировать задачу' : 'Новая задача' }}</h2>
          <button class="close-button" @click="closeModal">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>

        <form @submit.prevent="submitForm" class="form-content">
          <!-- Title -->
          <div class="form-group">
            <label for="title" class="form-label">Название задачи *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input"
              placeholder="Что нужно сделать?"
              required
              maxlength="100"
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label">Описание</label>
            <textarea
              id="description"
              v-model="formData.description"
              class="form-textarea"
              placeholder="Дополнительные детали..."
              rows="3"
              maxlength="500"
            ></textarea>
          </div>

          <!-- Category & Priority -->
          <div class="form-row">
            <div class="form-group">
              <label for="category" class="form-label">Категория</label>
              <div class="select-wrapper">
                <select
                  id="category"
                  v-model="formData.category"
                  class="form-select"
                >
                  <option value="">Выберите категорию</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                    :style="{ color: category.color }"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <Icon
                  name="lucide:chevron-down"
                  size="16"
                  class="select-icon"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Приоритет</label>
              <div class="priority-buttons">
                <button
                  type="button"
                  :class="[
                    'priority-button',
                    'low',
                    { active: formData.priority === 'low' },
                  ]"
                  @click="formData.priority = 'low'"
                >
                  Низкий
                </button>
                <button
                  type="button"
                  :class="[
                    'priority-button',
                    'medium',
                    { active: formData.priority === 'medium' },
                  ]"
                  @click="formData.priority = 'medium'"
                >
                  Средний
                </button>
                <button
                  type="button"
                  :class="[
                    'priority-button',
                    'high',
                    { active: formData.priority === 'high' },
                  ]"
                  @click="formData.priority = 'high'"
                >
                  Высокий
                </button>
              </div>
            </div>
          </div>

          <!-- Time & Date -->
          <div class="form-row">
            <div class="form-group">
              <label for="estimatedMinutes" class="form-label"
                >Время на выполнение</label
              >
              <div class="time-input">
                <input
                  id="estimatedMinutes"
                  v-model="formData.estimatedMinutes"
                  type="number"
                  min="1"
                  max="480"
                  class="form-input"
                  placeholder="0"
                />
                <span class="time-label">минут</span>
              </div>
            </div>

            <div class="form-group">
              <label for="dueAt" class="form-label">Дедлайн</label>
              <input
                id="dueAt"
                v-model="formData.dueAt"
                type="datetime-local"
                class="form-input"
              />
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label class="form-label">Теги</label>
            <div class="tags-input">
              <div class="tags-list">
                <span
                  v-for="(tag, index) in formData.tags"
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
              <div class="tag-input-wrapper">
                <input
                  v-model="newTag"
                  type="text"
                  class="tag-input"
                  placeholder="Добавить тег..."
                  @keydown.enter.prevent="addTag"
                  maxlength="20"
                />
                <button
                  type="button"
                  class="tag-add"
                  @click="addTag"
                  :disabled="!newTag.trim()"
                >
                  <Icon name="lucide:plus" size="16" />
                </button>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="closeModal">
              Отмена
            </button>
            <button
              type="submit"
              class="submit-button"
              :disabled="!formData.title.trim()"
            >
              {{ isEditing ? 'Сохранить' : 'Создать задачу' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  task?: Task | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'submit'])

const tasksStore = useTasksStore()

// Form data
const formData = ref({
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  estimatedMinutes: undefined as number | undefined,
  dueAt: undefined as string | undefined,
  tags: [] as string[],
})

const newTag = ref('')

// Computed
const categories = computed(() => tasksStore.categories)
const isEditing = computed(() => !!props.task)

// Methods
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    estimatedMinutes: undefined,
    dueAt: undefined,
    tags: [],
  }
  newTag.value = ''
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

const submitForm = () => {
  if (!formData.value.title.trim()) return

  const taskData = {
    ...formData.value,
    dueAt: formData.value.dueAt ? new Date(formData.value.dueAt) : undefined,
    status: 'active' as const,
    tags: [...formData.value.tags],
  }

  emit('submit', taskData)
  closeModal()
}

// Watch for task prop changes
watch(
  () => props.task,
  (task) => {
    if (task) {
      formData.value = {
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        estimatedMinutes: task.estimatedMinutes,
        dueAt: task.dueAt
          ? new Date(task.dueAt).toISOString().slice(0, 16)
          : undefined,
        tags: [...task.tags],
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Keyboard shortcuts
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
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

.modal-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  animation: slideUp 0.3s ease-out;
}

.modal-content {
  @include card;
  background: var(--card-bg);
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
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header h2 {
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
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);

  @include breakpoint(xs) {
    grid-template-columns: 1fr;
  }
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.2);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.select-wrapper {
  position: relative;
}

.form-select {
  appearance: none;
  cursor: pointer;
  padding-right: var(--space-8);
}

.select-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-secondary);
}

.priority-buttons {
  display: flex;
  gap: var(--space-2);
}

.priority-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-align: center;
  transition: all var(--duration-base);

  &.low {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);

    &.active {
      background: var(--success);
      color: white;
    }
  }

  &.medium {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);

    &.active {
      background: var(--warning);
      color: var(--primary-bg);
    }
  }

  &.high {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);

    &.active {
      background: var(--error);
      color: white;
    }
  }

  &:hover:not(.active) {
    opacity: 0.8;
  }
}

.time-input {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.time-label {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  white-space: nowrap;
}

.tags-input {
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  padding: var(--space-3);
  background: var(--surface-bg);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
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
    color: var(--error);
  }
}

.tag-input-wrapper {
  display: flex;
  gap: var(--space-2);
}

.tag-input {
  flex: 1;
  padding: var(--space-2);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: var(--text-sm);

  &:focus {
    outline: none;
  }
}

.tag-add {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  transition: all var(--duration-base);

  &:hover:not(:disabled) {
    background: rgba(93, 95, 239, 0.2);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.submit-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-button);
  background: var(--accent-primary);
  color: white;
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover:not(:disabled) {
    background: var(--accent-secondary);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

// Light theme adjustments
[data-theme='light'] {
  .modal-content {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .close-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .form-input,
  .form-textarea,
  .form-select,
  .tags-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .tag {
    background: rgba(0, 0, 0, 0.1);
  }

  .cancel-button {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(xs) {
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
}
</style>
