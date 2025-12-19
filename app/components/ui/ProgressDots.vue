<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalTime: number // ms
  estimatedTime?: number // minutes
  stepMinutes?: number // default 5
}>()

const step = computed(() => (props.stepMinutes ?? 5) * 60 * 1000)

const filledDots = computed(() => Math.floor(props.totalTime / step.value))

const totalDots = computed(() => {
  if (!props.estimatedTime) return filledDots.value
  return Math.ceil((props.estimatedTime * 60 * 1000) / step.value)
})
</script>

<template>
  <div class="dots">
    <span
      v-for="i in totalDots"
      :key="i"
      :class="['dot', { filled: i <= filledDots }]"
    />
  </div>
</template>

<style scoped lang="scss">
.dots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transition: background $transition-base;
}

.dot.filled {
  background: $white;
}
</style>
