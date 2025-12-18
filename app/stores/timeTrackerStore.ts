import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useTaskStore } from './taskStore'

export const useTimeTrackerStore = defineStore('timeTracker', () => {
  const taskStore = useTaskStore()

  // Состояние
  const activeTaskId = useLocalStorage<string | null>(
    'productivity-glass-active-task',
    null
  )
  const startTime = ref<Date | null>(null)
  const isRunning = ref(false)
  const elapsedTime = ref(0) // в миллисекундах
  const timerInterval = ref<number | null>(null)

  // Последние сессии для отката
  const lastSessions = ref<
    Array<{
      taskId: string
      sessionId: string
      startTime: Date
      endTime: Date
      duration: number
    }>
  >([])

  // Геттеры
  const activeTask = computed(() => {
    return activeTaskId.value ? taskStore.getTaskById(activeTaskId.value) : null
  })

  const formattedElapsedTime = computed(() => {
    const totalSeconds = Math.floor(elapsedTime.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      totalSeconds,
    }
  })

  const todayTotalTime = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return taskStore.tasks.reduce((total, task) => {
      const todaySessions = task.sessions.filter((session) => {
        const sessionDate = new Date(session.startTime)
        return sessionDate >= today
      })

      return (
        total +
        todaySessions.reduce((sum, session) => sum + session.duration, 0)
      )
    }, 0)
  })

  // Действия
  const startTimer = (taskId: string) => {
    if (isRunning.value) {
      stopTimer()
    }

    activeTaskId.value = taskId
    startTime.value = new Date()
    isRunning.value = true

    // Запуск интервала для обновления elapsedTime
    timerInterval.value = window.setInterval(() => {
      if (startTime.value) {
        elapsedTime.value = Date.now() - startTime.value.getTime()
      }
    }, 1000)

    // Сохраняем состояние в localStorage
    localStorage.setItem(
      'timeTrackerState',
      JSON.stringify({
        activeTaskId: taskId,
        startTime: startTime.value.toISOString(),
      })
    )
  }

  const stopTimer = () => {
    if (!isRunning.value || !startTime.value || !activeTaskId.value) return

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.value.getTime()

    // Создаем ID сессии
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    // Сохраняем сессию в задаче
    taskStore.addTaskSession(
      activeTaskId.value,
      sessionId,
      startTime.value,
      endTime,
      duration
    )

    // Сохраняем в историю для возможного отката
    lastSessions.value.push({
      taskId: activeTaskId.value,
      sessionId,
      startTime: startTime.value,
      endTime,
      duration,
    })

    // Очищаем состояние
    resetTimer()

    // Удаляем сохраненное состояние
    localStorage.removeItem('timeTrackerState')
  }

  const pauseTimer = () => {
    if (!isRunning.value || !startTime.value || !activeTaskId.value) return

    const pauseTime = new Date()
    const duration = pauseTime.getTime() - startTime.value.getTime()

    // Сохраняем промежуточную сессию
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    taskStore.addTaskSession(
      activeTaskId.value,
      sessionId,
      startTime.value,
      pauseTime,
      duration
    )

    // Сохраняем в историю
    lastSessions.value.push({
      taskId: activeTaskId.value,
      sessionId,
      startTime: startTime.value,
      endTime: pauseTime,
      duration,
    })

    // Сбрасываем таймер, но оставляем активную задачу
    isRunning.value = false
    elapsedTime.value = 0

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }

    // Обновляем сохраненное состояние
    localStorage.setItem(
      'timeTrackerState',
      JSON.stringify({
        activeTaskId: activeTaskId.value,
        isPaused: true,
      })
    )
  }

  const resumeTimer = () => {
    if (!activeTaskId.value || isRunning.value) return

    startTime.value = new Date()
    isRunning.value = true

    timerInterval.value = window.setInterval(() => {
      if (startTime.value) {
        elapsedTime.value = Date.now() - startTime.value.getTime()
      }
    }, 1000)

    // Обновляем сохраненное состояние
    localStorage.setItem(
      'timeTrackerState',
      JSON.stringify({
        activeTaskId: activeTaskId.value,
        startTime: startTime.value.toISOString(),
      })
    )
  }

  const resetTimer = () => {
    isRunning.value = false
    startTime.value = null
    elapsedTime.value = 0
    activeTaskId.value = null

    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }

  const undoLastSession = () => {
    if (lastSessions.value.length === 0) return false

    const lastSession = lastSessions.value.pop()
    if (!lastSession) return false

    // Находим задачу и удаляем сессию
    const task = taskStore.getTaskById(lastSession.taskId)
    if (task) {
      const sessionIndex = task.sessions.findIndex(
        (s) => s.id === lastSession.sessionId
      )
      if (sessionIndex > -1) {
        task.sessions.splice(sessionIndex, 1)
        task.totalTime -= lastSession.duration
        task.updatedAt = new Date()
      }
    }

    return true
  }

  const getTaskTotalTime = (taskId: string) => {
    const task = taskStore.getTaskById(taskId)
    return task ? task.totalTime : 0
  }

  const getTaskTodayTime = (taskId: string) => {
    const task = taskStore.getTaskById(taskId)
    if (!task) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return task.sessions
      .filter((session) => new Date(session.startTime) >= today)
      .reduce((sum, session) => sum + session.duration, 0)
  }

  // Восстановление состояния при загрузке
  const restoreState = () => {
    const savedState = localStorage.getItem('timeTrackerState')
    if (!savedState) return

    try {
      const state = JSON.parse(savedState)

      if (state.activeTaskId && state.startTime) {
        const startTimeDate = new Date(state.startTime)
        const now = new Date()

        // Восстанавливаем только если прошло меньше 24 часов
        if (now.getTime() - startTimeDate.getTime() < 24 * 60 * 60 * 1000) {
          activeTaskId.value = state.activeTaskId
          startTime.value = startTimeDate
          isRunning.value = true
          elapsedTime.value = now.getTime() - startTimeDate.getTime()

          // Запускаем таймер
          timerInterval.value = window.setInterval(() => {
            if (startTime.value) {
              elapsedTime.value = Date.now() - startTime.value.getTime()
            }
          }, 1000)
        } else {
          // Слишком много времени прошло, сбрасываем
          localStorage.removeItem('timeTrackerState')
        }
      } else if (state.activeTaskId && state.isPaused) {
        // Восстанавливаем паузу
        activeTaskId.value = state.activeTaskId
      }
    } catch (error) {
      console.error('Failed to restore timer state:', error)
      localStorage.removeItem('timeTrackerState')
    }
  }

  // Автоматическое сохранение при разгрузке страницы
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      if (isRunning.value && startTime.value && activeTaskId.value) {
        localStorage.setItem(
          'timeTrackerState',
          JSON.stringify({
            activeTaskId: activeTaskId.value,
            startTime: startTime.value.toISOString(),
          })
        )
      }
    })

    // Восстанавливаем состояние при инициализации
    restoreState()
  }

  // Следим за изменениями активной задачи
  watch(activeTaskId, (newTaskId) => {
    if (!newTaskId) {
      resetTimer()
    }
  })

  return {
    // Состояние
    activeTaskId,
    startTime,
    isRunning,
    elapsedTime,

    // Геттеры
    activeTask,
    formattedElapsedTime,
    todayTotalTime,

    // Действия
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    undoLastSession,
    getTaskTotalTime,
    getTaskTodayTime,
  }
})
