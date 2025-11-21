<template>
  <div class="content-section upcoming-deadlines">
    <div class="section-header">
      <div class="section-title">
        <Icon name="lucide:calendar" size="20" />
        <h2>Ближайшие дедлайны</h2>
      </div>
    </div>

    <div class="deadlines-content">
      <div v-if="upcomingDeadlines.length > 0" class="deadlines-list">
        <div
          v-for="deadline in upcomingDeadlines"
          :key="deadline.id"
          class="deadline-card"
          :class="[
            `priority-${deadline.priority}`,
            { urgent: deadline.isUrgent, today: deadline.isToday },
          ]"
          @click="goToTask(deadline.id)"
        >
          <div class="deadline-main">
            <div class="deadline-indicator">
              <div class="date-badge">
                <span class="date-day">{{ deadline.day }}</span>
                <span class="date-month">{{ deadline.month }}</span>
              </div>
              <div
                class="priority-dot"
                :class="`priority-${deadline.priority}`"
              ></div>
            </div>

            <div class="deadline-info">
              <h4 class="task-title">{{ deadline.title }}</h4>
              <div class="task-meta">
                <span class="category-tag">
                  <Icon :name="deadline.categoryIcon" size="12" />
                  <span class="category-text">{{ deadline.categoryName }}</span>
                </span>
                <span
                  class="time-remaining"
                  :class="{ urgent: deadline.isUrgent }"
                >
                  <Icon name="lucide:clock" size="12" />
                  <span class="time-text">{{ deadline.relativeTime }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="deadline-actions">
            <button
              class="quick-action"
              @click.stop="toggleTaskStatus(deadline.id)"
              :title="
                deadline.status === 'completed'
                  ? 'Вернуть в работу'
                  : 'Отметить выполненной'
              "
            >
              <Icon
                :name="
                  deadline.status === 'completed'
                    ? 'lucide:rotate-ccw'
                    : 'lucide:check-circle'
                "
                size="16"
              />
            </button>
          </div>
        </div>
        <button class="action-button secondary" @click="goToTasks">
          <span class="button-text">Все задачи</span>
          <Icon name="lucide:arrow-right" size="16" />
        </button>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <Icon name="lucide:calendar-check" size="48" />
        </div>
        <div class="empty-content">
          <h3>Нет ближайших дедлайнов</h3>
          <p>Все задачи выполнены или запланированы на будущее</p>
        </div>
        <button class="add-task-button" @click="goToTasks">
          <Icon name="lucide:plus" size="16" />
          <span>Добавить задачу</span>
        </button>
      </div>
    </div>

    <div v-if="upcomingDeadlines.length > 0" class="deadlines-footer">
      <div class="deadlines-stats">
        <div class="stat-item">
          <Icon name="lucide:alert-triangle" size="14" />
          <span>{{ urgentCount }} срочных</span>
        </div>
        <div class="stat-item">
          <Icon name="lucide:calendar" size="14" />
          <span>{{ todayCount }} на сегодня</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const tasksStore = useTasksStore()
const router = useRouter()

// Получаем задачи с дедлайнами и сортируем по дате
const upcomingDeadlines = computed(() => {
  const tasksWithDeadlines = tasksStore.tasks
    .filter((task) => task.dueAt && task.status === 'active')
    .sort((a, b) => {
      return new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime()
    })
    .slice(0, 5) // Показываем только 5 ближайших

  return tasksWithDeadlines.map((task) => {
    const dueDate = new Date(task.dueAt!)
    const now = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueDateStart = new Date(dueDate)
    dueDateStart.setHours(0, 0, 0, 0)

    const diffTime = dueDateStart.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Определяем относительное время
    let relativeTime = ''
    let isUrgent = false
    let isToday = false

    if (diffDays === 0) {
      relativeTime = 'Сегодня'
      isToday = true
      isUrgent = true
    } else if (diffDays === 1) {
      relativeTime = 'Завтра'
      isUrgent = true
    } else if (diffDays === 2) {
      relativeTime = 'Послезавтра'
    } else if (diffDays <= 7) {
      relativeTime = `Через ${diffDays} дня`
    } else {
      relativeTime = dueDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
    }

    // Получаем информацию о категории
    const category = tasksStore.categories.find(
      (cat) => cat.id === task.category
    )
    const categoryIcon = category?.icon || 'lucide:folder'
    const categoryName = category?.name || 'Без категории'

    return {
      id: task.id,
      title: task.title,
      day: dueDate.getDate().toString(),
      month: dueDate
        .toLocaleDateString('ru-RU', { month: 'short' })
        .toUpperCase(),
      relativeTime,
      priority: task.priority,
      status: task.status,
      categoryIcon,
      categoryName,
      isUrgent,
      isToday,
      dueDate: dueDate,
    }
  })
})

// Статистика дедлайнов
const urgentCount = computed(() => {
  return upcomingDeadlines.value.filter((deadline) => deadline.isUrgent).length
})

const todayCount = computed(() => {
  return upcomingDeadlines.value.filter((deadline) => deadline.isToday).length
})

// Методы
const toggleTaskStatus = (taskId: string) => {
  tasksStore.toggleTaskStatus(taskId)
}

const goToTask = (taskId: string) => {
  router.push(`/tasks?task=${taskId}`)
}

const goToTasks = () => {
  router.push('/tasks')
}
</script>

<style scoped lang="scss">
.content-section {
  @include card;
  padding: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.05);

  @include breakpoint(sm) {
    padding: var(--space-6);
  }
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);

  @include breakpoint(sm) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);

  @include breakpoint(sm) {
    gap: var(--space-3);
  }

  h2 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;

    @include breakpoint(sm) {
      font-size: var(--text-xl);
    }
  }

  :deep(svg) {
    color: var(--accent-primary);
    flex-shrink: 0;
  }
}

.deadlines-content {
  min-height: 160px;

  @include breakpoint(sm) {
    min-height: 200px;
  }
}

.deadlines-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.deadline-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-bg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all var(--duration-base);
  position: relative;

  @include breakpoint(sm) {
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  // Стили для приоритетов
  &.priority-high {
    border-left: 3px solid var(--error);

    .priority-dot.priority-high {
      background: var(--error);
    }
  }

  &.priority-medium {
    border-left: 3px solid var(--warning);

    .priority-dot.priority-medium {
      background: var(--warning);
    }
  }

  &.priority-low {
    border-left: 3px solid var(--success);

    .priority-dot.priority-low {
      background: var(--success);
    }
  }

  // Срочные и сегодняшние дедлайны
  &.urgent {
    background: rgba(248, 113, 113, 0.05);
    border-color: rgba(248, 113, 113, 0.2);
  }

  &.today {
    background: rgba(93, 95, 239, 0.05);
    border-color: rgba(93, 95, 239, 0.2);
  }
}

.deadline-main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;

  @include breakpoint(sm) {
    align-items: center;
  }
}

.deadline-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.date-badge {
  @include flex-center;
  flex-direction: column;
  padding: var(--space-2);
  background: var(--card-bg);
  border-radius: var(--radius-base);
  min-width: 44px;

  @include breakpoint(sm) {
    min-width: 50px;
  }
}

.date-day {
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;

  @include breakpoint(sm) {
    font-size: var(--text-lg);
  }
}

.date-month {
  font-size: 10px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: var(--font-medium);
  margin-top: 2px;

  @include breakpoint(sm) {
    font-size: var(--text-xs);
  }
}

.priority-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--text-secondary);

  @include breakpoint(sm) {
    width: 8px;
    height: 8px;
  }
}

.deadline-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: var(--leading-tight);
  @include text-truncate;
  font-size: var(--text-sm);

  @include breakpoint(sm) {
    font-size: var(--text-base);
  }
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  @include breakpoint(sm) {
    flex-direction: row;
    align-items: center;
    gap: var(--space-3);
  }
}

.category-tag {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-medium);
  font-size: 11px;
  width: fit-content;

  @include breakpoint(sm) {
    font-size: var(--text-xs);
  }

  .category-text {
    @include text-truncate;
    max-width: 80px;

    @include breakpoint(sm) {
      max-width: 100px;
    }
  }

  :deep(svg) {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
}

.time-remaining {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--accent-primary);
  font-weight: var(--font-medium);
  font-size: 11px;
  width: fit-content;

  @include breakpoint(sm) {
    font-size: var(--text-xs);
  }

  &.urgent {
    color: var(--error);

    :deep(svg) {
      color: var(--error);
    }
  }

  .time-text {
    @include text-truncate;
    max-width: 80px;

    @include breakpoint(sm) {
      max-width: none;
    }
  }

  :deep(svg) {
    color: var(--accent-primary);
    flex-shrink: 0;
  }
}

.deadline-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
  margin-top: -2px;

  @include breakpoint(sm) {
    margin-top: 0;
  }
}

.quick-action {
  @include button-reset;
  @include flex-center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-button);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  @include breakpoint(sm) {
    width: 32px;
    height: 32px;
  }

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: scale(1.1);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--text-secondary);

  @include breakpoint(sm) {
    padding: var(--space-8) var(--space-4);
  }
}

.empty-icon {
  @include flex-center;
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: rgba(93, 95, 239, 0.1);
  margin-bottom: var(--space-4);

  @include breakpoint(sm) {
    width: 80px;
    height: 80px;
  }

  :deep(svg) {
    color: var(--accent-primary);
  }
}

.empty-content {
  margin-bottom: var(--space-4);

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
    font-size: var(--text-sm);

    @include breakpoint(sm) {
      font-size: var(--text-base);
    }
  }
}

.add-task-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--accent-primary);
  color: white;
  border-radius: var(--radius-button);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  font-size: var(--text-sm);

  @include breakpoint(sm) {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-base);
  }

  &:hover {
    background: var(--accent-secondary);
    transform: translateY(-1px);
    box-shadow: var(--glow-primary);
  }
}

.deadlines-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.deadlines-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-4);

  @include breakpoint(sm) {
    gap: var(--space-6);
  }
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-secondary);

  @include breakpoint(sm) {
    font-size: var(--text-sm);
  }

  :deep(svg) {
    color: var(--text-muted);
    flex-shrink: 0;
  }
}

.action-button {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: all var(--duration-base);
  width: fit-content;
  align-self: flex-end;

  @include breakpoint(sm) {
    align-self: auto;
  }

  .button-text {
    @include breakpoint(xs) {
      display: none;
    }

    @include breakpoint(sm) {
      display: inline;
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
}

// Light theme adjustments
[data-theme='light'] {
  .category-tag {
    background: rgba(0, 0, 0, 0.05);
  }

  .quick-action {
    background: rgba(0, 0, 0, 0.05);
  }

  .action-button.secondary {
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}

// Extra small devices
@include breakpoint(xs) {
  .deadline-card {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .deadline-main {
    gap: var(--space-2);
  }

  .date-badge {
    min-width: 40px;
    padding: var(--space-1);
  }

  .date-day {
    font-size: var(--text-sm);
  }

  .date-month {
    font-size: 9px;
  }

  .task-title {
    font-size: var(--text-xs);
    margin-bottom: var(--space-1);
  }

  .task-meta {
    gap: var(--space-1);
  }

  .category-tag,
  .time-remaining {
    font-size: 10px;
    padding: 2px 6px;
  }

  .quick-action {
    width: 24px;
    height: 24px;

    :deep(svg) {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
