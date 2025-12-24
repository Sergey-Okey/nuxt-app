<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTimeTrackerStore } from '~/stores/timeTracker.store'
import { useTasksStore } from '~/stores/tasks.store'

const timeTracker = useTimeTrackerStore()
const tasksStore = useTasksStore()

const activeTask = computed(() => {
  if (!timeTracker.activeTaskId) return null
  return tasksStore.tasks.find((t) => t.id === timeTracker.activeTaskId)
})

const elapsedTime = computed(() => {
  if (!timeTracker.isRunning || !timeTracker.startTime) return 0
  return currentTime.value - timeTracker.startTime
})

const totalTime = computed(() => {
  if (!activeTask.value) return 0
  const sessionTime = activeTask.value.sessions.reduce(
    (sum, s) => sum + s.duration,
    0
  )
  return sessionTime + elapsedTime.value
})

const currentTime = ref(Date.now())

let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    if (timeTracker.isRunning) {
      currentTime.value = Date.now()
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})

const handlePause = () => {
  timeTracker.pause()
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const handleStop = () => {
  timeTracker.stop()
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
</script>

<template>
  <GlassCard v-if="activeTask" class="timer-component">
    <div class="timer-header">
      <h3 class="timer-task-title">{{ activeTask.title }}</h3>
      <div class="timer-time">
        <TimeDisplay :milliseconds="totalTime" format="full" />
      </div>
    </div>

    <div v-if="activeTask.description" class="timer-description">
      {{ activeTask.description }}
    </div>

    <div class="timer-actions">
      <button class="timer-btn pause" @click="handlePause">Пауза</button>
      <button class="timer-btn stop" @click="handleStop">Стоп</button>
    </div>
  </GlassCard>
</template>

<style scoped lang="scss">
.timer-component {
  padding: 24px;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.timer-task-title {
  font-size: $font-lg;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.timer-time {
  font-size: $font-xl;
  font-weight: 700;
  color: var(--color-accent);
  font-variant-numeric: tabular-nums;
}

.timer-description {
  font-size: $font-sm;
  color: var(--color-text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.timer-actions {
  display: flex;
  gap: 12px;
}

.timer-btn {
  flex: 1;
  min-height: 44px;
  padding: 0 20px;
  border-radius: $border-radius-md;
  font-size: $font-sm;
  font-weight: 500;
  transition: all $transition-fast;
  border: 1px solid var(--glass-border-medium);

  &.pause {
    background-color: var(--color-accent);
    color: var(--color-text-inverse);

    &:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
  }

  &.stop {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;

    &:hover {
      background-color: rgba(244, 67, 54, 0.2);
    }
  }
}
</style>
