<template>
  <i :class="iconClasses">
    <slot />
  </i>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(
  defineProps<{
    name?: string
    size?: string | number
    spin?: boolean
  }>(),
  {
    size: '24',
    spin: false,
  }
)

const iconClasses = computed(() => [
  'icon',
  {
    'icon--spin': props.spin,
  },
])

const iconStyles = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
}))
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  flex-shrink: 0;
  line-height: 1;
}

.icon--spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
