<template>
  <div :class="wrapperClasses" :style="wrapperStyles">
    <!-- Label -->
    <div v-if="label || showValue" class="progress-label">
      <span v-if="label" class="progress-label-text">
        {{ label }}
      </span>
      <span v-if="showValue" class="progress-value">
        {{ formattedValue }}
      </span>
    </div>

    <!-- Progress bar -->
    <div
      ref="trackRef"
      :class="trackClasses"
      :style="trackStyles"
      role="progressbar"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="internalValue"
      :aria-valuetext="ariaValueText"
      :aria-label="ariaLabel || label"
    >
      <!-- Progress fill -->
      <div :class="fillClasses" :style="fillStyles">
        <!-- Buffer (optional) -->
        <div
          v-if="showBuffer && bufferValue > 0"
          :class="bufferClasses"
          :style="bufferStyles"
        />

        <!-- Stripes (for indeterminate) -->
        <div
          v-if="striped || indeterminate"
          :class="stripesClasses"
          :style="stripesStyles"
        />

        <!-- Inner label -->
        <div v-if="innerLabel" class="progress-inner-label">
          {{ innerLabel }}
        </div>
      </div>

      <!-- Steps (optional) -->
      <div v-if="showSteps && steps > 0" class="progress-steps">
        <div
          v-for="step in steps"
          :key="step"
          :class="stepClasses(step)"
          :style="stepStyles(step)"
        />
      </div>
    </div>

    <!-- Helper text -->
    <div v-if="helperText" class="progress-helper">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface ProgressProps {
  // Value
  modelValue?: number
  min?: number
  max?: number

  // Variants
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'line' | 'circle' | 'semicircle'

  // Display
  label?: string
  showValue?: boolean
  valueFormat?: 'percent' | 'fraction' | 'value'
  innerLabel?: string
  helperText?: string

  // States
  indeterminate?: boolean
  animated?: boolean
  striped?: boolean

  // Buffer
  bufferValue?: number
  showBuffer?: boolean

  // Steps
  steps?: number
  showSteps?: boolean
  stepSize?: number

  // Customization
  color?: string
  trackColor?: string
  height?: string
  width?: string

  // Accessibility
  ariaLabel?: string
  ariaValueText?: string
}

const props = withDefaults(defineProps<ProgressProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  variant: 'default',
  size: 'md',
  shape: 'line',
  valueFormat: 'percent',
  showValue: false,
  showBuffer: false,
  bufferValue: 0,
  steps: 0,
  showSteps: false,
  stepSize: 4,
  animated: false,
  striped: false,
})

const trackRef = ref<HTMLElement>()

// Clamp value between min and max
const internalValue = computed(() => {
  const value = props.modelValue
  return Math.max(props.min, Math.min(props.max, value))
})

// Calculate percentage
const percentage = computed(() => {
  const range = props.max - props.min
  return range > 0 ? ((internalValue.value - props.min) / range) * 100 : 0
})

// Calculate buffer percentage
const bufferPercentage = computed(() => {
  const range = props.max - props.min
  return range > 0 ? ((props.bufferValue - props.min) / range) * 100 : 0
})

// Formatted value display
const formattedValue = computed(() => {
  switch (props.valueFormat) {
    case 'percent':
      return `${Math.round(percentage.value)}%`
    case 'fraction':
      return `${internalValue.value}/${props.max}`
    case 'value':
      return `${internalValue.value}`
    default:
      return `${Math.round(percentage.value)}%`
  }
})

// Variant color mapping
const variantColors = {
  default: 'var(--text-primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
}

// Height mapping
const sizeHeights = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
}

// Classes
const wrapperClasses = computed(() => [
  'progress',
  `progress--${props.shape}`,
  `progress--${props.size}`,
  {
    'progress--indeterminate': props.indeterminate,
    'progress--animated': props.animated,
    'progress--striped': props.striped,
    'progress--has-label': props.label || props.showValue,
    'progress--has-steps': props.showSteps && props.steps > 0,
    'progress--has-buffer': props.showBuffer,
  },
])

const wrapperStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.width && props.shape !== 'line') {
    styles.width = props.width
    styles.height = props.height || props.width
  }

  return styles
})

const trackClasses = computed(() => [
  'progress-track',
  {
    'progress-track--circle': props.shape === 'circle',
    'progress-track--semicircle': props.shape === 'semicircle',
  },
])

const trackStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.trackColor) {
    styles.background = props.trackColor
  }

  if (props.height && props.shape === 'line') {
    styles.height = props.height
  }

  return styles
})

const fillClasses = computed(() => [
  'progress-fill',
  `progress-fill--${props.variant}`,
  {
    'progress-fill--indeterminate': props.indeterminate,
    'progress-fill--animated': props.animated,
    'progress-fill--striped': props.striped,
  },
])

const fillStyles = computed(() => {
  const styles: Record<string, string> = {}

  // Set width/transform based on shape
  if (props.shape === 'line') {
    styles.width = `${percentage.value}%`
  } else if (props.shape === 'circle' || props.shape === 'semicircle') {
    const strokeDasharray = props.shape === 'circle' ? 283 : 141.5
    const offset = strokeDasharray * (1 - percentage.value / 100)
    styles.strokeDashoffset = `${offset}`
  }

  // Custom color
  if (props.color) {
    if (props.shape === 'line') {
      styles.background = props.color
    } else {
      styles.stroke = props.color
    }
  }

  return styles
})

const bufferClasses = computed(() => ['progress-buffer'])

const bufferStyles = computed(() => ({
  width: `${bufferPercentage.value}%`,
}))

const stripesClasses = computed(() => [
  'progress-stripes',
  {
    'progress-stripes--animated': props.animated || props.indeterminate,
  },
])

const stripesStyles = computed(() => ({
  backgroundSize: `${props.height || sizeHeights[props.size]} ${
    props.height || sizeHeights[props.size]
  }`,
}))

// Step methods
const stepClasses = (step: number) => [
  'progress-step',
  {
    'progress-step--active':
      step <= Math.ceil((internalValue.value / props.max) * props.steps),
  },
]

const stepStyles = (step: number) => ({
  width: `${props.stepSize}px`,
  height: `${props.stepSize}px`,
})
</script>

<style lang="scss" scoped>
.progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;

  // Circle and semicircle shapes
  &--circle,
  &--semicircle {
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;

    .progress-track {
      width: 100%;
      height: 100%;
    }
  }
}

.progress-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.progress-label-text {
  font-weight: var(--font-medium);
}

.progress-value {
  color: var(--text-secondary);
}

.progress-track {
  position: relative;
  background: var(--surface-bg);
  border-radius: var(--radius-full);
  overflow: hidden;

  // Circle track
  &--circle,
  &--semicircle {
    background: transparent;
    border-radius: var(--radius-full);

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .progress-fill {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset var(--duration-300) var(--ease-out);
    }
  }

  &--semicircle {
    .progress-fill {
      stroke-dasharray: 141.5; // Half of circle
    }
  }

  &--circle {
    .progress-fill {
      stroke-dasharray: 283; // Full circle
    }
  }
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: inherit;
  transition: width var(--duration-300) var(--ease-out);
  background: var(--text-primary);

  // Variants
  &--success {
    background: var(--success);
  }

  &--warning {
    background: var(--warning);
  }

  &--error {
    background: var(--error);
  }

  &--info {
    background: var(--info);
  }

  // Indeterminate animation
  &--indeterminate {
    width: 50% !important;
    animation: progress-indeterminate 1.5s ease-in-out infinite;
  }

  // Circle fill
  .progress-track--circle &,
  .progress-track--semicircle & {
    position: static;
    width: auto;
    height: auto;
    background: none;
    stroke: var(--text-primary);
    stroke-width: 8;

    &.progress-fill--success {
      stroke: var(--success);
    }

    &.progress-fill--warning {
      stroke: var(--warning);
    }

    &.progress-fill--error {
      stroke: var(--error);
    }

    &.progress-fill--info {
      stroke: var(--info);
    }
  }
}

.progress-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: inherit;
  transition: width var(--duration-300) var(--ease-out);
}

.progress-stripes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  border-radius: inherit;

  &--animated {
    animation: progress-stripes 1s linear infinite;
  }
}

.progress-inner-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.progress-steps {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  pointer-events: none;
}

.progress-step {
  background: var(--card-bg);
  border-radius: var(--radius-full);
  flex-shrink: 0;

  &--active {
    background: var(--text-primary);
  }
}

.progress-helper {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

// Size variants
.progress--xs {
  .progress-track:not(.progress-track--circle):not(
      .progress-track--semicircle
    ) {
    height: 4px;
  }

  .progress-step {
    width: 2px;
    height: 2px;
  }
}

.progress--sm {
  .progress-track:not(.progress-track--circle):not(
      .progress-track--semicircle
    ) {
    height: 6px;
  }

  .progress-step {
    width: 3px;
    height: 3px;
  }
}

.progress--md {
  .progress-track:not(.progress-track--circle):not(
      .progress-track--semicircle
    ) {
    height: 8px;
  }

  .progress-step {
    width: 4px;
    height: 4px;
  }
}

.progress--lg {
  .progress-track:not(.progress-track--circle):not(
      .progress-track--semicircle
    ) {
    height: 12px;
  }

  .progress-step {
    width: 6px;
    height: 6px;
  }
}

// Animations
@keyframes progress-indeterminate {
  0% {
    left: -50%;
  }
  100% {
    left: 100%;
  }
}

@keyframes progress-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

// Circle and semicircle sizes
@include breakpoint(sm) {
  .progress--circle,
  .progress--semicircle {
    width: 120px;
    height: 120px;
  }
}

@include breakpoint(md) {
  .progress--circle,
  .progress--semicircle {
    width: 140px;
    height: 140px;
  }
}
</style>
