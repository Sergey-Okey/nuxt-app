<template>
  <div class="page-content">
    <div class="container">
      <div class="content-card">
        <h2>Главная</h2>
        <p>Главная страница работает ✅</p>

        <div class="welcome-section">
          <div class="welcome-message">
            <h3>Добро пожаловать в TaskFlow! 🚀</h3>
            <p>
              Ваш персональный помощник для управления задачами и повышения
              продуктивности.
            </p>
          </div>

          <div class="quick-stats">
            <div class="stat" v-for="stat in quickStats" :key="stat.label">
              <Icon :name="stat.icon" size="20" />
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const quickStats = [
  { icon: 'lucide:check-circle', value: '5', label: 'Задачи сегодня' },
  { icon: 'lucide:clock', value: '2ч 15м', label: 'В фокусе' },
  { icon: 'lucide:trending-up', value: '85%', label: 'Продуктивность' },
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

.welcome-section {
  margin-top: var(--space-5);
}

.welcome-message {
  text-align: center;
  margin-bottom: var(--space-6);

  h3 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-3);
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
  }
}

.quick-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);

  @include breakpoint(sm) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-card);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.stat-info {
  .stat-value {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    color: var(--text-primary);
    margin-bottom: var(--space-1);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}
</style>
