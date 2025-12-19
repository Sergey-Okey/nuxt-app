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
  gap: 4px;
  padding: 4px 10px;
  border-radius: $border-radius-full;
  background-color: var(--tag-color);
  opacity: 0.8;
  transition: all $transition-fast;
  cursor: default;

  &:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
}

.tag-label {
  font-size: $font-xs;
  font-weight: 500;
  color: $color-white;
  user-select: none;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  color: $color-white;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: background-color $transition-fast;

  &:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
}
</style>
