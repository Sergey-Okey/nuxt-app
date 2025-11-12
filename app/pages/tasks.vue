<template>
  <div class="page-content">
    <div class="container">
      <div class="content-card">
        <h2>Мои задачи</h2>
        <p>Страница задач работает ✅</p>

        <div class="task-list">
          <div class="task-item" v-for="i in 4" :key="i">
            <Icon name="lucide:circle" size="16" />
            <span>Пример задачи {{ i }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Tasks page content
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-bg);
  border-radius: var(--radius-base);

  :deep(svg) {
    color: var(--text-secondary);
  }

  span {
    color: var(--text-primary);
  }
}
</style>
