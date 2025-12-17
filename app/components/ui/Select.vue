<template>
  <div :class="wrapperClasses" :style="wrapperStyles">
    <!-- Label -->
    <label v-if="label" :for="id" class="select__label">
      {{ label }}
      <span v-if="reqred" class="select__reqred">*</span>
    </label>

    <!-- Select container -->
    <div
      ref="containerRef"
      :class="containerClasses"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      tabindex="0"
    >
      <!-- Selected value display -->
      <div class="select__selected">
        <!-- Left icon -->
        <div v-if="icon" class="select__icon">
          <Icon :name="icon" size="18" />
        </div>

        <!-- Placeholder or selected value -->
        <span v-if="!selectedOptionLabel" class="select__placeholder">
          {{ placeholder || 'Select...' }}
        </span>

        <!-- Selected option -->
        <span v-else class="select__value">
          <slot name="selected" :option="selectedOption">
            {{ selectedOptionLabel }}
          </slot>
        </span>
      </div>

      <!-- Dropdown indicator -->
      <div class="select__indicator">
        <Icon :name="isOpen ? 'chevron-up' : 'chevron-down'" size="18" />
      </div>
    </div>

    <!-- Dropdown -->
    <Transition name="select-dropdown">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        :class="dropdownClasses"
        :style="dropdownStyles"
      >
        <!-- Search input -->
        <div v-if="searchable" class="select__search">
          <Input
            v-model="searchQuery"
            placeholder="Search..."
            size="sm"
            icon-left="search"
            @keydown.stop
            @keydown.enter="selectFirstOption"
          />
        </div>

        <!-- Options list -->
        <div class="select__options">
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionKey(option, index)"
            :class="optionClasses(option)"
            @click="selectOption(option)"
            @mouseenter="hoveredIndex = index"
          >
            <slot name="option" :option="option">
              <div class="select__option-content">
                <!-- Option icon -->
                <div v-if="option.icon" class="select__option-icon">
                  <Icon :name="option.icon" size="16" />
                </div>

                <!-- Option label -->
                <div class="select__option-label">
                  {{ getOptionLabel(option) }}
                </div>

                <!-- Selected checkmark -->
                <div
                  v-if="isOptionSelected(option)"
                  class="select__option-check"
                >
                  <Icon name="check" size="16" />
                </div>
              </div>

              <!-- Option description -->
              <div v-if="option.description" class="select__option-description">
                {{ option.description }}
              </div>
            </slot>
          </div>

          <!-- No results -->
          <div v-if="filteredOptions.length === 0" class="select__no-results">
            No options found
          </div>
        </div>
      </div>
    </Transition>

    <!-- Helper text -->
    <div v-if="helperText" class="select__helper">
      {{ helperText }}
    </div>

    <!-- Error message -->
    <div v-if="error" class="select__error">
      <Icon name="alert" size="16" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
export interface SelectOption {
  value: string | number
  label: string
  icon?: string
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  // Model
  modelValue?: string | number | (string | number)[]
  options: SelectOption[]

  // Configuration
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  placeholder?: string
  label?: string
  helperText?: string
  error?: string
  reqred?: boolean
  disabled?: boolean

  // Styling
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  fullWidth?: boolean
  icon?: string

  // Customization
  optionLabel?: string
  optionValue?: string
  trackBy?: string
}

const props = withDefaults(defineProps<SelectProps>(), {
  size: 'md',
  multiple: false,
  searchable: false,
  clearable: false,
  fullWidth: false,
  optionLabel: 'label',
  optionValue: 'value',
  trackBy: 'value',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
  change: [value: string | number | (string | number)[]]
  open: []
  close: []
}>()

// Refs
const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const isOpen = ref(false)
const searchQuery = ref('')
const hoveredIndex = ref(-1)
const id = `select-${Math.random().toString(36).substr(2, 9)}`

// Computed
const selectedOption = computed(() => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return props.options.filter((option) => values.includes(option.value))
  }
  return props.options.find((option) => option.value === props.modelValue)
})

const selectedOptionLabel = computed(() => {
  if (Array.isArray(selectedOption.value)) {
    return selectedOption.value.map((opt) => opt.label).join(', ')
  }
  return selectedOption.value?.label || ''
})

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(
    (option) =>
      getOptionLabel(option).toLowerCase().includes(query) ||
      option.description?.toLowerCase().includes(query)
  )
})

// Classes
const wrapperClasses = computed(() => [
  'select',
  `select--${props.size}`,
  {
    'select--full-width': props.fullWidth,
    'select--disabled': props.disabled,
    'select--error': props.error,
    'select--open': isOpen.value,
  },
])

const wrapperStyles = computed(() => {
  const styles: Record<string, string> = {}
  if (props.fullWidth) {
    styles.width = '100%'
  }
  return styles
})

const containerClasses = computed(() => [
  'select__container',
  {
    'select__container--rounded': props.rounded,
    'select__container--open': isOpen.value,
    'select__container--error': props.error,
    'select__container--disabled': props.disabled,
    'select__container--has-icon': props.icon,
  },
])

const dropdownClasses = computed(() => [
  'select__dropdown',
  {
    'select__dropdown--searchable': props.searchable,
  },
])

const dropdownStyles = computed(() => {
  if (!containerRef.value) return {}

  const rect = containerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  // Position dropdown above if not enough space below
  return {
    top: spaceBelow < 200 && spaceAbove > 200 ? 'auto' : '100%',
    bottom: spaceBelow < 200 && spaceAbove > 200 ? '100%' : 'auto',
    width: `${rect.width}px`,
  }
})

// Methods
const getOptionLabel = (option: SelectOption) => option.label
const getOptionKey = (option: SelectOption, index: number) =>
  option.value.toString() || index.toString()

const isOptionSelected = (option: SelectOption) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return values.includes(option.value)
  }
  return props.modelValue === option.value
}

const optionClasses = (option: SelectOption) => [
  'select__option',
  {
    'select__option--selected': isOptionSelected(option),
    'select__option--disabled': option.disabled,
    'select__option--hovered':
      filteredOptions.value.findIndex((o) => o.value === option.value) ===
      hoveredIndex.value,
  },
]

const toggleDropdown = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('open')
    searchQuery.value = ''
    hoveredIndex.value = -1
    nextTick(() => {
      dropdownRef.value?.focus()
    })
  } else {
    emit('close')
  }
}

const selectOption = (option: SelectOption) => {
  if (option.disabled) return

  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? props.modelValue : []
    const newValue = currentValue.includes(option.value)
      ? currentValue.filter((v) => v !== option.value)
      : [...currentValue, option.value]

    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    isOpen.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggleDropdown()
      break

    case 'Escape':
      if (isOpen.value) {
        event.preventDefault()
        isOpen.value = false
      }
      break

    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        navigateOptions(1)
      }
      break

    case 'ArrowUp':
      event.preventDefault()
      if (!isOpen.value) {
        toggleDropdown()
      } else {
        navigateOptions(-1)
      }
      break
  }
}

const navigateOptions = (direction: number) => {
  const options = filteredOptions.value.filter((option) => !option.disabled)
  if (options.length === 0) return

  let newIndex = hoveredIndex.value + direction
  if (newIndex < 0) newIndex = options.length - 1
  if (newIndex >= options.length) newIndex = 0

  const selectedOption = options[newIndex]
  if (selectedOption) {
    hoveredIndex.value = filteredOptions.value.findIndex(
      (option) => option.value === selectedOption.value
    )
  }

  // Scroll to hovered option
  nextTick(() => {
    const optionEl = dropdownRef.value?.querySelector(
      `.select__option:nth-child(${hoveredIndex.value + 1})`
    ) as HTMLElement
    optionEl?.scrollIntoView({ block: 'nearest' })
  })
}

const selectFirstOption = () => {
  if (
    hoveredIndex.value >= 0 &&
    hoveredIndex.value < filteredOptions.value.length
  ) {
    const option = filteredOptions.value[hoveredIndex.value]
    if (option) {
      selectOption(option)
    }
  }
}

// Click outside to close
const handleClickOutside = (event: MouseEvent) => {
  if (
    isOpen.value &&
    containerRef.value &&
    !containerRef.value.contains(event.target as Node) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose methods
const focus = () => containerRef.value?.focus()
const blur = () => containerRef.value?.blur()

defineExpose({ focus, blur, open: () => toggleDropdown() })
</script>
