<template>
  <div class="content-section productivity-tips">
    <div class="section-header">
      <h2>Рекомендации</h2>
      <button
        class="refresh-button"
        @click="refreshTips"
        title="Обновить рекомендации"
      >
        <Icon name="lucide:refresh-cw" size="16" />
      </button>
    </div>

    <div class="tips-container">
      <div v-if="personalizedTips.length > 0" class="tips-list">
        <div
          v-for="tip in personalizedTips"
          :key="tip.id"
          class="tip-card"
          :class="tip.type"
        >
          <div class="tip-header">
            <div class="tip-icon" :class="tip.type">
              <Icon :name="tip.icon" size="20" />
            </div>
            <div class="tip-badge" :class="tip.priority">
              {{ tip.priority === 'high' ? 'Важно' : 'Совет' }}
            </div>
          </div>

          <div class="tip-content">
            <h3 class="tip-title">{{ tip.title }}</h3>
            <p class="tip-description">{{ tip.description }}</p>

            <div v-if="tip.action" class="tip-action">
              <button class="action-button" @click="handleTipAction(tip)">
                <Icon :name="tip.action.icon" size="16" />
                <span>{{ tip.action.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="tips-empty">
        <div class="empty-icon">
          <Icon name="lucide:sparkles" size="32" />
        </div>
        <div class="empty-content">
          <h3>Отличная работа!</h3>
          <p>Вы следуете всем рекомендациям по продуктивности</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timerStore = useTimerStore()
const tasksStore = useTasksStore()

// Реактивные данные
const lastRefresh = ref(new Date())
const viewedTips = ref<Set<string>>(new Set())

// Вычисляем персонализированные советы на основе статистики пользователя
const personalizedTips = computed(() => {
  const tips = []
  const now = new Date()
  const currentHour = now.getHours()

  // Анализируем статистику пользователя
  const focusTimeToday = calculateFocusTimeToday()
  const taskCompletionRate = calculateTaskCompletionRate()
  const breakFrequency = calculateBreakFrequency()
  const overdueTasks = tasksStore.tasks.filter(
    (task) =>
      task.dueAt && new Date(task.dueAt) < now && task.status !== 'completed'
  ).length

  // 1. Совет по фокус-времени
  if (focusTimeToday < 60 && currentHour >= 14) {
    // Меньше 1 часа к 14:00
    tips.push({
      id: 'focus-time',
      type: 'warning',
      priority: 'high',
      icon: 'lucide:clock',
      title: 'Увеличьте фокус-время',
      description:
        'Сегодня вы сфокусировались меньше часа. Попробуйте технику Pomodoro.',
      action: {
        icon: 'lucide:play',
        label: 'Начать сессию',
        handler: () => timerStore.startTimer(),
      },
    })
  }

  // 2. Совет по выполнению задач
  if (taskCompletionRate < 30 && currentHour >= 16) {
    tips.push({
      id: 'task-completion',
      type: 'warning',
      priority: 'high',
      icon: 'lucide:check-circle',
      title: 'Низкий прогресс задач',
      description: `Выполнено только ${Math.round(
        taskCompletionRate
      )}% задач. Сфокусируйтесь на главном.`,
      action: {
        icon: 'lucide:list',
        label: 'Посмотреть задачи',
        handler: () => navigateTo('/tasks'),
      },
    })
  }

  // 3. Совет по перерывам
  if (breakFrequency < 2 && focusTimeToday > 120) {
    tips.push({
      id: 'take-break',
      type: 'tip',
      priority: 'medium',
      icon: 'lucide:coffee',
      title: 'Время для перерыва',
      description:
        'Вы работали более 2 часов без перерыва. Отдохните 5-10 минут.',
      action: {
        icon: 'lucide:clock',
        label: 'Начать перерыв',
        handler: () => startBreakTimer(),
      },
    })
  }

  // 4. Совет по утренней продуктивности
  if (currentHour >= 6 && currentHour <= 10 && focusTimeToday === 0) {
    tips.push({
      id: 'morning-planning',
      type: 'success',
      priority: 'medium',
      icon: 'lucide:sunrise',
      title: 'Планирование дня',
      description:
        'Утренние часы - самые продуктивные. Составьте план на день.',
      action: {
        icon: 'lucide:plus',
        label: 'Добавить задачи',
        handler: () => navigateTo('/tasks'),
      },
    })
  }

  // 5. Совет по просроченным задачам
  if (overdueTasks > 0) {
    tips.push({
      id: 'overdue-tasks',
      type: 'warning',
      priority: 'high',
      icon: 'lucide:alert-triangle',
      title: 'Просроченные задачи',
      description: `У вас ${overdueTasks} просроченных ${getTaskWord(
        overdueTasks
      )}.`,
      action: {
        icon: 'lucide:list',
        label: 'Просмотреть',
        handler: () => navigateTo('/tasks'),
      },
    })
  }

  // 6. Общий совет по продуктивности (если других советов мало)
  if (tips.length < 2) {
    const generalTips = [
      {
        id: 'pomodoro-technique',
        type: 'tip',
        priority: 'medium',
        icon: 'lucide:clock',
        title: 'Техника Pomodoro',
        description:
          'Работайте интервалами по 25 минут с 5-минутными перерывами для лучшей концентрации.',
        action: {
          icon: 'lucide:play',
          label: 'Попробовать',
          handler: () => timerStore.startTimer(),
        },
      },
      {
        id: 'task-prioritization',
        type: 'tip',
        priority: 'medium',
        icon: 'lucide:target',
        title: 'Приоритизация задач',
        description:
          'Сфокусируйтесь на 3 самых важных задачах дня для максимальной эффективности.',
        action: null,
      },
      {
        id: 'digital-minimalism',
        type: 'tip',
        priority: 'low',
        icon: 'lucide:smartphone',
        title: 'Цифровой минимализм',
        description:
          'Отключите ненужные уведомления для минимизации отвлечений во время работы.',
        action: null,
      },
    ]

    // Добавляем случайный общий совет
    const randomTip =
      generalTips[Math.floor(Math.random() * generalTips.length)]
    if (!tips.find((tip) => tip.id === randomTip.id)) {
      tips.push(randomTip)
    }
  }

  // Фильтруем уже просмотренные советы
  return tips.filter((tip) => !viewedTips.value.has(tip.id)).slice(0, 3)
})

// Вспомогательные функции
const calculateFocusTimeToday = () => {
  const todaySessions = timerStore.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  return todaySessions.reduce((total, session) => {
    if (session.endAt && session.phase === 'work') {
      const start = new Date(session.startAt)
      const end = new Date(session.endAt)
      return total + Math.round((end.getTime() - start.getTime()) / 60000)
    }
    return total
  }, 0)
}

const calculateTaskCompletionRate = () => {
  const todayTasks = tasksStore.todayTasks || []
  if (todayTasks.length === 0) return 0

  const completed = todayTasks.filter(
    (task) => task.status === 'completed'
  ).length
  return (completed / todayTasks.length) * 100
}

const calculateBreakFrequency = () => {
  const todaySessions = timerStore.sessions.filter((session) => {
    const sessionDate = new Date(session.startAt)
    const today = new Date()
    return sessionDate.toDateString() === today.toDateString()
  })

  return todaySessions.filter(
    (session) =>
      session.phase === 'short_break' || session.phase === 'long_break'
  ).length
}

const getTaskWord = (count: number) => {
  if (count === 1) return 'задача'
  if (count >= 2 && count <= 4) return 'задачи'
  return 'задач'
}

const startBreakTimer = () => {
  // TODO: Реализовать запуск таймера перерыва
  console.log('Starting break timer')
}

// Обработчики действий
const handleTipAction = (tip: any) => {
  if (tip.action && tip.action.handler) {
    tip.action.handler()
  }
  // Помечаем совет как просмотренный
  viewedTips.value.add(tip.id)
}

const refreshTips = () => {
  lastRefresh.value = new Date()
  // Можно добавить анимацию обновления
}

const navigateTo = (route: string) => {
  // Используем useRouter для навигации
  const router = useRouter()
  router.push(route)
}
</script>

<style scoped lang="scss">
.content-section {
  @include card;
  padding: var(--space-6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.refresh-button {
  @include button-reset;
  @include flex-center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: rotate(180deg);
  }
}

.tips-container {
  min-height: 200px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.tip-card {
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid transparent;
  transition: all var(--duration-base);
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: var(--shadow-sm);
  }

  &.warning {
    border-left-color: var(--warning);

    .tip-icon {
      background: rgba(250, 204, 21, 0.1);
      color: var(--warning);
    }
  }

  &.tip {
    border-left-color: var(--accent-primary);

    .tip-icon {
      background: rgba(93, 95, 239, 0.1);
      color: var(--accent-primary);
    }
  }

  &.success {
    border-left-color: var(--success);

    .tip-icon {
      background: rgba(93, 242, 126, 0.1);
      color: var(--success);
    }
  }
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-4) 0;
}

.tip-icon {
  @include flex-center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-card);
  transition: all var(--duration-base);
}

.tip-badge {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);

  &.high {
    background: rgba(248, 113, 113, 0.1);
    color: var(--error);
  }

  &.medium {
    background: rgba(250, 204, 21, 0.1);
    color: var(--warning);
  }

  &.low {
    background: rgba(93, 95, 239, 0.1);
    color: var(--accent-primary);
  }
}

.tip-content {
  padding: var(--space-3) var(--space-4) var(--space-4);
}

.tip-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
}

.tip-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-3);
}

.tip-action {
  margin-top: var(--space-3);
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: translateY(-1px);
  }
}

.tips-empty {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8) var(--space-4);
  color: var(--text-secondary);
}

.empty-icon {
  @include flex-center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: rgba(93, 242, 126, 0.1);
  margin-bottom: var(--space-4);

  :deep(svg) {
    color: var(--success);
  }
}

.empty-content {
  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  p {
    color: var(--text-secondary);
    line-height: var(--leading-relaxed);
    margin: 0;
  }
}

// Light theme adjustments
[data-theme='light'] {
  .action-button {
    background: rgba(0, 0, 0, 0.05);
  }
}

// Responsive design
@include breakpoint(sm) {
  .tips-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}

@include breakpoint(md) {
  .tips-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@include breakpoint(lg) {
  .tips-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
