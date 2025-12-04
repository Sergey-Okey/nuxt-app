<template>
  <div class="category-manager-modal" v-if="isOpen">
    <div class="modal-backdrop" @click="closeModal"></div>

    <div class="modal-container">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">Управление категориями</h2>
          <button class="close-button" @click="closeModal">
            <Icon name="lucide:x" size="20" />
          </button>
        </div>

        <!-- Основной контент -->
        <div class="manager-content">
          <!-- Список категорий -->
          <div class="categories-list">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :style="{ '--category-color': category.color }"
            >
              <div class="category-info">
                <div class="category-icon">
                  <Icon :name="category.icon" size="20" />
                </div>
                <div class="category-details">
                  <h4>{{ category.name }}</h4>
                  <p>{{ category.taskCount }} задач</p>
                </div>
                <span v-if="!category.isCustom" class="system-badge">
                  Системная
                </span>
              </div>

              <div class="category-actions">
                <button
                  v-if="category.isCustom"
                  class="action-button edit"
                  @click="editCategory(category)"
                >
                  <Icon name="lucide:edit-2" size="16" />
                </button>
                <button
                  v-if="category.isCustom"
                  class="action-button delete"
                  @click="deleteCategory(category)"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </div>
          </div>

          <!-- Форма добавления/редактирования -->
          <div class="category-form">
            <h3 class="form-title">
              {{ editingCategory ? 'Редактировать' : 'Добавить' }} категорию
            </h3>

            <form @submit.prevent="submitForm" class="form-content">
              <div class="form-row">
                <div class="form-group">
                  <label>Название</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-input"
                    placeholder="Название категории"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Цвет</label>
                  <div class="color-picker">
                    <input
                      v-model="formData.color"
                      type="color"
                      class="color-input"
                    />
                    <span class="color-value">{{ formData.color }}</span>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label>Иконка</label>
                <div class="icon-selector">
                  <button
                    v-for="icon in availableIcons"
                    :key="icon"
                    type="button"
                    class="icon-option"
                    :class="{ active: formData.icon === icon }"
                    @click="formData.icon = icon"
                  >
                    <Icon :name="icon" size="18" />
                  </button>
                </div>
              </div>

              <div class="form-actions">
                <button
                  v-if="editingCategory"
                  type="button"
                  class="cancel-button"
                  @click="cancelEdit"
                >
                  Отмена
                </button>
                <button type="submit" class="submit-button">
                  {{ editingCategory ? 'Сохранить' : 'Добавить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Category } from '~/stores/tasks'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const tasksStore = useTasksStore()

// Данные формы
const formData = reactive({
  name: '',
  color: '#5d5fef',
  icon: 'lucide:folder',
})

const editingCategory = ref<Category | null>(null)

// Доступные данные
const categories = computed(() => tasksStore.categories)

const availableIcons = [
  'lucide:folder',
  'lucide:briefcase',
  'lucide:home',
  'lucide:heart',
  'lucide:book-open',
  'lucide:shopping-cart',
  'lucide:coffee',
  'lucide:dumbbell',
  'lucide:music',
  'lucide:camera',
  'lucide:code',
  'lucide:palette',
  'lucide:car',
  'lucide:plane',
  'lucide:gift',
  'lucide:star',
]

// Методы
const resetForm = () => {
  formData.name = ''
  formData.color = '#5d5fef'
  formData.icon = 'lucide:folder'
  editingCategory.value = null
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  formData.name = category.name
  formData.color = category.color
  formData.icon = category.icon
}

const cancelEdit = () => {
  resetForm()
}

const deleteCategory = (category: Category) => {
  if (confirm(`Удалить категорию "${category.name}"?`)) {
    tasksStore.deleteCategory(category.id)
  }
}

const submitForm = () => {
  if (editingCategory.value) {
    // Редактирование
    tasksStore.updateCategory(editingCategory.value.id, {
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
    })
  } else {
    // Добавление
    tasksStore.addCategory({
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
    })
  }

  resetForm()
}
</script>

<style scoped lang="scss">
.category-manager-modal {
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
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
}

.modal-content {
  @include glass(20px, 0.05);
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
  padding: var(--space-5);
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

.manager-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.category-icon {
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-card);
  background: rgba(var(--category-color, 93, 95, 239), 0.1);

  :deep(svg) {
    color: var(--category-color, var(--accent-primary));
  }
}

.category-details {
  flex: 1;

  h4 {
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-1);
  }

  p {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
  }
}

.system-badge {
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.category-actions {
  display: flex;
  gap: var(--space-1);
}

.action-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    &.edit {
      background: rgba(93, 95, 239, 0.1);
      color: var(--accent-primary);
    }

    &.delete {
      background: rgba(248, 113, 113, 0.1);
      color: var(--error);
    }
  }
}

.category-form {
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  padding: var(--space-4);
}

.form-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  @include breakpoint(sm) {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
  }
}

.form-input {
  padding: var(--space-3);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: var(--glow-primary);
  }
}

.color-picker {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.color-input {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: var(--radius-button);
  }
}

.color-value {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-family: var(--font-family-mono);
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: var(--space-2);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--space-2);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
}

.icon-option {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: transparent;
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

.cancel-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
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
  .modal-content {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .category-item {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
  }

  .system-badge {
    background: rgba(0, 0, 0, 0.05);
  }

  .action-button {
    background: rgba(0, 0, 0, 0.05);
  }

  .category-form {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .form-input,
  .icon-selector {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .icon-option:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .cancel-button {
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

@media (max-width: 640px) {
  .category-manager-modal {
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

  .modal-header {
    padding: var(--space-4);
  }

  .manager-content {
    padding: var(--space-4);
  }

  .icon-selector {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
