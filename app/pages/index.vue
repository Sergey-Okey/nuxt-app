<template>
  <div class="dashboard-page">
    <!-- Заголовок и статистика -->
    <div class="header-section">
      <h1 class="page-title">Дашборд продуктивности</h1>
      <div class="quick-stats">
        <GlassCard class="quick-stat">
          <div class="stat-label">Сегодня</div>
          <div class="stat-value">
            <TimeDisplay :milliseconds="totalTimeToday" />
          </div>
        </GlassCard>
        <GlassCard class="quick-stat">
          <div class="stat-label">Активные</div>
          <div class="stat-value">{{ tasksStore.activeTasks.length }}</div>
        </GlassCard>
        <GlassCard class="quick-stat">
          <div class="stat-label">Завершено</div>
          <div class="stat-value">{{ tasksStore.completedTasks.length }}</div>
        </GlassCard>
      </div>
    </div>

    <!-- Основная сетка компонентов -->
    <div class="components-grid">
      <!-- Активный таймер -->
      <div class="component-cell wide">
        <TimerComponent v-if="timeTracker.activeTaskId" />
        <GlassCard v-else class="placeholder-card">
          <h3>Нет активного таймера</h3>
          <p>Выберите задачу и начните отсчёт времени</p>
        </GlassCard>
      </div>

      <!-- Карточки задач -->
      <div
        class="component-cell"
        v-for="task in tasksStore.activeTasks.slice(0, 2)"
        :key="task.id"
      >
        <TaskCard
          :task="task"
          :is-active="timeTracker.activeTaskId === task.id"
          @start="timeTracker.start(task.id)"
          @pause="timeTracker.pause()"
          @complete="tasksStore.completeTask(task.id)"
          @edit="showModal = true"
          @delete="tasksStore.removeTask(task.id)"
        />
      </div>

      <!-- Прогресс бар -->
      <div class="component-cell">
        <GlassCard>
          <h3>Прогресс дня</h3>
          <div class="progress-section">
            <ProgressDots
              :total-time="totalTimeToday"
              :estimated-time="480"
              :step-minutes="30"
            />
            <div class="progress-text">
              <TimeDisplay :milliseconds="totalTimeToday" /> из 8ч
            </div>
          </div>
        </GlassCard>
      </div>

      <!-- Примеры тегов -->
      <div class="component-cell">
        <GlassCard>
          <h3>Теги</h3>
          <div class="tags-demo">
            <TagBadge
              v-for="tag in tagsStore.tags"
              :key="tag.id"
              :label="tag.label"
              :color="tag.color"
              :removable="true"
              @remove="tagsStore.removeTag(tag.id)"
            />
          </div>
        </GlassCard>
      </div>

      <!-- Форма ввода -->
      <div class="component-cell">
        <GlassCard>
          <h3>Добавить задачу</h3>
          <div class="form-demo">
            <BaseInput
              v-model="inputValue"
              placeholder="Название задачи..."
              class="mb-3"
            />
            <BaseSelect
              v-model="selectedOption"
              :options="selectOptions"
              placeholder="Приоритет"
              class="mb-3"
            />
            <BaseButton @click="showModal = true"> Сохранить </BaseButton>
          </div>
        </GlassCard>
      </div>

      <!-- Отображение времени -->
      <div class="component-cell">
        <GlassCard>
          <h3>Форматы времени</h3>
          <div class="time-formats">
            <div class="time-format">
              <div class="format-label">Короткий:</div>
              <TimeDisplay :milliseconds="3725000" format="short" />
            </div>
            <div class="time-format">
              <div class="format-label">Полный:</div>
              <TimeDisplay :milliseconds="3725000" format="full" />
            </div>
            <div class="time-format">
              <div class="format-label">Сегодня:</div>
              <TimeDisplay :milliseconds="totalTimeToday" format="short" />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>

    <!-- Модальное окно -->
    <BaseModal :open="showModal" @close="showModal = false">
      <h3>Редактирование</h3>
      <p>Модальное окно со стеклоэффектом</p>
      <div class="modal-actions">
        <BaseButton @click="showModal = false">Закрыть</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from '~/stores/tasks.store'
import { useCategoriesStore } from '~/stores/categories.store'
import { useTagsStore } from '~/stores/tags.store'
import { useAnalyticsStore } from '~/stores/analytics.store'
import { useTimeTrackerStore } from '~/stores/timeTracker.store'

const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const tagsStore = useTagsStore()
const analyticsStore = useAnalyticsStore()
const timeTracker = useTimeTrackerStore()

const showModal = ref(false)
const inputValue = ref('')
const selectedOption = ref('medium')

onMounted(() => {
  if (tagsStore.tags.length === 0) {
    tagsStore.addTag('Работа', '#3B82F6')
    tagsStore.addTag('Учеба', '#10B981')
    tagsStore.addTag('Личное', '#8B5CF6')
    tagsStore.addTag('Срочно', '#EF4444')
  }

  if (categoriesStore.categories.length === 0) {
    categoriesStore.addCategory('Разработка', '#3B82F6')
    categoriesStore.addCategory('Дизайн', '#8B5CF6')
    categoriesStore.addCategory('Исследование', '#10B981')
  }

  if (tasksStore.tasks.length === 0) {
    tasksStore.addTask({
      title: 'Создать UI компоненты',
      description: 'Разработать стекломорфные компоненты для приложения',
      priority: 'high',
      estimatedTime: 120,
      tagIds: [tagsStore.tags[0].id, tagsStore.tags[3].id],
      categoryId: categoriesStore.categories[0].id,
    })

    tasksStore.addTask({
      title: 'Изучить Nuxt 4',
      description: 'Пройти документацию по новым возможностям',
      priority: 'medium',
      estimatedTime: 90,
      tagIds: [tagsStore.tags[1].id],
      categoryId: categoriesStore.categories[2].id,
    })

    tasksStore.addTask({
      title: 'Проектирование дизайна',
      description: 'Создать макеты интерфейса',
      priority: 'low',
      estimatedTime: 60,
      tagIds: [tagsStore.tags[1].id, tagsStore.tags[2].id],
      categoryId: categoriesStore.categories[1].id,
    })
  }
})

const stats = computed(() => analyticsStore.collect())

const selectOptions = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
]

const totalTimeToday = computed(() => {
  const today = new Date().toDateString()
  return stats.value.byDay[today] || 0
})
</script>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header-section {
  .page-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--color-text-primary);
  }
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.quick-stat {
  text-align: center;
  padding: 1.5rem 1rem;

  .stat-label {
    font-size: $font-xs;
    color: var(--color-text-tertiary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    font-variant-numeric: tabular-nums;
  }
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @include respond-to(md) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }

  .component-cell {
    &.wide {
      grid-column: 1 / -1;
    }
  }
}

.placeholder-card {
  text-align: center;
  padding: 3rem 2rem;

  h3 {
    margin-bottom: 0.75rem;
    color: var(--color-text-secondary);
  }

  p {
    color: var(--color-text-tertiary);
    font-size: $font-sm;
  }
}

.progress-section {
  .progress-text {
    margin-top: 1rem;
    text-align: center;
    font-size: $font-sm;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }
}

.tags-demo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.form-demo {
  .mb-3 {
    margin-bottom: 1rem;
  }
}

.time-formats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.time-format {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border-light);

  &:last-child {
    border-bottom: none;
  }

  .format-label {
    font-size: $font-sm;
    color: var(--color-text-secondary);
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
