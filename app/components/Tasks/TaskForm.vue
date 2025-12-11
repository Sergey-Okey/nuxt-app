<template>
  <div class="task-form">
    <div class="form-header">
      <h2>{{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}</h2>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Название задачи *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          placeholder="Что нужно сделать?"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="description">Описание</label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="Детали задачи..."
          class="form-input textarea"
          rows="3"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category">Категория</label>
          <div class="select-wrapper">
            <select
              id="category"
              v-model="formData.category"
              class="form-input select"
            >
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <Icon name="lucide:chevron-down" size="16" class="select-icon" />
          </div>
        </div>

        <div class="form-group">
          <label for="priority">Приоритет</label>
          <div class="priority-buttons">
            <button
              v-for="priority in priorityOptions"
              :key="priority.value"
              type="button"
              class="priority-button"
              :class="{
                active: formData.priority === priority.value,
                [priority.value]: true,
              }"
              @click="formData.priority = priority.value"
            >
              {{ priority.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="estimatedMinutes">Время (мин)</label>
          <input
            id="estimatedMinutes"
            v-model="formData.estimatedMinutes"
            type="number"
            min="5"
            max="240"
            step="5"
            placeholder="60"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="dueAt">Дедлайн</label>
          <input
            id="dueAt"
            v-model="formData.dueAt"
            type="date"
            class="form-input"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Теги</label>
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
              placeholder="Добавить тег..."
              class="tag-input"
              @keydown.enter.prevent="addTag"
              @keydown.delete="handleTagDelete"
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

      <div class="form-actions">
        <button type="button" class="cancel-button" @click="$emit('close')">
          Отмена
        </button>
        <button type="submit" class="submit-button">
          {{ editingTask ? 'Сохранить' : 'Добавить задачу' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

interface Props {
  task?: Task
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'success'])

const tasksStore = useTasksStore()

// Form data
const formData = ref({
  title: '',
  description: '',
  category: 'work',
  priority: 'medium' as 'low' | 'medium' | 'high',
  estimatedMinutes: undefined as number | undefined,
  dueAt: undefined as string | undefined,
  tags: [] as string[],
})

const newTag = ref('')

// Options
const categories = computed(() => tasksStore.categories)

const priorityOptions = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
]

// Check if editing
const editingTask = computed(() => !!props.task)

// Initialize form
onMounted(() => {
  if (props.task) {
    formData.value = {
      title: props.task.title,
      description: props.task.description || '',
      category: props.task.category,
      priority: props.task.priority,
      estimatedMinutes: props.task.estimatedMinutes,
      dueAt: props.task.dueAt
        ? new Date(props.task.dueAt).toISOString().split('T')[0]
        : undefined,
      tags: [...props.task.tags],
    }
  }
})

// Methods
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

const handleTagDelete = () => {
  if (!newTag.value && formData.value.tags.length > 0) {
    formData.value.tags.pop()
  }
}

const handleSubmit = () => {
  const taskData = {
    ...formData.value,
    dueAt: formData.value.dueAt ? new Date(formData.value.dueAt) : undefined,
    tags: formData.value.tags.filter((tag) => tag.trim()),
  }

  if (props.task) {
    // Update existing task
    tasksStore.updateTask(props.task.id, taskData)
  } else {
    // Create new task
    tasksStore.addTask({
      ...taskData,
      status: 'active',
      spentMinutes: 0,
    })
  }

  emit('success')
  emit('close')
}
</script>

<style scoped lang="scss">
.task-form {
  padding: var(--space-4);
}

.form-header {
  margin-bottom: var(--space-5);

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-base);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.05);
  }

  &::placeholder {
    color: var(--text-muted);
  }

  &.textarea {
    resize: vertical;
    min-height: 60px;
  }

  &.select {
    appearance: none;
    cursor: pointer;
  }
}

.select-wrapper {
  position: relative;
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.priority-buttons {
  display: flex;
  gap: var(--space-2);
}

.priority-button {
  @include button-reset;
  flex: 1;
  padding: 8px 12px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-base);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: white;

    &.low {
      background: var(--success);
    }

    &.medium {
      background: var(--warning);
      color: var(--primary-bg);
    }

    &.high {
      background: var(--error);
    }
  }
}

.tags-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-base);
  padding: var(--space-2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: var(--space-2);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.tag-remove {
  @include button-reset;
  @include flex-center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.tag-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tag-input {
  flex: 1;
  padding: 6px 0;
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
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
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
  margin-top: var(--space-6);
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.submit-button {
  @include button-reset;
  flex: 1;
  padding: 12px;
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
</style>
