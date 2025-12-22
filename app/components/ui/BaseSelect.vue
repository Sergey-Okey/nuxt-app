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
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: $border-radius-xl;
  border: 1.5px solid var(--color-border-light);
  cursor: pointer;
  transition: all $transition-base;
  user-select: none;
  background: var(--glass-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: $font-md;

  &:hover:not(.disabled) {
    border-color: var(--color-border-medium);
    background: var(--glass-bg-medium);
  }

  &.is-open {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb, 0, 0, 0), 0.1);
    background: var(--glass-bg-medium);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .selected-label {
    font-size: $font-md;
    color: var(--color-text-primary);
    font-weight: 400;
  }

  .chevron {
    font-size: $font-lg;
    color: var(--color-text-tertiary);
    transition: transform $transition-base;
    line-height: 1;
  }

  &.is-open .chevron {
    transform: rotate(180deg);
  }
}

.base-select-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: $z-index-dropdown;
  max-height: 240px;
  overflow-y: auto;
  border-radius: $border-radius-xl;
  border: 1.5px solid var(--color-border-light);
  box-shadow: $shadow-xl;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  overflow: hidden;
  
  // Для темной темы используем более темный фон
  [data-theme='dark'] &,
  .dark &,
  html.dark & {
    background: rgba(0, 0, 0, 0.85);
  }
}

.base-select-option {
  padding: 16px 20px;
  font-size: $font-md;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all $transition-fast;
  border-bottom: 1px solid var(--color-border-light);
  font-weight: 400;

  &:first-child {
    border-top-left-radius: $border-radius-xl;
    border-top-right-radius: $border-radius-xl;
  }

  &:last-child {
    border-bottom: none;
    border-bottom-left-radius: $border-radius-xl;
    border-bottom-right-radius: $border-radius-xl;
  }

  &:hover {
    background-color: var(--color-hover);
  }

  &.selected {
    background-color: var(--color-active);
    font-weight: 500;
    color: var(--color-accent-dark);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all $transition-base;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
