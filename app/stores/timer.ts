import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  taskId?: string
  startAt: Date
  endAt?: Date
  phase: 'work' | 'short_break' | 'long_break'
}

export const useTimerStore = defineStore('timer', {
  state: () => ({
    isRunning: false,
    timeLeft: 25 * 60, // 25 минут в секундах
    currentPhase: 'work' as 'work' | 'short_break' | 'long_break',
    sessions: [] as PomodoroSession[],
    currentTaskId: null as string | null,
    currentSession: null as PomodoroSession | null,

    settings: {
      work: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60,
      sessionsBeforeLongBreak: 4,
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
      const total = state.settings[state.currentPhase]
      return ((total - state.timeLeft) / total) * 100
    },

    currentTask: (state) => {
      if (state.currentTaskId) {
        const tasksStore = useTasksStore()
        return tasksStore.tasks.find((task) => task.id === state.currentTaskId)
      }
      return null
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
              })) || []

            // Если нет сессий, добавляем демо-данные
            if (this.sessions.length === 0) {
              this.addSampleSessions()
            }
          } catch (error) {
            console.error('Error loading timer from localStorage:', error)
            // Добавляем демо-данные если загрузка не удалась
            this.addSampleSessions()
          }
        } else {
          // Добавляем демо-данные для нового пользователя
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
          })
        )
      }
    },

    // Добавление демо-сессий
    addSampleSessions() {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Сессии за сегодня
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
            25
          ),
          phase: 'work' as const,
        },
        {
          id: '3',
          taskId: 'sample-3',
          startAt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            14,
            30
          ),
          endAt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            14,
            55
          ),
          phase: 'work' as const,
        },
      ]

      // Сессии за вчера
      const yesterdaySessions = [
        {
          id: '4',
          taskId: 'sample-4',
          startAt: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            10,
            0
          ),
          endAt: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            10,
            25
          ),
          phase: 'work' as const,
        },
        {
          id: '5',
          taskId: 'sample-5',
          startAt: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            11,
            0
          ),
          endAt: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            11,
            25
          ),
          phase: 'work' as const,
        },
        {
          id: '6',
          taskId: 'sample-6',
          startAt: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            15,
            0
          ),
          endAt: new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            15,
            25
          ),
          phase: 'work' as const,
        },
      ]

      this.sessions = [...todaySessions, ...yesterdaySessions]
      this.saveToLocalStorage()
    },

    // Установка задачи для таймера
    setTask(taskId: string | null) {
      this.currentTaskId = taskId
      this.saveToLocalStorage()
    },

    // Запуск таймера
    startTimer() {
      if (!this.isRunning) {
        this.isRunning = true

        // Создаем новую сессию
        this.currentSession = {
          id: Date.now().toString(),
          startAt: new Date(),
          phase: this.currentPhase,
          taskId: this.currentTaskId || undefined,
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

        // Сохраняем ID интервала для очистки
        if (process.client) {
          ;(window as any).timerInterval = timerInterval
        }
      }
    },

    // Пауза таймера
    pauseTimer() {
      this.isRunning = false

      // Очищаем интервал
      if (process.client && (window as any).timerInterval) {
        clearInterval((window as any).timerInterval)
        ;(window as any).timerInterval = null
      }

      this.saveToLocalStorage()
    },

    // Сброс таймера
    resetTimer() {
      this.isRunning = false
      this.timeLeft = this.settings[this.currentPhase]
      this.currentSession = null

      // Очищаем интервал
      if (process.client && (window as any).timerInterval) {
        clearInterval((window as any).timerInterval)
        ;(window as any).timerInterval = null
      }

      this.saveToLocalStorage()
    },

    // Завершение фазы
    completePhase() {
      this.isRunning = false

      // Очищаем интервал
      if (process.client && (window as any).timerInterval) {
        clearInterval((window as any).timerInterval)
        ;(window as any).timerInterval = null
      }

      if (this.currentSession) {
        this.currentSession.endAt = new Date()
        this.sessions.push(this.currentSession)

        // Добавляем время к задаче
        if (this.currentSession.taskId) {
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
      } else {
        this.currentPhase = 'work'
      }

      this.timeLeft = this.settings[this.currentPhase]
      this.currentSession = null
      this.saveToLocalStorage()

      // Уведомление
      this.showNotification()
    },

    // Показать уведомление
    showNotification() {
      if (process.client && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const phaseName = {
            work: 'Работа',
            short_break: 'Короткий перерыв',
            long_break: 'Длинный перерыв',
          }[this.currentPhase]

          new Notification(`TaskFlow: ${phaseName}`, {
            body:
              this.currentPhase === 'work'
                ? 'Время поработать!'
                : 'Время отдохнуть!',
            icon: '/icon.png',
          })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              this.showNotification()
            }
          })
        }
      }
    },

    // Настройка времени
    setWorkTime(minutes: number) {
      this.settings.work = minutes * 60
      if (this.currentPhase === 'work' && !this.isRunning) {
        this.timeLeft = this.settings.work
      }
      this.saveToLocalStorage()
    },

    setBreakTime(type: 'shortBreak' | 'longBreak', minutes: number) {
      this.settings[type] = minutes * 60
      if (this.currentPhase === type && !this.isRunning) {
        this.timeLeft = this.settings[type]
      }
      this.saveToLocalStorage()
    },

    // Смена фазы вручную
    switchPhase(phase: 'work' | 'short_break' | 'long_break') {
      if (!this.isRunning) {
        this.currentPhase = phase
        this.timeLeft = this.settings[phase]
        this.saveToLocalStorage()
      }
    },

    // Добавление сессии вручную (для тестирования)
    addSession(session: Omit<PomodoroSession, 'id'>) {
      const newSession: PomodoroSession = {
        ...session,
        id: Date.now().toString(),
      }
      this.sessions.push(newSession)
      this.saveToLocalStorage()
    },

    // Очистка всех сессий
    clearSessions() {
      this.sessions = []
      this.saveToLocalStorage()
    },
  },
})
