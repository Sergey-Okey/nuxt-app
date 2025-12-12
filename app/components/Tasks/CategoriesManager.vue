<template>
  <div class="categories-manager">
    <div class="manager-header">
      <h3>Категории</h3>
      <button class="add-button" @click="openAddModal">
        <Icon name="lucide:plus" size="14" />
      </button>
    </div>

    <div class="categories-list">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        :style="{ '--category-color': category.color }"
      >
        <div class="category-info">
          <div class="category-icon" :style="{ color: category.color }">
            <Icon :name="category.icon" size="16" />
          </div>
          <div class="category-name">{{ category.name }}</div>
        </div>
        <button
          v-if="category.isCustom"
          class="delete-button"
          @click="deleteCategory(category.id)"
        >
          <Icon name="lucide:x" size="14" />
        </button>
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="add-category-modal">
        <div class="modal-header">
          <h4>Новая категория</h4>
          <button class="close-button" @click="closeAddModal">
            <Icon name="lucide:x" size="16" />
          </button>
        </div>

        <form class="category-form" @submit.prevent="addCategory">
          <div class="form-group">
            <label>Название</label>
            <input
              v-model="newCategory.name"
              type="text"
              placeholder="Название категории"
              required
            />
          </div>

          <div class="form-group">
            <label>Цвет</label>
            <div class="color-options">
              <button
                v-for="color in colorOptions"
                :key="color"
                class="color-option"
                :style="{ background: color }"
                :class="{ active: newCategory.color === color }"
                @click="newCategory.color = color"
                type="button"
              ></button>
            </div>
          </div>

          <div class="form-group">
            <label>Иконка</label>
            <div class="icon-options">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                class="icon-option"
                :class="{ active: newCategory.icon === icon }"
                @click="newCategory.icon = icon"
                type="button"
              >
                <Icon :name="icon" size="20" />
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-button" @click="closeAddModal">
              Отмена
            </button>
            <button type="submit" class="save-button">Добавить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// Data
const showAddModal = ref(false)
const newCategory = reactive({
  name: '',
  color: '#5d5fef',
  icon: 'lucide:folder',
})

// Options
const colorOptions = [
  '#5d5fef',
  '#5df27e',
  '#facc15',
  '#f87171',
  '#60a5fa',
  '#a78bfa',
  '#f472b6',
  '#6ee7b7',
]

const iconOptions = [
  'lucide:folder',
  'lucide:briefcase',
  'lucide:home',
  'lucide:heart',
  'lucide:book',
  'lucide:coffee',
  'lucide:shopping-cart',
  'lucide:dumbbell',
  'lucide:music',
  'lucide:camera',
  'lucide:code',
  'lucide:palette',
]

// Computed
const categories = computed(() => tasksStore.categories)

// Methods
const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  resetNewCategory()
}

const addCategory = () => {
  if (newCategory.name.trim()) {
    tasksStore.addCategory(
      newCategory.name,
      newCategory.color,
      newCategory.icon
    )
    closeAddModal()
  }
}

const deleteCategory = (id: string) => {
  if (confirm('Удалить категорию?')) {
    tasksStore.deleteCategory(id)
  }
}

const resetNewCategory = () => {
  newCategory.name = ''
  newCategory.color = '#5d5fef'
  newCategory.icon = 'lucide:folder'
}
</script>

<style scoped lang="scss">
.categories-manager {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.add-button {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.2);
    transform: rotate(90deg);
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
  padding: var(--space-2);
  border-radius: var(--radius-button);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.category-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.category-icon {
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: rgba(var(--category-color, 93, 95, 239), 0.1);
}

.category-name {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.delete-button {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);
  opacity: 0;

  .category-item:hover & {
    opacity: 1;
  }

  &:hover {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

// Modal styles
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

.add-category-modal {
  @include card;
  width: 100%;
  max-width: 400px;
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-4) var(--space-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h4 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.category-form {
  padding: var(--space-4);
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

  input[type='text'] {
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
  }
}

.color-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-2);
}

.color-option {
  @include button-reset;
  aspect-ratio: 1;
  border-radius: var(--radius-button);
  transition: all var(--duration-base);
  position: relative;

  &:hover {
    transform: scale(1.1);
  }

  &.active {
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: var(--text-sm);
      font-weight: var(--font-bold);
    }
  }
}

.icon-options {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-2);
}

.icon-option {
  @include button-reset;
  @include flex-center;
  aspect-ratio: 1;
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
  }
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.cancel-button,
.save-button {
  @include button-reset;
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
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
  }
}
</style>
