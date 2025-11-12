<template>
  <div class="page-content">
    <div class="container">
      <div class="content-card">
        <h2>Аналитика</h2>
        <p>Страница аналитики работает ✅</p>

        <div class="stats-grid">
          <div class="stat-item" v-for="stat in stats" :key="stat.label">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <div class="chart-placeholder">
          <Icon name="lucide:bar-chart" size="48" />
          <p>График продуктивности</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const stats = [
  { value: '12', label: 'Выполнено задач' },
  { value: '4ч 30м', label: 'Время фокуса' },
  { value: '85%', label: 'Продуктивность' },
  { value: '7', label: 'Дней подряд' },
]
</script>

<style scoped lang="scss">
.page-content {
  padding: var(--space-4);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  @include card;
  padding: var(--space-6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  margin: var(--space-5) 0;

  @include breakpoint(sm) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-item {
  text-align: center;
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--accent-primary);
  margin-bottom: var(--space-2);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.chart-placeholder {
  @include flex-center;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-8);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  border: 2px dashed rgba(255, 255, 255, 0.1);

  :deep(svg) {
    color: var(--text-secondary);
    opacity: 0.5;
  }

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}
</style>
