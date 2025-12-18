<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  placeholder?: string
  label?: string
  error?: string
  success?: boolean
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  autocomplete?: string
  min?: number | string
  max?: number | string
  step?: number | string
  maxlength?: number
  icon?: string
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  label: '',
  error: '',
  success: false,
  disabled: false,
  readonly: false,
  required: false,
  autocomplete: 'off',
  min: undefined,
  max: undefined,
  step: undefined,
  maxlength: undefined,
  icon: undefined,
  iconPosition: 'left',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [e: FocusEvent]
  blur: [e: FocusEvent]
  input: [e: Event]
  keydown: [e: KeyboardEvent]
}>()

const inputId = `input_${Math.random().toString(36).substr(2, 9)}`
const inputRef = ref<HTMLInputElement>()

const wrapperClasses = computed(() => [
  'input-wrapper',
  `input-wrapper--${props.size}`,
  {
    'input-wrapper--error': props.error,
    'input-wrapper--success': props.success,
    'input-wrapper--disabled': props.disabled,
    'input-wrapper--with-icon': props.icon,
    'input-wrapper--icon-left': props.icon && props.iconPosition === 'left',
    'input-wrapper--icon-right': props.icon && props.iconPosition === 'right',
  },
])

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', e)
}

const handleFocus = (e: FocusEvent) => emit('focus', e)
const handleBlur = (e: FocusEvent) => emit('blur', e)
const handleKeydown = (e: KeyboardEvent) => emit('keydown', e)

const focusInput = () => {
  inputRef.value?.focus()
}

defineExpose({ focusInput })
</script>

<template>
  <div :class="wrapperClasses">
    <label v-if="label" :for="inputId" class="input__label">
      {{ label }}
      <span v-if="required" class="input__required">*</span>
    </label>

    <div class="input__container">
      <i v-if="icon" class="input__icon" :class="icon" />

      <input
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :min="min"
        :max="max"
        :step="step"
        :maxlength="maxlength"
        class="glass-input"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
    </div>

    <div v-if="error" class="input__error">
      {{ error }}
    </div>

    <div
      v-if="maxlength && typeof modelValue === 'string'"
      class="input__counter"
    >
      {{ modelValue.length }} / {{ maxlength }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-wrapper {
  width: 100%;
  margin-bottom: var(--spacing-md);

  // Размеры
  &--sm {
    .glass-input {
      height: 36px;
      padding: 0 var(--spacing-md);
      font-size: var(--font-sm);
    }

    .input__label {
      font-size: var(--font-sm);
    }
  }

  &--md {
    .glass-input {
      height: 44px;
      padding: 0 var(--spacing-md);
      font-size: var(--font-base);
    }
  }

  &--lg {
    .glass-input {
      height: 52px;
      padding: 0 var(--spacing-lg);
      font-size: var(--font-lg);
    }

    .input__label {
      font-size: var(--font-lg);
    }
  }

  // Состояния
  &--error {
    .glass-input {
      border-color: var(--color-error);
      box-shadow: 0 0 0 1px rgba(var(--color-error-rgb), 0.2);

      &:focus {
        border-color: var(--color-error);
        box-shadow: 0 0 0 3px rgba(var(--color-error-rgb), 0.1);
      }
    }

    .input__error {
      color: var(--color-error);
      font-size: var(--font-sm);
      margin-top: var(--spacing-xs);
    }
  }

  &--success {
    .glass-input {
      border-color: var(--color-success);
      box-shadow: 0 0 0 1px rgba(var(--color-success-rgb), 0.2);
    }
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;

    .glass-input {
      cursor: not-allowed;
    }
  }

  // С иконкой
  &--with-icon {
    .input__container {
      position: relative;
    }

    .glass-input {
      padding-left: var(--spacing-xl);
    }

    &--icon-right {
      .glass-input {
        padding-left: var(--spacing-md);
        padding-right: var(--spacing-xl);
      }

      .input__icon {
        left: auto;
        right: var(--spacing-md);
      }
    }
  }
}

.input {
  &__label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  &__required {
    color: var(--color-error);
    margin-left: 2px;
  }

  &__container {
    position: relative;
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: var(--spacing-md);
    transform: translateY(-50%);
    color: var(--color-text-muted);
    font-size: 1.2em;
    z-index: 1;
  }

  &__error {
    color: var(--color-error);
    font-size: var(--font-sm);
    margin-top: var(--spacing-xs);
  }

  &__counter {
    text-align: right;
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }
}

.glass-input {
  @include glass-input();
  width: 100%;
  color: var(--color-text-primary);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-fast);

  &::placeholder {
    color: var(--color-text-muted);
    opacity: 0.7;
  }

  &:focus {
    outline: none;
    border-color: var(--color-border-medium);
    box-shadow: 0 0 0 3px rgba(var(--color-accent-medium-rgb), 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:read-only {
    background-color: var(--color-bg-tertiary);
  }
}
</style>
