<template>
  <div class="quick-create-modal">
    <div class="modal-backdrop" @click="$emit('close')"></div>

    <div class="modal-content">
      <div class="modal-header">
        <h3>Быстрое создание</h3>
        <button class="close-button" @click="$emit('close')">
          <Icon name="lucide:x" size="20" />
        </button>
      </div>

      <div class="create-options">
        <button class="create-option" @click="createTask">
          <div class="option-icon">
            <Icon name="lucide:check-square" size="24" />
          </div>
          <div class="option-content">
            <h4>Задача</h4>
            <p>Создать новую задачу</p>
          </div>
          <Icon name="lucide:chevron-right" size="16" />
        </button>

        <button class="create-option" @click="startTimer">
          <div class="option-icon">
            <Icon name="lucide:clock" size="24" />
          </div>
          <div class="option-content">
            <h4>Таймер</h4>
            <p>Начать фокус-сессию</p>
          </div>
          <Icon name="lucide:chevron-right" size="16" />
        </button>

        <button class="create-option" @click="createNote">
          <div class="option-icon">
            <Icon name="lucide:sticky-note" size="24" />
          </div>
          <div class="option-content">
            <h4>Заметка</h4>
            <p>Быстрая заметка</p>
          </div>
          <Icon name="lucide:chevron-right" size="16" />
        </button>

        <button class="create-option" @click="createReminder">
          <div class="option-icon">
            <Icon name="lucide:bell" size="24" />
          </div>
          <div class="option-content">
            <h4>Напоминание</h4>
            <p>Установить напоминание</p>
          </div>
          <Icon name="lucide:chevron-right" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Methods
const createTask = () => {
  console.log('Create task')
  // Здесь можно открыть расширенную форму создания задачи
  emit('close')
}

const startTimer = () => {
  console.log('Start timer')
  navigateTo('/timer')
  emit('close')
}

const createNote = () => {
  console.log('Create note')
  emit('close')
}

const createReminder = () => {
  console.log('Create reminder')
  emit('close')
}

// Navigation
const router = useRouter()

const navigateTo = (route: string) => {
  router.push(route)
}

const { emit } = defineEmits<{
  close: []
}>()
</script>

<style scoped lang="scss">
.quick-create-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: var(--card-bg);
  border-radius: var(--radius-card);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  h3 {
    margin: 0;
    font-size: var(--text-xl);
    color: var(--text-primary);
  }
}

.close-button {
  @include button-reset;
  @include flex-center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-button);
  background: var(--surface-bg);
  color: var(--text-secondary);
  transition: all var(--duration-base);

  &:hover {
    background: var(--error);
    color: white;
  }
}

.create-options {
  padding: var(--space-2);
}

.create-option {
  @include button-reset;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-card);
  transition: all var(--duration-base);
  margin-bottom: var(--space-1);

  &:hover {
    background: var(--surface-bg);
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.option-icon {
  @include flex-center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-base);
  background: var(--surface-bg);
  color: var(--accent-primary);
  flex-shrink: 0;
}

.option-content {
  flex: 1;
  text-align: left;

  h4 {
    margin: 0 0 var(--space-1);
    font-size: var(--text-base);
    color: var(--text-primary);
    font-weight: var(--font-semibold);
  }

  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.create-option :deep(svg:last-child) {
  color: var(--text-muted);
}
</style>
