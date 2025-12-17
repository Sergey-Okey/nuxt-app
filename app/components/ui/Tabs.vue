<template>
  <div :class="tabsClasses">
    <!-- Tabs header -->
    <div ref="headerRef" :class="headerClasses" role="tablist">
      <!-- Scroll buttons (if scrollable) -->
      <Button
        v-if="scrollable"
        variant="text"
        size="sm"
        icon-only
        class="tabs-scroll-btn tabs-scroll-prev"
        :disabled="!canScrollPrev"
        @click="scrollPrev"
      >
        <Icon name="chevron-left" size="20" />
      </Button>

      <!-- Tabs container -->
      <div ref="tabsContainerRef" class="tabs-container" @scroll="handleScroll">
        <!-- Tabs -->
        <div
          v-for="(tab, index) in tabs"
          :key="tab.value || index"
          :id="`tab-${tab.value || index}`"
          :class="tabClasses(tab, index)"
          :style="tabStyles(tab)"
          role="tab"
          :aria-selected="modelValue === tab.value"
          :aria-controls="`panel-${tab.value || index}`"
          :tabindex="modelValue === tab.value ? 0 : -1"
          @click="selectTab(tab.value)"
          @keydown="handleKeydown($event, tab.value)"
        >
          <!-- Tab content -->
          <div class="tab-content">
            <!-- Icon -->
            <Icon
              v-if="tab.icon"
              :name="tab.icon"
              :size="iconSize"
              class="tab-icon"
            />

            <!-- Label -->
            <span class="tab-label">
              {{ tab.label }}
            </span>

            <!-- Badge -->
            <span v-if="tab.badge" class="tab-badge">
              {{ tab.badge }}
            </span>

            <!-- Close button (for closable tabs) -->
            <Button
              v-if="closable && tab.closable !== false"
              variant="text"
              size="xs"
              icon-only
              class="tab-close"
              @click.stop="closeTab(tab.value)"
              aria-label="Close tab"
            >
              <Icon name="close" size="14" />
            </Button>
          </div>

          <!-- Active indicator -->
          <div v-if="modelValue === tab.value" class="tab-indicator" />
        </div>

        <!-- Add button (if addable) -->
        <Button
          v-if="addable"
          variant="text"
          size="sm"
          icon-only
          class="tabs-add-btn"
          @click="handleAdd"
          aria-label="Add tab"
        >
          <Icon name="plus" size="20" />
        </Button>
      </div>

      <!-- Scroll buttons (if scrollable) -->
      <Button
        v-if="scrollable"
        variant="text"
        size="sm"
        icon-only
        class="tabs-scroll-btn tabs-scroll-next"
        :disabled="!canScrollNext"
        @click="scrollNext"
      >
        <Icon name="chevron-right" size="20" />
      </Button>
    </div>

    <!-- Tab panels -->
    <div class="tabs-panels">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useSlots } from 'vue'

export interface TabItem {
  value: string | number
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  closable?: boolean
}

export interface TabsProps {
  // Model
  modelValue: string | number

  // Configuration
  tabs?: TabItem[]
  variant?: 'default' | 'pills' | 'underline' | 'segmented'
  alignment?: 'start' | 'center' | 'end' | 'stretch'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  vertical?: boolean

  // Features
  closable?: boolean
  addable?: boolean
  scrollable?: boolean

  // Styling
  rounded?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<TabsProps>(), {
  variant: 'default',
  alignment: 'start',
  size: 'md',
  fullWidth: false,
  vertical: false,
  closable: false,
  addable: false,
  scrollable: false,
  rounded: false,
  border: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
  'tab-click': [value: string | number]
  'tab-close': [value: string | number]
  'tab-add': []
}>()

const slots = useSlots()
const headerRef = ref<HTMLElement>()
const tabsContainerRef = ref<HTMLElement>()
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

// Get tabs from props or slots
const tabs = computed(() => {
  if (props.tabs && props.tabs.length > 0) {
    return props.tabs
  }

  // Extract tabs from default slot
  if (slots.default) {
    const children = slots.default()
    return children
      .filter((child) => child.type && (child.type as any).__name === 'Tab')
      .map((child) => ({
        value: child.props?.value,
        label: child.props?.label,
        icon: child.props?.icon,
        badge: child.props?.badge,
        disabled: child.props?.disabled,
        closable: child.props?.closable,
      }))
  }

  return []
})

// Icon size based on tab size
const iconSize = computed(() => {
  const map = { sm: '16', md: '18', lg: '20' }
  return map[props.size]
})

// Classes
const tabsClasses = computed(() => [
  'tabs',
  `tabs--${props.variant}`,
  `tabs--${props.alignment}`,
  `tabs--${props.size}`,
  {
    'tabs--vertical': props.vertical,
    'tabs--full-width': props.fullWidth,
    'tabs--rounded': props.rounded,
    'tabs--border': props.border,
    'tabs--scrollable': props.scrollable,
  },
])

const headerClasses = computed(() => [
  'tabs-header',
  {
    'tabs-header--scrollable': props.scrollable,
  },
])

// Tab classes
const tabClasses = (tab: TabItem, index: number) => [
  'tab',
  {
    'tab--active': props.modelValue === tab.value,
    'tab--disabled': tab.disabled,
    'tab--has-icon': tab.icon,
    'tab--has-badge': tab.badge,
  },
]

// Tab styles
const tabStyles = (tab: TabItem) => {
  const styles: Record<string, string> = {}

  if (props.fullWidth && props.alignment === 'stretch') {
    styles.flex = '1'
  }

  return styles
}

// Methods
const selectTab = (value: string | number) => {
  const tab = tabs.value.find((t) => t.value === value)
  if (tab && !tab.disabled) {
    emit('update:modelValue', value)
    emit('change', value)
    emit('tab-click', value)
  }
}

const closeTab = (value: string | number) => {
  emit('tab-close', value)
}

const handleAdd = () => {
  emit('tab-add')
}

const handleKeydown = (event: KeyboardEvent, value: string | number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectTab(value)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigateTabs(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateTabs(1)
  }
}

const navigateTabs = (direction: number) => {
  const currentIndex = tabs.value.findIndex(
    (tab) => tab.value === props.modelValue
  )
  if (currentIndex === -1) return

  let newIndex = currentIndex + direction
  while (newIndex >= 0 && newIndex < tabs.value.length) {
    if (!tabs.value[newIndex].disabled) {
      selectTab(tabs.value[newIndex].value)
      break
    }
    newIndex += direction
  }
}

// Scroll handling
const checkScroll = () => {
  if (!tabsContainerRef.value || !props.scrollable) return

  const container = tabsContainerRef.value
  canScrollPrev.value = container.scrollLeft > 0
  canScrollNext.value =
    container.scrollLeft < container.scrollWidth - container.clientWidth
}

const scrollPrev = () => {
  if (tabsContainerRef.value) {
    tabsContainerRef.value.scrollLeft -= 100
  }
}

const scrollNext = () => {
  if (tabsContainerRef.value) {
    tabsContainerRef.value.scrollLeft += 100
  }
}

const handleScroll = () => {
  checkScroll()
}

// Lifecycle
onMounted(() => {
  checkScroll()
  window.addEventListener('resize', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll)
})
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  flex-direction: column;
  width: 100%;

  // Vertical orientation
  &--vertical {
    flex-direction: row;

    .tabs-header {
      flex-direction: column;
      width: auto;
      min-width: 200px;
      border-right: 1px solid var(--border-light);
      border-bottom: none;

      .tabs-container {
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .tab {
        width: 100%;
        justify-content: flex-start;
        border-bottom: none;
        border-right: 2px solid transparent;

        &--active {
          border-right-color: var(--text-primary);
        }

        .tab-indicator {
          display: none;
        }
      }
    }

    .tabs-panels {
      flex: 1;
      padding-left: var(--space-6);
    }
  }
}

.tabs-header {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  min-height: 48px;

  &--scrollable {
    .tabs-container {
      overflow-x: auto;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}

.tabs-container {
  display: flex;
  flex: 1;
  gap: var(--space-1);
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  user-select: none;
  transition: all var(--duration-200) var(--ease-in-out);
  border-bottom: 2px solid transparent;
  min-height: 48px;
  flex-shrink: 0;

  // States
  &--active {
    color: var(--text-primary);

    .tab-label {
      font-weight: var(--font-semibold);
    }
  }

  &--disabled {
    opacity: var(--opacity-50);
    cursor: not-allowed;
    pointer-events: none;
  }

  // Hover effect (only for non-disabled)
  &:not(.tab--disabled):hover {
    background: var(--hover-bg);
  }
}

.tab-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  z-index: 1;
}

.tab-icon {
  flex-shrink: 0;
}

.tab-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: currentColor;
  white-space: nowrap;
  transition: color var(--duration-200) var(--ease-in-out);
}

.tab-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-2);
  background: var(--surface-bg);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.tab-close {
  margin-left: var(--space-1);
  margin-right: calc(var(--space-1) * -1);
  opacity: 0.5;
  transition: opacity var(--duration-200) var(--ease-in-out);

  &:hover {
    opacity: 1;
  }
}

.tab-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--text-primary);
  border-radius: var(--radius-full) var(--radius-full) 0 0;
}

// Variants
.tabs--pills {
  .tabs-header {
    border-bottom: none;
    gap: var(--space-2);

    .tab {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-base);
      border-bottom: 1px solid var(--border-light);
      padding: var(--space-2) var(--space-4);

      &--active {
        background: var(--surface-bg);
        border-color: var(--border-hover);
      }

      &:not(.tab--disabled):hover {
        border-color: var(--border-hover);
      }
    }

    .tab-indicator {
      display: none;
    }
  }
}

.tabs--underline {
  .tabs-header {
    border-bottom: none;

    .tab {
      border-bottom: 2px solid transparent;

      &--active {
        .tab-label {
          font-weight: var(--font-semibold);
        }
      }
    }
  }
}

.tabs--segmented {
  .tabs-header {
    background: var(--surface-bg);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-base);
    padding: var(--space-1);
    border-bottom: none;

    .tab {
      border-radius: var(--radius-sm);
      border-bottom: none;

      &--active {
        background: var(--card-bg);
        box-shadow: var(--shadow-sm);
      }
    }

    .tab-indicator {
      display: none;
    }
  }
}

// Alignment
.tabs--center {
  .tabs-header .tabs-container {
    justify-content: center;
  }
}

.tabs--end {
  .tabs-header .tabs-container {
    justify-content: flex-end;
  }
}

.tabs--stretch {
  .tabs-header .tabs-container {
    justify-content: stretch;

    .tab {
      flex: 1;
      text-align: center;
    }
  }
}

// Size variants
.tabs--sm {
  .tab {
    padding: var(--space-2) var(--space-3);
    min-height: 40px;
  }

  .tab-label {
    font-size: var(--text-xs);
  }
}

.tabs--lg {
  .tab {
    padding: var(--space-4) var(--space-6);
    min-height: 56px;
  }

  .tab-label {
    font-size: var(--text-base);
  }
}

// Scroll buttons
.tabs-scroll-btn {
  flex-shrink: 0;

  &:disabled {
    opacity: var(--opacity-25);
    cursor: not-allowed;
  }
}

.tabs-add-btn {
  flex-shrink: 0;
  margin-left: var(--space-2);
}

.tabs-panels {
  padding-top: var(--space-6);
}
</style>
