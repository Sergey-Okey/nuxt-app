<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  categoryId: string
  showIcon?: boolean
  showName?: boolean
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  removable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  showName: true,
  size: 'md',
  clickable: false,
  removable: false,
})

const emit = defineEmits<{
  click: []
  remove: []
}>()

// В реальном приложении здесь будет обращение к store
const category = computed(() => {
  // Заглушка - в реальности брать из store
  const categories: Record<string, any> = {
    work: {
      id: 'work',
      name: 'Работа',
      color: '#3498db',
      icon: 'icon-briefcase',
    },
    study: { id: 'study', name: 'Учеба', color: '#9b59b6', icon: 'icon-book' },
    personal: {
      id: 'personal',
      name: 'Личное',
      color: '#1abc9c',
      icon: 'icon-user',
    },
    health: {
      id: 'health',
      name: 'Здоровье',
      color: '#e74c3c',
      icon: 'icon-heart',
    },
    other: { id: 'other', name: 'Другое', color: '#95a5a6', icon: 'icon-more' },
  }

  return categories[props.categoryId] || categories.other
})

const badgeClasses = computed(() => [
  'category-badge',
  `category-badge--${props.size}`,
  `category-${category.value.id}`,
  {
    'category-badge--clickable': props.clickable,
    'category-badge--removable': props.removable,
  },
])

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const handleRemove = (e: MouseEvent) => {
  e.stopPropagation()
  emit('remove')
}
</script>

<template>
  <div :class="badgeClasses" @click="handleClick">
    <!-- Иконка -->
    <i
      v-if="showIcon && category.icon"
      class="category-badge__icon"
      :class="category.icon"
    />

    <!-- Название -->
    <span v-if="showName" class="category-badge__name">
      {{ category.name }}
    </span>

    <!-- Кнопка удаления -->
    <button
      v-if="removable"
      class="category-badge__remove"
      @click="handleRemove"
    >
      <i class="icon-close" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(var(--category-color-rgb), 0.1);
  border: 1px solid rgba(var(--category-color-rgb), 0.2);
  border-radius: var(--radius-full);
  color: var(--category-color);
  transition: all var(--transition-fast);
  user-select: none;

  // Размеры
  &--sm {
    padding: 2px var(--spacing-xs);
    font-size: var(--font-xs);

    .category-badge__icon {
      font-size: 0.8em;
    }
  }

  &--md {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-sm);
  }

  &--lg {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-base);
  }

  // Состояния
  &--clickable {
    cursor: pointer;

    &:hover {
      background-color: rgba(var(--category-color-rgb), 0.2);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &--removable {
    padding-right: var(--spacing-xs);
  }
}

.category-badge {
  &__icon {
    font-size: 1em;
    line-height: 1;
  }

  &__name {
    font-weight: var(--font-weight-medium);
    line-height: 1;
  }

  &__remove {
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
    margin-left: var(--spacing-xs);
    transition: opacity var(--transition-fast);

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 0.8em;
    }
  }
}

// Динамические цвета для категорий
@each $category, $color in $category-colors {
  .category-#{$category} {
    --category-color: var(--category-#{$category});
    --category-color-rgb: #{red($color)}, #{green($color)}, #{blue($color)};
  }
}
</style>
