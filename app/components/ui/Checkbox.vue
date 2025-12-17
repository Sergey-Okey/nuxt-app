<template>
  <label :class="wrapperClasses" :style="wrapperStyles">
    <!-- Hidden native checkbox -->
    <input
      ref="inputRef"
      v-model="internalValue"
      type="checkbox"
      :class="inputClasses"
      :disabled="disabled"
      :required="required"
      :name="name"
      :value="value"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Custom checkbox -->
    <span :class="checkboxClasses">
      <span class="checkbox__indicator">
        <UiIcon v-if="isChecked" name="check" size="14" />
        <span v-else-if="indeterminate" class="checkbox__indeterminate" />
      </span>

      <!-- Label -->
      <span v-if="$slots.default || label" class="checkbox__label">
        <slot>{{ label }}</slot>
      </span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface CheckboxProps {
  // Model
  modelValue?: boolean | (string | number)[]
  value?: string | number | boolean

  // States
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  indeterminate?: boolean

  // Label
  label?: string
  name?: string

  // Styling
  size?: 'sm' | 'md' | 'lg'
  color?: string
  rounded?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  size: 'md',
  rounded: false,
  border: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | (string | number)[]]
  change: [value: boolean | (string | number)[]]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

// Check if checkbox is checked
const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value as never)
  }
  return Boolean(props.modelValue)
})

// Internal value for v-model
const internalValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

// Size mapping
const sizeClasses = {
  sm: 'checkbox--sm',
  md: 'checkbox--md',
  lg: 'checkbox--lg',
}

// Wrapper classes
const wrapperClasses = computed(() => [
  'checkbox-wrapper',
  {
    'checkbox-wrapper--disabled': props.disabled,
  },
])

// Wrapper styles for custom color
const wrapperStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.color && isChecked.value && !props.disabled) {
    styles['--checkbox-checked-bg'] = props.color
    styles['--checkbox-border-color'] = props.color
  }

  return styles
})

// Native input classes
const inputClasses = computed(() => ['checkbox__native'])

// Custom checkbox classes
const checkboxClasses = computed(() => [
  'checkbox',
  sizeClasses[props.size],
  {
    'checkbox--checked': isChecked.value,
    'checkbox--indeterminate': props.indeterminate,
    'checkbox--disabled': props.disabled,
    'checkbox--focused': isFocused.value,
    'checkbox--rounded': props.rounded,
    'checkbox--border': props.border,
    'checkbox--readonly': props.readonly,
  },
])

// Methods
const handleChange = (event: Event) => {
  if (!props.readonly) {
    emit('change', internalValue.value)
  }
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// Public methods
const focus = () => inputRef.value?.focus()
const blur = () => inputRef.value?.blur()

defineExpose({ focus, blur })
</script>

<style lang="scss" scoped>
@use '~/assets/scss/mixins' as *;
@use '~/assets/scss/variables' as *;

.checkbox-wrapper {
  display: inline-flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;

  &--disabled {
    cursor: not-allowed;
    opacity: var(--opacity-50);
  }
}

.checkbox__native {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.checkbox {
  --checkbox-bg: var(--surface-bg);
  --checkbox-border-color: var(--border-light);
  --checkbox-checked-bg: var(--text-primary);
  --checkbox-checked-color: var(--primary-bg);

  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: all var(--duration-200) var(--ease-in-out);

  // States
  &--checked {
    .checkbox__indicator {
      background: var(--checkbox-checked-bg);
      border-color: var(--checkbox-checked-bg);
      color: var(--checkbox-checked-color);
    }
  }

  &--indeterminate {
    .checkbox__indicator {
      background: var(--checkbox-checked-bg);
      border-color: var(--checkbox-checked-bg);
    }
  }

  &--disabled {
    opacity: var(--opacity-50);
    cursor: not-allowed;
  }

  &--focused {
    .checkbox__indicator {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
  }

  &--rounded {
    .checkbox__indicator {
      border-radius: var(--radius-full);
    }
  }

  &--border {
    .checkbox__indicator {
      border: 2px solid var(--checkbox-border-color);
    }
  }
}

.checkbox__indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--checkbox-bg);
  border: 2px solid var(--checkbox-border-color);
  border-radius: var(--radius-sm);
  transition: all var(--duration-200) var(--ease-in-out);
  position: relative;

  .checkbox--checked &,
  .checkbox--indeterminate & {
    border-color: transparent;
  }
}

.checkbox__label {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: var(--leading-normal);
  @include text-truncate;
}

.checkbox__indeterminate {
  width: 50%;
  height: 2px;
  background: var(--checkbox-checked-color);
  border-radius: var(--radius-full);
}

// Size variants
.checkbox--sm {
  .checkbox__indicator {
    width: 16px;
    height: 16px;
  }

  .checkbox__label {
    font-size: var(--text-sm);
  }
}

.checkbox--md {
  .checkbox__indicator {
    width: 20px;
    height: 20px;
  }
}

.checkbox--lg {
  .checkbox__indicator {
    width: 24px;
    height: 24px;
  }

  .checkbox__label {
    font-size: var(--text-lg);
  }
}

// Focus styles
.checkbox-wrapper:focus-within {
  .checkbox__indicator {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
}

// Hover effect (only when not disabled)
.checkbox-wrapper:not(.checkbox-wrapper--disabled):hover {
  .checkbox__indicator {
    border-color: var(--text-secondary);
  }

  .checkbox--checked .checkbox__indicator,
  .checkbox--indeterminate .checkbox__indicator {
    border-color: transparent;
    opacity: 0.9;
  }
}
</style>
