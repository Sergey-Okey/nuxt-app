<template>
  <i :class="iconClasses" :style="iconStyles">
    <slot />
  </i>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface IconProps {
  name?: string
  size?: string | number
  color?: string
  strokeWidth?: number
  rotate?: number
  spin?: boolean
}

const props = withDefaults(defineProps<IconProps>(), {
  size: '24',
  strokeWidth: 2,
  rotate: 0,
  spin: false,
})

const iconClasses = computed(() => [
  'ui-icon',
  {
    [`ui-icon--${props.name}`]: props.name,
    'ui-icon--spin': props.spin,
  },
])

const iconStyles = computed(() => ({
  '--icon-size':
    typeof props.size === 'number' ? `${props.size}px` : props.size,
  '--icon-color': props.color,
  '--icon-stroke': props.strokeWidth,
  '--icon-rotate': `${props.rotate}deg`,
}))
</script>

<style lang="scss" scoped>
.ui-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-size, 24px);
  height: var(--icon-size, 24px);
  color: var(--icon-color, currentColor);
  transform: rotate(var(--icon-rotate, 0deg));
  transition: transform var(--duration-200) var(--ease-in-out);
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    stroke: currentColor;
    stroke-width: var(--icon-stroke, 2);
  }

  &--spin {
    animation: icon-spin 1s linear infinite;
  }
}

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
