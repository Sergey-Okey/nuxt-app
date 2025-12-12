<template>
  <div class="timer-progress" :class="{ hidden: isHidden }">
    <!-- Header - всегда видимый -->
    <div class="timer-header" @click="isHidden ? restoreTimer() : null">
      <div class="timer-header-content">
        <div class="timer-info-compact">
          <Icon name="lucide:zap" size="16" />
          <span class="timer-task-compact">{{ task.title }}</span>
          <div class="timer-time-compact" v-if="!isHidden">
            {{ formattedTime }}
          </div>
        </div>
        <div class="timer-header-actions">
          <button
            v-if="!isHidden"
            class="hide-timer"
            @click.stop="toggleHideTimer"
            title="Свернуть таймер"
          >
            <Icon name="lucide:chevron-up" size="16" />
          </button>
          <button
            v-else
            class="restore-timer"
            @click.stop="restoreTimer"
            title="Развернуть таймер"
          >
            <Icon name="lucide:chevron-down" size="16" />
            <span>Продолжить</span>
          </button>
        </div>
      </div>

      <!-- Progress mini-bar -->
      <div class="mini-progress-bar" v-if="!isHidden">
        <div
          class="mini-progress-fill"
          :style="{ width: progress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Main content - скрывается при isHidden -->
    <div v-if="!isHidden" class="timer-main">
      <!-- Digital Timer Display -->
      <div class="timer-display">
        <div class="timer-time-large">{{ formattedTime }}</div>
        <div class="timer-phase">{{ phaseText }}</div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
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
          }"
        ></div>
      </div>

      <!-- Controls -->
      <div class="timer-controls">
        <template v-if="!isCompleted">
          <button
            v-if="!isRunning"
            class="control-button primary"
            @click="startTimer"
          >
            <Icon name="lucide:play" size="16" />
            <span>Старт</span>
          </button>
          <button v-else class="control-button warning" @click="pauseTimer">
            <Icon name="lucide:pause" size="16" />
            <span>Пауза</span>
          </button>
          <button class="control-button secondary" @click="resetTimer">
            <Icon name="lucide:rotate-ccw" size="16" />
            <span>Сброс</span>
          </button>
        </template>
        <button class="control-button success" @click="completeTimer">
          <Icon name="lucide:check" size="16" />
          <span>{{ isCompleted ? 'Готово' : 'Завершить' }}</span>
        </button>
      </div>
    </div>

    <!-- Info - скрывается при isHidden -->
    <div v-if="!isHidden" class="timer-info">
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
import { useToast } from '~/composables/useToast'

interface Props {
  task: any
}

const props = defineProps<Props>()
const toast = useToast()

// Emit для обновления в родительском компоненте
const emit = defineEmits<{
  'timer-hidden': [id: string]
  'timer-restored': [id: string]
}>()

// Timer state - сохраняем в localStorage
const timerState = useLocalStorage(`timer_${props.task.id}`, {
  isRunning: false,
  elapsedTime: 0, // in seconds
  isCompleted: false,
  isHidden: false,
  lastUpdated: Date.now(),
})

// Reactive state из localStorage
const isRunning = ref(timerState.value.isRunning)
const elapsedTime = ref(timerState.value.elapsedTime)
const isCompleted = ref(timerState.value.isCompleted)
const isHidden = ref(timerState.value.isHidden)

// Константы
const totalTime = ref(props.task.estimatedMinutes * 60 || 25 * 60) // 25 minutes default

// Computed
const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedTime.value / 60)
  const seconds = elapsedTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
})

const progress = computed(() => {
  return Math.min(100, (elapsedTime.value / totalTime.value) * 100)
})

const estimatedMinutes = computed(() => {
  return Math.floor(totalTime.value / 60)
})

const elapsedMinutes = computed(() => {
  return Math.floor(elapsedTime.value / 60)
})

const phaseText = computed(() => {
  return isCompleted.value ? 'Завершено' : 'Работа'
})

// Dots for visual progress
const totalDots = ref(10)
const completedDots = computed(() => {
  return Math.floor((progress.value / 100) * totalDots.value)
})

const currentDot = computed(() => {
  return Math.ceil((progress.value / 100) * totalDots.value)
})

// Timer logic
let timerInterval: NodeJS.Timeout | null = null

// Сохраняем состояние в localStorage
const saveState = () => {
  timerState.value = {
    isRunning: isRunning.value,
    elapsedTime: elapsedTime.value,
    isCompleted: isCompleted.value,
    isHidden: isHidden.value,
    lastUpdated: Date.now(),
  }
}

// Восстанавливаем состояние при монтировании
onMounted(() => {
  if (isRunning.value && !isHidden.value) {
    // Рассчитываем прошедшее время с момента последнего сохранения
    const timePassed = Math.floor(
      (Date.now() - timerState.value.lastUpdated) / 1000
    )
    elapsedTime.value += timePassed

    // Проверяем не завершился ли таймер
    if (elapsedTime.value >= totalTime.value) {
      completeTimer()
    } else {
      startTimer()
    }
  }
})

const startTimer = () => {
  if (!isRunning.value && !isCompleted.value) {
    isRunning.value = true
    timerInterval = setInterval(() => {
      if (elapsedTime.value < totalTime.value) {
        elapsedTime.value++
        saveState()
      } else {
        completeTimer()
      }
    }, 1000)
    saveState()

    toast.show({
      title: 'Таймер запущен',
      message: `Отсчет времени начат`,
      type: 'info',
      duration: 2000,
    })
  }
}

const pauseTimer = () => {
  if (isRunning.value && timerInterval) {
    isRunning.value = false
    clearInterval(timerInterval)
    timerInterval = null
    saveState()

    toast.show({
      title: 'Таймер на паузе',
      message: `Время: ${elapsedMinutes.value} минут`,
      type: 'info',
      duration: 2000,
    })
  }
}

const resetTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  isRunning.value = false
  elapsedTime.value = 0
  isCompleted.value = false
  saveState()

  toast.show({
    title: 'Таймер сброшен',
    message: 'Готов к новому отсчету',
    type: 'info',
    duration: 2000,
  })
}

const completeTimer = () => {
  // Останавливаем таймер
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  isRunning.value = false
  isCompleted.value = true
  elapsedTime.value = totalTime.value // Устанавливаем полное время

  // Добавляем время к задаче
  const tasksStore = useTasksStore()
  tasksStore.addTimeToTask(props.task.id, elapsedMinutes.value)

  // Помечаем задачу как выполненную
  tasksStore.updateTask(props.task.id, { status: 'completed' })

  saveState()

  // Автоматически скрываем таймер после завершения
  setTimeout(() => {
    toggleHideTimer()
  }, 1000)

  // Показываем уведомление
  toast.show({
    title: 'Задача выполнена! 🎉',
    message: `Вы потратили ${elapsedMinutes.value} минут на "${props.task.title}"`,
    type: 'success',
    duration: 5000,
  })
}

const toggleHideTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  }

  isHidden.value = true
  saveState()
  emit('timer-hidden', props.task.id)

  toast.show({
    title: 'Таймер свернут',
    message: 'Нажмите на заголовок, чтобы развернуть',
    type: 'info',
    duration: 2000,
  })
}

// Восстановить таймер
const restoreTimer = () => {
  isHidden.value = false
  saveState()
  emit('timer-restored', props.task.id)

  toast.show({
    title: 'Таймер восстановлен',
    message: 'Готов к продолжению',
    type: 'info',
    duration: 2000,
  })
}

// Экспортируем методы для использования извне
defineExpose({
  restoreTimer,
  resetTimer,
  startTimer,
  pauseTimer,
  completeTimer,
  isHidden,
})

// Cleanup on unmount
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped lang="scss">
.timer-progress {
  @include card;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: var(--space-4);
  transition: all var(--duration-base);
  overflow: hidden;

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.hidden {
    opacity: 0.7;
    cursor: pointer;

    &:hover {
      border-color: rgba(93, 95, 239, 0.3);
      opacity: 1;
    }
  }
}

// Header - всегда видимый
.timer-header {
  padding: var(--space-3) var(--space-4);
  background: var(--surface-bg);
  cursor: pointer;
  transition: all var(--duration-base);

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }
}

.timer-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.timer-info-compact {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.timer-task-compact {
  font-weight: var(--font-medium);
  color: var(--text-primary);
  @include text-truncate;
  flex: 1;
}

.timer-time-compact {
  font-family: var(--font-family-mono);
  font-size: var(--text-sm);
  color: var(--accent-primary);
  font-weight: var(--font-bold);
  background: rgba(93, 95, 239, 0.1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.timer-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.hide-timer,
.restore-timer {
  @include button-reset;
  @include flex-center;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-button);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  gap: var(--space-1);
}

.hide-timer {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }
}

.restore-timer {
  background: rgba(93, 95, 239, 0.1);
  color: var(--accent-primary);

  &:hover {
    background: rgba(93, 95, 239, 0.2);
  }
}

.mini-progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

// Main content
.timer-main {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}

.timer-display {
  text-align: center;
  margin-bottom: var(--space-3);
}

.timer-time-large {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  letter-spacing: 2px;
  font-family: var(--font-family-mono);
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

  &.error {
    background: var(--error);
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
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.02);
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
  .timer-header {
    background: var(--surface-bg);
  }

  .progress-bar,
  .mini-progress-bar {
    background: rgba(0, 0, 0, 0.1);
  }

  .progress-dot {
    background: rgba(0, 0, 0, 0.1);
  }

  .control-button.secondary {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .timer-info {
    background: rgba(0, 0, 0, 0.02);
  }

  .hide-timer {
    background: rgba(0, 0, 0, 0.05);
  }

  .timer-header:hover {
    background: rgba(0, 0, 0, 0.03);
  }
}
</style>
