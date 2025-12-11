<template>
  <div class="tasks-filters">
    <!-- Search and Filter Bar -->
    <div class="filters-bar">
      <div class="search-container">
        <Icon name="lucide:search" size="18" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск задач..."
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">
          <Icon name="lucide:x" size="14" />
        </button>
      </div>

      <div class="filter-controls">
        <button
          class="filter-toggle"
          :class="{ active: showFilters || hasActiveFilters }"
          @click="toggleFilters"
        >
          <Icon name="lucide:filter" size="18" />
          <span v-if="hasActiveFilters" class="filter-badge">
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- Expandable Filters -->
    <Transition name="slide-down">
      <div v-if="showFilters" class="expanded-filters">
        <div class="filters-content">
          <!-- Status Filter -->
          <div class="filter-section">
            <div class="section-header" @click="toggleSection('status')">
              <h4 class="section-title">
                <Icon name="lucide:check-circle" size="16" />
                <span>Статус</span>
              </h4>
              <Icon
                :name="
                  expandedSections.status
                    ? 'lucide:chevron-up'
                    : 'lucide:chevron-down'
                "
                size="16"
              />
            </div>

            <Transition name="slide-down">
              <div v-if="expandedSections.status" class="section-content">
                <div class="filter-options">
                  <button
                    v-for="status in statusOptions"
                    :key="status.value"
                    class="filter-option"
                    :class="{ active: filters.status === status.value }"
                    @click="setFilter('status', status.value)"
                  >
                    <div class="option-checkbox">
                      <Icon
                        v-if="filters.status === status.value"
                        name="lucide:check"
                        size="14"
                      />
                    </div>
                    <span class="option-label">{{ status.label }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Category Filter -->
          <div class="filter-section">
            <div class="section-header" @click="toggleSection('category')">
              <h4 class="section-title">
                <Icon name="lucide:folder" size="16" />
                <span>Категория</span>
              </h4>
              <Icon
                :name="
                  expandedSections.category
                    ? 'lucide:chevron-up'
                    : 'lucide:chevron-down'
                "
                size="16"
              />
            </div>

            <Transition name="slide-down">
              <div v-if="expandedSections.category" class="section-content">
                <div class="filter-options">
                  <button
                    class="filter-option"
                    :class="{ active: filters.category === 'all' }"
                    @click="setFilter('category', 'all')"
                  >
                    <div class="option-checkbox">
                      <Icon
                        v-if="filters.category === 'all'"
                        name="lucide:check"
                        size="14"
                      />
                    </div>
                    <span class="option-label">Все категории</span>
                  </button>

                  <button
                    v-for="category in categories"
                    :key="category.id"
                    class="filter-option"
                    :class="{ active: filters.category === category.id }"
                    @click="setFilter('category', category.id)"
                  >
                    <div class="option-checkbox">
                      <Icon
                        v-if="filters.category === category.id"
                        name="lucide:check"
                        size="14"
                      />
                    </div>
                    <div class="option-icon" :style="{ color: category.color }">
                      {{ category.icon }}
                    </div>
                    <span class="option-label">{{ category.name }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Priority Filter -->
          <div class="filter-section">
            <div class="section-header" @click="toggleSection('priority')">
              <h4 class="section-title">
                <Icon name="lucide:flag" size="16" />
                <span>Приоритет</span>
              </h4>
              <Icon
                :name="
                  expandedSections.priority
                    ? 'lucide:chevron-up'
                    : 'lucide:chevron-down'
                "
                size="16"
              />
            </div>

            <Transition name="slide-down">
              <div v-if="expandedSections.priority" class="section-content">
                <div class="filter-options">
                  <button
                    v-for="priority in priorityOptions"
                    :key="priority.value"
                    class="filter-option"
                    :class="{ active: filters.priority === priority.value }"
                    @click="setFilter('priority', priority.value)"
                  >
                    <div class="option-checkbox">
                      <Icon
                        v-if="filters.priority === priority.value"
                        name="lucide:check"
                        size="14"
                      />
                    </div>
                    <div
                      class="priority-indicator"
                      :class="priority.value"
                    ></div>
                    <span class="option-label">{{ priority.label }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Active Filters -->
          <div v-if="hasActiveFilters" class="active-filters">
            <div class="active-filters-header">
              <span class="filters-title">Активные фильтры</span>
              <button class="clear-all" @click="resetFilters">
                Очистить все
              </button>
            </div>

            <div class="filters-tags">
              <span
                v-if="filters.status !== 'all'"
                class="filter-tag"
                @click="setFilter('status', 'all')"
              >
                {{ getStatusLabel(filters.status) }}
                <Icon name="lucide:x" size="12" />
              </span>

              <span
                v-if="filters.category !== 'all'"
                class="filter-tag"
                @click="setFilter('category', 'all')"
              >
                {{ getCategoryLabel(filters.category) }}
                <Icon name="lucide:x" size="12" />
              </span>

              <span
                v-if="filters.priority !== 'all'"
                class="filter-tag"
                @click="setFilter('priority', 'all')"
              >
                {{ getPriorityLabel(filters.priority) }}
                <Icon name="lucide:x" size="12" />
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="filter-actions">
            <button class="action-button apply" @click="applyFilters">
              <Icon name="lucide:check" size="16" />
              <span>Применить фильтры</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce'

const tasksStore = useTasksStore()

// State
const showFilters = ref(false)
const searchQuery = ref('')
const expandedSections = ref({
  status: true,
  category: true,
  priority: true,
})

// Options
const statusOptions = [
  { value: 'all', label: 'Все задачи' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

const priorityOptions = [
  { value: 'all', label: 'Все приоритеты' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
]

// Computed
const categories = computed(() => tasksStore.categories)
const filters = computed(() => tasksStore.filters)

const hasActiveFilters = computed(() => {
  return (
    filters.value.status !== 'all' ||
    filters.value.category !== 'all' ||
    filters.value.priority !== 'all'
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.status !== 'all') count++
  if (filters.value.category !== 'all') count++
  if (filters.value.priority !== 'all') count++
  return count
})

// Methods
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

const toggleSection = (section: keyof typeof expandedSections.value) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const setFilter = (type: 'status' | 'category' | 'priority', value: string) => {
  tasksStore.setFilter(type, value)
}

const resetFilters = () => {
  tasksStore.resetFilters()
}

const applyFilters = () => {
  showFilters.value = false
}

const handleSearch = debounce(() => {
  // TODO: Implement search functionality
  console.log('Searching for:', searchQuery.value)
}, 300)

const clearSearch = () => {
  searchQuery.value = ''
}

const getStatusLabel = (status: string) => {
  const option = statusOptions.find((opt) => opt.value === status)
  return option?.label || status
}

const getCategoryLabel = (categoryId: string) => {
  if (categoryId === 'all') return 'Все категории'
  const category = categories.value.find((cat) => cat.id === categoryId)
  return category?.name || categoryId
}

const getPriorityLabel = (priority: string) => {
  const option = priorityOptions.find((opt) => opt.value === priority)
  return option?.label || priority
}

// Close filters when clicking outside
onClickOutside(document, () => {
  if (showFilters.value) {
    showFilters.value = false
  }
})

// Initialize filters
onMounted(() => {
  // Expand all sections on mobile, collapse on desktop
  const isMobile = window.innerWidth < 768
  expandedSections.value = {
    status: !isMobile,
    category: !isMobile,
    priority: !isMobile,
  }
})
</script>

<style scoped lang="scss">
.tasks-filters {
  margin-bottom: var(--space-4);
}

// Search and Filter Bar
.filters-bar {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-button);
  color: var(--text-primary);
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

.clear-search {
  @include button-reset;
  @include flex-center;
  position: absolute;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base);

  &:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.15);
  }
}

.filter-controls {
  display: flex;
  gap: var(--space-2);
}

.filter-toggle {
  @include button-reset;
  @include flex-center;
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
  }
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  min-width: 16px;
  height: 16px;
  border-radius: 50%;
  @include flex-center;
  padding: 0 4px;
  animation: pop 0.2s ease-out;
}

@keyframes pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

// Expanded Filters
.expanded-filters {
  @include card;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.filters-content {
  padding: var(--space-4);
}

// Filter Sections
.filter-section {
  margin-bottom: var(--space-4);

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  @include button-reset;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: var(--space-2);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.section-content {
  padding-top: var(--space-3);
}

// Filter Options
.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 12px;
  border-radius: var(--radius-base);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(93, 95, 239, 0.1);
    border-color: var(--accent-primary);
  }
}

.option-checkbox {
  @include flex-center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid var(--text-secondary);
  flex-shrink: 0;

  .filter-option.active & {
    background: var(--accent-primary);
    border-color: var(--accent-primary);

    :deep(svg) {
      color: white;
    }
  }
}

.option-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.option-label {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

// Priority Indicator
.priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;

  &.high {
    background: var(--error);
  }

  &.medium {
    background: var(--warning);
  }

  &.low {
    background: var(--success);
  }

  &.all {
    background: var(--text-secondary);
  }
}

// Active Filters
.active-filters {
  margin: var(--space-4) 0;
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.filters-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.clear-all {
  @include button-reset;
  font-size: var(--text-sm);
  color: var(--accent-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: rgba(93, 95, 239, 0.1);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.2);
  }
}

.filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 6px 10px;
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);
  border-radius: 16px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(93, 95, 239, 0.2);

    :deep(svg) {
      color: var(--error);
    }
  }
}

// Filter Actions
.filter-actions {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-button);
  font-weight: var(--font-semibold);
  transition: all var(--duration-base);

  &.apply {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-1px);
      box-shadow: var(--glow-primary);
    }
  }
}

// Animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}

// Light theme adjustments
[data-theme='light'] {
  .search-input {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:focus {
      background: rgba(93, 95, 239, 0.05);
    }
  }

  .filter-toggle {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .expanded-filters {
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .filter-option {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .active-filters {
    background: rgba(0, 0, 0, 0.05);
  }

  .filter-actions {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }
}

// Mobile optimizations
@include breakpoint(sm) {
  .filters-bar {
    flex-direction: column;
  }

  .filter-options {
    grid-template-columns: 1fr;
  }

  .section-content {
    padding-left: var(--space-2);
  }
}

@include breakpoint(xs) {
  .filters-content {
    padding: var(--space-3);
  }

  .filter-section {
    margin-bottom: var(--space-3);
  }
}
</style>
