<template>
  <div class="layout">
    <!-- Fixed Header -->
    <AppHeader />

    <!-- Main Content Area - pages will be rendered here -->
    <main class="layout-main">
      <slot />
    </main>

    <!-- Fixed Bottom Navigation -->
    <AppBottomNav />
  </div>
</template>

<script setup lang="ts">
// Components will be auto-imported
</script>

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
