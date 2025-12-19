<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    :class="[
      variant === 'primary' ? 'btn-primary' : 'btn-secondary',
      { disabled },
    ]"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
button {
  min-height: 44px;
  padding: 0 20px;
  font-size: $font-sm;
}

.disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
