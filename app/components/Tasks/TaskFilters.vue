<template>
  <div class="task-filters">
    <div class="filters-header">
      <h3>Фильтры</h3>
      <button class="clear-button" @click="resetFilters">
        <Icon name="lucide:x" size="14" />
        <span>Сбросить</span>
      </button>
    </div>

    <div class="filter-group">
      <label>Статус</label>
      <div class="filter-options">
        <button
          v-for="status in statusOptions"
          :key="status.value"
          class="filter-button"
          :class="{ active: filters.status === status.value }"
          @click="setFilter('status', status.value)"
        >
          <Icon :name="status.icon" size="14" />
          <span>{{ status.label }}</span>
        </button>
      </div>
    </div>

    <div class="filter-group">
      <label>Приоритет</label>
      <div class="filter-options">
        <button
          v-for="priority in priorityOptions"
          :key="priority.value"
          class="filter-button"
          :class="{ active: filters.priority === priority.value }"
          @click="setFilter('priority', priority.value)"
        >
          <Icon :name="priority.icon" size="14" />
          <span>{{ priority.label }}</span>
        </button>
      </div>
    </div>

    <div class="filter-group"></div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()

// Options
const statusOptions = [
  { value: 'all', label: 'Все', icon: 'lucide:list' },
  { value: 'active', label: 'Активные', icon: 'lucide:circle' },
  { value: 'completed', label: 'Выполненные', icon: 'lucide:check-circle' },
]

const priorityOptions = [
  { value: 'all', label: 'Все', icon: 'lucide:layers' },
  { value: 'high', label: 'Высокий', icon: 'lucide:alert-circle' },
  { value: 'medium', label: 'Средний', icon: 'lucide:alert-triangle' },
  { value: 'low', label: 'Низкий', icon: 'lucide:arrow-down-circle' },
]

// Computed
const filters = computed(() => tasksStore.filters)
const categories = computed(() => tasksStore.categories)

// Methods
const setFilter = (type: 'status' | 'category' | 'priority', value: string) => {
  tasksStore.setFilter(type, value)
}

const resetFilters = () => {
  tasksStore.resetFilters()
}
</script>

<style scoped lang="scss">
.task-filters {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.filters-header {
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

.clear-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);

  &:hover {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

.filter-group {
  margin-bottom: var(--space-4);

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
  }
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  text-align: left;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &.active {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
    font-weight: var(--font-medium);

    :deep(svg) {
      color: var(--accent-primary);
    }
  }

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.filter-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
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
</style>
