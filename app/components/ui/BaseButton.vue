<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    :class="[
      'base-button',
      `variant-${variant || 'primary'}`,
      `size-${size || 'md'}`,
      { disabled, 'full-width': fullWidth },
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all $transition-base;
  user-select: none;
  font-family: inherit;
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  // Размеры
  &.size-sm {
    min-height: 36px;
    padding: 0 16px;
    font-size: $font-xs;
    border-radius: $border-radius-md;
  }

  &.size-md {
    min-height: 44px;
    padding: 0 24px;
    font-size: $font-sm;
    border-radius: $border-radius-lg;
  }

  &.size-lg {
    min-height: 52px;
    padding: 0 32px;
    font-size: $font-md;
    border-radius: $border-radius-xl;
  }

  // Варианты
  &.variant-primary {
    background: var(--color-accent);
    color: var(--color-text-inverse);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover:not(.disabled) {
      background: var(--color-accent-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active:not(.disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  &.variant-secondary {
    background: var(--glass-bg-medium);
    color: var(--color-text-primary);
    border: 1px solid var(--glass-border-medium);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    &:hover:not(.disabled) {
      background: var(--glass-bg-heavy);
      border-color: var(--glass-border-heavy);
      transform: translateY(-1px);
    }

    &:active:not(.disabled) {
      transform: translateY(0);
    }
  }

  &.variant-outline {
    background: transparent;
    color: var(--color-text-primary);
    border: 1.5px solid var(--color-border-medium);

    &:hover:not(.disabled) {
      background: var(--color-hover);
      border-color: var(--color-border-heavy);
    }
  }

  &.variant-ghost {
    background: transparent;
    color: var(--color-text-primary);

    &:hover:not(.disabled) {
      background: var(--color-hover);
    }
  }

  &.full-width {
    width: 100%;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Эффект ripple при клике
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active:not(.disabled)::before {
    width: 300px;
    height: 300px;
  }
}
</style>
