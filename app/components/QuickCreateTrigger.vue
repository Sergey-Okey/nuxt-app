<template>
  <div class="quick-create-wrapper">
    <button
      class="icon-button"
      @click="toggleQuickCreate"
      title="Быстрое создание"
    >
      <Icon name="lucide:plus" size="20" />
    </button>

    <QuickCreateModal
      v-if="showQuickCreate"
      @close="showQuickCreate = false"
      @created="handleTaskCreated"
    />
  </div>
</template>

<script setup lang="ts">
const showQuickCreate = ref(false)

const toggleQuickCreate = () => {
  showQuickCreate.value = !showQuickCreate.value
}

const handleTaskCreated = (task: any) => {
  console.log('Task created:', task)
  // Можно добавить уведомление о успешном создании
}

// Close when clicking outside
onClickOutside(document.body, () => {
  if (showQuickCreate.value) {
    showQuickCreate.value = false
  }
})
</script>

<style scoped lang="scss">
.quick-create-wrapper {
  position: relative;
}
</style>
