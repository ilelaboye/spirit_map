<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', value: string): void;
}>();

const inputValue = ref('');

const handleSubmit = () => {
  if (inputValue.value.trim()) {
    emit('submit', inputValue.value);
  }
};
</script>

<template>
  <div class="input-group">
    <input
      v-model="inputValue"
      type="text"
      :placeholder="placeholder"
      :disabled="disabled"
      @keyup.enter="handleSubmit"
    >
    <button 
      @click="handleSubmit"
      :disabled="disabled || !inputValue.trim()"
    >
      <slot>Submit</slot>
    </button>
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}
</style>