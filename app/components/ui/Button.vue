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
      <span v-if="iconLeft || slots.iconLeft" class="button__icon-left">
        <slot name="iconLeft">
          <Icon v-if="iconLeft" :name="iconLeft" :size="iconSize" />
        </slot>
      </span>

      <!-- Label/text -->
      <span v-if="!iconOnly" class="button__label">
        <slot>{{ label }}</slot>
      </span>

      <!-- Right icon -->
      <span v-if="iconRight || slots.iconRight" class="button__icon-right">
        <slot name="iconRight">
          <Icon v-if="iconRight" :name="iconRight" :size="iconSize" />
        </slot>
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
const slots = useSlots()

export interface ButtonProps {
  // Variants
  variant?: 'primary' | 'secondary' | 'ghost' | 'text' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  // Content
  label?: string
  iconLeft?: string
  iconRight?: string
  iconOnly?: boolean

  // States
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  fullWidth?: boolean

  // Styling
  rounded?: boolean
  circle?: boolean
  type?: 'button' | 'submit' | 'reset'

  // Advanced
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

// Size mapping
const sizeClasses = {
  xs: 'button--xs',
  sm: 'button--sm',
  md: 'button--md',
  lg: 'button--lg',
  xl: 'button--xl',
}

// Variant mapping
const variantClasses = {
  primary: 'button--primary',
  secondary: 'button--secondary',
  ghost: 'button--ghost',
  text: 'button--text',
  danger: 'button--danger',
}

// Icon sizes based on button size
const iconSizeMap = {
  xs: '16',
  sm: '18',
  md: '20',
  lg: '22',
  xl: '24',
}

const iconSize = computed(() => iconSizeMap[props.size])

// Button classes
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

// Inline styles for custom colors
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

// Spinner styles for loading state
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
