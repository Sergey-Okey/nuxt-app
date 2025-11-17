<template>
  <div class="page-content">
    <div class="container">
      <!-- Animated Hero Section -->
      <HeroSection />

      <!-- Stats with Animation -->
      <StatsOverview />

      <!-- Main Content Grid with Stagger Animation -->
      <div class="content-grid">
        <TodayTasks />
        <ProductivityMetrics />
        <UpcomingDeadlines />
        <ProductivityTips />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auto imports from components folder
</script>

<style scoped lang="scss">
.page-content {
  padding-top: var(--space-3);
  padding-bottom: calc(var(--space-16) + var(--space-4));
  animation: fadeIn 0.6s ease-out;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  animation: slideUp 0.8s ease-out 0.3s both;

  @include breakpoint(lg) {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
