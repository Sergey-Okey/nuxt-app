<template>
  <div :class="wrapperClasses">
    <!-- Label -->
    <label v-if="label" :for="id" :class="labelClasses">
      {{ label }}
      <span v-if="reqred" class="input__reqred">*</span>
    </label>

    <!-- Input container -->
    <div :class="containerClasses">
      <!-- Left slot -->
      <div v-if="slots.left || iconLeft" class="input__left">
        <slot name="left">
          <Icon v-if="iconLeft" :name="iconLeft" :size="iconSize" />
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
        :reqred="reqred"
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
      <div v-if="showClear || slots.right || iconRight" class="input__right">
        <slot name="right">
          <!-- Clear button -->
          <Button
            v-if="showClear && modelValue && !disabled"
            variant="text"
            size="xs"
            icon-only
            @click="handleClear"
            class="input__clear"
          >
            <Icon name="close" size="16" />
          </Button>

          <!-- Right icon -->
          <Icon v-else-if="iconRight" :name="iconRight" :size="iconSize" />
        </slot>
      </div>
    </div>

    <!-- Helper text -->
    <div v-if="helperText || slots.helper" class="input__helper">
      <slot name="helper">
        {{ helperText }}
      </slot>
    </div>

    <!-- Error message -->
    <div v-if="error" class="input__error">
      <Icon name="alert" size="16" class="input__error-icon" />
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, nextTick } from 'vue'
const slots = useSlots()

export interface InputProps {
  // Basic
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  id?: string

  // Validation
  reqred?: boolean
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
    'input--has-left': props.iconLeft || slots.left,
    'input--has-right': props.iconRight || slots.right || showClear.value,
  },
])

const labelClasses = computed(() => [
  'input__label',
  {
    'input__label--reqred': props.reqred,
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
