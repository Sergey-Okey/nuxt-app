<template>
  <article :class="cardClasses" :style="cardStyles" @click="handleClick">
    <!-- Header slot -->
    <header v-if="slots.header || title" class="card__header">
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
    <div v-if="slots.media" class="card__media">
      <slot name="media" />
    </div>

    <!-- Content (default slot) -->
    <div class="card__content">
      <slot />
    </div>

    <!-- Actions slot -->
    <footer v-if="slots.actions" class="card__actions">
      <slot name="actions" />
    </footer>

    <!-- Overlay for clickable cards -->
    <div v-if="clickable" class="card__overlay"></div>
  </article>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
const slots = useSlots()

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
    'card--has-media': slots.media,
    'card--has-actions': slots.actions,
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
