<template>
  <article :class="cardClasses" :style="cardStyles" @click="handleClick">
    <!-- Header slot -->
    <header v-if="$slots.header || title" class="card__header">
      <slot name="header">
        <h3 v-if="title" class="card__title">
          {{ title }}
        </h3>
        <div v-if="subtitle" class="card__subtitle">
          {{ subtitle }}
        </div>
      </slot>
    </header>

    <!-- Media slot (image/video) -->
    <div v-if="$slots.media" class="card__media">
      <slot name="media" />
    </div>

    <!-- Content (default slot) -->
    <div class="card__content">
      <slot />
    </div>

    <!-- Actions slot -->
    <footer v-if="$slots.actions" class="card__actions">
      <slot name="actions" />
    </footer>

    <!-- Overlay for clickable cards -->
    <div v-if="clickable" class="card__overlay"></div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CardProps {
  // Content
  title?: string
  subtitle?: string

  // Styling
  variant?: 'default' | 'outline' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean

  // States
  clickable?: boolean
  hoverable?: boolean
  selected?: boolean
  disabled?: boolean

  // Interactive
  interactive?: boolean
  ripple?: boolean

  // Custom
  background?: string
  borderColor?: string
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
  rounded: 'md',
  shadow: 'md',
  border: true,
  ripple: true,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// Padding mapping
const paddingClasses = {
  none: 'card--padding-none',
  sm: 'card--padding-sm',
  md: 'card--padding-md',
  lg: 'card--padding-lg',
}

// Rounded mapping
const roundedClasses = {
  sm: 'card--rounded-sm',
  md: 'card--rounded-md',
  lg: 'card--rounded-lg',
  xl: 'card--rounded-xl',
  full: 'card--rounded-full',
}

// Shadow mapping
const shadowClasses = {
  none: 'card--shadow-none',
  sm: 'card--shadow-sm',
  md: 'card--shadow-md',
  lg: 'card--shadow-lg',
}

// Card classes
const cardClasses = computed(() => [
  'card',
  `card--${props.variant}`,
  paddingClasses[props.padding],
  roundedClasses[props.rounded],
  shadowClasses[props.shadow],
  {
    'card--border': props.border,
    'card--clickable': props.clickable,
    'card--hoverable': props.hoverable,
    'card--selected': props.selected,
    'card--disabled': props.disabled,
    'card--interactive': props.interactive,
    'card--has-media': props.$slots.media,
    'card--has-actions': props.$slots.actions,
  },
])

// Inline styles
const cardStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.background) {
    styles.background = props.background
  }

  if (props.borderColor) {
    styles['--card-border-color'] = props.borderColor
  }

  return styles
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)

    // Ripple effect
    if (props.ripple && props.clickable) {
      const card = event.currentTarget as HTMLElement
      const ripple = document.createElement('span')
      const rect = card.getBoundingClientRect()

      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      ripple.className = 'card__ripple'
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`

      card.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  --card-border-color: var(--border-light);
  --card-bg: var(--card-bg);
  --card-hover-bg: var(--hover-bg);

  position: relative;
  background: var(--card-bg);
  transition: all var(--duration-200) var(--ease-in-out);
  overflow: hidden;

  // Variants
  &--default {
    background: var(--card-bg);
  }

  &--outline {
    background: transparent;
    border: 1px solid var(--card-border-color);
  }

  &--flat {
    background: var(--surface-bg);
    box-shadow: none;
  }

  // Border
  &--border {
    border: 1px solid var(--card-border-color);
  }

  // States
  &--clickable {
    cursor: pointer;

    &:active:not(.card--disabled) {
      transform: translateY(1px);
    }
  }

  &--hoverable {
    &:hover:not(.card--disabled) {
      background: var(--card-hover-bg);
      box-shadow: var(--shadow-lg);
    }
  }

  &--selected {
    background: var(--selected-bg);
    border-color: var(--text-secondary);
  }

  &--disabled {
    opacity: var(--opacity-50);
    cursor: not-allowed;
    pointer-events: none;
  }

  &--interactive {
    &:hover:not(.card--disabled) {
      transform: translateY(-2px);
    }
  }
}

// Padding variants
.card--padding-none {
  .card__header,
  .card__content,
  .card__actions {
    padding: 0;
  }
}

.card--padding-sm {
  .card__header,
  .card__content,
  .card__actions {
    padding: var(--space-3);
  }
}

.card--padding-md {
  .card__header,
  .card__content,
  .card__actions {
    padding: var(--space-4);
  }
}

.card--padding-lg {
  .card__header,
  .card__content,
  .card__actions {
    padding: var(--space-6);
  }
}

// Rounded variants
.card--rounded-sm {
  border-radius: var(--radius-sm);
}

.card--rounded-md {
  border-radius: var(--radius-base);
}

.card--rounded-lg {
  border-radius: var(--radius-lg);
}

.card--rounded-xl {
  border-radius: var(--radius-xl);
}

.card--rounded-full {
  border-radius: var(--radius-full);
}

// Shadow variants
.card--shadow-none {
  box-shadow: none;
}

.card--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.card--shadow-md {
  box-shadow: var(--shadow-base);
}

.card--shadow-lg {
  box-shadow: var(--shadow-lg);
}

// Card sections
.card__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--border-light);
    padding-bottom: var(--space-4);
  }
}

.card__title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  @include text-truncate;
}

.card__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.card__media {
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  &:first-child {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }

  &:last-child {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }
}

.card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;

  &:not(:first-child) {
    padding-top: 0;
  }
}

.card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  padding-top: 0;

  &:not(:first-child) {
    border-top: 1px solid var(--border-light);
    padding-top: var(--space-4);
  }
}

// Overlay for clickable cards
.card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  background: rgba(255, 255, 255, 0.05);
  transition: opacity var(--duration-200) var(--ease-in-out);

  .card--clickable:hover & {
    opacity: 1;
  }

  .card--clickable:active & {
    opacity: 0.8;
  }
}

// Ripple effect
.card__ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple-animation 0.6s linear;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

// Responsive adjustments
@include breakpoint(sm) {
  .card--padding-md {
    .card__header,
    .card__content,
    .card__actions {
      padding: var(--space-6);
    }
  }

  .card__actions {
    gap: var(--space-4);
  }
}
</style>
