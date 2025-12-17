<template>
  <div class="layout">
    <!-- Main Content Area - pages will be rendered here -->
    <main class="layout-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.layout {
  min-height: 100vh;
  background: var(--primary-bg);
  display: flex;
  flex-direction: column;
}

.layout-main {
  flex: 1;
  padding-bottom: 80px; // Space for bottom nav
  overflow-x: hidden;
}
</style>
