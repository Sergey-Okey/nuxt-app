<template>
  <div class="page-content">
    <div class="container">
      <div class="content-card">
        <h2>Таймер Pomodoro</h2>
        <p>Страница таймера работает ✅</p>

        <div class="timer-preview">
          <div class="timer-circle">
            <span class="timer-text">25:00</span>
          </div>
          <div class="timer-controls">
            <button class="timer-button">
              <Icon name="lucide:play" size="20" />
              Старт
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Timer page content
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
  text-align: center;
}

.timer-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.timer-circle {
  width: 200px;
  height: 200px;
  border-radius: var(--radius-full);
  border: 4px solid var(--accent-primary);
  @include flex-center;
  box-shadow: var(--glow-primary);
}

.timer-text {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.timer-controls {
  display: flex;
  gap: var(--space-3);
}

.timer-button {
  @include button-reset;
  @include flex-center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--glow-primary);
  }
}
</style>
