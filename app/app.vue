<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <div class="toast-container">
      <ToastNotification />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}
</style>
