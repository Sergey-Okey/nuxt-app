<template>
  <div class="quick-create-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h3>Новая задача</h3>
        <button class="close-button" @click="$emit('close')">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <form @submit.prevent="createTask" class="quick-create-form">
        <div class="form-group">
          <label class="form-label">Название задачи</label>
          <input
            v-model="taskData.title"
            type="text"
            class="input-field"
            placeholder="Что нужно сделать?"
            required
            autofocus
          />
        </div>

        <div class="form-group">
          <label class="form-label">Категория</label>
          <select v-model="taskData.category" class="select-field">
            <option value="work">💼 Работа</option>
            <option value="personal">🏠 Личное</option>
            <option value="health">❤️ Здоровье</option>
            <option value="learning">📚 Обучение</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Приоритет</label>
          <div class="priority-buttons">
            <button
              v-for="priority in priorities"
              :key="priority.value"
              type="button"
              class="priority-button"
              :class="{ active: taskData.priority === priority.value }"
              @click="taskData.priority = priority.value"
            >
              <Icon :name="priority.icon" size="16" />
              <span>{{ priority.label }}</span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">
            <input
              v-model="taskData.hasDeadline"
              type="checkbox"
              class="checkbox"
            />
            <span>Установить дедлайн</span>
          </label>

          <input
            v-if="taskData.hasDeadline"
            v-model="taskData.deadline"
            type="datetime-local"
            class="input-field"
            :min="minDate"
          />
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-button" @click="$emit('close')">
            Отмена
          </button>
          <button
            type="submit"
            class="create-button"
            :disabled="!taskData.title"
          >
            <Icon name="lucide:plus" size="16" />
            Создать задачу
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TaskData {
  title: string
  category: string
  priority: 'low' | 'medium' | 'high'
  hasDeadline: boolean
  deadline: string
}

// Props & Emits
defineEmits<{
  close: []
  created: [task: any]
}>()

// Task data
const taskData = ref<TaskData>({
  title: '',
  category: 'work',
  priority: 'medium',
  hasDeadline: false,
  deadline: '',
})

// Priority options
const priorities = [
  { value: 'low', label: 'Низкий', icon: 'lucide:arrow-down' },
  { value: 'medium', label: 'Средний', icon: 'lucide:minus' },
  { value: 'high', label: 'Высокий', icon: 'lucide:arrow-up' },
]

// Min date for deadline (today)
const minDate = computed(() => {
  return new Date().toISOString().slice(0, 16)
})

// Methods
const createTask = () => {
  const task = {
    ...taskData.value,
    id: Date.now().toString(),
    createdAt: new Date(),
    status: 'active' as const,
  }

  // Emit the created task
  emit('created', task)

  // Reset form
  taskData.value = {
    title: '',
    category: 'work',
    priority: 'medium',
    hasDeadline: false,
    deadline: '',
  }

  // Close modal
  emit('close')
}

const { emit } = defineEmits<{
  close: []
  created: [task: any]
}>()
</script>

<style scoped lang="scss">
.quick-create-modal {
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
}

.modal-content {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0;
    font-size: var(--text-xl);
    color: var(--text-primary);
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--error);
    color: white;
  }
}

.quick-create-form {
  padding: var(--space-5);
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.input-field,
.select-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-primary);
  font-size: var(--text-sm);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.2);
  }

  &::placeholder {
    color: var(--text-muted);
  }
}

.priority-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.priority-button {
  @include button-reset;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  transition: all var(--duration-base);

  &:hover {
    border-color: var(--accent-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
  }
}

.checkbox {
  margin-right: var(--space-2);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
}

.create-button {
  @include button-reset;
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  background: var(--accent-primary);
  color: white;
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover:not(:disabled) {
    background: var(--accent-primary);
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
