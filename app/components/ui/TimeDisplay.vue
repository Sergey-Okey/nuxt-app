<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  milliseconds: number
  format?: 'short' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'short',
})

const formattedTime = computed(() => {
  const ms = props.milliseconds
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (props.format === 'short') {
    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м`
    }
    if (minutes > 0) {
      return `${minutes}м`
    }
    return `${seconds}с`
  }

  // full format
  const h = String(hours).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
})
</script>

<template>
  <span class="time-display" :class="`format-${props.format}`">
    {{ formattedTime }}
  </span>
</template>

<style scoped lang="scss">
.time-display {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  font-weight: 500;

  &.format-short {
    font-size: $font-sm;
  }

  &.format-full {
    font-size: $font-md;
    font-family: 'JetBrains Mono', monospace;
  }
}
</style>

