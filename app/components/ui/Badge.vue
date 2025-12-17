<template>
  <span :class="badgeClasses" :style="badgeStyles">
    <!-- Icon -->
    <Icon v-if="icon" :name="icon" :size="iconSize" class="badge-icon" />

    <!-- Content -->
    <span class="badge-content">
      <slot>
        {{ label }}
      </slot>
    </span>

    <!-- Close button -->
    <Button
      v-if="closable"
      variant="text"
      size="xs"
      icon-only
      class="badge-close"
      @click="handleClose"
      aria-label="Remove"
    >
      <Icon name="close" size="12" />
    </Button>
  </span>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
export interface BadgeProps {
  // Content
  label?: string | number

  // Variants
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'default' | 'pill' | 'dot'

  // Icons
  icon?: string
  iconOnly?: boolean

  // States
  closable?: boolean
  disabled?: boolean
  interactive?: boolean

  // Customization
  color?: string
  textColor?: string
}

const props = withDefaults(defineProps<BadgeProps>(), {
  variant: 'default',
  size: 'md',
  shape: 'default',
  iconOnly: false,
})

const emit = defineEmits<{
  close: []
  click: [event: MouseEvent]
}>()

// Icon size mapping
const iconSize = computed(() => {
  const map = { xs: '12', sm: '14', md: '16', lg: '18' }
  return map[props.size]
})

// Classes
const badgeClasses = computed(() => [
  'badge',
  `badge--${props.variant}`,
  `badge--${props.size}`,
  `badge--${props.shape}`,
  {
    'badge--icon-only': props.iconOnly,
    'badge--closable': props.closable,
    'badge--disabled': props.disabled,
    'badge--interactive': props.interactive,
    'badge--has-icon': props.icon,
  },
])

// Styles
const badgeStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.color) {
    styles.background = props.color
  }

  if (props.textColor) {
    styles.color = props.textColor
  }

  return styles
})

const handleClose = (event: MouseEvent) => {
  event.stopPropagation()
  emit('close')
}
</script>

<style lang="scss" scoped>
.badge {
  --badge-bg: var(--surface-bg);
  --badge-text: var(--text-secondary);
  --badge-border: var(--border-light);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  background: var(--badge-bg);
  color: var(--badge-text);
  border: 1px solid var(--badge-border);
  font-weight: var(--font-medium);
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;

  // Variants
  &--default {
    --badge-bg: var(--surface-bg);
    --badge-text: var(--text-secondary);
  }

  &--primary {
    --badge-bg: var(--text-primary);
    --badge-text: var(--primary-bg);
    --badge-border: transparent;
  }

  &--success {
    --badge-bg: var(--success);
    --badge-text: var(--primary-bg);
    --badge-border: transparent;
  }

  &--warning {
    --badge-bg: var(--warning);
    --badge-text: var(--primary-bg);
    --badge-border: transparent;
  }

  &--error {
    --badge-bg: var(--error);
    --badge-text: var(--primary-bg);
    --badge-border: transparent;
  }

  &--info {
    --badge-bg: var(--info);
    --badge-text: var(--primary-bg);
    --badge-border: transparent;
  }

  // Shapes
  &--pill {
    border-radius: var(--radius-full);
  }

  &--dot {
    padding: 0;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);

    .badge-content,
    .badge-icon,
    .badge-close {
      display: none;
    }
  }

  // States
  &--disabled {
    opacity: var(--opacity-50);
    pointer-events: none;
  }

  &--interactive {
    cursor: pointer;
    transition: all var(--duration-200) var(--ease-in-out);

    &:hover:not(.badge--disabled) {
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }

    &:active:not(.badge--disabled) {
      transform: translateY(0);
    }
  }

  // Icon only
  &--icon-only {
    .badge-content {
      display: none;
    }
  }
}

.badge-icon {
  flex-shrink: 0;
}

.badge-content {
  font-size: inherit;
  @include text-truncate;
}

.badge-close {
  flex-shrink: 0;
  margin-left: calc(var(--space-1) * -1);
  margin-right: calc(var(--space-1) * -1);
  opacity: 0.7;
  transition: opacity var(--duration-200) var(--ease-in-out);

  &:hover {
    opacity: 1;
  }
}

// Size variants
.badge--xs {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  min-height: 20px;
  gap: var(--space-1);

  &.badge--icon-only {
    padding: var(--space-1);
    min-width: 20px;
  }
}

.badge--sm {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-3);
  min-height: 24px;

  &.badge--icon-only {
    padding: var(--space-1);
    min-width: 24px;
  }
}

.badge--md {
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  min-height: 28px;

  &.badge--icon-only {
    padding: var(--space-2);
    min-width: 28px;
  }
}

.badge--lg {
  font-size: var(--text-base);
  padding: var(--space-2) var(--space-4);
  min-height: 32px;

  &.badge--icon-only {
    padding: var(--space-2);
    min-width: 32px;
  }
}

// Default shape (if not pill or dot)
.badge:not(.badge--pill):not(.badge--dot) {
  border-radius: var(--radius-sm);
}
</style>
