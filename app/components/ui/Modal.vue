<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :style="buttonStyles"
    @click="handleClick"
  >
    <!-- Loading state -->
    <div v-if="loading" class="button__loading">
      <div class="button__spinner" :style="spinnerStyles"></div>
      <span v-if="!iconOnly" class="button__loading-text">
        {{ loadingText || label }}
      </span>
    </div>

    <!-- Normal state -->
    <div v-else class="button__content">
      <!-- Left icon -->
      <span v-if="iconLeft || $slots.iconLeft" class="button__icon-left">
        <slot name="iconLeft">
          <Icon v-if="iconLeft" :name="iconLeft" :size="iconSize" />
        </slot>
      </span>

      <!-- Label/text -->
      <span v-if="!iconOnly" class="button__label">
        <slot>{{ label }}</slot>
      </span>

      <!-- Right icon -->
      <span v-if="iconRight || $slots.iconRight" class="button__icon-right">
        <slot name="iconRight">
          <Icon v-if="iconRight" :name="iconRight" :size="iconSize" />
        </slot>
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'text' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  iconLeft?: string
  iconRight?: string
  iconOnly?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean
  rounded?: boolean
  circle?: boolean
  type?: 'button' | 'submit' | 'reset'
  color?: string
  textColor?: string
  borderColor?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  iconOnly: false,
  fullWidth: false,
  rounded: false,
  circle: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = {
  xs: 'button--xs',
  sm: 'button--sm',
  md: 'button--md',
  lg: 'button--lg',
  xl: 'button--xl',
}

const variantClasses = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  ghost: 'button--ghost',
  text: 'button--text',
  danger: 'button--danger',
}

const iconSizeMap = {
  xs: '16',
  sm: '18',
  md: '20',
  lg: '22',
  xl: '24',
}

const iconSize = computed(() => iconSizeMap[props.size])

const buttonClasses = computed(() => [
  'button',
  variantClasses[props.variant],
  sizeClasses[props.size],
  {
    'button--disabled': props.disabled,
    'button--loading': props.loading,
    'button--full-width': props.fullWidth,
    'button--rounded': props.rounded,
    'button--circle': props.circle,
    'button--icon-only': props.iconOnly,
  },
])

const buttonStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.color) {
    styles['--button-bg'] = props.color
    styles['--button-bg-hover'] = props.color
  }

  if (props.textColor) {
    styles['--button-text'] = props.textColor
  }

  if (props.borderColor) {
    styles['--button-border'] = props.borderColor
  }

  return styles
})

const spinnerStyles = computed(() => {
  const sizeMap = {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  }

  return {
    width: sizeMap[props.size],
    height: sizeMap[props.size],
    borderWidth: props.size === 'xs' ? '2px' : '3px',
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
.button {
  position: relative;
  font-family: var(--font-family-primary);
  font-weight: var(--font-medium);
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-in-out);
  border: 1px solid transparent;
  user-select: none;
  touch-action: manipulation;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;

  &:focus-visible {
    outline: 2px solid var(--text-primary);
    outline-offset: 2px;
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &--loading {
    cursor: wait;

    .button__content {
      opacity: 0;
    }
  }

  &--full-width {
    width: 100%;
  }

  &--circle {
    border-radius: 50%;
    padding: 0 !important;
    aspect-ratio: 1/1;
  }

  &--rounded {
    border-radius: var(--radius-full);
  }

  &--icon-only {
    padding: 0 !important;
    aspect-ratio: 1/1;
  }
}

// Variant styles
.button--primary {
  background: var(--text-primary);
  color: var(--primary-bg);
  border-color: var(--text-primary);

  &:not(.button--disabled):hover {
    background: var(--text-secondary);
    border-color: var(--text-secondary);
  }

  &:not(.button--disabled):active {
    background: var(--text-muted);
    border-color: var(--text-muted);
  }
}

.button--secondary {
  background: var(--surface-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-light);

  &:not(.button--disabled):hover {
    background: var(--hover-bg);
    border-color: var(--border-hover);
  }

  &:not(.button--disabled):active {
    background: var(--active-bg);
  }
}

.button--ghost {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-light);

  &:not(.button--disabled):hover {
    background: var(--hover-bg);
    border-color: var(--border-hover);
  }

  &:not(.button--disabled):active {
    background: var(--active-bg);
  }
}

.button--text {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid transparent;

  &:not(.button--disabled):hover {
    background: var(--hover-bg);
  }

  &:not(.button--disabled):active {
    background: var(--active-bg);
  }
}

.button--danger {
  background: var(--error);
  color: var(--text-primary);
  border: 1px solid var(--error);

  &:not(.button--disabled):hover {
    opacity: 0.8;
  }

  &:not(.button--disabled):active {
    opacity: 0.6;
  }
}

// Size styles
.button--xs {
  font-size: var(--text-xs);
  min-height: 28px;
  padding: var(--space-1) var(--space-3);
  gap: var(--space-1);

  &.button--circle,
  &.button--icon-only {
    width: 28px;
    min-height: 28px;
  }
}

.button--sm {
  font-size: var(--text-sm);
  min-height: 36px;
  padding: var(--space-2) var(--space-4);
  gap: var(--space-2);

  &.button--circle,
  &.button--icon-only {
    width: 36px;
    min-height: 36px;
  }
}

.button--md {
  font-size: var(--text-base);
  min-height: 44px;
  padding: var(--space-3) var(--space-5);
  gap: var(--space-2);

  &.button--circle,
  &.button--icon-only {
    width: 44px;
    min-height: 44px;
  }
}

.button--lg {
  font-size: var(--text-lg);
  min-height: 52px;
  padding: var(--space-3) var(--space-6);
  gap: var(--space-3);

  &.button--circle,
  &.button--icon-only {
    width: 52px;
    min-height: 52px;
  }
}

.button--xl {
  font-size: var(--text-xl);
  min-height: 60px;
  padding: var(--space-4) var(--space-8);
  gap: var(--space-3);

  &.button--circle,
  &.button--icon-only {
    width: 60px;
    min-height: 60px;
  }
}

// Content wrapper
.button__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: inherit;
  width: 100%;
}

.button__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.button__spinner {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: currentColor;
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

.button__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  text-align: center;
}

.button__icon-left,
.button__icon-right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

// Animations
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
