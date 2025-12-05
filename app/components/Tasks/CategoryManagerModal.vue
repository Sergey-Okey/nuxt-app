<template>
  <div class="category-manager-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>

    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Управление категориями</h2>
        <button class="close-button" @click="$emit('close')">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <div class="modal-content">
        <!-- Add Category Form -->
        <div class="add-category-form">
          <h3 class="section-title">
            {{ isEditing ? 'Редактировать категорию' : 'Добавить категорию' }}
          </h3>

          <!-- Notification -->
          <div
            v-if="notification.show"
            class="notification"
            :class="notification.type"
          >
            <Icon
              :name="
                notification.type === 'error'
                  ? 'lucide:alert-circle'
                  : 'lucide:check'
              "
              size="16"
            />
            <span>{{ notification.message }}</span>
            <button class="notification-close" @click="clearNotification">
              <Icon name="lucide:x" size="14" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="category-form">
            <div class="form-row">
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                :placeholder="
                  isEditing ? 'Новое название категории' : 'Название категории'
                "
                required
                maxlength="20"
                @input="clearNotification"
              />
              <input
                v-model="formData.color"
                type="color"
                class="color-input"
                title="Выберите цвет"
              />
            </div>

            <div class="icon-selector">
              <div class="icon-options">
                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  type="button"
                  class="icon-button"
                  :class="{ active: formData.icon === icon }"
                  @click="formData.icon = icon"
                >
                  <Icon :name="icon" size="20" />
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button
                v-if="isEditing"
                type="button"
                class="cancel-button"
                @click="cancelEdit"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="add-button"
                :disabled="!formData.name.trim() || isSubmitting"
              >
                <Icon
                  :name="isEditing ? 'lucide:save' : 'lucide:plus'"
                  size="16"
                />
                <span>{{ isEditing ? 'Сохранить' : 'Добавить' }}</span>
                <span v-if="isSubmitting" class="spinner"></span>
              </button>
            </div>
          </form>
        </div>

        <!-- User Categories List -->
        <div class="user-categories">
          <h3 class="section-title">Мои категории</h3>

          <div v-if="userCategories.length > 0" class="categories-list">
            <div
              v-for="category in userCategories"
              :key="category.id"
              class="category-item"
              :style="{ '--category-color': category.color }"
            >
              <div class="category-info">
                <div class="category-icon">
                  <Icon :name="category.icon" size="16" />
                </div>
                <div class="category-details">
                  <span class="category-name">{{ category.name }}</span>
                  <span v-if="category.isCustom" class="custom-badge"
                    >Пользовательская</span
                  >
                </div>
              </div>
              <div class="category-actions">
                <button
                  class="edit-button"
                  @click="startEdit(category)"
                  :title="'Редактировать ' + category.name"
                >
                  <Icon name="lucide:edit-2" size="16" />
                </button>
                <button
                  class="delete-button"
                  @click="confirmDelete(category)"
                  :title="'Удалить ' + category.name"
                >
                  <Icon name="lucide:trash-2" size="16" />
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <Icon name="lucide:tag" size="32" />
            <p>У вас пока нет своих категорий</p>
          </div>
        </div>

        <!-- Default Categories List -->
        <div class="default-categories" v-if="defaultCategories.length > 0">
          <h3 class="section-title">Системные категории</h3>
          <div class="categories-list">
            <div
              v-for="category in defaultCategories"
              :key="category.id"
              class="category-item"
              :style="{ '--category-color': category.color }"
            >
              <div class="category-info">
                <div class="category-icon">
                  <Icon :name="category.icon" size="16" />
                </div>
                <div class="category-details">
                  <span class="category-name">{{ category.name }}</span>
                  <span class="system-badge">Системная</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="confirmation-modal">
      <div
        class="confirmation-backdrop"
        @click="showDeleteConfirm = false"
      ></div>
      <div class="confirmation-content">
        <h3>Удалить категорию?</h3>
        <p>
          Категория "{{ categoryToDelete?.name }}" будет удалена. Все задачи в
          этой категории будут перемещены в категорию "Личное". Это действие
          нельзя отменить.
        </p>
        <div class="confirmation-actions">
          <button class="cancel-btn" @click="showDeleteConfirm = false">
            Отмена
          </button>
          <button class="delete-btn" @click="deleteCategory">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/stores/tasks'

const tasksStore = useTasksStore()

// Emits
const emit = defineEmits(['close', 'category-added', 'category-updated'])

// State
const formData = reactive({
  name: '',
  color: '#5d5fef',
  icon: 'lucide:tag',
})

const isSubmitting = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const notification = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

// Delete confirmation
const showDeleteConfirm = ref(false)
const categoryToDelete = ref<Category | null>(null)

// Icon options
const iconOptions = [
  'lucide:tag',
  'lucide:star',
  'lucide:heart',
  'lucide:briefcase',
  'lucide:home',
  'lucide:book-open',
  'lucide:music',
  'lucide:coffee',
  'lucide:shopping-cart',
  'lucide:gamepad-2',
  'lucide:dumbbell',
  'lucide:car',
  'lucide:plane',
  'lucide:gift',
  'lucide:camera',
]

// Computed
const userCategories = computed(() => tasksStore.userCategories)
const defaultCategories = computed(() => tasksStore.defaultCategories)

// Methods
const clearNotification = () => {
  notification.show = false
}

const showNotification = (
  message: string,
  type: 'success' | 'error' = 'success'
) => {
  notification.show = true
  notification.message = message
  notification.type = type

  // Auto hide success notifications
  if (type === 'success') {
    setTimeout(clearNotification, 3000)
  }
}

const resetForm = () => {
  formData.name = ''
  formData.color = '#5d5fef'
  formData.icon = 'lucide:tag'
  isEditing.value = false
  editingId.value = null
  isSubmitting.value = false
}

const normalizeCategoryName = (name: string) => {
  return name.trim().toLowerCase()
}

const checkForDuplicate = (name: string, excludeId?: string): boolean => {
  const normalizedInput = normalizeCategoryName(name)

  return userCategories.value.some((category) => {
    if (excludeId && category.id === excludeId) return false
    return normalizeCategoryName(category.name) === normalizedInput
  })
}

const handleSubmit = async () => {
  if (!formData.name.trim()) return

  isSubmitting.value = true

  try {
    const normalizedName = formData.name.trim()

    // Check for duplicates among user categories
    if (checkForDuplicate(normalizedName, editingId.value || undefined)) {
      showNotification('Категория с таким названием уже существует', 'error')
      isSubmitting.value = false
      return
    }

    // Also check default categories (system categories)
    const defaultCategoryDuplicate = defaultCategories.value.some(
      (category) =>
        normalizeCategoryName(category.name) ===
        normalizeCategoryName(normalizedName)
    )

    if (defaultCategoryDuplicate) {
      showNotification(
        'Категория с таким названием уже существует среди системных категорий',
        'error'
      )
      isSubmitting.value = false
      return
    }

    if (isEditing.value && editingId.value) {
      // Update existing category
      tasksStore.updateCategory(editingId.value, {
        name: normalizedName,
        color: formData.color,
        icon: formData.icon,
      })

      showNotification('Категория обновлена')
      emit('category-updated')
      resetForm()
    } else {
      // Add new category
      const category = tasksStore.addCategory(
        normalizedName,
        formData.color,
        formData.icon
      )

      showNotification('Категория добавлена')
      emit('category-added', category)
      resetForm()
    }
  } catch (error) {
    console.error('Error saving category:', error)
    showNotification('Произошла ошибка', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const startEdit = (category: Category) => {
  if (!category.isCustom) return // Don't edit system categories

  formData.name = category.name
  formData.color = category.color
  formData.icon = category.icon
  isEditing.value = true
  editingId.value = category.id
  clearNotification()
}

const cancelEdit = () => {
  resetForm()
  clearNotification()
}

const confirmDelete = (category: Category) => {
  if (!category.isCustom) return // Don't delete system categories

  categoryToDelete.value = category
  showDeleteConfirm.value = true
}

const deleteCategory = () => {
  if (!categoryToDelete.value) return

  try {
    tasksStore.deleteCategory(categoryToDelete.value.id)
    showNotification('Категория удалена')
    emit('category-updated')
  } catch (error) {
    console.error('Error deleting category:', error)
    showNotification('Не удалось удалить категорию', 'error')
  } finally {
    showDeleteConfirm.value = false
    categoryToDelete.value = null
  }
}

// Reset form when modal opens
resetForm()
</script>

<style scoped lang="scss">
.category-manager-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--z-modal) + 1);
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
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 450px;
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

  > * + * {
    margin-top: var(--space-6);
  }
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.add-category-form {
  padding-bottom: var(--space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.notification {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-card);
  font-size: var(--text-sm);
  animation: slideDown 0.2s ease-out;

  &.success {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  &.error {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .notification-close {
    @include button-reset;
    @include flex-center;
    margin-left: auto;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-button);
    color: inherit;
    opacity: 0.7;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: flex;
  gap: var(--space-3);
  align-items: center;

  .form-input {
    flex: 1;
  }
}

.form-input {
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

.color-input {
  @include button-reset;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-button);
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
}

.icon-selector {
  .icon-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: var(--space-2);
  }

  .icon-button {
    @include button-reset;
    @include flex-center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-button);
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
    transition: all var(--duration-base);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    &.active {
      background: rgba(93, 95, 239, 0.1);
      color: var(--accent-primary);
      border: 1px solid var(--accent-primary);
    }
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

.add-button {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
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

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.6s linear infinite;
    margin-left: var(--space-2);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.cancel-button {
  @include button-reset;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.1);
  }
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.category-icon {
  @include flex-center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(var(--category-color, 93, 95, 239), 0.1);
  color: var(--category-color, var(--accent-primary));

  :deep(svg) {
    color: var(--category-color, var(--accent-primary));
  }
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.category-name {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.custom-badge,
.system-badge {
  font-size: var(--text-xs);
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: var(--font-medium);
}

.custom-badge {
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  align-self: flex-start;
}

.system-badge {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  align-self: flex-start;
}

.category-actions {
  display: flex;
  gap: var(--space-1);
  flex-shrink: 0;
}

.edit-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
}

.delete-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--text-secondary);

  :deep(svg) {
    margin-bottom: var(--space-3);
    opacity: 0.5;
  }

  p {
    font-size: var(--text-sm);
    margin: 0;
  }
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: calc(var(--z-modal) + 2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmation-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.confirmation-content {
  position: relative;
  background: var(--card-bg);
  border-radius: 16px;
  padding: var(--space-5);
  max-width: 320px;
  width: 90%;
  animation: scaleIn 0.2s ease-out;

  h3 {
    margin: 0 0 var(--space-2);
    color: var(--text-primary);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
  }

  p {
    margin: 0 0 var(--space-4);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    line-height: 1.4;
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

.confirmation-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;

  button {
    @include button-reset;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-button);
    font-weight: var(--font-medium);
    transition: all var(--duration-base);
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .delete-btn {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }
}
</style>
