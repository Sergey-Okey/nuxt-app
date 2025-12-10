<template>
  <div class="task-filters">
    <!-- Compact Filter Bar -->
    <div class="filter-bar">
      <button
        class="filter-trigger"
        :class="{ active: showFilters }"
        @click="toggleFilters"
      >
        <Icon name="lucide:filter" size="18" />
        <span class="trigger-text">Фильтры</span>
        <span v-if="hasActiveFilters" class="filter-count">
          {{ activeFilterCount }}
        </span>
        <Icon
          :name="showFilters ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          size="16"
          class="chevron"
        />
      </button>

      <!-- Quick Status Filter -->
      <div class="quick-filters">
        <button
          v-for="status in quickStatusOptions"
          :key="status.value"
          :class="[
            'quick-filter-button',
            { active: activeFilters.status === status.value },
          ]"
          @click="setFilter('status', status.value)"
        >
          <Icon :name="status.icon" size="14" />
          <span>{{ status.label }}</span>
        </button>
      </div>

      <button
        v-if="hasActiveFilters"
        class="reset-filters"
        @click="resetFilters"
        title="Сбросить все фильтры"
      >
        <Icon name="lucide:x" size="14" />
      </button>
    </div>

    <!-- Expanded Filters Panel -->
    <Transition name="slide-down">
      <div v-if="showFilters" class="filters-panel">
        <div class="filters-grid">
          <!-- Priority Filter -->
          <div class="filter-group">
            <label class="filter-label">Приоритет</label>
            <div class="priority-chips">
              <button
                v-for="priority in priorityOptions"
                :key="priority.value"
                :class="[
                  'priority-chip',
                  priority.value,
                  { active: activeFilters.priority === priority.value },
                ]"
                @click="setFilter('priority', priority.value)"
              >
                <Icon :name="priority.icon" size="14" />
                <span>{{ priority.label }}</span>
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-label">Категория</label>
            <div class="category-chips">
              <button
                v-for="category in allCategories"
                :key="category.id"
                :class="[
                  'category-chip',
                  { active: activeFilters.category === category.id },
                ]"
                @click="setFilter('category', category.id)"
                :style="{
                  '--category-color': category.color,
                  '--category-color-light': category.color + '20',
                }"
              >
                <Icon :name="category.icon" size="14" />
                <span class="category-name">{{ category.name }}</span>
              </button>
            </div>
          </div>

          <!-- Search -->
          <div class="filter-group">
            <label class="filter-label">Поиск</label>
            <div class="search-box">
              <Icon name="lucide:search" size="16" class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Название, описание, теги..."
                @input="onSearch"
              />
              <button
                v-if="searchQuery"
                class="clear-search"
                @click="clearSearch"
              >
                <Icon name="lucide:x" size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Active Filters Badges -->
        <div v-if="activeFilterCount > 0" class="active-filters">
          <div class="active-filters-label">Активные фильтры:</div>
          <div class="filter-badges">
            <span
              v-if="activeFilters.status !== 'all'"
              class="filter-badge"
              @click="setFilter('status', 'all')"
            >
              {{ getStatusLabel(activeFilters.status) }}
              <Icon name="lucide:x" size="10" />
            </span>

            <span
              v-if="activeFilters.priority !== 'all'"
              class="filter-badge"
              :class="activeFilters.priority"
              @click="setFilter('priority', 'all')"
            >
              {{ getPriorityLabel(activeFilters.priority) }}
              <Icon name="lucide:x" size="10" />
            </span>

            <span
              v-if="activeFilters.category !== 'all'"
              class="filter-badge category-badge"
              @click="setFilter('category', 'all')"
            >
              {{ getCategoryName(activeFilters.category) }}
              <Icon name="lucide:x" size="10" />
            </span>

            <span
              v-if="searchQuery"
              class="filter-badge search-badge"
              @click="clearSearch"
            >
              Поиск: "{{ searchQuery }}"
              <Icon name="lucide:x" size="10" />
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// State
const showFilters = ref(false)
const searchQuery = ref('')

// Computed
const activeFilters = computed(() => tasksStore.filters)
const allCategories = computed(() => tasksStore.categories)
const defaultCategories = computed(() => tasksStore.defaultCategories)
const userCategories = computed(() => tasksStore.userCategories)

const hasActiveFilters = computed(() => {
  return (
    activeFilters.value.status !== 'all' ||
    activeFilters.value.category !== 'all' ||
    activeFilters.value.priority !== 'all' ||
    searchQuery.value !== ''
  )
})

const activeFilterCount = computed(() => {
  let count = 0
  if (activeFilters.value.status !== 'all') count++
  if (activeFilters.value.category !== 'all') count++
  if (activeFilters.value.priority !== 'all') count++
  if (searchQuery.value) count++
  return count
})

// Options
const quickStatusOptions = [
  { value: 'all', label: 'Все', icon: 'lucide:list' },
  { value: 'active', label: 'Активные', icon: 'lucide:circle' },
  { value: 'completed', label: 'Готово', icon: 'lucide:check-circle' },
]

const priorityOptions = [
  { value: 'all', label: 'Все', icon: 'lucide:star' },
  { value: 'low', label: 'Низкий', icon: 'lucide:trending-down' },
  { value: 'medium', label: 'Средний', icon: 'lucide:minus' },
  { value: 'high', label: 'Высокий', icon: 'lucide:trending-up' },
]

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const setFilter = (type: 'status' | 'category' | 'priority', value: string) => {
  tasksStore.setFilter(type, value)
}

const resetFilters = () => {
  tasksStore.resetFilters()
  searchQuery.value = ''
  showFilters.value = false
}

const onSearch = debounce(() => {
  // Emit search query to parent
  emit('search', searchQuery.value)
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

const getStatusLabel = (status: string) => {
  const option = quickStatusOptions.find((s) => s.value === status)
  return option?.label || status
}

const getPriorityLabel = (priority: string) => {
  const option = priorityOptions.find((p) => p.value === priority)
  return option?.label || priority
}

const getCategoryName = (categoryId: string) => {
  const category = allCategories.value.find((cat) => cat.id === categoryId)
  return category?.name || categoryId
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Emit events
const emit = defineEmits(['search'])

watch(searchQuery, (value) => {
  emit('search', value)
})

// Close filters when clicking outside
const clickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.task-filters')) {
    showFilters.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', clickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', clickOutside)
})
</script>

<style scoped lang="scss">
.task-filters {
  position: relative;
  margin-bottom: var(--space-4);
}

.filter-bar {
  @include card;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--card-bg);

  @include breakpoint(xs) {
    padding: var(--space-3);
    gap: var(--space-2);
    flex-wrap: wrap;
  }
}

.filter-trigger {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  position: relative;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  &.active {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  .chevron {
    transition: transform var(--duration-base);
    margin-left: var(--space-1);

    @include breakpoint(xs) {
      margin-left: 0;
    }
  }
}

.trigger-text {
  @include breakpoint(xs) {
    display: none;
  }
}

.filter-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  @include flex-center;
  padding: 0 var(--space-1);
  border: 2px solid var(--card-bg);
  z-index: 1;

  @include breakpoint(xs) {
    position: static;
    top: auto;
    right: auto;
    margin-left: var(--space-1);
    border: none;
  }
}

.quick-filters {
  display: flex;
  gap: var(--space-2);
  margin-left: auto;

  @include breakpoint(xs) {
    margin-left: 0;
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: var(--space-2);
  }
}

.quick-filter-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  &.active {
    background: var(--accent-primary);
    color: white;
  }

  @include breakpoint(xs) {
    flex: 1;
    justify-content: center;
    font-size: var(--text-xs);
    padding: var(--space-2);
  }
}

.reset-filters {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: rgba(248, 113, 113, 0.1);
  color: var(--error);
  transition: all var(--duration-base);
  flex-shrink: 0;

  &:hover {
    background: rgba(248, 113, 113, 0.2);
    transform: rotate(90deg);
  }

  @include breakpoint(xs) {
    order: 2;
    margin-left: auto;
  }
}

// Filters Panel
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-base) cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.filters-panel {
  @include card;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-2);
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--card-bg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-dropdown);
  border-radius: var(--radius-card);
  animation: slideDown 0.2s ease-out;

  @include breakpoint(sm) {
    padding: var(--space-4);
  }

  @include breakpoint(xs) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: var(--radius-card) var(--radius-card) 0 0;
    max-height: 80vh;
    overflow-y: auto;
    padding-bottom: calc(var(--space-5) + env(safe-area-inset-bottom));
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

.filters-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  margin-bottom: var(--space-4);

  @include breakpoint(sm) {
    gap: var(--space-4);
  }
}

.filter-group {
  .filter-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.priority-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  @include breakpoint(xs) {
    gap: var(--space-1);
  }
}

.priority-chip {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &.active {
    &.low {
      background: var(--success);
      color: white;
    }

    &.medium {
      background: var(--warning);
      color: var(--primary-bg);
    }

    &.high {
      background: var(--error);
      color: white;
    }
  }

  &.low:hover {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.medium:hover {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.high:hover {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  @include breakpoint(xs) {
    flex: 1;
    min-width: calc(33.333% - var(--space-1));
    justify-content: center;
    font-size: var(--text-xs);
    padding: var(--space-2);
  }
}

.category-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  @include breakpoint(xs) {
    gap: var(--space-1);
  }
}

.category-chip {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
    border-color: var(--category-color);
  }

  &.active {
    background: var(--category-color-light);
    color: var(--category-color);
    border-color: var(--category-color);

    :deep(svg) {
      color: var(--category-color);
    }
  }

  :deep(svg) {
    color: var(--text-secondary);
    transition: color var(--duration-base);
    flex-shrink: 0;
  }

  @include breakpoint(xs) {
    flex: 1;
    min-width: calc(50% - var(--space-1));
    justify-content: center;
    font-size: var(--text-xs);
    padding: var(--space-2);

    .category-name {
      @include text-truncate;
      max-width: 80px;
    }
  }
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-8);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-button);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.2);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
}

.clear-search {
  @include button-reset;
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

// Active Filters
.active-filters {
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  @include breakpoint(xs) {
    padding-top: var(--space-3);
  }
}

.active-filters-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);

  @include breakpoint(xs) {
    font-size: var(--text-xs);
  }
}

.filter-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);

  @include breakpoint(xs) {
    gap: var(--space-1);
  }
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);
  user-select: none;
  white-space: nowrap;

  &:hover {
    background: rgba(93, 95, 239, 0.2);
    transform: scale(1.05);
  }

  &.low {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.medium {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.high {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.category-badge {
    background: rgba(93, 95, 239, 0.08);
    color: var(--text-primary);
  }

  &.search-badge {
    background: rgba(93, 95, 239, 0.05);
    color: var(--text-primary);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(svg) {
    width: 10px;
    height: 10px;
    opacity: 0.7;
    flex-shrink: 0;
  }

  @include breakpoint(xs) {
    font-size: 10px;
    padding: 3px 6px;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Light theme adjustments
[data-theme='light'] {
  .filter-bar,
  .filters-panel {
    background: var(--card-bg);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }

  .filter-trigger {
    background: rgba(0, 0, 0, 0.04);
    color: var(--text-secondary);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--text-primary);
    }

    &.active {
      background: rgba(93, 95, 239, 0.08);
      color: var(--accent-primary);
    }
  }

  .quick-filter-button {
    background: rgba(0, 0, 0, 0.04);
    color: var(--text-secondary);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
      color: var(--text-primary);
    }

    &.active {
      background: var(--accent-primary);
      color: white;
    }
  }

  .reset-filters {
    background: rgba(248, 113, 113, 0.08);
    color: var(--error);

    &:hover {
      background: rgba(248, 113, 113, 0.12);
    }
  }

  .priority-chip {
    background: rgba(0, 0, 0, 0.04);
    color: var(--text-secondary);

    &.low:hover {
      background: rgba(93, 242, 126, 0.08);
      color: var(--success);
    }

    &.medium:hover {
      background: rgba(250, 204, 21, 0.08);
      color: var(--warning);
    }

    &.high:hover {
      background: rgba(248, 113, 113, 0.08);
      color: var(--error);
    }
  }

  .category-chip {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.08);
    color: var(--text-secondary);

    &:hover {
      border-color: var(--category-color);
    }

    &.active {
      background: var(--category-color-light);
      color: var(--category-color);
      border-color: var(--category-color);
    }
  }

  .search-input {
    background: var(--surface-bg);
    border: 1px solid rgba(0, 0, 0, 0.08);
    color: var(--text-primary);

    &:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 2px rgba(93, 95, 239, 0.1);
    }

    &::placeholder {
      color: var(--text-secondary);
      opacity: 0.7;
    }
  }

  .search-icon,
  .clear-search {
    color: var(--text-secondary);
  }

  .clear-search:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .active-filters {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .active-filters-label {
    color: var(--text-secondary);
  }

  .filter-badge {
    background: rgba(93, 95, 239, 0.06);
    color: var(--accent-primary);

    &.low {
      background: rgba(93, 242, 126, 0.06);
      color: var(--success);
    }

    &.medium {
      background: rgba(250, 204, 21, 0.06);
      color: var(--warning);
    }

    &.high {
      background: rgba(248, 113, 113, 0.06);
      color: var(--error);
    }

    &.category-badge {
      background: rgba(0, 0, 0, 0.04);
      color: var(--text-primary);
    }

    &.search-badge {
      background: rgba(0, 0, 0, 0.03);
      color: var(--text-primary);
    }

    &:hover {
      &.low {
        background: rgba(93, 242, 126, 0.12);
      }

      &.medium {
        background: rgba(250, 204, 21, 0.12);
      }

      &.high {
        background: rgba(248, 113, 113, 0.12);
      }

      &.category-badge {
        background: rgba(0, 0, 0, 0.08);
      }

      &.search-badge {
        background: rgba(0, 0, 0, 0.06);
      }
    }
  }
}
</style>
