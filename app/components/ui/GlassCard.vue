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
}

.p-sm {
  padding: 12px;
}

.p-md {
  padding: 16px;
}

.p-lg {
  padding: 24px;
}
</style>
