<template>
  <div class="components-showcase">
    <!-- Кнопка переключения темы -->
    <button class="theme-toggle" @click="toggleTheme" :aria-label="`Переключить на ${colorMode.preference === 'dark' ? 'светлую' : 'тёмную'} тему`">
      <svg v-if="colorMode.preference === 'dark'" class="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
      <svg v-else class="theme-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
    </button>

    <!-- Заголовок -->
    <div class="header-section">
      <h1 class="page-title">UI Компоненты</h1>
      <p class="page-subtitle">Библиотека компонентов в стиле Telegram</p>
    </div>

    <!-- Секции компонентов -->
    <div class="sections-container">
      <!-- Кнопки -->
      <section class="component-section">
        <h2 class="section-title">Кнопки</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Варианты</h3>
              <div class="demo-items">
                <BaseButton variant="primary">Primary</BaseButton>
                <BaseButton variant="secondary">Secondary</BaseButton>
                <BaseButton variant="outline">Outline</BaseButton>
                <BaseButton variant="ghost">Ghost</BaseButton>
              </div>
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Размеры</h3>
              <div class="demo-items">
                <BaseButton size="sm">Small</BaseButton>
                <BaseButton size="md">Medium</BaseButton>
                <BaseButton size="lg">Large</BaseButton>
              </div>
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Состояния</h3>
              <div class="demo-items">
                <BaseButton>Обычная</BaseButton>
                <BaseButton disabled>Отключена</BaseButton>
                <BaseButton full-width>На всю ширину</BaseButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Поля ввода -->
      <section class="component-section">
        <h2 class="section-title">Поля ввода</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Текстовое поле</h3>
              <BaseInput v-model="inputValue" placeholder="Введите текст..." />
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Пароль</h3>
              <BaseInput v-model="passwordValue" type="password" placeholder="Введите пароль..." />
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Email</h3>
              <BaseInput v-model="emailValue" type="email" placeholder="email@example.com" />
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Отключенное поле</h3>
              <BaseInput v-model="inputValue" placeholder="Недоступно" disabled />
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Селект -->
      <section class="component-section">
        <h2 class="section-title">Выпадающий список</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Выбор приоритета</h3>
              <BaseSelect
                v-model="selectedOption"
                :options="selectOptions"
                placeholder="Выберите приоритет"
              />
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Отключенный селект</h3>
              <BaseSelect
                v-model="selectedOption"
                :options="selectOptions"
                placeholder="Недоступно"
                disabled
              />
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Теги -->
      <section class="component-section">
        <h2 class="section-title">Теги</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Цветные теги</h3>
              <div class="tags-container">
                <TagBadge label="Работа" color="#3B82F6" />
                <TagBadge label="Учеба" color="#10B981" />
                <TagBadge label="Личное" color="#8B5CF6" />
                <TagBadge label="Срочно" color="#EF4444" />
              </div>
            </div>
            <div class="demo-group">
              <h3 class="demo-title">С возможностью удаления</h3>
              <div class="tags-container">
                <TagBadge
                  v-for="tag in tagsStore.tags"
                  :key="tag.id"
                  :label="tag.label"
                  :color="tag.color"
                  :removable="true"
                  @remove="tagsStore.removeTag(tag.id)"
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Карточки -->
      <section class="component-section">
        <h2 class="section-title">Карточки</h2>
        <div class="cards-grid">
          <GlassCard padding="sm">
            <h3>Маленький отступ</h3>
            <p>Карточка с маленьким отступом</p>
          </GlassCard>
          <GlassCard padding="md">
            <h3>Средний отступ</h3>
            <p>Карточка со средним отступом</p>
          </GlassCard>
          <GlassCard padding="lg">
            <h3>Большой отступ</h3>
            <p>Карточка с большим отступом</p>
          </GlassCard>
        </div>
      </section>

      <!-- Модальное окно -->
      <section class="component-section">
        <h2 class="section-title">Модальное окно</h2>
        <GlassCard>
          <div class="component-demo">
            <BaseButton @click="showModal = true">Открыть модальное окно</BaseButton>
          </div>
        </GlassCard>
      </section>

      <!-- Отображение времени -->
      <section class="component-section">
        <h2 class="section-title">Отображение времени</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Короткий формат</h3>
              <TimeDisplay :milliseconds="3725000" format="short" />
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Полный формат</h3>
              <TimeDisplay :milliseconds="3725000" format="full" />
            </div>
            <div class="demo-group">
              <h3 class="demo-title">Сегодня</h3>
              <TimeDisplay :milliseconds="totalTimeToday" format="short" />
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Прогресс -->
      <section class="component-section">
        <h2 class="section-title">Прогресс</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Прогресс дня</h3>
              <ProgressDots
                :total-time="totalTimeToday"
                :estimated-time="480"
                :step-minutes="30"
              />
              <div class="progress-text">
                <TimeDisplay :milliseconds="totalTimeToday" /> из 8ч
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Карточка задачи -->
      <section class="component-section">
        <h2 class="section-title">Карточка задачи</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Примеры карточек задач</h3>
              <div class="tasks-grid">
                <TaskCard
                  v-for="task in demoTasks"
                  :key="task.id"
                  :task="task"
                  :is-active="timeTracker.activeTaskId === task.id"
                  @start="handleTaskStart(task.id)"
                  @pause="timeTracker.pause()"
                  @complete="handleTaskComplete(task.id)"
                  @edit="handleTaskEdit(task.id)"
                  @delete="handleTaskDelete(task.id)"
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Таймер -->
      <section class="component-section">
        <h2 class="section-title">Таймер</h2>
        <GlassCard>
          <div class="component-demo">
            <div class="demo-group">
              <h3 class="demo-title">Активный таймер</h3>
              <div v-if="timeTracker.activeTaskId" class="timer-wrapper">
                <TimerComponent />
              </div>
              <div v-else class="timer-placeholder">
                <p>Нет активного таймера</p>
                <p class="timer-hint">Нажмите "Start" на любой карточке задачи, чтобы запустить таймер</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      <!-- Комплексный пример -->
      <section class="component-section">
        <h2 class="section-title">Комплексный пример</h2>
        <GlassCard>
          <div class="component-demo">
            <h3 class="demo-title">Форма добавления задачи</h3>
            <div class="form-example">
              <BaseInput
                v-model="taskTitle"
                placeholder="Название задачи..."
                class="mb-3"
              />
              <BaseSelect
                v-model="taskPriority"
                :options="selectOptions"
                placeholder="Приоритет"
                class="mb-3"
              />
              <div class="form-actions">
                <BaseButton variant="primary" @click="handleAddTask">Добавить</BaseButton>
                <BaseButton variant="ghost" @click="handleResetForm">Сбросить</BaseButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>

    <!-- Модальное окно -->
    <BaseModal :open="showModal" @close="showModal = false">
      <h3>Модальное окно</h3>
      <p>Это пример модального окна со стеклоэффектом. Вы можете закрыть его, нажав на кнопку или кликнув вне окна.</p>
      <div class="modal-actions">
        <BaseButton variant="primary" @click="showModal = false">Закрыть</BaseButton>
        <BaseButton variant="ghost" @click="showModal = false">Отмена</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTagsStore } from '~/stores/tags.store'
import { useAnalyticsStore } from '~/stores/analytics.store'
import { useTasksStore } from '~/stores/tasks.store'
import { useCategoriesStore } from '~/stores/categories.store'
import { useTimeTrackerStore } from '~/stores/timeTracker.store'

const colorMode = useColorMode()
const tagsStore = useTagsStore()
const analyticsStore = useAnalyticsStore()
const tasksStore = useTasksStore()
const categoriesStore = useCategoriesStore()
const timeTracker = useTimeTrackerStore()

const showModal = ref(false)
const inputValue = ref('')
const passwordValue = ref('')
const emailValue = ref('')
const selectedOption = ref('medium')
const taskTitle = ref('')
const taskPriority = ref('medium')

const toggleTheme = () => {
  colorMode.preference = colorMode.preference === 'dark' ? 'light' : 'dark'
}

const handleAddTask = () => {
  if (taskTitle.value) {
    alert(`Задача "${taskTitle.value}" добавлена с приоритетом "${taskPriority.value}"`)
    handleResetForm()
  }
}

const handleResetForm = () => {
  taskTitle.value = ''
  taskPriority.value = 'medium'
}

const handleTaskStart = (taskId: string) => {
  timeTracker.start(taskId)
}

const handleTaskComplete = (taskId: string) => {
  tasksStore.completeTask(taskId)
}

const handleTaskEdit = (taskId: string) => {
  showModal.value = true
}

const handleTaskDelete = (taskId: string) => {
  if (confirm('Удалить задачу?')) {
    tasksStore.removeTask(taskId)
  }
}

const demoTasks = computed(() => {
  return tasksStore.tasks.slice(0, 2)
})

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
.components-showcase {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  min-height: 100vh;
  padding-bottom: 4rem;
}

// Кнопка переключения темы
.theme-toggle {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: $z-index-fixed;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg-medium);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border-medium);
  border-radius: $border-radius-full;
  cursor: pointer;
  transition: all $transition-base;
  box-shadow: 0 4px 12px var(--shadow-color);
  color: var(--color-text-primary);

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 16px var(--shadow-color);
    background: var(--glass-bg-heavy);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  .theme-icon {
    width: 1.5rem;
    height: 1.5rem;
    transition: transform $transition-base;
  }

  &:hover .theme-icon {
    transform: rotate(15deg);
  }

  @include respond-to(sm) {
    top: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;

    .theme-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}

.header-section {
  margin-top: 1rem;
  text-align: center;

  .page-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--color-text-primary);
    letter-spacing: -0.02em;
    line-height: 1.1;
    background: linear-gradient(
      135deg,
      var(--color-text-primary) 0%,
      var(--color-text-secondary) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @include respond-to(sm) {
      font-size: 2.5rem;
    }
  }

  .page-subtitle {
    font-size: $font-lg;
    color: var(--color-text-secondary);
    font-weight: 400;
  }
}

.sections-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem;

  @include respond-to(sm) {
    padding: 0 1rem;
    gap: 2rem;
  }
}

.component-section {
  animation: fadeInUp 0.5s ease-out backwards;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;

  @include respond-to(sm) {
    font-size: 1.75rem;
  }
}

.component-demo {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-title {
  font-size: $font-md;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0;
}

.demo-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  @include respond-to(sm) {
    grid-template-columns: 1fr;
  }

  h3 {
    font-size: $font-lg;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-text-primary);
  }

  p {
    font-size: $font-sm;
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.form-example {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  .mb-3 {
    margin-bottom: 0;
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.progress-text {
  margin-top: 1rem;
  text-align: center;
  font-size: $font-md;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @include respond-to(sm) {
    grid-template-columns: 1fr;
  }
}

.timer-wrapper {
  width: 100%;
}

.timer-placeholder {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--color-text-secondary);

  p {
    margin: 0.5rem 0;
    font-size: $font-md;
  }

  .timer-hint {
    font-size: $font-sm;
    color: var(--color-text-tertiary);
  }
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

