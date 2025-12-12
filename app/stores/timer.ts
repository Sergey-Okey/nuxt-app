import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  taskId?: string
  startAt: string
  endAt?: string
  phase: 'work' | 'short_break' | 'long_break'
  elapsedTime: number
}

interface TimerState {
  taskId: string | null
  elapsedTime: number
  totalTime: number
  isRunning: boolean
  isVisible: boolean
  startTime: number | null
}

export const useTimerStore = defineStore('timer', () => {
  // Состояние таймера
  const state = ref<TimerState>({
    taskId: null,
    elapsedTime: 0,
    totalTime: 25 * 60,
    isRunning: false,
    isVisible: false,
    startTime: null,
  })

  // Загружаем состояние из localStorage при инициализации
  onMounted(() => {
    const saved = localStorage.getItem('timerState')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Восстанавливаем только если не прошло больше часа
        if (parsed.startTime && Date.now() - parsed.startTime < 3600000) {
          state.value = {
            ...parsed,
            isRunning: false, // Всегда сбрасываем running состояние
          }
        }
      } catch (e) {
        console.error('Failed to load timer state:', e)
      }
    }
  })

  // Сохраняем состояние в localStorage
  const saveState = () => {
    localStorage.setItem('timerState', JSON.stringify(state.value))
  }

  // Начинаем таймер для задачи
  const startForTask = (taskId: string, totalMinutes: number = 25) => {
    state.value = {
      taskId,
      elapsedTime: 0,
      totalTime: totalMinutes * 60,
      isRunning: true,
      isVisible: true,
      startTime: Date.now(),
    }
    saveState()
  }

  // Продолжаем существующий таймер
  const continueTimer = () => {
    if (!state.value.taskId) return

    state.value.isRunning = true
    state.value.startTime = Date.now()
    saveState()
  }

  const pauseTimer = () => {
    if (state.value.isRunning && state.value.startTime) {
      // Сохраняем прошедшее время
      state.value.elapsedTime += Math.floor(
        (Date.now() - state.value.startTime) / 1000
      )
      state.value.isRunning = false
      state.value.startTime = null
      saveState()
    }
  }

  const resetTimer = () => {
    state.value.elapsedTime = 0
    state.value.isRunning = false
    state.value.startTime = null
    saveState()
  }

  const completeTimer = async () => {
    pauseTimer()

    // Сохраняем время в задачу
    if (state.value.taskId) {
      const tasksStore = useTasksStore()
      const elapsedMinutes = Math.floor(state.value.elapsedTime / 60)
      tasksStore.addTimeToTask(state.value.taskId, elapsedMinutes)

      // Помечаем задачу как выполненную если прошло достаточно времени
      if (elapsedMinutes >= Math.floor((state.value.totalTime / 60) * 0.8)) {
        tasksStore.toggleTaskStatus(state.value.taskId)
      }
    }

    // Показываем уведомление
    const notifications = inject('notifications') as any
    notifications?.showNotification({
      type: 'success',
      title: 'Таймер завершен!',
      message: 'Отличная работа! Задача выполнена.',
      icon: 'lucide:check-circle',
      duration: 3000,
    })

    // Скрываем таймер
    hideTimer()
  }

  const hideTimer = () => {
    state.value.isVisible = false
    state.value.isRunning = false
    state.value.startTime = null
    saveState()
  }

  const showTimer = () => {
    state.value.isVisible = true
    saveState()
  }

  // Текущее время таймера
  const currentTime = computed(() => {
    if (state.value.isRunning && state.value.startTime) {
      const additionalTime = Math.floor(
        (Date.now() - state.value.startTime) / 1000
      )
      return state.value.elapsedTime + additionalTime
    }
    return state.value.elapsedTime
  })

  const formattedTime = computed(() => {
    const totalSeconds = Math.min(currentTime.value, state.value.totalTime)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  })

  const progress = computed(() => {
    return Math.min(100, (currentTime.value / state.value.totalTime) * 100)
  })

  const isComplete = computed(() => {
    return currentTime.value >= state.value.totalTime
  })

  // Автоматически завершаем таймер когда время истекло
  watch(
    isComplete,
    (complete) => {
      if (complete && state.value.isRunning) {
        completeTimer()
      }
    },
    { immediate: true }
  )

  return {
    state,
    currentTime,
    formattedTime,
    progress,
    isComplete,
    startForTask,
    continueTimer,
    pauseTimer,
    resetTimer,
    completeTimer,
    hideTimer,
    showTimer,
    saveState,
  }
})
