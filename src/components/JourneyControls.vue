<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatDistance, formatDuration, intervalToDuration } from 'date-fns';
import type { JourneyState } from '../types/maps';

const props = defineProps<{
  journeyState: JourneyState;
}>();

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'end'): void;
}>();

const formattedDistance = computed(() => {
  if (props.journeyState.totalDistance === 0) return '0 km';
  return formatDistance(0, props.journeyState.totalDistance);
});

const duration = computed(() => {
  if (!props.journeyState.startTime) return '';
  const end = props.journeyState.endTime || new Date();
  return formatDuration(
    intervalToDuration({
      start: props.journeyState.startTime,
      end
    })
  );
});
</script>

<template>
  <div class="journey-controls">
    <div class="buttons">
      <button
        v-if="!journeyState.isActive"
        @click="emit('start')"
        class="start-button"
      >
        Start Journey
      </button>
      <button
        v-else
        @click="emit('end')"
        class="end-button"
      >
        End Journey
      </button>
    </div>

    <div v-if="journeyState.isActive || journeyState.endTime" class="stats">
      <div class="stat">
        <span class="label">Distance:</span>
        <span class="value">{{ formattedDistance }}</span>
      </div>
      <div class="stat">
        <span class="label">Duration:</span>
        <span class="value">{{ duration }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.journey-controls {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.buttons {
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-button {
  background-color: #42b883;
  color: white;
}

.start-button:hover {
  background-color: #3aa876;
}

.end-button {
  background-color: #dc3545;
  color: white;
}

.end-button:hover {
  background-color: #c82333;
}

.stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  color: #6c757d;
}

.value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
}
</style>