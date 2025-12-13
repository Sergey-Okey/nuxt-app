<template>
  <div class="task-subtasks" :class="{ expanded }">
    <div class="subtasks-header" @click="toggleExpanded">
      <div class="header-left">
        <div class="header-icon">
          <Icon name="lucide:list-checks" size="14" />
        </div>
        <div class="header-info">
          <span class="subtasks-label">Подзадачи</span>
          <div class="subtasks-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercentage + '%' }"
              ></div>
            </div>
            <span class="progress-text"
              >{{ completedCount }}/{{ totalCount }}</span
            >
          </div>
        </div>
      </div>
      <div class="header-right">
        <Icon
          :name="expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          size="16"
          class="expand-icon"
        />
      </div>
    </div>

    <Transition name="slide-down">
      <div v-if="expanded" class="subtasks-content">
        <div v-if="subtasks.length > 0" class="subtasks-list">
          <div
            v-for="subtask in subtasks"
            :key="subtask.id"
            class="subtask-item"
            :class="{ completed: subtask.completed }"
          >
            <button
              class="subtask-toggle"
              @click="toggleSubtask(subtask.id)"
              :title="
                subtask.completed ? 'Отметить как невыполненную' : 'Выполнить'
              "
            >
              <div class="checkmark" :class="{ checked: subtask.completed }">
                <Icon v-if="subtask.completed" name="lucide:check" size="10" />
              </div>
            </button>

            <span class="subtask-title">{{ subtask.title }}</span>

            <button
              class="subtask-delete"
              @click="deleteSubtask(subtask.id)"
              title="Удалить подзадачу"
            >
              <Icon name="lucide:x" size="12" />
            </button>
          </div>
        </div>

        <div class="empty-subtasks" v-else>
          <Icon name="lucide:list-check" size="20" />
          <span>Нет подзадач</span>
        </div>

        <div class="add-subtask">
          <input
            v-model="newSubtaskTitle"
            type="text"
            placeholder="Добавить подзадачу..."
            class="add-input"
            @keyup.enter="addNewSubtask"
            @blur="handleInputBlur"
          />
          <button
            class="add-button"
            @click="addNewSubtask"
            :disabled="!newSubtaskTitle.trim()"
            :title="newSubtaskTitle.trim() ? 'Добавить' : 'Введите текст'"
          >
            <Icon name="lucide:plus" size="14" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Props {
  subtasks: Subtask[]
}

const props = defineProps<Props>()
const emit = defineEmits(['complete', 'add', 'delete'])

const expanded = ref(false)
const newSubtaskTitle = ref('')

const totalCount = computed(() => props.subtasks.length)
const completedCount = computed(
  () => props.subtasks.filter((s) => s.completed).length
)

const progressPercentage = computed(() =>
  totalCount.value > 0
    ? Math.round((completedCount.value / totalCount.value) * 100)
    : 0
)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const toggleSubtask = (id: string) => {
  emit('complete', id)
}

const deleteSubtask = (id: string) => {
  emit('delete', id)
}

const addNewSubtask = () => {
  if (newSubtaskTitle.value.trim()) {
    emit('add', newSubtaskTitle.value.trim())
    newSubtaskTitle.value = ''
  }
}

const handleInputBlur = () => {
  // Optionally add task on blur if there's text
  if (newSubtaskTitle.value.trim()) {
    addNewSubtask()
  }
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/variables';
@import '~/assets/scss/mixins';

.task-subtasks {
  margin: var(--space-3) 0;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-base);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: all var(--duration-base);

  &.expanded {
    background: rgba(255, 255, 255, 0.03);
  }
}

.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  cursor: pointer;
  user-select: none;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.header-icon {
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: rgba(119, 119, 119, 0.1);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.subtasks-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.subtasks-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.progress-bar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  min-width: 40px;
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width var(--duration-slow);
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  flex-shrink: 0;
}

.header-right {
  flex-shrink: 0;
}

.expand-icon {
  color: var(--text-secondary);
  transition: transform var(--duration-base);

  .expanded & {
    transform: rotate(180deg);
  }
}

// Subtasks Content
.subtasks-content {
  padding: 0 var(--space-3) var(--space-3);
}

.subtasks-list {
  margin-bottom: var(--space-3);
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.02);

    .subtask-delete {
      opacity: 1;
    }
  }

  &:not(:last-child) {
    margin-bottom: var(--space-1);
  }

  &.completed {
    opacity: 0.8;

    .subtask-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .checkmark {
      background: var(--success);
      border-color: var(--success);
    }
  }
}

.subtask-toggle {
  @include button-reset;
  @include flex-center;
  flex-shrink: 0;
}

.checkmark {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  @include flex-center;
  transition: all var(--duration-base);

  &.checked {
    border-color: var(--success);
    background: var(--success);
    color: white;
  }
}

.subtask-title {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: var(--leading-normal);
  @include text-truncate;
}

.subtask-delete {
  @include button-reset;
  @include flex-center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  opacity: 0;
  transition: all var(--duration-base);

  &:hover {
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

.empty-subtasks {
  @include flex-center;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);

  :deep(svg) {
    opacity: 0.5;
  }
}

.add-subtask {
  display: flex;
  gap: var(--space-2);
}

.add-input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-family-primary);
  transition: all var(--duration-base);

  &:focus {
    outline: none;
    border-color: var(--accent-primary);
    background: rgba(119, 119, 119, 0.05);
  }

  &::placeholder {
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  &:hover:not(:focus) {
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.add-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
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

// Animations
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-base) var(--ease-out);
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
  max-height: 400px;
  opacity: 1;
  transform: translateY(0);
}

// Light theme
[data-theme='light'] {
  .task-subtasks {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.05);

    &.expanded {
      background: rgba(0, 0, 0, 0.03);
    }
  }

  .subtasks-header:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .header-icon {
    background: rgba(0, 0, 0, 0.1);
  }

  .progress-bar {
    background: rgba(0, 0, 0, 0.1);
  }

  .subtask-item:hover {
    background: rgba(0, 0, 0, 0.02);
  }

  .checkmark {
    border-color: rgba(0, 0, 0, 0.2);
  }

  .add-input {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.1);

    &:hover:not(:focus) {
      border-color: rgba(0, 0, 0, 0.2);
    }
  }
}

// Mobile optimizations
@include breakpoint(xs) {
  .subtasks-header {
    padding: var(--space-2) var(--space-3);
  }

  .header-left {
    gap: var(--space-2);
  }

  .header-icon {
    width: 24px;
    height: 24px;
  }

  .subtasks-label {
    font-size: var(--text-xs);
  }

  .progress-bar {
    min-width: 30px;
  }

  .progress-text {
    font-size: 10px;
  }

  .subtask-item {
    padding: var(--space-1) var(--space-2);
  }

  .subtask-title {
    font-size: var(--text-xs);
  }

  .add-input {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
  }

  .add-button {
    width: 28px;
    height: 28px;
  }
}

// Tablet optimizations
@include breakpoint(sm) {
  .subtasks-progress {
    gap: var(--space-3);
  }

  .progress-bar {
    height: 4px;
    min-width: 60px;
  }
}

// Desktop optimizations
@include breakpoint(md) {
  .task-subtasks {
    margin: var(--space-4) 0;
  }

  .subtasks-header {
    padding: var(--space-3) var(--space-4);
  }

  .subtasks-content {
    padding: 0 var(--space-4) var(--space-4);
  }

  .subtask-item {
    padding: var(--space-2) var(--space-3);
  }

  .add-subtask {
    gap: var(--space-3);
  }

  .add-input {
    padding: var(--space-2) var(--space-4);
  }

  .add-button {
    width: 36px;
    height: 36px;
  }
}
</style>
