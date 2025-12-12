<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="confirm-modal">
      <div class="modal-header">
        <div class="modal-icon" :class="type">
          <Icon :name="iconName" size="20" />
        </div>
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="$emit('cancel')">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <p class="modal-message">{{ message }}</p>

      <div class="modal-actions">
        <button class="modal-button cancel" @click="$emit('cancel')">
          {{ cancelText }}
        </button>
        <button
          class="modal-button confirm"
          :class="type"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'success' | 'info'
}

withDefaults(defineProps<Props>(), {
  confirmText: 'Подтвердить',
  cancelText: 'Отмена',
  type: 'info',
})

const iconName = computed(() => {
  const icons = {
    danger: 'lucide:trash-2',
    warning: 'lucide:alert-triangle',
    success: 'lucide:check-circle',
    info: 'lucide:info',
  }
  return icons[props.type] || 'lucide:info'
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  z-index: var(--z-modal);
  @include flex-center;
  padding: var(--space-4);
  animation: fadeIn 0.2s ease-out;
}

.confirm-modal {
  @include card;
  max-width: 400px;
  width: 100%;
  padding: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.modal-icon {
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);

  &.danger {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.warning {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.success {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.info {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent);
  }
}

.modal-title {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.modal-message {
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.modal-button {
  @include button-reset;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &.cancel {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.05);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  &.confirm {
    color: white;

    &.danger {
      background: var(--error);

      &:hover {
        background: #ef4444;
      }
    }

    &.warning {
      background: var(--warning);

      &:hover {
        background: #eab308;
      }
    }

    &.success {
      background: var(--success);

      &:hover {
        background: #4ade80;
      }
    }

    &.info {
      background: var(--accent);

      &:hover {
        background: var(--accent-secondary);
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
