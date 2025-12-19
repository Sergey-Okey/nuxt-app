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
  padding: 0 16px;
  font-size: $font-sm;
  color: var(--color-text-primary);
  border-radius: $border-radius-lg;
  border: 1px solid var(--glass-border-medium);
  transition: all $transition-fast;

  &:focus {
    border-color: var(--glass-border-heavy);
    box-shadow: 0 0 0 2px var(--color-hover);
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
}
</style>
