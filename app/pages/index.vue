<script setup lang="ts">
// Редирект на страницу задач
onMounted(() => {
  navigateTo('/tasks')
})
</script>

<template>
  <div class="loading">
    <div class="spinner" />
  </div>
</template>

<style scoped lang="scss">
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-accent-medium);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
