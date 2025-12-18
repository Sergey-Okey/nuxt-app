<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
  showCloseButton?: boolean
  preventClose?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  size: 'md',
  closeOnOverlay: true,
  showCloseButton: true,
  preventClose: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

// Блокировка прокрутки body при открытом модальном окне
const lockBodyScroll = (lock: boolean) => {
  if (lock) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Закрытие по Escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.modelValue && !props.preventClose) {
    closeModal()
  }
}

// Закрытие модального окна
const closeModal = () => {
  if (!props.preventClose) {
    emit('update:modelValue', false)
    emit('close')
  }
}

// Открытие модального окна
const openModal = () => {
  emit('open')
}

// Обработка клика на оверлей
const handleOverlayClick = (e: MouseEvent) => {
  if (
    props.closeOnOverlay &&
    (e.target as HTMLElement).classList.contains('modal-overlay')
  ) {
    closeModal()
  }
}

// Следим за изменениями видимости
watch(
  () => props.modelValue,
  (visible) => {
    lockBodyScroll(visible)
    if (visible) {
      openModal()
    }
  }
)

// Инициализация
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  if (props.modelValue) {
    lockBodyScroll(true)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  lockBodyScroll(false)
})

defineExpose({ closeModal, openModal })
</script>

<template>
  <Transition name="fade">
    <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-content" :class="`modal-content--${size}`">
        <!-- Заголовок -->
        <div v-if="title || showCloseButton" class="modal__header">
          <h2 v-if="title" class="modal__title">
            {{ title }}
          </h2>

          <BaseButton
            v-if="showCloseButton"
            variant="ghost"
            size="sm"
            class="modal__close"
            @click="closeModal"
          >
            <i class="icon-close" />
          </BaseButton>
        </div>

        <!-- Содержимое -->
        <div class="modal__body">
          <slot />
        </div>

        <!-- Футер (опционально) -->
        <div v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  animation: overlay-appear var(--transition-medium);

  .dark-theme & {
    background-color: rgba(0, 0, 0, 0.7);
  }

  @keyframes overlay-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}

.modal-content {
  @include glass-container();
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: var(--z-modal);
  animation: modal-appear var(--transition-medium);
  display: flex;
  flex-direction: column;

  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  // Размеры
  &--sm {
    width: 100%;
    max-width: 400px;
  }

  &--md {
    width: 100%;
    max-width: 500px;
  }

  &--lg {
    width: 100%;
    max-width: 700px;
  }

  &--xl {
    width: 100%;
    max-width: 900px;
  }
}

.modal {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg) var(--spacing-xl) 0;
    margin-bottom: var(--spacing-lg);
  }

  &__title {
    margin: 0;
    font-size: var(--font-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  &__close {
    margin-left: auto;
  }

  &__body {
    flex: 1;
    padding: 0 var(--spacing-xl);
    overflow-y: auto;
    @include custom-scrollbar();

    .dark-theme & {
      @include custom-scrollbar('dark');
    }
  }

  &__footer {
    padding: var(--spacing-lg) var(--spacing-xl);
    border-top: 1px solid var(--color-border-light);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--spacing-md);
    margin-top: auto;
  }
}

// Анимации
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-medium);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Адаптивность
@media (max-width: 640px) {
  .modal-content {
    max-height: 100vh;
    height: 100%;
    border-radius: 0;
    margin: 0;
  }

  .modal__header,
  .modal__body,
  .modal__footer {
    padding: var(--spacing-md);
  }
}
</style>
