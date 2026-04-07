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
  gap: 0.25rem;
  background: var(--color-bg-soft);
  padding: 0.25rem;
  border-radius: 8px;
  overflow-x: auto;
}
.tab {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: none;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  color: var(--color-text-muted);
  transition: all 0.2s;
}
.tab.active {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}
</style>
