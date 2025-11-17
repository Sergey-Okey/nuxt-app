import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  taskId?: string
  taskTitle?: string
  startAt: Date
  endAt?: Date
  phase: 'work' | 'short_break' | 'long_break'
  duration: number // in minutes
}

interface TimerState {
  isRunning: boolean
  timeLeft: number // in seconds
  currentPhase: 'work' | 'short_break' | 'long_break'
  sessions: PomodoroSession[]
  currentSession: PomodoroSession | null
  settings: {
    work: number
    shortBreak: number
    longBreak: number
    sessionsBeforeLongBreak: number
  }
}

export const useTimerStore = defineStore('timer', {
  state: (): TimerState => ({
    isRunning: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    currentPhase: 'work',
    sessions: [],
    currentSession: null,
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

    completedSessions: (state) => {
      return state.sessions.filter((session) => session.endAt).length
    },

    currentTaskTitle: (state) => {
      return state.currentSession?.taskTitle || 'Без задачи'
    },
  },

  actions: {
    startTimer(taskId?: string, taskTitle?: string) {
      if (!this.isRunning) {
        this.isRunning = true
        this.currentSession = {
          id: Math.random().toString(36).substr(2, 9),
          taskId,
          taskTitle,
          startAt: new Date(),
          phase: this.currentPhase,
          duration: this.settings[this.currentPhase] / 60,
        }

        // Start the interval
        this.timerInterval = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--
          } else {
            this.completePhase()
          }
        }, 1000)
      }
    },

    pauseTimer() {
      this.isRunning = false
      if (this.timerInterval) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
      }
    },

    resetTimer() {
      this.pauseTimer()
      this.timeLeft = this.settings.work
      this.currentPhase = 'work'
      this.currentSession = null
    },

    completePhase() {
      this.pauseTimer()

      // Complete current session
      if (this.currentSession) {
        this.currentSession.endAt = new Date()
        this.sessions.push(this.currentSession)
      }

      // Transition to next phase
      if (this.currentPhase === 'work') {
        const completedWorkSessions = this.sessions.filter(
          (s) => s.phase === 'work' && s.endAt
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
    },

    setPhase(phase: 'work' | 'short_break' | 'long_break') {
      this.pauseTimer()
      this.currentPhase = phase
      this.timeLeft = this.settings[phase]
      this.currentSession = null
    },

    updateSettings(settings: Partial<TimerState['settings']>) {
      this.settings = { ...this.settings, ...settings }

      // Update current time if phase matches
      if (!this.isRunning) {
        this.timeLeft = this.settings[this.currentPhase]
      }
    },

    // For demo purposes - add some sample sessions
    addSampleSessions() {
      const now = new Date()
      this.sessions = [
        {
          id: '1',
          taskId: 'task1',
          taskTitle: 'Разработка интерфейса',
          startAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          endAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
          phase: 'work',
          duration: 25,
        },
        {
          id: '2',
          taskId: 'task2',
          taskTitle: 'Тестирование компонентов',
          startAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
          endAt: new Date(now.getTime() - 0.5 * 60 * 60 * 1000),
          phase: 'work',
          duration: 25,
        },
      ]
    },
  },
})

// Timer interval reference
declare module '@pinia/nuxt' {
  interface PiniaCustomProperties {
    timerInterval: NodeJS.Timeout | null
  }
}
