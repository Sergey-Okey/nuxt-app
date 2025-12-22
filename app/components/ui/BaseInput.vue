<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  placeholder: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const value = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})
</script>

<template>
  <div class="base-input-wrapper">
    <input
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-input glass"
    />
  </div>
</template>

<style scoped lang="scss">
.base-input-wrapper {
  width: 100%;
}

.base-input {
  width: 100%;
  min-height: 44px;
  padding: 0 20px;
  font-size: $font-md;
  color: var(--color-text-primary);
  border-radius: $border-radius-xl;
  border: 1.5px solid var(--color-border-light);
  transition: all $transition-base;
  background: var(--glass-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: inherit;

  &:hover:not(:disabled) {
    border-color: var(--color-border-medium);
    background: var(--glass-bg-medium);
  }

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb, 0, 0, 0), 0.1);
    outline: none;
    background: var(--glass-bg-medium);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: var(--color-bg-secondary);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
    font-weight: 400;
  }
}
</style>
