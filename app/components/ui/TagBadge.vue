<script setup lang="ts">
interface Props {
  label: string
  color: string
  removable?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  remove: []
}>()

const handleRemove = (e: MouseEvent) => {
  e.stopPropagation()
  emit('remove')
}
</script>

<template>
  <div class="tag-badge" :style="{ '--tag-color': color }">
    <span class="tag-label">{{ label }}</span>
    <button
      v-if="removable"
      class="tag-remove"
      @click="handleRemove"
      aria-label="Remove tag"
    >
      ×
    </button>
  </div>
</template>

<style scoped lang="scss">
.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: $border-radius-full;
  background-color: var(--tag-color);
  opacity: 0.9;
  transition: all $transition-base;
  cursor: default;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    opacity: 1;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
}

.tag-label {
  font-size: $font-sm;
  font-weight: 500;
  color: $color-white;
  user-select: none;
  letter-spacing: 0.3px;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.25);
  color: $color-white;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all $transition-fast;
  font-weight: 600;

  &:hover {
    background-color: rgba(0, 0, 0, 0.4);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}
</style>
