<template>
  <div v-if="timerStore.state.isVisible" class="timer-progress">
    <div class="timer-header">
      <h3 class="timer-title">
        <Icon name="lucide:zap" size="20" />
        <span>Фокус-сессия</span>
        <button
          class="timer-close"
          @click="timerStore.hideTimer"
          title="Закрыть таймер"
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </h3>
      <div class="timer-task">{{ timerStore.state.taskTitle }}</div>
    </div>

    <div class="timer-main">
      <!-- Digital Timer Display -->
      <div class="timer-display">
        <div class="timer-time">{{ timerStore.formattedTime }}</div>
        <div class="timer-phase">Работа</div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :class="{ complete: timerStore.isComplete }"
            :style="{ width: timerStore.progress + '%' }"
          ></div>
        </div>
        <div class="progress-labels">
          <span class="progress-current">{{ elapsedMinutes }} мин</span>
          <span class="progress-total">{{ estimatedMinutes }} мин</span>
        </div>
      </div>

      <!-- Dots Progress -->
      <div class="dots-progress">
        <div
          v-for="dot in totalDots"
          :key="dot"
          class="progress-dot"
          :class="{
            active: dot <= completedDots,
            current: dot === currentDot,
            last: dot === totalDots,
          }"
        ></div>
      </div>

      <!-- Controls -->
      <div class="timer-controls">
        <button
          v-if="!timerStore.state.isRunning"
          class="control-button primary"
          @click="startTimer"
        >
          <Icon name="lucide:play" size="16" />
          <span>{{ timerStore.currentTime > 0 ? 'Продолжить' : 'Старт' }}</span>
        </button>
        <button
          v-else
          class="control-button warning"
          @click="timerStore.pauseTimer"
        >
          <Icon name="lucide:pause" size="16" />
          <span>Пауза</span>
        </button>
        <button class="control-button secondary" @click="timerStore.resetTimer">
          <Icon name="lucide:rotate-ccw" size="16" />
          <span>Сброс</span>
        </button>
        <button
          class="control-button success"
          @click="timerStore.completeTimer"
        >
          <Icon name="lucide:check" size="16" />
          <span>Завершить</span>
        </button>
      </div>
    </div>

    <div class="timer-info">
      <div class="info-item">
        <Icon name="lucide:target" size="16" />
        <span>Цель: {{ estimatedMinutes }} минут</span>
      </div>
      <div class="info-item">
        <Icon name="lucide:clock" size="16" />
        <span>Прошло: {{ elapsedMinutes }} минут</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timerStore = useTimerStore()

// Вычисляемые свойства
const estimatedMinutes = computed(() => {
  return Math.floor(timerStore.state.totalTime / 60)
})

const elapsedMinutes = computed(() => {
  return Math.floor(timerStore.currentTime / 60)
})

// Точки прогресса
const totalDots = ref(10)

const completedDots = computed(() => {
  return Math.floor((timerStore.progress / 100) * totalDots.value)
})

const currentDot = computed(() => {
  const dot = Math.ceil((timerStore.progress / 100) * totalDots.value)
  return dot === 0 ? 1 : dot
})

// Методы
const startTimer = () => {
  if (timerStore.currentTime > 0) {
    timerStore.continueTimer()
  } else if (timerStore.state.taskId) {
    timerStore.continueTimer()
  }
}
</script>

<style scoped lang="scss">
.timer-progress {
  @include card;
  padding: var(--space-5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin: 0;
}

.timer-header {
  margin-bottom: var(--space-4);
  text-align: center;
  position: relative;
}

.timer-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--accent-primary);
  margin-bottom: var(--space-2);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.timer-close {
  @include button-reset;
  @include flex-center;
  position: absolute;
  right: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  opacity: 0.7;
  transition: all var(--duration-base);

  &:hover {
    opacity: 1;
    color: var(--error);
    background: rgba(248, 113, 113, 0.1);
  }
}

.timer-task {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  @include text-truncate;
  max-width: 250px;
  margin: 0 auto;
  padding: 0 var(--space-2);
}

.timer-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.timer-display {
  text-align: center;
  margin-bottom: var(--space-3);
}

.timer-time {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  letter-spacing: 2px;
}

.timer-phase {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 1px;
}

// Progress Bar
.progress-bar-container {
  width: 100%;
  margin-bottom: var(--space-3);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--space-2);
}

.progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 3px;
  transition: width 0.3s ease;

  &.complete {
    background: var(--success);
  }
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.progress-current {
  color: var(--accent-primary);
  font-weight: var(--font-bold);
}

.progress-total {
  color: var(--text-secondary);
}

// Dots Progress
.dots-progress {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base);

  &.active {
    background: var(--success);
  }

  &.current {
    transform: scale(1.3);
    background: var(--accent-primary);
    box-shadow: 0 0 8px var(--accent-primary);
  }

  &.last {
    background: rgba(255, 255, 255, 0.1);

    &.active {
      background: var(--success);
    }

    &.current {
      background: var(--accent-primary);
    }
  }
}

// Controls
.timer-controls {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.control-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  min-width: 80px;
  justify-content: center;

  &.primary {
    background: var(--accent-primary);
    color: white;

    &:hover {
      background: var(--accent-secondary);
      transform: translateY(-1px);
      box-shadow: var(--glow-primary);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
  }

  &.warning {
    background: var(--warning);
    color: var(--primary-bg);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }

  &.success {
    background: var(--success);
    color: white;

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }
}

.timer-info {
  display: flex;
  justify-content: space-around;
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--text-secondary);

  :deep(svg) {
    color: var(--accent-primary);
  }
}

// Light theme adjustments
[data-theme='light'] {
  .progress-bar {
    background: rgba(0, 0, 0, 0.1);
  }

  .progress-dot {
    background: rgba(0, 0, 0, 0.1);

    &.last {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .control-button.secondary {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
