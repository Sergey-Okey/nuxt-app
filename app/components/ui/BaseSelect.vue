<script setup lang="ts">
import { computed, ref } from 'vue'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectedOption = computed(() =>
  props.options.find((opt) => opt.value === props.modelValue)
)

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}
</script>

<template>
  <div class="base-select-wrapper">
    <div
      class="base-select-trigger glass"
      :class="{ 'is-open': isOpen, disabled }"
      @click="!disabled && (isOpen = !isOpen)"
    >
      <span class="selected-label">
        {{ selectedOption?.label || placeholder }}
      </span>
      <span class="chevron">▾</span>
    </div>

    <Transition name="slide-down">
      <div v-if="isOpen" class="base-select-dropdown glass">
        <div
          v-for="option in options"
          :key="option.value"
          class="base-select-option"
          :class="{ selected: option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.base-select-wrapper {
  position: relative;
  width: 100%;
}

.base-select-trigger {
  width: 100%;
  min-height: 44px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: $border-radius-lg;
  border: 1px solid var(--glass-border-medium);
  cursor: pointer;
  transition: all $transition-fast;
  user-select: none;

  &:hover:not(.disabled) {
    border-color: var(--glass-border-heavy);
  }

  &.is-open {
    border-color: var(--glass-border-heavy);
    box-shadow: 0 0 0 2px var(--color-hover);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .selected-label {
    font-size: $font-sm;
    color: var(--color-text-primary);
  }

  .chevron {
    font-size: $font-sm;
    color: var(--color-text-tertiary);
    transition: transform $transition-fast;
  }

  &.is-open .chevron {
    transform: rotate(180deg);
  }
}

.base-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: $z-index-dropdown;
  max-height: 200px;
  overflow-y: auto;
  border-radius: $border-radius-lg;
  border: 1px solid var(--glass-border-medium);
  box-shadow: $shadow-lg;
}

.base-select-option {
  padding: 12px 16px;
  font-size: $font-sm;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color $transition-fast;
  border-bottom: 1px solid var(--glass-border-light);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-hover);
  }

  &.selected {
    background-color: var(--color-active);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all $transition-fast;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
