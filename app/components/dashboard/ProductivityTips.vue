<template>
  <div class="content-section productivity-tips">
    <div class="section-header">
      <h2>Советы по продуктивности</h2>
    </div>

    <div class="tips-list">
      <div
        v-for="tip in productivityTips"
        :key="tip.id"
        class="tip-item"
        :class="tip.type"
      >
        <div class="tip-icon">
          <Icon :name="tip.icon" size="20" />
        </div>
        <div class="tip-content">
          <h3>{{ tip.title }}</h3>
          <p>{{ tip.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const productivityTips = [
  {
    id: '1',
    type: 'tip',
    icon: 'lucide:clock',
    title: 'Метод Pomodoro',
    description:
      'Работайте интервалами по 25 минут с 5-минутными перерывами для лучшей концентрации',
  },
  {
    id: '2',
    type: 'warning',
    icon: 'lucide:bell',
    title: 'Уведомления',
    description: 'Отключите ненужные уведомления для минимизации отвлечений',
  },
  {
    id: '3',
    type: 'success',
    icon: 'lucide:target',
    title: 'Цели на день',
    description:
      'Ставьте 3 главные цели на день для лучшей фокусировки и приоритизации',
  },
]
</script>

<style scoped lang="scss">
.tips-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid transparent;
  transition: all var(--duration-base);

  &:hover {
    transform: translateX(4px);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.tip {
    border-left-color: var(--accent-primary);
  }

  &.warning {
    border-left-color: var(--warning);
  }

  &.success {
    border-left-color: var(--success);
  }
}

.tip-icon {
  @include flex-center;
  flex-shrink: 0;
  margin-top: 2px;

  :deep(svg) {
    color: var(--text-secondary);
  }
}

.tip-content {
  flex: 1;

  h3 {
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
  }
}
</style>
