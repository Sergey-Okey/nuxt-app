<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
  clickable: false,
  loading: false,
  border: true,
})

const emit = defineEmits<{
  click: [e: MouseEvent]
}>()

const cardClasses = computed(() => [
  'glass-card',
  `glass-card--${props.variant}`,
  `glass-card--padding-${props.padding}`,
  {
    'glass-card--hoverable': props.hoverable,
    'glass-card--clickable': props.clickable,
    'glass-card--loading': props.loading,
    'glass-card--no-border': !props.border,
  },
])

const handleClick = (e: MouseEvent) => {
  if (props.clickable) {
    emit('click', e)
  }
}
</script>

<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- Скелетон при загрузке -->
    <div v-if="loading" class="card__skeleton">
      <div class="skeleton skeleton--title" />
      <div class="skeleton skeleton--text" />
      <div class="skeleton skeleton--text" />
      <div class="skeleton skeleton--text" />
    </div>

    <!-- Контент -->
    <template v-else>
      <slot name="header" />

      <div class="card__content">
        <slot />
      </div>

      <slot name="footer" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.glass-card {
  @include glass-container();
  border-radius: var(--radius-lg);
  transition: all var(--transition-medium);
  overflow: hidden;

  // Варианты
  &--default {
    background-color: var(--color-bg-secondary);
  }

  &--elevated {
    background-color: var(--color-bg-secondary);
    box-shadow: var(--shadow-glass);
  }

  &--flat {
    background-color: transparent;
    border: 1px solid var(--color-border-light);
  }

  // Отступы
  &--padding {
    &-none {
      .card__content {
        padding: 0;
      }
    }

    &-sm {
      .card__content {
        padding: var(--spacing-sm);
      }
    }

    &-md {
      .card__content {
        padding: var(--spacing-md);
      }
    }

    &-lg {
      .card__content {
        padding: var(--spacing-lg);
      }
    }

    &-xl {
      .card__content {
        padding: var(--spacing-xl);
      }
    }
  }

  // Состояния
  &--hoverable {
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);

      .dark-theme & {
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
      }
    }
  }

  &--clickable {
    cursor: pointer;

    &:active {
      transform: translateY(0);
      transition-duration: 50ms;
    }
  }

  &--loading {
    min-height: 200px;
  }

  &--no-border {
    border: none;
  }
}

.card {
  &__content {
    position: relative;
  }

  &__skeleton {
    padding: var(--spacing-lg);

    .skeleton {
      background: linear-gradient(
        90deg,
        var(--color-bg-tertiary) 25%,
        var(--color-bg-secondary) 50%,
        var(--color-bg-tertiary) 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: var(--radius-sm);

      &--title {
        height: 24px;
        width: 60%;
        margin-bottom: var(--spacing-md);
      }

      &--text {
        height: 16px;
        width: 100%;
        margin-bottom: var(--spacing-sm);

        &:last-child {
          width: 80%;
          margin-bottom: 0;
        }
      }
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  }
}

// Темная тема
.dark-theme {
  .glass-card {
    &--default {
      background-color: var(--color-bg-secondary);
    }

    &--elevated {
      background-color: var(--color-bg-secondary);
    }
  }
}
</style>
