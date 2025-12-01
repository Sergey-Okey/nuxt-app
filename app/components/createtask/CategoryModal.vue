<template>
  <div class="category-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>

    <div class="modal-container">
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">Новая категория</h2>
          <button class="close-button" @click="$emit('close')">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>
      </div>

      <div class="modal-content">
        <div class="form-group">
          <label class="form-label">Название категории</label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Например: Спорт"
            maxlength="20"
          />
          <div class="form-counter">{{ form.name.length }}/20</div>
        </div>

        <div class="form-group">
          <label class="form-label">Цвет</label>
          <div class="color-grid">
            <button
              v-for="color in colors"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: color }"
              :class="{ active: form.color === color }"
              @click="form.color = color"
            >
              <Icon v-if="form.color === color" name="lucide:check" size="16" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Иконка</label>
          <div class="icon-grid">
            <button
              v-for="icon in icons"
              :key="icon"
              class="icon-option"
              :class="{ active: form.icon === icon }"
              @click="form.icon = icon"
            >
              <Icon :name="icon" size="20" />
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button class="cancel-button" @click="$emit('close')">Отмена</button>
          <button
            class="save-button"
            :disabled="!isValid"
            @click="saveCategory"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Emits
const emit = defineEmits<{
  close: []
  save: [category: { name: string; color: string; icon: string }]
}>()

// Form
const form = ref({
  name: '',
  color: '#5d5fef',
  icon: 'lucide:star',
})

const isValid = computed(() => form.value.name.trim().length > 0)

// Color options
const colors = [
  '#5d5fef', // Primary
  '#5df27e', // Success
  '#facc15', // Warning
  '#f87171', // Error
  '#60a5fa', // Blue
  '#a78bfa', // Purple
  '#f472b6', // Pink
  '#fb923c', // Orange
]

// Icon options
const icons = [
  'lucide:star',
  'lucide:heart',
  'lucide:bell',
  'lucide:target',
  'lucide:music',
  'lucide:film',
  'lucide:shopping-bag',
  'lucide:utensils',
  'lucide:car',
  'lucide:gift',
  'lucide:dollar-sign',
  'lucide:code',
  'lucide:paintbrush',
  'lucide:dumbbell',
]

const saveCategory = () => {
  if (!isValid.value) return

  emit('save', {
    name: form.value.name.trim(),
    color: form.value.color,
    icon: form.value.icon,
  })

  form.value = {
    name: '',
    color: '#5d5fef',
    icon: 'lucide:star',
  }
}
</script>

<style scoped lang="scss">
.category-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--z-modal) + 10);
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s ease-out;
  overflow: hidden;
}

.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: var(--text-lg);
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
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-input {
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.1);
  }
}

.form-counter {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-align: right;
  margin-top: var(--space-1);
}

// Color Grid
.color-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.color-option {
  @include button-reset;
  aspect-ratio: 1;
  border-radius: var(--radius-card);
  transition: all var(--duration-base);
  position: relative;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    border-color: white;
    box-shadow: 0 0 0 2px currentColor;

    :deep(svg) {
      color: white;
    }
  }

  :deep(svg) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

// Icon Grid
.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.icon-option {
  @include button-reset;
  @include flex-center;
  aspect-ratio: 1;
  border-radius: var(--radius-card);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  &.active {
    border-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  :deep(svg) {
    color: currentColor;
  }
}

// Form Actions
.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-card);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.save-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  border-radius: var(--radius-card);
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

// Light Theme
[data-theme='light'] {
  .modal-container {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .close-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .form-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .icon-option {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .cancel-button {
    background: var(--surface-bg);
  }
}
</style>
