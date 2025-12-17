<template>
  <div :class="wrapperClasses">
    <!-- Label -->
    <label v-if="label" :for="id" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="input__required">*</span>
    </label>

    <!-- Input container -->
    <div :class="containerClasses">
      <!-- Left slot -->
      <div v-if="$slots.left || iconLeft" class="input__left">
        <slot name="left">
          <UiIcon v-if="iconLeft" :name="iconLeft" :size="iconSize" />
        </slot>
      </div>

      <!-- Input field -->
      <component
        :is="isTextarea ? 'textarea' : 'input'"
        :id="id"
        :ref="inputRef"
        :class="inputClasses"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :rows="rows"
        :style="inputStyles"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />

      <!-- Right slot (clear button, icon, etc.) -->
      <div v-if="showClear || $slots.right || iconRight" class="input__right">
        <slot name="right">
          <!-- Clear button -->
          <UiButton
            v-if="showClear && modelValue && !disabled"
            variant="text"
            size="xs"
            icon-only
            @click="handleClear"
            class="input__clear"
          >
            <UiIcon name="close" size="16" />
          </UiButton>

          <!-- Right icon -->
          <UiIcon v-else-if="iconRight" :name="iconRight" :size="iconSize" />
        </slot>
      </div>
    </div>

    <!-- Helper text -->
    <div v-if="helperText || $slots.helper" class="input__helper">
      <slot name="helper">
        {{ helperText }}
      </slot>
    </div>

    <!-- Error message -->
    <div v-if="error" class="input__error">
      <UiIcon name="alert" size="16" class="input__error-icon" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import UiButton from './Button.vue'
import UiIcon from './Icon.vue'

export interface InputProps {
  // Basic
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  id?: string

  // Validation
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  helperText?: string
  maxlength?: number

  // Icons
  iconLeft?: string
  iconRight?: string

  // Styling
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  rounded?: boolean
  transparent?: boolean

  // Textarea
  isTextarea?: boolean
  rows?: number

  // Autocomplete
  autocomplete?: string

  // State
  clearable?: boolean
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  rows: 3,
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [value: string | number]
  change: [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  clear: []
}>()

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>()
const isFocused = ref(false)
const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`

// Computed
const showClear = computed(() => props.clearable && props.modelValue)

const iconSize = computed(() => {
  const map = { sm: '16', md: '18', lg: '20' }
  return map[props.size]
})

const wrapperClasses = computed(() => [
  'input',
  `input--${props.size}`,
  {
    'input--disabled': props.disabled,
    'input--error': props.error,
    'input--full-width': props.fullWidth,
    'input--focused': isFocused.value,
    'input--has-left': props.iconLeft || props.$slots.left,
    'input--has-right':
      props.iconRight || props.$slots.right || showClear.value,
  },
])

const labelClasses = computed(() => [
  'input__label',
  {
    'input__label--required': props.required,
  },
])

const containerClasses = computed(() => [
  'input__container',
  {
    'input__container--rounded': props.rounded,
    'input__container--transparent': props.transparent,
    'input__container--disabled': props.disabled,
    'input__container--error': props.error,
    'input__container--focused': isFocused.value,
  },
])

const inputClasses = computed(() => [
  'input__field',
  {
    'input__field--textarea': props.isTextarea,
  },
])

const inputStyles = computed(() => ({
  'min-height': props.isTextarea ? `${props.rows * 1.5}em` : undefined,
}))

// Methods
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('input', target.value)
  emit('update:modelValue', target.value)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('change', target.value)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleClear = () => {
  emit('input', '')
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Expose methods
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
})
</script>

<style lang="scss" scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: left;

  &--full-width {
    width: 100%;
  }

  &--disabled {
    opacity: var(--opacity-50);
    cursor: not-allowed;
  }

  &--error {
    .input__container {
      border-color: var(--error);

      &--focused {
        border-color: var(--error);
        box-shadow: 0 0 0 1px var(--error);
      }
    }

    .input__label {
      color: var(--error);
    }
  }
}

.input__label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-1);

  &--required {
    &::after {
      content: '*';
      color: var(--error);
    }
  }
}

.input__container {
  display: flex;
  align-items: center;
  background: var(--surface-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-base);
  transition: all var(--duration-200) var(--ease-in-out);
  position: relative;

  &--rounded {
    border-radius: var(--radius-full);
  }

  &--transparent {
    background: transparent;
  }

  &--focused {
    border-color: var(--border-hover);
    box-shadow: var(--shadow-sm);
  }

  &--error {
    border-color: var(--error);
  }

  &--disabled {
    opacity: var(--opacity-50);
    cursor: not-allowed;
  }
}

.input__left,
.input__right {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.input__left {
  padding-left: var(--space-4);
}

.input__right {
  padding-right: var(--space-4);
}

.input__field {
  flex: 1;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0 var(--space-4);
  color: var(--text-primary);
  font-family: var(--font-family-primary);
  font-size: inherit;
  line-height: var(--leading-normal);
  resize: none;
  outline: none;
  min-height: 44px; // Touch target

  &::placeholder {
    color: var(--text-muted);
    opacity: 1;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &--textarea {
    padding: var(--space-3) var(--space-4);
    min-height: auto;
    line-height: var(--leading-relaxed);
  }
}

.input__clear {
  opacity: 0.5;
  transition: opacity var(--duration-200) var(--ease-in-out);

  &:hover {
    opacity: 1;
  }
}

.input__helper {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.input__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--error);
  margin-top: var(--space-1);
}

.input__error-icon {
  flex-shrink: 0;
}

// Size variants
.input--sm {
  .input__field {
    font-size: var(--text-sm);
    min-height: 36px;
    padding: 0 var(--space-3);
  }

  .input__left {
    padding-left: var(--space-3);
  }

  .input__right {
    padding-right: var(--space-3);
  }
}

.input--lg {
  .input__field {
    font-size: var(--text-lg);
    min-height: 52px;
    padding: 0 var(--space-5);
  }

  .input__left {
    padding-left: var(--space-5);
  }

  .input__right {
    padding-right: var(--space-5);
  }
}
</style>
