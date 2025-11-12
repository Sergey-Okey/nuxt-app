<template>
  <div class="page-content">
    <div class="container">
      <div class="content-card">
        <h2>Профиль</h2>
        <p>Страница профиля работает ✅</p>

        <div class="profile-section">
          <div class="profile-header">
            <div class="profile-avatar">
              <span>С</span>
            </div>
            <div class="profile-info">
              <h3>Сергей</h3>
              <p>sergey@example.com</p>
            </div>
          </div>

          <div class="profile-actions">
            <div
              class="action-item"
              v-for="action in actions"
              :key="action.label"
            >
              <Icon :name="action.icon" size="20" />
              <span>{{ action.label }}</span>
              <Icon name="lucide:chevron-right" size="16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const actions = [
  { icon: 'lucide:settings', label: 'Настройки' },
  { icon: 'lucide:bell', label: 'Уведомления' },
  { icon: 'lucide:moon', label: 'Тема' },
  { icon: 'lucide:help-circle', label: 'Помощь' },
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

.profile-section {
  margin-top: var(--space-5);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  margin-bottom: var(--space-5);
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: var(--gradient-primary);
  @include flex-center;
  font-weight: var(--font-bold);
  font-size: var(--text-xl);
  color: white;
  box-shadow: var(--glow-primary);
}

.profile-info {
  h3 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-1);
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    margin: 0;
  }
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-base);
  transition: all var(--duration-base);

  &:hover {
    background: var(--card-bg);
    transform: translateX(4px);
  }

  :deep(svg:first-child) {
    color: var(--text-secondary);
  }

  :deep(svg:last-child) {
    color: var(--text-muted);
    margin-left: auto;
  }

  span {
    color: var(--text-primary);
    font-weight: var(--font-medium);
  }
}
</style>
