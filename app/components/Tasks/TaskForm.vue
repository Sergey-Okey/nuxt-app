<template>
  <div class="modal-overlay" @click.self="close">
    <div class="task-form-modal">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Редактировать задачу' : 'Новая задача' }}</h2>
        <button class="close-button" @click="close">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <form class="task-form" @submit.prevent="save">
        <!-- Title -->
        <div class="form-group">
          <label for="title">Название задачи *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="Что нужно сделать?"
            required
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Описание</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Детали задачи..."
            rows="3"
          ></textarea>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label>Категория</label>
          <div class="category-options">
            <button
              v-for="category in categories"
              :key="category.id"
              class="category-option"
              :class="{ active: formData.category === category.id }"
              @click="formData.category = category.id"
              type="button"
            >
              <Icon :name="category.icon" size="16" />
              <span>{{ category.name }}</span>
            </button>
          </div>
        </div>

        <!-- Priority -->
        <div class="form-group">
          <label>Приоритет</label>
          <div class="priority-options">
            <button
              v-for="priority in priorityOptions"
              :key="priority.value"
              class="priority-option"
              :class="[
                priority.value,
                { active: formData.priority === priority.value },
              ]"
              @click="formData.priority = priority.value"
              type="button"
            >
              <Icon :name="priority.icon" size="16" />
              <span>{{ priority.label }}</span>
            </button>
          </div>
        </div>

        <!-- Due Date -->
        <div class="form-group">
          <label>Срок выполнения</label>
          <input v-model="formData.dueAt" type="datetime-local" :min="today" />
        </div>

        <!-- Estimated Time -->
        <div class="form-group">
          <label>Оценочное время (минуты)</label>
          <input
            v-model.number="formData.estimatedMinutes"
            type="number"
            min="0"
            placeholder="например, 30"
          />
        </div>

        <!-- Tags -->
        <div class="form-group">
          <label>Теги</label>
          <div class="tags-input">
            <div v-for="tag in formData.tags" :key="tag" class="tag">
              {{ tag }}
              <button type="button" @click="removeTag(tag)">
                <Icon name="lucide:x" size="12" />
              </button>
            </div>
            <input
              v-model="newTag"
              type="text"
              placeholder="Добавить тег"
              @keydown.enter.prevent="addTag"
            />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="cancel-button" @click="close">
            Отмена
          </button>
          <button type="submit" class="save-button">
            {{ isEditing ? 'Сохранить' : 'Создать задачу' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

interface Props {
  task?: any
}

interface Emits {
  (e: 'close'): void
  (e: 'save', task: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Data
const formData = reactive({
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueAt: '',
  estimatedMinutes: 0,
  tags: [] as string[],
})

const newTag = ref('')
const today = new Date().toISOString().slice(0, 16)

// Options
const priorityOptions = [
  { value: 'high', label: 'Высокий', icon: 'lucide:alert-circle' },
  { value: 'medium', label: 'Средний', icon: 'lucide:alert-triangle' },
  { value: 'low', label: 'Низкий', icon: 'lucide:arrow-down-circle' },
]

// Computed
const categories = computed(() => tasksStore.categories)
const isEditing = computed(() => !!props.task)

// Methods
const close = () => {
  emit('close')
}

const save = () => {
  const taskData = {
    ...formData,
    dueAt: formData.dueAt ? new Date(formData.dueAt) : undefined,
    estimatedMinutes: formData.estimatedMinutes || undefined,
    tags: formData.tags,
    status: 'active' as const,
  }
  emit('save', taskData)
}

const addTag = () => {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  formData.tags = formData.tags.filter((t) => t !== tag)
}

// Initialize form with task data if editing
watchEffect(() => {
  if (props.task) {
    Object.assign(formData, {
      title: props.task.title,
      description: props.task.description || '',
      category: props.task.category,
      priority: props.task.priority,
      dueAt: props.task.dueAt
        ? new Date(props.task.dueAt).toISOString().slice(0, 16)
        : '',
      estimatedMinutes: props.task.estimatedMinutes || 0,
      tags: [...props.task.tags],
    })
  } else {
    // Reset form
    Object.assign(formData, {
      title: '',
      description: '',
      category: 'personal',
      priority: 'medium',
      dueAt: '',
      estimatedMinutes: 0,
      tags: [],
    })
  }
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  @include flex-center;
  padding: var(--space-4);
}

.task-form-modal {
  @include card;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
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
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.task-form {
  padding: var(--space-5);
}

.form-group {
  margin-bottom: var(--space-4);

  label {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
  }

  input[type='text'],
  input[type='number'],
  input[type='datetime-local'],
  textarea {
    width: 100%;
    padding: var(--space-3);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-button);
    color: var(--text-primary);
    font-size: var(--text-sm);
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

  textarea {
    resize: vertical;
    min-height: 60px;
  }
}

.category-options,
.priority-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}

.category-option,
.priority-option {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
    font-weight: var(--font-medium);

    :deep(svg) {
      color: var(--accent-primary);
    }
  }
}

.priority-option {
  &.high.active {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.medium.active {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.low.active {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);

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

    button {
      @include button-reset;
      @include flex-center;
      width: 14px;
      height: 14px;
      color: inherit;
      opacity: 0.7;
      transition: all var(--duration-base);

      &:hover {
        opacity: 1;
      }
    }
  }

  input {
    flex: 1;
    min-width: 100px;
    background: none;
    border: none;
    color: var(--text-primary);
    font-size: var(--text-sm);
    padding: var(--space-1);

    &:focus {
      outline: none;
    }
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cancel-button,
.save-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
}

.cancel-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.save-button {
  background: var(--accent-primary);
  color: white;

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    box-shadow: var(--glow-primary);
  }
}
</style>
