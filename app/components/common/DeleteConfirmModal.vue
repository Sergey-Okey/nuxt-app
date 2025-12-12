<template>
  <Transition name="modal">
    <div class="delete-confirm-modal" @click.self="closeModal">
      <div class="modal-container" v-motion-pop>
        <!-- Header -->
        <div class="modal-header">
          <div class="header-icon">
            <Icon name="lucide:trash-2" size="24" />
          </div>
          <h3 class="modal-title">Удалить задачу?</h3>
          <p class="modal-subtitle">
            Эта операция необратима. Задача будет удалена без возможности
            восстановления.
          </p>
        </div>

        <!-- Warning Details -->
        <div class="warning-details" v-if="taskDetails">
          <div class="warning-item">
            <Icon name="lucide:alert-circle" size="16" />
            <span>{{ taskDetails.title }}</span>
          </div>
          <div class="warning-item" v-if="taskDetails.category">
            <Icon name="lucide:folder" size="16" />
            <span>{{ taskDetails.category }}</span>
          </div>
          <div class="warning-item" v-if="taskDetails.timeSpent">
            <Icon name="lucide:clock" size="16" />
            <span>Затрачено времени: {{ taskDetails.timeSpent }}</span>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="danger-zone">
          <div class="zone-header">
            <Icon name="lucide:alert-triangle" size="16" />
            <span>Обратите внимание</span>
          </div>
          <ul class="zone-list">
            <li>Вся статистика по задаче будет удалена</li>
            <li v-if="hasSubtasks">Все подзадачи также будут удалены</li>
            <li>Восстановление данных невозможно</li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button class="action-button cancel" @click="cancel">
            <Icon name="lucide:x" size="16" />
            <span>Отмена</span>
          </button>
          <button class="action-button confirm" @click="confirm">
            <Icon name="lucide:trash-2" size="16" />
            <span>Удалить навсегда</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  taskDetails?: {
    title: string
    category?: string
    timeSpent?: string
    hasSubtasks?: boolean
  }
  hasSubtasks?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasSubtasks: false,
})

const emit = defineEmits(['confirm', 'cancel'])

const cancel = () => {
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}

const closeModal = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    cancel()
  }
}

// Close on Escape key
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    cancel()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped lang="scss">
.delete-confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 9999;
}

.modal-container {
  background: var(--card-bg);
  border-radius: var(--radius-card);
  max-width: 420px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-elevated);
  overflow: hidden;
  animation: modal-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: var(--space-6);
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-icon {
  @include flex-center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(248, 113, 113, 0.1);
  color: var(--error);
  margin: 0 auto var(--space-4);
  box-shadow: 0 0 0 8px rgba(248, 113, 113, 0.05);
  animation: pulse-icon 2s infinite;
}

@keyframes pulse-icon {
  0%,
  100% {
    box-shadow: 0 0 0 8px rgba(248, 113, 113, 0.05);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(248, 113, 113, 0.05);
  }
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: 1.3;
}

.modal-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.warning-details {
  padding: var(--space-4) var(--space-6);
  background: rgba(248, 113, 113, 0.05);
  border: 1px solid rgba(248, 113, 113, 0.1);
  margin: var(--space-4) var(--space-6);
  border-radius: var(--radius-card);
}

.warning-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  :deep(svg) {
    flex-shrink: 0;
    color: var(--error);
    opacity: 0.8;
  }
}

.danger-zone {
  padding: var(--space-4) var(--space-6);
  margin: 0 var(--space-6);
  background: rgba(248, 113, 113, 0.02);
  border: 1px solid rgba(248, 113, 113, 0.1);
  border-radius: var(--radius-card);
}

.zone-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--error);
  margin-bottom: var(--space-3);

  :deep(svg) {
    color: var(--error);
  }
}

.zone-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    position: relative;
    padding-left: var(--space-4);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--space-1);

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--error);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-button);
  font-weight: 600;
  font-size: var(--text-sm);
  transition: all var(--transition-base);

  &:active {
    transform: scale(0.98);
  }
}

.cancel {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

.confirm {
  background: var(--error);
  color: white;
  border: 1px solid var(--error);

  &:hover {
    background: #ef4444;
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.2);
  }
}

// Modal transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

// Light theme
[data-theme='light'] {
  .delete-confirm-modal {
    background: rgba(0, 0, 0, 0.6);
  }

  .modal-container {
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .warning-details {
    background: rgba(248, 113, 113, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .warning-item:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .danger-zone {
    background: rgba(248, 113, 113, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  .cancel {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.2);
    }
  }

  .modal-actions {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}

// Responsive
@include breakpoint(sm) {
  .modal-container {
    margin: var(--space-4);
  }
}

@include breakpoint(xs) {
  .modal-header,
  .warning-details,
  .danger-zone,
  .modal-actions {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
    margin-left: var(--space-4);
    margin-right: var(--space-4);
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
