<script setup lang="ts">
defineProps<{
  distance?: string;
  error?: string;
}>();
</script>

<template>
  <div v-if="error" class="error">
    {{ error }}
  </div>
  <div v-else-if="distance" class="result">
    Distance: <strong>{{ distance }}</strong>
  </div>
</template>

<style scoped>
.error {
  color: #dc3545;
  margin-top: 1rem;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>