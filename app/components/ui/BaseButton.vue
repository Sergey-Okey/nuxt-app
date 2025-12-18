<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
  icon: undefined,
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'glass-button',
  `glass-button--${props.size}`,
  `glass-button--${props.variant}`,
  {
    'glass-button--loading': props.loading,
    'glass-button--disabled': props.disabled,
    'glass-button--full-width': props.fullWidth,
    'glass-button--with-icon': props.icon,
  },
])

const handleClick = (e: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="button__loader">
      <span class="loading-spinner loading-spinner--small" />
    </span>

    <span v-else class="button__content">
      <i v-if="icon" class="button__icon" :class="icon" />
      <span v-if="$slots.default" class="button__text">
        <slot />
      </span>
    </span>
  </button>
</template>

<style scoped lang="scss">
.glass-button {
  position: relative;
  border: none;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  // Варианты размеров
  &--sm {
    height: 32px;
    padding: 0 var(--spacing-md);
    font-size: var(--font-sm);
    border-radius: var(--radius-md);
  }

  &--md {
    height: 44px;
    padding: 0 var(--spacing-lg);
    font-size: var(--font-base);
    border-radius: var(--radius-md);
  }

  &--lg {
    height: 52px;
    padding: 0 var(--spacing-xl);
    font-size: var(--font-lg);
    border-radius: var(--radius-md);
  }

  // Варианты стилей
  &--primary {
    background: rgba(var(--color-accent-high-rgb), 0.9);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover:not(.glass-button--disabled) {
      background: rgba(var(--color-accent-high-rgb), 1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active:not(.glass-button--disabled) {
      transform: translateY(0);
    }
  }

  &--secondary {
    @include glass-container();
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-light);

    &:hover:not(.glass-button--disabled) {
      background: var(--color-bg-tertiary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-glass);
    }

    &:active:not(.glass-button--disabled) {
      transform: translateY(0);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-primary);
    border: 1px solid transparent;

    &:hover:not(.glass-button--disabled) {
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-light);
    }
  }

  &--danger {
    background: rgba(var(--color-error-rgb), 0.1);
    color: var(--color-error);
    border: 1px solid rgba(var(--color-error-rgb), 0.2);

    &:hover:not(.glass-button--disabled) {
      background: rgba(var(--color-error-rgb), 0.2);
      transform: translateY(-1px);
    }

    &:active:not(.glass-button--disabled) {
      transform: translateY(0);
    }
  }

  // Состояния
  &--loading {
    cursor: wait;
    opacity: 0.8;
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--full-width {
    width: 100%;
  }

  &--with-icon {
    .button__text {
      margin-left: var(--spacing-xs);
    }
  }

  // Эффект при наведении
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0) 100%
    );
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  &:hover:not(.glass-button--disabled):not(.glass-button--loading)::after {
    opacity: 1;
  }
}

.button {
  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
  }

  &__text {
    line-height: 1;
  }
}

// Темная тема
.dark-theme {
  .glass-button {
    &--primary {
      background: rgba(236, 240, 241, 0.9);
      color: var(--color-bg-primary);

      &:hover:not(.glass-button--disabled) {
        background: rgba(236, 240, 241, 1);
      }
    }
  }
}
</style>
