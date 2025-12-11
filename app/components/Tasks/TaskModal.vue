<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="task-modal">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Редактировать задачу' : 'Новая задача' }}</h2>
        <button class="close-button" @click="$emit('close')">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:type" size="16" />
            <span>Название</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Что нужно сделать?"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:align-left" size="16" />
            <span>Описание</span>
          </label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            placeholder="Дополнительные детали..."
            rows="3"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <Icon name="lucide:folder" size="16" />
              <span>Категория</span>
            </label>
            <select v-model="form.category" class="form-select">
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <Icon name="lucide:flag" size="16" />
              <span>Приоритет</span>
            </label>
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
                <Icon :name="priority.icon" size="14" />
                <span>{{ priority.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">
              <Icon name="lucide:clock" size="16" />
              <span>Оценка времени</span>
            </label>
            <div class="time-input-group">
              <input
                v-model.number="form.estimatedMinutes"
                type="number"
                min="0"
                class="form-input"
                placeholder="Минуты"
              />
              <span class="time-label">минут</span>
            </div>
          </div>

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
        </div>

        <div class="form-group">
          <label class="form-label">
            <Icon name="lucide:tag" size="16" />
            <span>Теги</span>
          </label>
          <div class="tags-input">
            <div class="tags-list">
              <div v-for="tag in form.tags" :key="tag" class="tag">
                <span>{{ tag }}</span>
                <button
                  type="button"
                  class="tag-remove"
                  @click="removeTag(tag)"
                >
                  <Icon name="lucide:x" size="12" />
                </button>
              </div>
            </div>
            <div class="tag-input-container">
              <input
                v-model="tagInput"
                type="text"
                class="tag-input"
                placeholder="Добавить тег..."
                @keydown.enter.prevent="addTag"
              />
              <button type="button" class="tag-add" @click="addTag">
                <Icon name="lucide:plus" size="14" />
              </button>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">
            Отмена
          </button>
          <button type="submit" class="submit-button">
            {{ isEditing ? 'Сохранить изменения' : 'Создать задачу' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  task?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'save', taskData: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Store
const tasksStore = useTasksStore()

// State
const tagInput = ref('')
const form = reactive({
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  estimatedMinutes: undefined as number | undefined,
  dueDate: '',
  tags: [] as string[],
})

// Computed
const categories = computed(() => tasksStore.categories)
const isEditing = computed(() => !!props.task)

const today = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const priorityOptions = [
  { value: 'low', label: 'Низкий', icon: 'lucide:flag' },
  { value: 'medium', label: 'Средний', icon: 'lucide:flag' },
  { value: 'high', label: 'Высокий', icon: 'lucide:flag' },
]

// Methods
const addTag = () => {
  if (tagInput.value.trim() && !form.tags.includes(tagInput.value.trim())) {
    form.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  form.tags = form.tags.filter((t) => t !== tag)
}

const handleSubmit = () => {
  const taskData = {
    title: form.title,
    description: form.description || undefined,
    category: form.category,
    priority: form.priority,
    estimatedMinutes: form.estimatedMinutes,
    dueAt: form.dueDate ? new Date(form.dueDate) : undefined,
    tags: form.tags,
    status: 'active' as 'active',
  }

  emit('save', taskData)
}

// Initialize form if editing
watch(
  () => props.task,
  (task) => {
    if (task) {
      form.title = task.title
      form.description = task.description || ''
      form.category = task.category
      form.priority = task.priority
      form.estimatedMinutes = task.estimatedMinutes
      form.dueDate = task.dueAt
        ? new Date(task.dueAt).toISOString().split('T')[0]
        : ''
      form.tags = [...task.tags]
    } else {
      // Reset form
      form.title = ''
      form.description = ''
      form.category = 'personal'
      form.priority = 'medium'
      form.estimatedMinutes = undefined
      form.dueDate = ''
      form.tags = []
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  z-index: var(--z-modal);
  @include flex-center;
  padding: var(--space-4);
}

.task-modal {
  @include card;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.modal-form {
  padding: var(--space-5);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);

  :deep(svg) {
    color: var(--text-muted);
  }
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:focus {
    border-color: var(--accent-primary);
    outline: none;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  @include breakpoint(sm) {
    grid-template-columns: 1fr 1fr;
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
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.active {
    border-color: currentColor;

    &.high {
      color: var(--error);
      background: rgba(248, 113, 113, 0.1);
    }

    &.medium {
      color: var(--warning);
      background: rgba(250, 204, 21, 0.1);
    }

    &.low {
      color: var(--success);
      background: rgba(93, 242, 126, 0.1);
    }
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.1);
  }
}

.time-input-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  .form-input {
    flex: 1;
  }
}

.time-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
}

.tags-input {
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

.tag-remove {
  @include button-reset;
  @include flex-center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: inherit;
  opacity: 0.7;
  transition: all var(--duration-base);

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
}

.tag-input-container {
  display: flex;
  gap: var(--space-2);
}

.tag-input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-primary);
  font-size: var(--text-sm);

  &:focus {
    border-color: var(--accent-primary);
    outline: none;
  }
}

.tag-add {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-secondary);
    transform: scale(1.1);
  }
}

.modal-actions {
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
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
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
  .form-input,
  .form-textarea,
  .form-select,
  .tag-input {
    background: var(--surface-bg);
    border-color: rgba(0, 0, 0, 0.05);
  }

  .priority-button {
    background: rgba(0, 0, 0, 0.05);

    &:hover:not(.active) {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .cancel-button {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
