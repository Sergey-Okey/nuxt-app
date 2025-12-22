<script setup lang="ts">
import { computed } from 'vue'
import GlassCard from './GlassCard.vue'
import ProgressDots from './ProgressDots.vue'
import TimeDisplay from './TimeDisplay.vue'
import TagBadge from './TagBadge.vue'
import type { Task, TaskPriority } from '~/types/task.types'

interface Props {
  task: Task
  isActive?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: [taskId: string]
  pause: [taskId: string]
  complete: [taskId: string]
  edit: [taskId: string]
  delete: [taskId: string]
}>()

const totalTime = computed(() =>
  props.task.sessions.reduce((sum, session) => sum + session.duration, 0)
)

const priorityColors: Record<TaskPriority, string> = {
  low: '#4CAF50', // green
  medium: '#FF9800', // orange
  high: '#F44336', // red
}
</script>

<template>
  <GlassCard class="task-card" :class="{ 'is-active': isActive }">
    <div class="task-header">
      <div class="task-title-section">
        <h3 class="task-title">{{ props.task.title }}</h3>
        <span
          class="task-priority-badge"
          :style="{ backgroundColor: priorityColors[props.task.priority] }"
        >
          {{ props.task.priority }}
        </span>
      </div>

      <div class="task-time">
        <TimeDisplay :milliseconds="totalTime" />
        <span v-if="props.task.estimatedTime" class="task-estimated">
          / {{ props.task.estimatedTime }}m
        </span>
      </div>
    </div>

    <p v-if="props.task.description" class="task-description">
      {{ props.task.description }}
    </p>

    <div class="task-progress">
      <ProgressDots
        :total-time="totalTime"
        :estimated-time="props.task.estimatedTime"
      />
    </div>

    <div v-if="props.task.tagIds.length" class="task-tags">
      <TagBadge
        v-for="tagId in props.task.tagIds"
        :key="tagId"
        :label="`Tag ${tagId.slice(0, 3)}`"
        color="var(--color-accent-light)"
        :removable="false"
      />
    </div>

    <div class="task-actions">
      <button
        v-if="!props.isActive"
        class="task-action-btn glass"
        @click="emit('start', props.task.id)"
      >
        Start
      </button>
      <button
        v-else
        class="task-action-btn glass active"
        @click="emit('pause', props.task.id)"
      >
        Pause
      </button>

      <button
        v-if="props.task.status === 'active'"
        class="task-action-btn glass"
        @click="emit('complete', props.task.id)"
      >
        Complete
      </button>

      <button class="task-action-btn glass" @click="emit('edit', props.task.id)">
        Edit
      </button>

      <button
        class="task-action-btn glass danger"
        @click="emit('delete', props.task.id)"
      >
        Delete
      </button>
    </div>
  </GlassCard>
</template>

<style scoped lang="scss">
.task-card {
  &.is-active {
    border: 1px solid var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-hover);
  }
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.task-title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title {
  font-size: $font-md;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.task-priority-badge {
  padding: 2px 8px;
  border-radius: $border-radius-full;
  font-size: $font-xs;
  font-weight: 500;
  color: $color-white;
  text-transform: uppercase;
  opacity: 0.9;
}

.task-time {
  font-size: $font-sm;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.task-estimated {
  color: var(--color-text-tertiary);
}

.task-description {
  font-size: $font-sm;
  color: var(--color-text-secondary);
  margin: 12px 0;
  line-height: 1.4;
}

.task-progress {
  margin: 16px 0;
}

.task-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.task-action-btn {
  flex: 1;
  min-height: 36px;
  padding: 0 12px;
  border-radius: $border-radius-md;
  font-size: $font-sm;
  font-weight: 500;
  color: var(--color-text-primary);
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &.active {
    background-color: var(--color-accent);
    color: var(--color-text-inverse);
  }

  &.danger {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
  }
}
</style>
