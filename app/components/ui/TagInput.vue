<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

interface Tag {
  id: string
  name: string
  color: string
}

interface Props {
  modelValue: string[]
  availableTags: Tag[]
  placeholder?: string
  maxTags?: number
  allowNewTags?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  availableTags: () => [],
  placeholder: 'Добавьте теги...',
  maxTags: 10,
  allowNewTags: true,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [tags: string[]]
  'tag-added': [tag: Tag]
  'tag-removed': [tagId: string]
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref('')
const isFocused = ref(false)
const showSuggestions = ref(false)
const selectedSuggestionIndex = ref(-1)

// Отфильтрованные теги для автодополнения
const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) {
    return props.availableTags.filter(
      (tag) => !props.modelValue.includes(tag.id)
    )
  }

  const searchLower = inputValue.value.toLowerCase()
  return props.availableTags.filter(
    (tag) =>
      !props.modelValue.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchLower)
  )
})

// Выбранные теги
const selectedTags = computed(() => {
  return props.availableTags.filter((tag) => props.modelValue.includes(tag.id))
})

// Добавление тега
const addTag = (tagId?: string) => {
  if (props.disabled) return

  const tagToAdd = tagId || inputValue.value.trim()

  if (!tagToAdd || props.modelValue.length >= props.maxTags) return

  // Если это существующий тег
  const existingTag = props.availableTags.find(
    (t) => t.id === tagToAdd || t.name === tagToAdd
  )
  if (existingTag) {
    if (!props.modelValue.includes(existingTag.id)) {
      emit('update:modelValue', [...props.modelValue, existingTag.id])
      emit('tag-added', existingTag)
      inputValue.value = ''
      showSuggestions.value = false
    }
  }
  // Если разрешено создание новых тегов
  else if (props.allowNewTags) {
    const newTag: Tag = {
      id: `tag_${Date.now()}`,
      name: tagToAdd,
      color: getRandomColor(),
    }

    emit('update:modelValue', [...props.modelValue, newTag.id])
    emit('tag-added', newTag)
    inputValue.value = ''
    showSuggestions.value = false
  }
}

// Удаление тега
const removeTag = (tagId: string) => {
  if (props.disabled) return

  const newTags = props.modelValue.filter((id) => id !== tagId)
  emit('update:modelValue', newTags)
  emit('tag-removed', tagId)
}

// Обработка клавиш
const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
      e.preventDefault()
      if (selectedSuggestionIndex.value >= 0) {
        addTag(filteredSuggestions.value[selectedSuggestionIndex.value].id)
      } else {
        addTag()
      }
      selectedSuggestionIndex.value = -1
      break

    case 'Backspace':
      if (!inputValue.value && props.modelValue.length > 0) {
        const lastTag = props.modelValue[props.modelValue.length - 1]
        removeTag(lastTag)
      }
      break

    case 'ArrowUp':
      e.preventDefault()
      if (showSuggestions.value && filteredSuggestions.value.length > 0) {
        selectedSuggestionIndex.value = Math.max(
          selectedSuggestionIndex.value - 1,
          -1
        )
      }
      break

    case 'ArrowDown':
      e.preventDefault()
      if (showSuggestions.value && filteredSuggestions.value.length > 0) {
        selectedSuggestionIndex.value = Math.min(
          selectedSuggestionIndex.value + 1,
          filteredSuggestions.value.length - 1
        )
      }
      break

    case 'Escape':
      showSuggestions.value = false
      selectedSuggestionIndex.value = -1
      break
  }
}

// Генерация случайного цвета для нового тега
const getRandomColor = () => {
  const colors = [
    '#3498db',
    '#9b59b6',
    '#1abc9c',
    '#e74c3c',
    '#f39c12',
    '#2ecc71',
    '#e67e22',
    '#34495e',
    '#16a085',
    '#8e44ad',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Фокус на инпут
const focusInput = () => {
  inputRef.value?.focus()
}

// Следим за фокусом
watch(isFocused, (focused) => {
  if (focused) {
    showSuggestions.value = filteredSuggestions.value.length > 0
  } else {
    setTimeout(() => {
      showSuggestions.value = false
    }, 200)
  }
})

// Следим за изменением inputValue
watch(inputValue, (value) => {
  showSuggestions.value =
    value.trim().length > 0 && filteredSuggestions.value.length > 0
  selectedSuggestionIndex.value = -1
})

defineExpose({ focusInput })

onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <div class="tag-input">
    <!-- Выбранные теги -->
    <div class="tag-input__tags">
      <div
        v-for="tag in selectedTags"
        :key="tag.id"
        class="tag-input__tag"
        :style="{ '--tag-color': tag.color }"
      >
        <span class="tag-input__tag-name">
          {{ tag.name }}
        </span>

        <button
          class="tag-input__tag-remove"
          :disabled="disabled"
          @click="removeTag(tag.id)"
        >
          <i class="icon-close" />
        </button>
      </div>
    </div>

    <!-- Поле ввода -->
    <div class="tag-input__wrapper">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled || modelValue.length >= maxTags"
        class="tag-input__input"
        @keydown="handleKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Подсказка о максимальном количестве тегов -->
      <div v-if="modelValue.length >= maxTags" class="tag-input__max-hint">
        Максимум {{ maxTags }} тегов
      </div>
    </div>

    <!-- Автодополнение -->
    <Transition name="slide-up">
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="tag-input__suggestions"
      >
        <div
          v-for="(tag, index) in filteredSuggestions"
          :key="tag.id"
          class="tag-input__suggestion"
          :class="{
            'tag-input__suggestion--selected':
              index === selectedSuggestionIndex,
          }"
          @mousedown="addTag(tag.id)"
        >
          <span
            class="tag-input__suggestion-color"
            :style="{ backgroundColor: tag.color }"
          />

          <span class="tag-input__suggestion-name">
            {{ tag.name }}
          </span>

          <span class="tag-input__suggestion-hint"> Enter для выбора </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.tag-input {
  position: relative;
  width: 100%;

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(var(--tag-color-rgb), 0.1);
    border: 1px solid rgba(var(--tag-color-rgb), 0.2);
    border-radius: var(--radius-full);
    color: var(--tag-color);
    font-size: var(--font-sm);
    transition: all var(--transition-fast);

    &:hover {
      background-color: rgba(var(--tag-color-rgb), 0.2);
    }
  }

  &__tag-name {
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }

  &__tag-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: none;
    color: inherit;
    opacity: 0.7;
    cursor: pointer;
    padding: 0;
    transition: opacity var(--transition-fast);

    &:hover {
      opacity: 1;
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    i {
      font-size: 0.8em;
    }
  }

  &__wrapper {
    position: relative;
  }

  &__input {
    @include glass-input();
    width: 100%;
    color: var(--color-text-primary);
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border-light);
    transition: all var(--transition-fast);

    &:focus {
      outline: none;
      border-color: var(--color-border-medium);
      box-shadow: 0 0 0 3px rgba(var(--color-accent-medium-rgb), 0.1);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__max-hint {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    font-size: var(--font-xs);
    color: var(--color-text-muted);
  }

  &__suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: var(--spacing-xs);
    @include glass-container();
    border-radius: var(--radius-md);
    max-height: 200px;
    overflow-y: auto;
    z-index: var(--z-dropdown);
    @include custom-scrollbar();

    .dark-theme & {
      @include custom-scrollbar('dark');
    }
  }

  &__suggestion {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover,
    &--selected {
      background-color: var(--color-bg-tertiary);
    }
  }

  &__suggestion-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__suggestion-name {
    flex: 1;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }

  &__suggestion-hint {
    font-size: var(--font-xs);
    color: var(--color-text-muted);
    opacity: 0.7;
  }
}

// Анимации
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--transition-medium);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// Темная тема
.dark-theme {
  .tag-input {
    &__input {
      background-color: var(--color-bg-secondary);
      border-color: var(--color-border-light);
    }
  }
}
</style>
