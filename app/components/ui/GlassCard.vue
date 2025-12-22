<script setup lang="ts">
defineProps<{
  padding?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div class="glass glass-card" :class="padding ? `p-${padding}` : 'p-md'">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.glass-card {
  width: 100%;
  background: var(--glass-bg-medium);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--glass-border-medium);
  border-radius: $border-radius-xl;
  box-shadow: $shadow-md;
  transition: all $transition-base;

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }

  &.p-sm {
    padding: 16px;
  }

  &.p-md {
    padding: 20px;
  }

  &.p-lg {
    padding: 28px;
  }
}
</style>
