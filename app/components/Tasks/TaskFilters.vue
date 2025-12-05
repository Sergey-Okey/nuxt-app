<template>
  <div class="task-filters">
    <div class="filters-container">
      <!-- Status Filters -->
      <div class="filter-group">
        <button
          v-for="status in statusFilters"
          :key="status.value"
          class="filter-button"
          :class="{ active: activeFilters.status === status.value }"
          @click="setFilter('status', status.value)"
        >
          <Icon :name="status.icon" size="16" />
          <span>{{ status.label }}</span>
        </button>
      </div>

      <!-- Category Dropdown -->
      <div class="filter-group">
        <div class="dropdown">
          <button
            class="filter-button dropdown-toggle"
            :class="{ active: activeFilters.category !== 'all' }"
            @click="toggleCategoryDropdown"
          >
            <Icon name="lucide:tag" size="16" />
            <span>{{ selectedCategoryLabel }}</span>
            <Icon name="lucide:chevron-down" size="12" />
          </button>

          <div v-if="showCategoryDropdown" class="dropdown-menu">
            <button
              class="dropdown-item"
              :class="{ active: activeFilters.category === 'all' }"
              @click="setFilter('category', 'all')"
            >
              Все категории
            </button>

            <div class="dropdown-divider"></div>

            <button
              v-for="category in allCategories"
              :key="category.id"
              class="dropdown-item"
              :class="{ active: activeFilters.category === category.id }"
              @click="setFilter('category', category.id)"
              :style="{ color: category.color }"
            >
              <Icon :name="category.icon" size="14" />
              <span>{{ category.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Priority Dropdown -->
      <div class="filter-group">
        <div class="dropdown">
          <button
            class="filter-button dropdown-toggle"
            :class="{ active: activeFilters.priority !== 'all' }"
            @click="togglePriorityDropdown"
          >
            <Icon name="lucide:flag" size="16" />
            <span>{{ selectedPriorityLabel }}</span>
            <Icon name="lucide:chevron-down" size="12" />
          </button>

          <div v-if="showPriorityDropdown" class="dropdown-menu">
            <button
              class="dropdown-item"
              :class="{ active: activeFilters.priority === 'all' }"
              @click="setFilter('priority', 'all')"
            >
              Все приоритеты
            </button>

            <div class="dropdown-divider"></div>

            <button
              v-for="priority in priorityFilters"
              :key="priority.value"
              class="dropdown-item"
              :class="{ active: activeFilters.priority === priority.value }"
              @click="setFilter('priority', priority.value)"
              :style="{ color: priority.color }"
            >
              <Icon :name="priority.icon" size="14" />
              <span>{{ priority.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Reset Filters Button -->
      <button
        v-if="hasActiveFilters"
        class="reset-button"
        @click="resetFilters"
      >
        <Icon name="lucide:x" size="14" />
        <span>Сбросить</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// Local state
const showCategoryDropdown = ref(false)
const showPriorityDropdown = ref(false)

// Computed
const activeFilters = computed(() => tasksStore.filters)
const allCategories = computed(() => tasksStore.categories)

const selectedCategoryLabel = computed(() => {
  if (activeFilters.value.category === 'all') return 'Категория'
  const category = allCategories.value.find(
    (c) => c.id === activeFilters.value.category
  )
  return category?.name || 'Категория'
})

const selectedPriorityLabel = computed(() => {
  const labels = {
    all: 'Приоритет',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[activeFilters.value.priority] || 'Приоритет'
})

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.status !== 'all' ||
    activeFilters.value.category !== 'all' ||
    activeFilters.value.priority !== 'all'
  )
})

// Filters data
const statusFilters = [
  { value: 'all', label: 'Все', icon: 'lucide:list' },
  { value: 'active', label: 'Активные', icon: 'lucide:circle' },
  { value: 'completed', label: 'Выполненные', icon: 'lucide:check-circle' },
]

const priorityFilters = [
  {
    value: 'high',
    label: 'Высокий',
    icon: 'lucide:flag',
    color: 'var(--error)',
  },
  {
    value: 'medium',
    label: 'Средний',
    icon: 'lucide:flag',
    color: 'var(--warning)',
  },
  {
    value: 'low',
    label: 'Низкий',
    icon: 'lucide:flag',
    color: 'var(--success)',
  },
]

// Methods
const setFilter = (type: 'status' | 'category' | 'priority', value: string) => {
  tasksStore.setFilter(type, value)
  closeDropdowns()
}

const resetFilters = () => {
  tasksStore.resetFilters()
  closeDropdowns()
}

const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
  showPriorityDropdown.value = false
}

const togglePriorityDropdown = () => {
  showPriorityDropdown.value = !showPriorityDropdown.value
  showCategoryDropdown.value = false
}

const closeDropdowns = () => {
  showCategoryDropdown.value = false
  showPriorityDropdown.value = false
}

// Close dropdowns when clicking outside
onClickOutside(() => {
  closeDropdowns()
})
</script>

<style scoped lang="scss">
.task-filters {
  @include card;
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.filters-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: var(--space-2);
}

.filter-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  &.active {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);

    :deep(svg) {
      color: var(--accent-primary);
    }
  }

  &.dropdown-toggle {
    padding-right: var(--space-2);
  }
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
  z-index: var(--z-dropdown);
  min-width: 180px;
  max-height: 300px;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;
}

.dropdown-item {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  :deep(svg) {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: var(--space-2) 0;
}

.reset-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(248, 113, 113, 0.1);
  color: var(--error);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  margin-left: auto;

  &:hover {
    background: rgba(248, 113, 113, 0.2);
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

// Responsive adjustments
@media (max-width: 640px) {
  .filters-container {
    gap: var(--space-2);
  }

  .filter-button span {
    display: none;
  }

  .filter-button.dropdown-toggle span {
    display: inline;
  }

  .reset-button span {
    display: none;
  }
}
</style>
