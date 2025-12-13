import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  taskId?: string
  startAt: Date
  endAt?: Date
  phase: 'work' | 'short_break' | 'long_break'
  targetTime?: number // Время, установленное в задаче (в минутах)
}

export const useTimerStore = defineStore('timer', {
  state: () => ({
    isRunning: false,
    timeLeft: 25 * 60, // Начальное значение (25 минут в секундах)
    currentPhase: 'work' as 'work' | 'short_break' | 'long_break',
    sessions: [] as PomodoroSession[],
    currentTaskId: null as string | null,
    currentSession: null as PomodoroSession | null,

    settings: {
      defaultWork: 25 * 60, // Дефолтное время работы (25 минут)
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      sessionsBeforeLongBreak: 4,
      useTaskTime: true, // Использовать время из задачи
      minWorkTime: 1 * 60, // Минимальное время работы (1 минута)
      maxWorkTime: 480 * 60, // Максимальное время работы (8 часов)
    },
  }),

  getters: {
    formattedTime: (state) => {
      const minutes = Math.floor(state.timeLeft / 60)
      const seconds = state.timeLeft % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    },

    progress: (state) => {
      // Получаем целевое время для текущей фазы
      let totalTime = 0

      if (state.currentPhase === 'work' && state.currentSession?.targetTime) {
        // Для фазы работы используем время из задачи
        totalTime = state.currentSession.targetTime * 60
      } else {
        // Для перерывов используем настройки
        totalTime =
          state.settings[
            state.currentPhase === 'short_break' ? 'shortBreak' : 'longBreak'
          ]
      }

      return totalTime > 0
        ? ((totalTime - state.timeLeft) / totalTime) * 100
        : 0
    },

    currentTask: (state) => {
      if (state.currentTaskId) {
        const tasksStore = useTasksStore()
        return tasksStore.tasks.find((task) => task.id === state.currentTaskId)
      }
      return null
    },

    currentTaskTime: (state) => {
      if (!state.currentTaskId) return null
      const tasksStore = useTasksStore()
      const task = tasksStore.tasks.find((t) => t.id === state.currentTaskId)
      return task?.estimatedMinutes || null
    },

    todaysSessions: (state) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return state.sessions.filter((session) => {
        const sessionDate = new Date(session.startAt)
        sessionDate.setHours(0, 0, 0, 0)
        return sessionDate.getTime() === today.getTime()
      })
    },

    totalFocusTimeToday: (state) => {
      const todaysWorkSessions = state.todaysSessions.filter(
        (session) => session.phase === 'work'
      )

      return todaysWorkSessions.reduce((total, session) => {
        if (session.endAt) {
          const start = new Date(session.startAt).getTime()
          const end = new Date(session.endAt).getTime()
          return total + Math.round((end - start) / 60000) // в минутах
        }
        return total
      }, 0)
    },

    // Получаем текущее время для фазы с учетом задачи
    currentPhaseTime: (state) => {
      if (state.currentPhase === 'work' && state.currentSession?.targetTime) {
        return state.currentSession.targetTime
      }

      switch (state.currentPhase) {
        case 'work':
          return state.settings.defaultWork / 60
        case 'short_break':
          return state.settings.shortBreak / 60
        case 'long_break':
          return state.settings.longBreak / 60
      }
    },
  },

  actions: {
    // Инициализация из localStorage
    initialize() {
      if (process.client) {
        const savedTimer = localStorage.getItem('taskflow-timer')
        if (savedTimer) {
          try {
            const parsed = JSON.parse(savedTimer)
            this.isRunning = parsed.isRunning
            this.timeLeft = parsed.timeLeft
            this.currentPhase = parsed.currentPhase
            this.currentTaskId = parsed.currentTaskId
            this.sessions =
              parsed.sessions?.map((session: any) => ({
                ...session,
                startAt: new Date(session.startAt),
                endAt: session.endAt ? new Date(session.endAt) : undefined,
                targetTime: session.targetTime || undefined,
              })) || []
            this.settings = { ...this.settings, ...parsed.settings }

            // Если есть текущая задача, обновляем время
            if (this.currentTaskId && this.currentPhase === 'work') {
              this.updateTimeFromTask(this.currentTaskId)
            }

            // Восстанавливаем сессию, если таймер был запущен
            if (this.isRunning && this.timeLeft > 0) {
              // Таймер был прерван, сбрасываем его
              this.isRunning = false
              this.timeLeft = this.settings.defaultWork
              this.currentSession = null
            }

            // Если нет сессий, добавляем демо-данные
            if (this.sessions.length === 0) {
              this.addSampleSessions()
            }
          } catch (error) {
            console.error('Error loading timer from localStorage:', error)
            this.addSampleSessions()
          }
        } else {
          this.addSampleSessions()
        }
      }
    },

    // Сохранение в localStorage
    saveToLocalStorage() {
      if (process.client) {
        localStorage.setItem(
          'taskflow-timer',
          JSON.stringify({
            isRunning: this.isRunning,
            timeLeft: this.timeLeft,
            currentPhase: this.currentPhase,
            currentTaskId: this.currentTaskId,
            sessions: this.sessions,
            settings: this.settings,
          })
        )
      }
    },

    // Добавление демо-сессий
    addSampleSessions() {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const todaySessions = [
        {
          id: '1',
          taskId: 'sample-1',
          startAt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            9,
            0
          ),
          endAt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            9,
            25
          ),
          phase: 'work' as const,
          targetTime: 25,
        },
        {
          id: '2',
          taskId: 'sample-2',
          startAt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            10,
            0
          ),
          endAt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            10,
            30
          ),
          phase: 'work' as const,
          targetTime: 30,
        },
      ]

      this.sessions = todaySessions
      this.saveToLocalStorage()
    },

    // Обновление времени из задачи
    updateTimeFromTask(taskId: string) {
      if (!taskId) return false

      const tasksStore = useTasksStore()
      const task = tasksStore.tasks.find((t) => t.id === taskId)

      if (task && task.estimatedMinutes) {
        const taskTimeInSeconds = task.estimatedMinutes * 60

        // Проверяем границы времени
        if (taskTimeInSeconds < this.settings.minWorkTime) {
          console.warn(
            'Task time is below minimum, using minimum:',
            this.settings.minWorkTime / 60,
            'min'
          )
          this.timeLeft = this.settings.minWorkTime
        } else if (taskTimeInSeconds > this.settings.maxWorkTime) {
          console.warn(
            'Task time exceeds maximum, using maximum:',
            this.settings.maxWorkTime / 60,
            'min'
          )
          this.timeLeft = this.settings.maxWorkTime
        } else {
          this.timeLeft = taskTimeInSeconds
        }

        // Обновляем таргет время для сессии
        if (this.currentSession) {
          this.currentSession.targetTime = Math.floor(this.timeLeft / 60)
        }

        this.saveToLocalStorage()
        return true
      }

      return false
    },

    // Установка задачи для таймера
    setTask(taskId: string | null) {
      this.currentTaskId = taskId

      if (taskId && this.currentPhase === 'work') {
        // Если выбрана задача и мы в фазе работы, обновляем время
        this.updateTimeFromTask(taskId)
      } else if (!taskId && this.currentPhase === 'work' && !this.isRunning) {
        // Если задача снята, возвращаем дефолтное время
        this.timeLeft = this.settings.defaultWork
      }

      this.saveToLocalStorage()
    },

    // Запуск таймера
    startTimer() {
      if (!this.isRunning) {
        this.isRunning = true

        // Создаем новую сессию
        const targetTime =
          this.currentPhase === 'work' && this.currentTaskId
            ? this.currentTaskTime
            : null

        this.currentSession = {
          id: Date.now().toString(),
          startAt: new Date(),
          phase: this.currentPhase,
          taskId: this.currentTaskId || undefined,
          targetTime: targetTime || undefined,
        }

        this.saveToLocalStorage()

        // Запускаем интервал
        const timerInterval = setInterval(() => {
          if (this.isRunning && this.timeLeft > 0) {
            this.timeLeft--
            this.saveToLocalStorage()
          } else if (this.isRunning && this.timeLeft === 0) {
            clearInterval(timerInterval)
            this.completePhase()
          }
        }, 1000)

        // Сохраняем ID интервала
        if (process.client) {
          ;(window as any).timerInterval = timerInterval
        }
      }
    },

    // Пауза таймера
    pauseTimer() {
      this.isRunning = false

      if (process.client && (window as any).timerInterval) {
        clearInterval((window as any).timerInterval)
        ;(window as any).timerInterval = null
      }

      this.saveToLocalStorage()
    },

    // Сброс таймера
    resetTimer() {
      this.isRunning = false

      // Сбрасываем время с учетом задачи
      if (this.currentPhase === 'work' && this.currentTaskId) {
        this.updateTimeFromTask(this.currentTaskId)
      } else {
        this.timeLeft =
          this.currentPhase === 'work'
            ? this.settings.defaultWork
            : this.currentPhase === 'short_break'
            ? this.settings.shortBreak
            : this.settings.longBreak
      }

      this.currentSession = null

      if (process.client && (window as any).timerInterval) {
        clearInterval((window as any).timerInterval)
        ;(window as any).timerInterval = null
      }

      this.saveToLocalStorage()
    },

    // Завершение фазы
    completePhase() {
      this.isRunning = false

      if (process.client && (window as any).timerInterval) {
        clearInterval((window as any).timerInterval)
        ;(window as any).timerInterval = null
      }

      if (this.currentSession) {
        this.currentSession.endAt = new Date()
        this.sessions.push(this.currentSession)

        // Добавляем время к задаче
        if (
          this.currentSession.taskId &&
          this.currentSession.phase === 'work'
        ) {
          const tasksStore = useTasksStore()
          const timeSpent = Math.round(
            (this.currentSession.endAt.getTime() -
              this.currentSession.startAt.getTime()) /
              60000
          )
          tasksStore.addTimeToTask(this.currentSession.taskId, timeSpent)
        }
      }

      // Переход к следующей фазе
      if (this.currentPhase === 'work') {
        const completedWorkSessions = this.sessions.filter(
          (s) => s.phase === 'work'
        ).length
        this.currentPhase =
          completedWorkSessions % this.settings.sessionsBeforeLongBreak === 0
            ? 'long_break'
            : 'short_break'
        this.timeLeft =
          this.currentPhase === 'long_break'
            ? this.settings.longBreak
            : this.settings.shortBreak
      } else {
        this.currentPhase = 'work'
        // При переходе к работе используем время задачи или дефолтное
        if (this.currentTaskId) {
          this.updateTimeFromTask(this.currentTaskId)
        } else {
          this.timeLeft = this.settings.defaultWork
        }
      }

      this.currentSession = null
      this.saveToLocalStorage()
      this.showNotification()
    },

    // Настройка времени работы
    setWorkTime(minutes: number) {
      const timeInSeconds = minutes * 60

      // Проверяем границы
      if (timeInSeconds < this.settings.minWorkTime) {
        timeInSeconds = this.settings.minWorkTime
      } else if (timeInSeconds > this.settings.maxWorkTime) {
        timeInSeconds = this.settings.maxWorkTime
      }

      this.settings.defaultWork = timeInSeconds

      // Обновляем текущее время, если нет активной задачи
      if (
        this.currentPhase === 'work' &&
        !this.isRunning &&
        !this.currentTaskId
      ) {
        this.timeLeft = this.settings.defaultWork
      }

      this.saveToLocalStorage()
    },

    // Настройка времени перерыва
    setBreakTime(type: 'shortBreak' | 'longBreak', minutes: number) {
      const timeInSeconds = minutes * 60

      // Минимальное время перерыва - 1 минута
      if (timeInSeconds < 60) {
        timeInSeconds = 60
      }

      this.settings[type] = timeInSeconds

      // Обновляем текущее время, если мы в соответствующей фазе
      if (
        this.currentPhase ===
          (type === 'shortBreak' ? 'short_break' : 'long_break') &&
        !this.isRunning
      ) {
        this.timeLeft = this.settings[type]
      }

      this.saveToLocalStorage()
    },

    // Смена фазы вручную
    switchPhase(phase: 'work' | 'short_break' | 'long_break') {
      if (!this.isRunning) {
        const oldPhase = this.currentPhase
        this.currentPhase = phase

        if (phase === 'work') {
          // При переходе к работе используем время задачи
          if (this.currentTaskId) {
            this.updateTimeFromTask(this.currentTaskId)
          } else {
            this.timeLeft = this.settings.defaultWork
          }
        } else {
          // Для перерывов используем настройки
          this.timeLeft =
            phase === 'short_break'
              ? this.settings.shortBreak
              : this.settings.longBreak
        }

        // Сбрасываем сессию при смене фазы
        this.currentSession = null

        this.saveToLocalStorage()
      }
    },

    // Получение рекомендованного времени для задачи
    getRecommendedTime(taskComplexity: 'low' | 'medium' | 'high'): number {
      const recommendations = {
        low: 15, // 15 минут
        medium: 30, // 30 минут
        high: 60, // 1 час
      }
      return recommendations[taskComplexity]
    },

    // Проверка, сколько времени можно добавить к задаче
    getRemainingTimeForTask(taskId: string): number {
      const tasksStore = useTasksStore()
      const task = tasksStore.tasks.find((t) => t.id === taskId)

      if (!task) return 0

      const spent = task.spentMinutes || 0
      const estimated = task.estimatedMinutes || 0

      // Возвращаем оставшееся время или 0, если время не ограничено
      return estimated > spent ? estimated - spent : 0
    },

    // Уведомление
    showNotification() {
      if (
        process.client &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        const phaseNames = {
          work: 'Работа',
          short_break: 'Короткий перерыв',
          long_break: 'Длинный перерыв',
        }

        const messages = {
          work: 'Время поработать!',
          short_break: 'Время отдохнуть 5 минут!',
          long_break: 'Время для длинного перерыва 15 минут!',
        }

        new Notification(`TaskFlow: ${phaseNames[this.currentPhase]}`, {
          body: messages[this.currentPhase],
          icon: '/icon.png',
        })
      }
    },
  },
})
