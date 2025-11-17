export default defineNuxtPlugin(() => {
  const tasksStore = useTasksStore()
  const timerStore = useTimerStore()
  const statsStore = useStatsStore()

  // Initialize demo data only if stores are empty
  if (tasksStore.tasks.length === 0) {
    tasksStore.tasks = [
      {
        id: '1',
        title: 'Разработка интерфейса TaskFlow',
        category: 'work',
        priority: 'high',
        status: 'active',
        createdAt: new Date(),
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedMinutes: 120,
        tags: ['разработка', 'ui'],
      },
      {
        id: '2',
        title: 'Тестирование компонентов',
        category: 'work',
        priority: 'medium',
        status: 'active',
        createdAt: new Date(),
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        estimatedMinutes: 60,
        tags: ['тестирование'],
      },
      {
        id: '3',
        title: 'Утренняя зарядка',
        category: 'health',
        priority: 'low',
        status: 'completed',
        createdAt: new Date(),
        tags: ['здоровье'],
      },
    ]
  }

  if (timerStore.sessions.length === 0) {
    timerStore.addSampleSessions()
  }

  if (statsStore.focusSessions.length === 0) {
    statsStore.addFocusSession({
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      taskId: '1',
      duration: 25,
      type: 'work',
    })
    statsStore.addFocusSession({
      startTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 0.5 * 60 * 60 * 1000),
      taskId: '2',
      duration: 25,
      type: 'work',
    })
  }
})
