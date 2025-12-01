<template>
  <div v-if="isOpen" class="task-modal">
    <!-- Backdrop -->
    <div class="modal-backdrop" @click="closeModal"></div>

    <!-- Modal Container -->
    <div class="modal-container">
      <!-- iOS-style Header -->
      <div class="modal-header">
        <div class="header-drag">
          <div class="drag-handle"></div>
        </div>
        <div class="header-content">
          <button class="header-button" @click="closeModal">
            <span>Отмена</span>
          </button>
          <h2 class="modal-title">
            {{ isEditing ? 'Редактировать' : 'Новая задача' }}
          </h2>
          <button
            class="header-button primary"
            :disabled="!isValid"
            @click="saveTask"
          >
            <span>{{ isEditing ? 'Сохранить' : 'Создать' }}</span>
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="modal-content">
        <div class="form-section">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label">Название</label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="Что нужно сделать?"
              maxlength="100"
              @input="validateForm"
            />
            <div class="form-counter">{{ form.title.length }}/100</div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label"
              >Описание <span class="optional">(необязательно)</span></label
            >
            <textarea
              v-model="form.description"
              class="form-textarea"
              placeholder="Добавьте детали или заметки..."
              rows="3"
            ></textarea>
          </div>

          <!-- Category -->
          <div class="form-group">
            <label class="form-label">Категория</label>
            <div class="category-grid">
              <button
                v-for="category in categories"
                :key="category.id"
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
              <button
                class="category-option add-category"
                @click="openCategoryModal"
              >
                <div class="category-icon">
                  <Icon name="lucide:plus" size="16" />
                </div>
                <span class="category-name">Новая</span>
              </button>
            </div>
          </div>

          <!-- Priority -->
          <div class="form-group">
            <label class="form-label">Приоритет</label>
            <div class="priority-options">
              <button
                v-for="priority in priorities"
                :key="priority.value"
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

          <!-- Date & Time -->
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">Дата выполнения</label>
              <div class="date-input">
                <Icon name="lucide:calendar" size="16" />
                <input
                  v-model="form.dueDate"
                  type="date"
                  class="form-input"
                  :min="today"
                />
              </div>
            </div>
            <div class="form-group half">
              <label class="form-label">Время</label>
              <div class="date-input">
                <Icon name="lucide:clock" size="16" />
                <input v-model="form.dueTime" type="time" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Estimated Time -->
          <div class="form-group">
            <label class="form-label"
              >Оценка времени <span class="optional">(минуты)</span></label
            >
            <div class="time-input">
              <input
                v-model.number="form.estimatedMinutes"
                type="number"
                class="form-input"
                placeholder="0"
                min="0"
                step="5"
              />
              <span class="time-label">минут</span>
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label class="form-label"
              >Теги <span class="optional">(необязательно)</span></label
            >
            <div class="tags-input">
              <div class="tags-list">
                <div
                  v-for="(tag, index) in form.tags"
                  :key="index"
                  class="tag-item"
                >
                  <span>{{ tag }}</span>
                  <button class="tag-remove" @click="removeTag(index)">
                    <Icon name="lucide:x" size="12" />
                  </button>
                </div>
              </div>
              <input
                v-model="tagInput"
                type="text"
                class="tag-input"
                placeholder="Добавить тег..."
                @keydown.enter="addTag"
                @keydown.backspace="handleBackspace"
              />
            </div>
          </div>

          <!-- Delete Button (only for editing) -->
          <div v-if="isEditing" class="form-group">
            <button class="delete-button" @click="deleteTask">
              <Icon name="lucide:trash-2" size="16" />
              <span>Удалить задачу</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Creation Modal -->
    <CategoryModal
      v-if="showCategoryModal"
      @save="addCustomCategory"
      @close="showCategoryModal = false"
    />
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// Props
const props = defineProps<{
  isOpen: boolean
  task?: Task | null
}>()

// Emits
const emit = defineEmits<{
  close: []
  saved: []
  deleted: []
}>()

// State
const isEditing = computed(() => !!props.task)

// Form data
const form = ref({
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueDate: '',
  dueTime: '',
  estimatedMinutes: undefined as number | undefined,
  tags: [] as string[],
})

const tagInput = ref('')
const isValid = ref(false)
const showCategoryModal = ref(false)

// Computed
const categories = computed(() => tasksStore.categories)
const today = computed(() => new Date().toISOString().split('T')[0])

const priorities = [
  {
    value: 'low',
    label: 'Низкий',
    icon: 'lucide:arrow-down',
    color: '#5df27e',
  },
  { value: 'medium', label: 'Средний', icon: 'lucide:minus', color: '#facc15' },
  {
    value: 'high',
    label: 'Высокий',
    icon: 'lucide:arrow-up',
    color: '#f87171',
  },
]

// Methods
const validateForm = () => {
  isValid.value = form.value.title.trim().length > 0
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (index: number) => {
  form.value.tags.splice(index, 1)
}

const handleBackspace = () => {
  if (!tagInput.value && form.value.tags.length > 0) {
    form.value.tags.pop()
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    estimatedMinutes: undefined,
    tags: [],
  }
  tagInput.value = ''
}

const saveTask = () => {
  if (!isValid.value) return

  // Prepare dueAt date
  let dueAt: Date | undefined = undefined
  if (form.value.dueDate) {
    if (form.value.dueTime) {
      dueAt = new Date(`${form.value.dueDate}T${form.value.dueTime}`)
    } else {
      dueAt = new Date(form.value.dueDate)
    }
  }

  const taskData = {
    title: form.value.title.trim(),
    description: form.value.description.trim() || undefined,
    category: form.value.category,
    priority: form.value.priority,
    dueAt,
    estimatedMinutes: form.value.estimatedMinutes,
    tags: form.value.tags,
  }

  if (isEditing.value && props.task) {
    tasksStore.updateTask(props.task.id, taskData)
  } else {
    tasksStore.addTask(taskData)
  }

  emit('saved')
  closeModal()
}

const deleteTask = () => {
  if (!props.task) return

  if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
    tasksStore.deleteTask(props.task.id)
    emit('deleted')
    closeModal()
  }
}

const openCategoryModal = () => {
  showCategoryModal.value = true
}

const addCustomCategory = (category: Omit<Category, 'id'>) => {
  const newCategory = tasksStore.addCategory(category)
  form.value.category = newCategory.id
  showCategoryModal.value = false
}

// Watch for task changes (for editing)
watch(
  () => props.task,
  (task) => {
    if (task) {
      form.value = {
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueDate: task.dueAt ? task.dueAt.toISOString().split('T')[0] : '',
        dueTime: task.dueAt ? task.dueAt.toTimeString().slice(0, 5) : '',
        estimatedMinutes: task.estimatedMinutes,
        tags: task.tags || [],
      }
    }
  },
  { immediate: true }
)

// Watch form for validation
watch(() => form.value.title, validateForm, { immediate: true })

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
.task-modal {
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  animation: backdropFadeIn 0.3s ease-out;
}

@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

  @include breakpoint(md) {
    max-width: 540px;
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
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

// Header
.modal-header {
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: var(--card-bg);
}

.header-drag {
  @include flex-center;
  padding-bottom: var(--space-2);

  .drag-handle {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-button {
  @include button-reset;
  padding: var(--space-2) var(--space-3);
  color: var(--text-secondary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.primary {
    color: var(--accent-primary);

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      opacity: 0.8;
    }
  }

  &:hover {
    color: var(--text-primary);
  }
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

// Content
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// Form Styles
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-row {
  display: flex;
  gap: var(--space-3);

  .form-group.half {
    flex: 1;
  }
}

.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);

  .optional {
    color: var(--text-secondary);
    font-weight: var(--font-normal);
  }
}

.form-input {
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
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
  @extend .form-input;
  resize: vertical;
  min-height: 80px;
  line-height: var(--leading-relaxed);
}

.form-counter {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: right;
  margin-top: var(--space-1);
}

// Category Grid
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.category-option {
  @include button-reset;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
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
    background: rgba(93, 95, 239, 0.1);
  }

  &.add-category {
    .category-icon {
      background: var(--surface-bg) !important;
      border: 2px dashed rgba(255, 255, 255, 0.2);

      :deep(svg) {
        color: var(--text-secondary);
      }
    }
  }
}

.category-icon {
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-card);

  :deep(svg) {
    color: white;
  }
}

.category-name {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);

  .active & {
    color: var(--accent-primary);
  }
}

// Priority Options
.priority-options {
  display: flex;
  gap: var(--space-2);
}

.priority-option {
  @include button-reset;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
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

// Date & Time Input
.date-input {
  position: relative;

  :deep(svg) {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
    pointer-events: none;
  }

  .form-input {
    padding-left: calc(var(--space-3) * 2 + 16px);
  }
}

.time-input {
  display: flex;
  align-items: center;
  gap: var(--space-3);

  .form-input {
    flex: 1;
  }

  .time-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    white-space: nowrap;
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

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--text-primary);

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
}

.tag-input {
  @extend .form-input;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

// Delete Button
.delete-button {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-radius: var(--radius-card);
  color: var(--error);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.2);
    transform: translateY(-1px);
  }
}

// Light Theme Adjustments
[data-theme='light'] {
  .modal-container {
    background: var(--card-bg);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .drag-handle {
    background: rgba(0, 0, 0, 0.1);
  }

  .form-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:focus {
      border-color: var(--accent-primary);
    }
  }

  .category-option {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .priority-option {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .category-option.add-category {
    .category-icon {
      border: 2px dashed rgba(0, 0, 0, 0.2);
    }
  }

  .tag-item {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}

// Mobile Full-screen
@include breakpoint(xs) {
  .modal-container {
    border-radius: 0;
    max-height: none;
  }

  .modal-header {
    padding-top: calc(var(--space-4) + env(safe-area-inset-top));
  }

  .modal-content {
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  }
}

// Desktop Optimizations
@include breakpoint(md) {
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
