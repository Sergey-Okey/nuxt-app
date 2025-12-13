<template>
  <Transition name="modal-slide">
    <div v-if="show" class="task-form-modal" ref="modalRef">
      <div class="modal-backdrop" @click="close"></div>

      <div class="modal-container" :class="{ dragging }">
        <!-- Drag handle -->
        <div class="drag-handle" @mousedown="startDrag" @touchstart="startDrag">
          <div class="drag-line"></div>
        </div>

        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon-wrapper">
              <Icon
                :name="editingTask ? 'lucide:edit-3' : 'lucide:plus-circle'"
                size="24"
                class="header-icon"
              />
            </div>
            <div class="header-text">
              <h2 class="modal-title">
                {{ editingTask ? 'Редактировать задачу' : 'Новая задача' }}
              </h2>
              <p class="modal-subtitle">Заполните информацию о задаче</p>
            </div>
          </div>
          <button class="close-button" @click="close" aria-label="Закрыть">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>

        <!-- Form -->
        <div class="modal-content">
          <form class="modal-form" @submit.prevent="save">
            <!-- Title -->
            <div class="form-group">
              <label for="title" class="form-label">
                <Icon name="lucide:type" size="16" />
                <span>Название задачи</span>
                <span class="required">*</span>
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="form-input"
                placeholder="Введите название задачи"
                required
                autofocus
              />
            </div>

            <!-- Description -->
            <div class="form-group">
              <div class="label-row">
                <label for="description" class="form-label">
                  <Icon name="lucide:align-left" size="16" />
                  <span>Описание</span>
                </label>
                <span class="char-count" v-if="form.description">
                  {{ form.description.length }}/500
                </span>
              </div>
              <textarea
                id="description"
                v-model="form.description"
                class="form-textarea"
                placeholder="Добавьте описание задачи (необязательно)"
                rows="3"
                maxlength="500"
              />
            </div>

            <!-- Category & Priority -->
            <div class="form-row">
              <!-- Category -->
              <div class="form-group">
                <label class="form-label">
                  <Icon name="lucide:folder" size="16" />
                  <span>Категория</span>
                </label>
                <div class="category-select">
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    class="category-option"
                    :class="{ active: form.category === category.id }"
                    @click="form.category = category.id"
                  >
                    <div class="category-preview">
                      <div
                        class="category-icon"
                        :style="{ color: category.color }"
                      >
                        {{ category.icon }}
                      </div>
                      <span class="category-name">{{ category.name }}</span>
                    </div>
                    <div
                      class="check-indicator"
                      v-if="form.category === category.id"
                    >
                      <Icon name="lucide:check" size="14" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Priority -->
              <div class="form-group">
                <label class="form-label">
                  <Icon name="lucide:flag" size="16" />
                  <span>Приоритет</span>
                </label>
                <div class="priority-select">
                  <div
                    v-for="priority in priorityOptions"
                    :key="priority.value"
                    class="priority-option"
                    :class="{
                      active: form.priority === priority.value,
                      [priority.value]: true,
                    }"
                    @click="form.priority = priority.value"
                  >
                    <div class="priority-content">
                      <div
                        class="priority-indicator"
                        :class="priority.value"
                      ></div>
                      <span class="priority-label">{{ priority.label }}</span>
                    </div>
                    <div
                      class="check-indicator"
                      v-if="form.priority === priority.value"
                    >
                      <Icon name="lucide:check" size="14" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Due Date -->
            <div class="form-group">
              <label class="form-label">
                <Icon name="lucide:calendar" size="16" />
                <span>Срок выполнения</span>
              </label>
              <div class="date-section">
                <div class="date-quick-actions">
                  <button
                    type="button"
                    class="date-quick-btn"
                    :class="{ active: isToday }"
                    @click="setToday"
                  >
                    Сегодня
                  </button>
                  <button
                    type="button"
                    class="date-quick-btn"
                    :class="{ active: isTomorrow }"
                    @click="setTomorrow"
                  >
                    Завтра
                  </button>
                  <button
                    type="button"
                    class="date-quick-btn"
                    :class="{ active: !form.dueAt }"
                    @click="form.dueAt = undefined"
                  >
                    Без срока
                  </button>
                </div>
                <div class="date-input-wrapper">
                  <input
                    id="dueDate"
                    v-model="form.dueAt"
                    type="date"
                    class="form-input date-input"
                    :min="today"
                  />
                  <div class="date-info" v-if="form.dueAt">
                    {{ formatDueDate(form.dueAt) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label">
                  <Icon name="lucide:tags" size="16" />
                  <span>Теги</span>
                </label>
                <span class="hint-text">Enter для добавления</span>
              </div>
              <div class="tags-section">
                <div class="tags-preview" v-if="form.tags.length > 0">
                  <div
                    v-for="(tag, index) in form.tags"
                    :key="index"
                    class="tag-badge"
                  >
                    <Icon name="lucide:tag" size="12" />
                    <span>{{ tag }}</span>
                    <button
                      type="button"
                      class="remove-tag"
                      @click="removeTag(index)"
                    >
                      <Icon name="lucide:x" size="10" />
                    </button>
                  </div>
                </div>
                <div class="tag-input-wrapper">
                  <input
                    v-model="tagInput"
                    type="text"
                    class="form-input tag-input"
                    placeholder="Добавить тег"
                    @keydown.enter.prevent="addTag"
                    @keydown.esc="tagInput = ''"
                  />
                  <button
                    type="button"
                    class="add-tag-btn"
                    @click="addTag"
                    :disabled="!tagInput.trim()"
                  >
                    <Icon name="lucide:plus" size="16" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Estimated Time -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label">
                  <Icon name="lucide:clock" size="16" />
                  <span>Оценка времени</span>
                </label>
                <div class="time-badge" v-if="form.estimatedMinutes">
                  {{ formatMinutes(form.estimatedMinutes) }}
                </div>
              </div>
              <div class="time-section">
                <!-- Quick Options -->
                <div class="time-quick-options">
                  <div class="options-grid">
                    <button
                      v-for="time in quickTimeOptions"
                      :key="time.value"
                      type="button"
                      class="time-quick-btn"
                      :class="{ active: form.estimatedMinutes === time.value }"
                      @click="form.estimatedMinutes = time.value"
                    >
                      {{ time.label }}
                    </button>
                  </div>
                </div>

                <!-- Custom Input -->
                <div class="custom-time">
                  <div class="custom-time-header">
                    <span class="custom-label">Свое время</span>
                    <div class="time-unit-selector">
                      <button
                        type="button"
                        class="unit-btn"
                        :class="{ active: timeUnit === 'minutes' }"
                        @click="timeUnit = 'minutes'"
                      >
                        мин
                      </button>
                      <button
                        type="button"
                        class="unit-btn"
                        :class="{ active: timeUnit === 'hours' }"
                        @click="timeUnit = 'hours'"
                      >
                        ч
                      </button>
                    </div>
                  </div>
                  <div class="custom-input-wrapper">
                    <div class="time-input-group">
                      <button
                        type="button"
                        class="time-btn decrement"
                        @click="decrementTime"
                        :disabled="form.estimatedMinutes <= 1"
                      >
                        <Icon name="lucide:minus" size="16" />
                      </button>
                      <input
                        v-model.number="customTimeValue"
                        type="number"
                        :min="1"
                        :max="timeUnit === 'minutes' ? 480 : 8"
                        :step="1"
                        class="time-input"
                        @input="handleCustomTimeInput"
                      />
                      <button
                        type="button"
                        class="time-btn increment"
                        @click="incrementTime"
                        :disabled="
                          (timeUnit === 'minutes' && customTimeValue >= 480) ||
                          (timeUnit === 'hours' && customTimeValue >= 8)
                        "
                      >
                        <Icon name="lucide:plus" size="16" />
                      </button>
                    </div>
                    <div class="time-display">
                      <span class="time-value">{{ customTimeValue }}</span>
                      <span class="time-unit-text">
                        {{ timeUnit === 'minutes' ? 'минут' : 'часов' }}
                      </span>
                    </div>
                  </div>
                  <div class="time-presets">
                    <button
                      v-for="preset in timePresets[timeUnit]"
                      :key="preset"
                      type="button"
                      class="time-preset-btn"
                      @click="setTimePreset(preset)"
                    >
                      {{ preset }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="footer-btn secondary" @click="close">
            Отмена
          </button>
          <button type="submit" class="footer-btn primary" @click="save">
            <Icon
              :name="editingTask ? 'lucide:save' : 'lucide:check-circle'"
              size="18"
            />
            <span>{{ editingTask ? 'Сохранить' : 'Создать задачу' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  task?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['save', 'close'])

// Stores
const tasksStore = useTasksStore()

// Refs
const modalRef = ref<HTMLElement>()
const form = reactive({
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueAt: undefined as string | undefined,
  estimatedMinutes: 30,
  tags: [] as string[],
})

const tagInput = ref('')
const customTimeValue = ref(30)
const timeUnit = ref<'minutes' | 'hours'>('minutes')
const dragging = ref(false)
const startY = ref(0)
const currentY = ref(0)

// Computed
const editingTask = computed(() => props.task)
const categories = computed(() => tasksStore.categories)
const today = computed(() => new Date().toISOString().split('T')[0])

const priorityOptions = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
]

const quickTimeOptions = [
  { value: 15, label: '15 мин' },
  { value: 25, label: '25 мин' },
  { value: 30, label: '30 мин' },
  { value: 45, label: '45 мин' },
  { value: 60, label: '1 час' },
  { value: 90, label: '1.5 часа' },
]

const timePresets = {
  minutes: [1, 5, 10, 20, 30, 45],
  hours: [1, 1.5, 2, 3, 4, 6, 8],
}

const isToday = computed(() => {
  if (!form.dueAt) return false
  return form.dueAt === today.value
})

const isTomorrow = computed(() => {
  if (!form.dueAt) return false
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return form.dueAt === tomorrow.toISOString().split('T')[0]
})

// Methods
const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueAt: undefined,
    estimatedMinutes: 30,
    tags: [],
  })
  tagInput.value = ''
  customTimeValue.value = 30
  timeUnit.value = 'minutes'
}

const close = () => {
  emit('close')
  resetForm()
}

const save = () => {
  // Обновляем время из кастомного ввода
  if (timeUnit.value === 'hours') {
    form.estimatedMinutes = customTimeValue.value * 60
  } else {
    form.estimatedMinutes = customTimeValue.value
  }

  const taskData = { ...form }
  emit('save', taskData)
  close()
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const setToday = () => {
  form.dueAt = today.value
}

const setTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  form.dueAt = tomorrow.toISOString().split('T')[0]
}

const formatDueDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Завтра'
  }

  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}ч ${mins > 0 ? `${mins}м` : ''}`
  }
  return `${mins}м`
}

const decrementTime = () => {
  if (customTimeValue.value > 1) {
    customTimeValue.value--
  }
}

const incrementTime = () => {
  const max = timeUnit.value === 'minutes' ? 480 : 8
  if (customTimeValue.value < max) {
    customTimeValue.value++
  }
}

const handleCustomTimeInput = () => {
  const max = timeUnit.value === 'minutes' ? 480 : 8
  if (customTimeValue.value < 1) customTimeValue.value = 1
  if (customTimeValue.value > max) customTimeValue.value = max
}

const setTimePreset = (value: number) => {
  customTimeValue.value = value
}

// Drag handling
const startDrag = (e: TouchEvent | MouseEvent) => {
  dragging.value = true
  startY.value =
    'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
}

const handleDrag = (e: TouchEvent) => {
  if (!dragging.value || !modalRef.value) return

  e.preventDefault()
  currentY.value = e.touches[0].clientY
  const delta = currentY.value - startY.value

  if (delta > 0) {
    modalRef.value.style.transform = `translateY(${delta}px)`
  }
}

const endDrag = () => {
  if (!dragging.value || !modalRef.value) return

  const delta = currentY.value - startY.value
  modalRef.value.style.transform = ''

  if (delta > 100) {
    close()
  }

  dragging.value = false
}

// Initialize form
watch(
  () => props.task,
  (task) => {
    if (task) {
      Object.assign(form, {
        title: task.title,
        description: task.description || '',
        category: task.category,
        priority: task.priority,
        dueAt: task.dueAt
          ? new Date(task.dueAt).toISOString().split('T')[0]
          : undefined,
        estimatedMinutes: task.estimatedMinutes || 30,
        tags: [...task.tags],
      })

      // Устанавливаем кастомное время
      customTimeValue.value = task.estimatedMinutes || 30
      timeUnit.value = customTimeValue.value >= 60 ? 'hours' : 'minutes'
      if (timeUnit.value === 'hours') {
        customTimeValue.value =
          Math.round((customTimeValue.value / 60) * 10) / 10
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Watch custom time
watch(customTimeValue, (value) => {
  // Обновляем время в форме
  if (timeUnit.value === 'hours') {
    form.estimatedMinutes = Math.round(value * 60)
  } else {
    form.estimatedMinutes = value
  }
})

// Handle description length
watch(
  () => form.description,
  (desc) => {
    if (desc && desc.length > 500) {
      form.description = desc.substring(0, 500)
    }
  }
)

// Prevent body scroll
watch(
  () => props.show,
  (show) => {
    if (show) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

// Close on escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape)
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
  align-items: flex-end;
  justify-content: center;

  @include breakpoint(md) {
    align-items: center;
  }
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  animation: fadeIn var(--duration-base) var(--ease-out);
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
  max-width: 520px;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  z-index: var(--z-modal);
  animation: slideUp var(--duration-base) var(--ease-out);

  @include breakpoint(md) {
    border-radius: var(--radius-xl);
    max-height: 85vh;
    animation: scaleIn var(--duration-base) var(--ease-out);
  }

  &.dragging {
    transition: transform var(--duration-fast);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.drag-handle {
  padding: var(--space-4) 0 var(--space-2);
  cursor: grab;
  touch-action: none;
  user-select: none;
  @include flex-center;

  @include breakpoint(md) {
    display: none;
  }

  &:active {
    cursor: grabbing;
  }
}

.drag-line {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.modal-header {
  padding: var(--space-5) var(--space-5) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  @include flex-between;
  gap: var(--space-4);

  @include breakpoint(md) {
    padding: var(--space-6) var(--space-6) var(--space-5);
  }
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  flex: 1;
}

.header-icon-wrapper {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-base);
  background: rgba(119, 119, 119, 0.1);
  flex-shrink: 0;
}

.header-icon {
  color: var(--accent-primary);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1);
  line-height: 1.2;

  @include breakpoint(md) {
    font-size: var(--text-2xl);
  }
}

.modal-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-primary);
  }
}

.modal-content {
  overflow-y: auto;
  max-height: calc(90vh - 200px);

  @include breakpoint(md) {
    max-height: calc(85vh - 200px);
  }
}

.modal-form {
  padding: var(--space-5);

  @include breakpoint(md) {
    padding: var(--space-6);
  }
}

.form-group {
  margin-bottom: var(--space-6);

  &:last-child {
    margin-bottom: 0;
  }
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.required {
  color: var(--error);
}

.hint-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: var(--font-family-primary);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: rgba(119, 119, 119, 0.05);
    @include focus-ring;
  }

  &::placeholder {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.form-textarea {
  @extend .form-input;
  resize: vertical;
  min-height: 100px;
  line-height: var(--leading-relaxed);
  font-family: var(--font-family-primary);
}

.char-count {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

// Form Row
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);

  @include breakpoint(sm) {
    grid-template-columns: 1fr 1fr;
  }
}

// Category Select
.category-select {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}

.category-option {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-base);
  transition: all var(--duration-base);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: rgba(119, 119, 119, 0.1);
    border-color: var(--accent-primary);
  }
}

.category-preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.category-icon {
  font-size: var(--text-lg);
  width: 24px;
  height: 24px;
  @include flex-center;
}

.category-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  @include text-truncate;
}

// Priority Select
.priority-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.priority-option {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-base);
  transition: all var(--duration-base);
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    &.high {
      background: rgba(248, 113, 113, 0.1);
      border-color: var(--error);
    }

    &.medium {
      background: rgba(250, 204, 21, 0.1);
      border-color: var(--warning);
    }

    &.low {
      background: rgba(93, 242, 126, 0.1);
      border-color: var(--success);
    }
  }
}

.priority-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.priority-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;

  .high & {
    background: var(--error);
  }

  .medium & {
    background: var(--warning);
  }

  .low & {
    background: var(--success);
  }
}

.priority-label {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.check-indicator {
  @include flex-center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-primary);
  color: white;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--duration-base);

  .active & {
    opacity: 1;
  }
}

// Date Section
.date-section {
  .date-quick-actions {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    flex-wrap: wrap;
  }

  .date-quick-btn {
    @include button-reset;
    padding: var(--space-2) var(--space-3);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    transition: all var(--duration-base);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &.active {
      background: rgba(119, 119, 119, 0.1);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
  }

  .date-input-wrapper {
    .date-input {
      margin-bottom: var(--space-2);
    }
  }

  .date-info {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding-left: var(--space-1);
  }
}

// Tags Section
.tags-section {
  .tags-preview {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .tag-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: rgba(119, 119, 119, 0.1);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    color: var(--accent-primary);

    .remove-tag {
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
  }

  .tag-input-wrapper {
    display: flex;
    gap: var(--space-2);
  }

  .tag-input {
    @extend .form-input;
    flex: 1;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }

  .add-tag-btn {
    @include button-reset;
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-button);
    background: var(--accent-primary);
    color: white;
    transition: all var(--duration-base);
    flex-shrink: 0;

    &:hover:not(:disabled) {
      background: var(--accent-secondary);
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// Time Section
.time-badge {
  padding: var(--space-1) var(--space-2);
  background: rgba(119, 119, 119, 0.1);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--accent-primary);
  font-weight: var(--font-medium);
}

.time-section {
  .time-quick-options {
    margin-bottom: var(--space-4);
  }

  .options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-2);
  }

  .time-quick-btn {
    @include button-reset;
    padding: var(--space-2);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    transition: all var(--duration-base);

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &.active {
      background: rgba(119, 119, 119, 0.1);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }
  }
}

.custom-time {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);

  .custom-time-header {
    @include flex-between;
    margin-bottom: var(--space-3);
  }

  .custom-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-primary);
  }

  .time-unit-selector {
    display: flex;
    gap: var(--space-1);
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-sm);
    padding: 2px;

    .unit-btn {
      @include button-reset;
      padding: var(--space-1) var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      border-radius: var(--radius-xs);
      transition: all var(--duration-base);

      &:hover {
        color: var(--text-primary);
      }

      &.active {
        background: rgba(119, 119, 119, 0.1);
        color: var(--accent-primary);
        font-weight: var(--font-medium);
      }
    }
  }

  .custom-input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-4);

    @include breakpoint(xs) {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-3);
    }
  }

  .time-input-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1;

    .time-btn {
      @include button-reset;
      @include flex-center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-button);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-secondary);
      transition: all var(--duration-base);

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .time-input {
      @extend .form-input;
      text-align: center;
      padding: var(--space-2);
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      flex: 1;
    }
  }

  .time-display {
    @include flex-center;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 80px;

    .time-value {
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      color: var(--accent-primary);
      line-height: 1;
    }

    .time-unit-text {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      text-transform: lowercase;
    }
  }

  .time-presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    justify-content: center;

    .time-preset-btn {
      @include button-reset;
      padding: var(--space-1) var(--space-2);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      transition: all var(--duration-base);

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
      }
    }
  }
}

.modal-footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  @include breakpoint(md) {
    padding: var(--space-5) var(--space-6);
  }
}

.footer-btn {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  transition: all var(--duration-base);

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }

  &.primary {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-1px);
      @include elevation(2);
    }
  }
}

// Modal Animations
.modal-slide-enter-active,
.modal-slide-leave-active {
  .modal-backdrop {
    transition: opacity var(--duration-base) var(--ease-out);
  }

  .modal-container {
    transition: transform var(--duration-base) var(--ease-out);
  }
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  .modal-backdrop {
    opacity: 0;
  }

  .modal-container {
    transform: translateY(100%);

    @include breakpoint(md) {
      transform: scale(0.95);
      opacity: 0;
    }
  }
}

.modal-slide-enter-to,
.modal-slide-leave-from {
  .modal-backdrop {
    opacity: 1;
  }

  .modal-container {
    transform: translateY(0);

    @include breakpoint(md) {
      transform: scale(1);
      opacity: 1;
    }
  }
}

// Light Theme
[data-theme='light'] {
  .modal-container {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    border-bottom-color: rgba(0, 0, 0, 0.05);
  }

  .form-input,
  .category-option,
  .priority-option,
  .time-quick-btn,
  .date-quick-btn,
  .time-preset-btn,
  .time-btn,
  .unit-btn,
  .custom-time {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.2);
    }
  }

  .header-icon-wrapper {
    background: rgba(0, 0, 0, 0.1);
  }

  .tag-badge,
  .time-badge {
    background: rgba(0, 0, 0, 0.1);
  }

  .modal-footer {
    border-top-color: rgba(0, 0, 0, 0.05);
  }

  .footer-btn.secondary {
    background: rgba(0, 0, 0, 0.05);
  }

  .time-unit-selector {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Responsive
@include breakpoint(xs) {
  .modal-form {
    padding: var(--space-4);
  }

  .form-group {
    margin-bottom: var(--space-5);
  }

  .category-select {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .options-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }

  .custom-input-wrapper {
    flex-direction: column;
  }

  .time-display {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: var(--space-2);
  }
}

@include breakpoint(sm) {
  .modal-container {
    max-width: 90%;
  }
}

@include breakpoint(md) {
  .modal-container {
    max-width: 520px;
  }
}
</style>
