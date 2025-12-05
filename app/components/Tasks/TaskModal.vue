<template>
  <div v-if="isOpen" class="task-modal">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? 'Редактировать задачу' : 'Новая задача' }}
        </h2>
        <button class="close-button" @click="closeModal">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <div class="modal-content">
        <form @submit.prevent="handleSubmit" class="task-form">
          <!-- Title -->
          <div class="form-group">
            <label for="title" class="form-label">Название задачи *</label>
            <input
              id="title"
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Что нужно сделать?"
              required
              maxlength="100"
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description" class="form-label"
              >Описание (необязательно)</label
            >
            <textarea
              id="description"
              v-model="form.description"
              class="form-textarea"
              placeholder="Дополнительные детали..."
              rows="3"
              maxlength="500"
            />
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label">Категория</label>
            <div class="categories-grid">
              <button
                v-for="category in availableCategories"
                :key="category.id"
                type="button"
                class="category-button"
                :class="{
                  active: form.category === category.id,
                  custom: category.isCustom,
                }"
                @click="form.category = category.id"
                :style="{ '--category-color': category.color }"
              >
                <Icon :name="category.icon" size="16" />
                <span>{{ category.name }}</span>
              </button>

              <button
                type="button"
                class="category-button add-category"
                @click="openCategoryManager"
              >
                <Icon name="lucide:plus" size="16" />
                <span>Добавить</span>
              </button>
            </div>
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label class="form-label">Приоритет</label>
            <div class="priority-buttons">
              <button
                v-for="priority in priorityOptions"
                :key="priority.value"
                type="button"
                class="priority-button"
                :class="{
                  active: form.priority === priority.value,
                  [priority.value]: true,
                }"
                @click="form.priority = priority.value"
              >
                <Icon :name="priority.icon" size="16" />
                <span>{{ priority.label }}</span>
              </button>
            </div>
          </div>

          <!-- Due Date -->
          <div class="form-group">
            <label for="dueAt" class="form-label">Срок выполнения</label>
            <div class="date-input">
              <input
                id="dueAt"
                v-model="form.dueAt"
                type="datetime-local"
                class="form-input"
                :min="minDate"
              />
              <button
                type="button"
                class="clear-date"
                @click="form.dueAt = ''"
                v-if="form.dueAt"
              >
                <Icon name="lucide:x" size="14" />
              </button>
            </div>
          </div>

          <!-- Estimated Time -->
          <div class="form-group">
            <label for="estimatedMinutes" class="form-label">
              Оценочное время (минуты)
            </label>
            <input
              id="estimatedMinutes"
              v-model.number="form.estimatedMinutes"
              type="number"
              class="form-input"
              min="1"
              max="480"
              placeholder="Например, 30"
            />
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label class="form-label">Теги</label>
            <div class="tags-input">
              <input
                v-model="newTag"
                type="text"
                class="form-input"
                placeholder="Добавить тег"
                @keydown.enter.prevent="addTag"
              />
              <button type="button" class="add-tag-button" @click="addTag">
                <Icon name="lucide:plus" size="16" />
              </button>
            </div>

            <div v-if="form.tags.length > 0" class="tags-list">
              <div v-for="tag in form.tags" :key="tag" class="tag">
                <span>{{ tag }}</span>
                <button
                  type="button"
                  class="remove-tag"
                  @click="removeTag(tag)"
                >
                  <Icon name="lucide:x" size="12" />
                </button>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="cancel-button" @click="closeModal">
              Отмена
            </button>
            <button type="submit" class="submit-button" :disabled="!form.title">
              {{ isEditing ? 'Сохранить' : 'Добавить задачу' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Manager Modal -->
    <CategoryManagerModal
      v-if="showCategoryManager"
      @close="closeCategoryManager"
      @category-added="onCategoryAdded"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task, Category } from '~/stores/tasks'
import CategoryManagerModal from '~/components/Tasks/CategoryManagerModal.vue'

interface Props {
  isOpen: boolean
  task?: Task | null
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'submit'])

const tasksStore = useTasksStore()

// Local state
const showCategoryManager = ref(false)
const newTag = ref('')

// Form data
const form = reactive({
  id: '',
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueAt: '',
  estimatedMinutes: undefined as number | undefined,
  tags: [] as string[],
})

// Computed
const isEditing = computed(() => !!props.task)
const availableCategories = computed(() => tasksStore.categories)
const minDate = computed(() => new Date().toISOString().slice(0, 16))

const priorityOptions = [
  {
    value: 'low',
    label: 'Низкий',
    icon: 'lucide:flag',
    color: 'var(--success)',
  },
  {
    value: 'medium',
    label: 'Средний',
    icon: 'lucide:flag',
    color: 'var(--warning)',
  },
  {
    value: 'high',
    label: 'Высокий',
    icon: 'lucide:flag',
    color: 'var(--error)',
  },
]

// Methods
const openCategoryManager = () => {
  showCategoryManager.value = true
}

const closeCategoryManager = () => {
  showCategoryManager.value = false
}

const onCategoryAdded = (category: Category) => {
  form.category = category.id
}

const addTag = () => {
  if (newTag.value.trim() && !form.tags.includes(newTag.value.trim())) {
    form.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag)
}

const handleSubmit = () => {
  const taskData = {
    ...form,
    dueAt: form.dueAt ? new Date(form.dueAt) : undefined,
    status: 'active' as const,
  }

  emit('submit', taskData)
  resetForm()
  emit('close')
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueAt: '',
    estimatedMinutes: undefined,
    tags: [],
  })
  newTag.value = ''
}

const closeModal = () => {
  resetForm()
  emit('close')
}

// Watch for props changes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.task) {
      Object.assign(form, {
        id: props.task.id,
        title: props.task.title,
        description: props.task.description || '',
        category: props.task.category,
        priority: props.task.priority,
        dueAt: props.task.dueAt
          ? new Date(props.task.dueAt).toISOString().slice(0, 16)
          : '',
        estimatedMinutes: props.task.estimatedMinutes,
        tags: [...props.task.tags],
      })
    } else if (!isOpen) {
      resetForm()
    }
  }
)
</script>

<style scoped lang="scss">
.task-modal {
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
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  background: var(--card-bg);
  border-radius: 24px;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-5) var(--space-4);
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

.modal-content {
  padding: var(--space-5);
  overflow-y: auto;
  max-height: calc(85vh - 73px);
}

.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

.form-input,
.form-textarea {
  @include button-reset;
  width: 100%;
  padding: var(--space-3) var(--space-4);
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--space-2);
}

.category-button {
  @include button-reset;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(var(--category-color, 93, 95, 239), 0.1);
    border-color: var(--category-color, var(--accent-primary));
    color: var(--category-color, var(--accent-primary));

    :deep(svg) {
      color: var(--category-color, var(--accent-primary));
    }
  }

  &.add-category {
    border: 1px dashed rgba(255, 255, 255, 0.2);

    &:hover {
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
  }

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.priority-buttons {
  display: flex;
  gap: var(--space-2);
}

.priority-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    &.low {
      background: rgba(93, 242, 126, 0.1);
      border-color: var(--success);
      color: var(--success);
    }

    &.medium {
      background: rgba(250, 204, 21, 0.1);
      border-color: var(--warning);
      color: var(--warning);
    }

    &.high {
      background: rgba(248, 113, 113, 0.1);
      border-color: var(--error);
      color: var(--error);
    }
  }
}

.date-input {
  position: relative;
  display: flex;
  align-items: center;

  .form-input {
    padding-right: 40px;
  }

  .clear-date {
    @include button-reset;
    @include flex-center;
    position: absolute;
    right: 10px;
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

.tags-input {
  position: relative;
  display: flex;
  align-items: center;

  .form-input {
    padding-right: 40px;
  }

  .add-tag-button {
    @include button-reset;
    @include flex-center;
    position: absolute;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
    transition: all var(--duration-base);

    &:hover {
      background: rgba(93, 95, 239, 0.2);
    }
  }
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--text-secondary);

  .remove-tag {
    @include button-reset;
    @include flex-center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all var(--duration-base);

    &:hover {
      background: rgba(248, 113, 113, 0.1);
      color: var(--error);
    }
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.submit-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  background: var(--accent-primary);
  border-radius: var(--radius-button);
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
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
