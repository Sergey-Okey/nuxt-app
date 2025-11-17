<template>
  <div class="content-section upcoming-deadlines">
    <div class="section-header">
      <h2>Ближайшие дедлайны</h2>
      <button class="action-button secondary" @click="goToTasks">
        <span>Все задачи</span>
        <Icon name="lucide:arrow-right" size="16" />
      </button>
    </div>

    <div class="deadlines-list">
      <div
        v-for="deadline in upcomingDeadlines"
        :key="deadline.id"
        class="deadline-item"
        :class="deadline.priority"
      >
        <div class="deadline-date">
          <div class="date-day">{{ deadline.day }}</div>
          <div class="date-month">{{ deadline.month }}</div>
        </div>
        <div class="deadline-content">
          <div class="deadline-title">{{ deadline.title }}</div>
          <div class="deadline-time">{{ deadline.relativeTime }}</div>
        </div>
        <div class="deadline-priority" :class="deadline.priority">
          {{ deadline.priorityLabel }}
        </div>
      </div>

      <div v-if="upcomingDeadlines.length === 0" class="empty-state">
        <Icon name="lucide:calendar" size="48" />
        <p>Нет ближайших дедлайнов</p>
        <span>Новые задачи появятся здесь</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const router = useRouter()

const upcomingDeadlines = computed(() => {
  const tasks = tasksStore.upcomingTasks.slice(0, 3)
  return tasks.map((task) => {
    const dueDate = task.dueAt ? new Date(task.dueAt) : new Date()
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let relativeTime = ''
    if (diffDays === 0) relativeTime = 'Сегодня'
    else if (diffDays === 1) relativeTime = 'Завтра'
    else if (diffDays <= 7) relativeTime = `Через ${diffDays} дня`
    else
      relativeTime = dueDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })

    return {
      id: task.id,
      title: task.title,
      day: dueDate.getDate().toString(),
      month: dueDate
        .toLocaleDateString('ru-RU', { month: 'short' })
        .toUpperCase(),
      relativeTime,
      priority: task.priority,
      priorityLabel: getPriorityLabel(task.priority),
    }
  })
})

const getPriorityLabel = (priority: string) => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
  }
  return labels[priority as keyof typeof labels] || priority
}

const goToTasks = () => {
  router.push('/tasks')
}
</script>

<style scoped lang="scss">
.deadlines-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.deadline-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-bg);
  border-radius: var(--radius-card);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 4px solid transparent;
  transition: all var(--duration-base);

  &:hover {
    transform: translateX(4px);
    border-color: rgba(255, 255, 255, 0.1);
  }

  &.high {
    border-left-color: var(--error);
  }

  &.medium {
    border-left-color: var(--warning);
  }

  &.low {
    border-left-color: var(--success);
  }
}

.deadline-date {
  @include flex-center;
  flex-direction: column;
  padding: var(--space-3);
  background: var(--card-bg);
  border-radius: var(--radius-base);
  min-width: 60px;
}

.date-day {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

.date-month {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
}

.deadline-content {
  flex: 1;
}

.deadline-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
}

.deadline-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.deadline-priority {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.high {
    background: rgba(248, 113, 113, 0.15);
    color: var(--error);
  }

  &.medium {
    background: rgba(250, 204, 21, 0.15);
    color: var(--warning);
  }

  &.low {
    background: rgba(93, 242, 126, 0.15);
    color: var(--success);
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);

  :deep(svg) {
    margin-bottom: var(--space-4);
    opacity: 0.5;
  }

  p {
    margin-bottom: var(--space-2);
    color: var(--text-primary);
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
  }

  span {
    font-size: var(--text-sm);
    opacity: 0.8;
  }
}
</style>
