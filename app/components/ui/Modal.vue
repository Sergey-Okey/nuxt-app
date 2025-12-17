<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="handleOverlayClick"
      >
        <div
          ref="modalRef"
          :class="modalClasses"
          :style="modalStyles"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descriptionId"
        >
          <!-- Header -->
          <header v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <div class="modal-title">
                <h3 :id="titleId" class="modal-title-text">
                  {{ title }}
                </h3>
                <div v-if="subtitle" class="modal-subtitle">
                  {{ subtitle }}
                </div>
              </div>
            </slot>

            <!-- Close button -->
            <Button
              v-if="closable"
              variant="text"
              size="sm"
              icon-only
              class="modal-close"
              @click="handleClose"
              aria-label="Close modal"
            >
              <Icon name="close" size="20" />
            </Button>
          </header>

          <!-- Content -->
          <div class="modal-content">
            <slot />
          </div>

          <!-- Footer -->
          <footer v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface ModalProps {
  // State
  modelValue: boolean
  title?: string
  subtitle?: string

  // Configuration
  closable?: boolean
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  persistent?: boolean
  fullscreen?: boolean
  maxWidth?: string

  // Accessibility
  ariaLabel?: string

  // Styling
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<ModalProps>(), {
  closable: true,
  closeOnOverlayClick: true,
  closeOnEsc: true,
  persistent: false,
  fullscreen: false,
  maxWidth: '500px',
  padding: 'md',
  rounded: 'lg',
  shadow: 'xl',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  open: []
  close: []
  'overlay-click': [event: MouseEvent]
}>()

const modalRef = ref<HTMLElement>()
const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
const descriptionId = `modal-description-${Math.random()
  .toString(36)
  .substr(2, 9)}`

// Classes
const modalClasses = computed(() => [
  'modal',
  `modal--padding-${props.padding}`,
  `modal--rounded-${props.rounded}`,
  `modal--shadow-${props.shadow}`,
  {
    'modal--fullscreen': props.fullscreen,
    'modal--has-header': props.$slots.header || props.title,
    'modal--has-footer': props.$slots.footer,
  },
])

// Styles
const modalStyles = computed(() => ({
  maxWidth: props.fullscreen ? '100%' : props.maxWidth,
}))

// Methods
const handleOverlayClick = (event: MouseEvent) => {
  if (props.closeOnOverlayClick && !props.persistent) {
    handleClose()
  }
  emit('overlay-click', event)
}

const handleClose = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEsc && !props.persistent) {
    handleClose()
  }
}

// Focus trap
const handleFocusTrap = (event: KeyboardEvent) => {
  if (event.key === 'Tab' && modalRef.value) {
    const focusable = modalRef.value.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusable.length === 0) return

    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === first) {
        last.focus()
        event.preventDefault()
      }
    } else {
      if (document.activeElement === last) {
        first.focus()
        event.preventDefault()
      }
    }
  }
}

// Lifecycle
onMounted(() => {
  if (props.modelValue) {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keydown', handleFocusTrap)
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('keydown', handleFocusTrap)
  document.body.style.overflow = ''
})

// Watch modelValue changes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      emit('open')
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('keydown', handleFocusTrap)
      document.body.style.overflow = 'hidden'

      // Focus first focusable element
      nextTick(() => {
        const focusable = modalRef.value?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        focusable?.focus()
      })
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keydown', handleFocusTrap)
      document.body.style.overflow = ''
    }
  }
)
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: var(--z-modal);
  animation: overlay-fade-in var(--duration-200) var(--ease-out);
}

.modal {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 100%;
  animation: modal-slide-up var(--duration-300) var(--ease-out);
  overflow: hidden;

  // Fullscreen
  &--fullscreen {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
    border: none;
  }
}

// Padding variants
.modal--padding-none {
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 0;
  }
}

.modal--padding-sm {
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--space-4);
  }
}

.modal--padding-md {
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--space-6);
  }
}

.modal--padding-lg {
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: var(--space-8);
  }
}

// Rounded variants
.modal--rounded-sm {
  border-radius: var(--radius-sm);
}

.modal--rounded-md {
  border-radius: var(--radius-md);
}

.modal--rounded-lg {
  border-radius: var(--radius-lg);
}

.modal--rounded-xl {
  border-radius: var(--radius-xl);
}

// Shadow variants
.modal--shadow-none {
  box-shadow: none;
}

.modal--shadow-sm {
  box-shadow: var(--shadow-sm);
}

.modal--shadow-md {
  box-shadow: var(--shadow-md);
}

.modal--shadow-lg {
  box-shadow: var(--shadow-lg);
}

.modal--shadow-xl {
  box-shadow: var(--shadow-xl);
}

// Header
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}

.modal-title {
  flex: 1;
  min-width: 0;
}

.modal-title-text {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--leading-tight);
  @include text-truncate;
}

.modal-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-2);
}

.modal-close {
  flex-shrink: 0;
  margin: calc(var(--space-1) * -1);
}

// Content
.modal-content {
  flex: 1;
  overflow-y: auto;
  @include scrollbar(6px, transparent, var(--border-light));
}

// Footer
.modal-footer {
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
}

// Animations
@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Transition
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-300) var(--ease-out);

  .modal-overlay {
    transition: opacity var(--duration-300) var(--ease-out);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-overlay {
    opacity: 0;
  }
}

// Responsive
@include breakpoint(sm) {
  .modal-overlay {
    padding: var(--space-8);
  }

  .modal-title-text {
    font-size: var(--text-2xl);
  }
}
</style>
