<template>
  <TransitionGroup name="toast">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast-notification"
      :class="toast.type"
      @click="removeToast(toast.id)"
    >
      <div class="toast-icon">
        <Icon :name="toastIcon(toast.type)" size="20" />
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ toast.title }}</div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
      <button class="toast-close" @click.stop="removeToast(toast.id)">
        <Icon name="lucide:x" size="16" />
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { removeToast } = toastStore

const toastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'lucide:check-circle'
    case 'error':
      return 'lucide:alert-circle'
    case 'warning':
      return 'lucide:alert-triangle'
    case 'info':
      return 'lucide:info'
    default:
      return 'lucide:info'
  }
}
</script>

<style scoped lang="scss">
.toast-notification {
  @include card;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
  border-left: 3px solid var(--accent-primary);
  cursor: pointer;
  animation: slideInRight 0.3s ease-out;
  max-width: 400px;
  width: 100%;
  z-index: var(--z-toast);

  &:hover {
    transform: translateX(2px);
    box-shadow: var(--shadow-md);
  }

  &.success {
    border-left-color: var(--success);
    background: rgba(93, 242, 126, 0.1);
  }

  &.error {
    border-left-color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }

  &.warning {
    border-left-color: var(--warning);
    background: rgba(250, 204, 21, 0.1);
  }

  &.info {
    border-left-color: var(--accent-primary);
    background: rgba(93, 95, 239, 0.1);
  }
}

.toast-icon {
  flex-shrink: 0;

  :deep(svg) {
    color: inherit;
  }

  .success & {
    color: var(--success);
  }

  .error & {
    color: var(--error);
  }

  .warning & {
    color: var(--warning);
  }

  .info & {
    color: var(--accent-primary);
  }
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: 2px;
}

.toast-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-tight);
}

.toast-close {
  @include button-reset;
  @include flex-center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-active {
  position: absolute;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
