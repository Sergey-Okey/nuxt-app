import { defineStore } from 'pinia'

interface TimerState {
  taskId: string | null
  taskTitle: string
  elapsedTime: number
  totalTime: number
  isRunning: boolean
  isVisible: boolean
  startTime: number | null
  estimatedMinutes: number
}

export const useTimerStore = defineStore('timer', () => {
  // Состояние таймера
  const state = ref<TimerState>({
    taskId: null,
    taskTitle: '',
    elapsedTime: 0,
    totalTime: 25 * 60,
    isRunning: false,
    isVisible: false,
    startTime: null,
    estimatedMinutes: 25,
  })

  let timerInterval: NodeJS.Timeout | null = null

  // Загружаем состояние из localStorage
  const loadState = () => {
    const saved = localStorage.getItem('timerState')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Восстанавливаем только если не прошло больше 24 часов
        if (parsed.startTime && Date.now() - parsed.startTime < 86400000) {
          state.value = {
            ...parsed,
            isRunning: false, // Всегда сбрасываем running при загрузке
          }
        }
      } catch (e) {
        console.error('Failed to load timer state:', e)
      }
    }
  }

  // Сохраняем состояние
  const saveState = () => {
    localStorage.setItem('timerState', JSON.stringify(state.value))
  }

  // Инициализация
  onMounted(() => {
    loadState()
    // Запускаем автоматическое сохранение каждые 30 секунд
    setInterval(saveState, 30000)
  })

  // Обновляем время в реальном времени
  const updateElapsedTime = () => {
    if (state.value.isRunning && state.value.startTime) {
      const currentElapsed = Math.floor(
        (Date.now() - state.value.startTime) / 1000
      )
      state.value.elapsedTime += currentElapsed
      state.value.startTime = Date.now()
      saveState()
    }
  }

  // Начинаем таймер для задачи
  const startForTask = (task: any, estimatedMinutes?: number) => {
    updateElapsedTime()

    const minutes = estimatedMinutes || task.estimatedMinutes || 25

    state.value = {
      taskId: task.id,
      taskTitle: task.title,
      elapsedTime: 0,
      totalTime: minutes * 60,
      isRunning: true,
      isVisible: true,
      startTime: Date.now(),
      estimatedMinutes: minutes,
    }

    startTimerInterval()
    saveState()

    // Показываем уведомление
    const notifications = inject('notifications') as any
    notifications?.showNotification({
      type: 'info',
      title: 'Таймер запущен',
      message: `Начали отсчет для задачи "${task.title}"`,
      icon: 'lucide:play',
      duration: 3000,
    })
  }

  // Продолжаем существующий таймер
  const continueTimer = () => {
    if (!state.value.taskId || state.value.isRunning) return

    state.value.isRunning = true
    state.value.startTime = Date.now()
    startTimerInterval()
    saveState()
  }

  const startTimerInterval = () => {
    if (timerInterval) clearInterval(timerInterval)

    timerInterval = setInterval(() => {
      if (state.value.isRunning) {
        const currentTime = currentTime.value
        if (currentTime >= state.value.totalTime) {
          completeTimer()
        }
      }
    }, 1000)
  }

  const pauseTimer = () => {
    if (state.value.isRunning) {
      updateElapsedTime()
      state.value.isRunning = false
      state.value.startTime = null

      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }

      saveState()
    }
  }

  const resetTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    state.value.elapsedTime = 0
    state.value.isRunning = false
    state.value.startTime = null
    saveState()
  }

  const completeTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    // Сохраняем время в задачу
    if (state.value.taskId) {
      const tasksStore = useTasksStore()
      const elapsedMinutes = Math.floor(state.value.elapsedTime / 60)

      // Добавляем время к задаче
      tasksStore.addTimeToTask(state.value.taskId, elapsedMinutes)

      // Если прошло больше 80% времени, отмечаем как выполненную
      if (elapsedMinutes >= Math.floor(state.value.estimatedMinutes * 0.8)) {
        tasksStore.toggleTaskStatus(state.value.taskId)
      }
    }

    // Показываем уведомление
    const notifications = inject('notifications') as any
    notifications?.showNotification({
      type: 'success',
      title: 'Таймер завершен!',
      message: `Отличная работа! Задача "${state.value.taskTitle}" выполнена.`,
      icon: 'lucide:check-circle',
      duration: 5000,
    })

    // Скрываем таймер через 5 секунд
    setTimeout(() => {
      hideTimer()
    }, 5000)
  }

  const hideTimer = () => {
    pauseTimer()
    state.value.isVisible = false
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

  // Экспортируем состояние
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
    updateElapsedTime,
  }
})
