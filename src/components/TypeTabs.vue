<template>
  <div class="type-tabs">
    <button
      v-for="type in types"
      :key="type"
      :class="['tab', { active: type === modelValue }]"
      @click="$emit('update:modelValue', type)"
    >
      {{ labels[type] || type }}
    </button>
  </div>
</template>

<script setup>
import { TYPE_LABELS } from '../config'

defineProps({
  types: { type: Array, required: true },
  modelValue: { type: String, required: true },
})
defineEmits(['update:modelValue'])

const labels = TYPE_LABELS
</script>

<style scoped>
.type-tabs {
  display: flex;
  gap: 2px;
  background: var(--color-bg-soft);
  padding: 2px;
  border-radius: 5px;
  overflow-x: auto;
}
.tab {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--color-text-muted);
  transition: all 0.15s;
}
.tab.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}
</style>
