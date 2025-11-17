<template>
  <div class="stats-overview">
    <div
      v-for="(stat, index) in quickStats"
      :key="stat.label"
      class="stat-card"
      :class="stat.color"
    >
      <div class="stat-icon">
        <Icon :name="stat.icon" size="20" />
      </div>

      <div class="stat-content">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>

        <div v-if="stat.trend" class="stat-trend" :class="stat.trend.type">
          <Icon :name="stat.trend.icon" size="12" />
          <span>{{ stat.trend.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const statsStore = useStatsStore()
const quickStats = computed(() => statsStore.quickStats)
</script>

<style scoped lang="scss">
.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-6);

  @include breakpoint(sm) {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-5);
  }
}

.stat-card {
  @include card;
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--duration-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.success {
    border-left: 3px solid var(--success);
  }

  &.accent {
    border-left: 3px solid var(--accent-primary);
  }

  &.warning {
    border-left: 3px solid var(--warning);
  }

  &.error {
    border-left: 3px solid var(--error);
  }
}

.stat-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-card);
  margin-bottom: var(--space-3);

  .stat-card.success & {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  .stat-card.accent & {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }

  .stat-card.warning & {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  .stat-card.error & {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  width: fit-content;

  &.positive {
    background: rgba(93, 242, 126, 0.1);
    color: var(--success);
  }

  &.negative {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }
}
</style>
