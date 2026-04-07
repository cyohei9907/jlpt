<template>
  <div class="question-nav">
    <button
      v-for="(q, i) in questions"
      :key="q.id"
      :class="['nav-dot', statusClass(q.id), { current: i === modelValue }]"
      @click="$emit('update:modelValue', i)"
    >
      {{ i + 1 }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  questions: { type: Array, required: true },
  modelValue: { type: Number, required: true },
  userAnswers: { type: Object, required: true },
  revealed: { type: Object, required: true },
})
defineEmits(['update:modelValue'])

function statusClass(id) {
  if (!props.revealed[id]) return ''
  return props.userAnswers[id] === getAnswer(id) ? 'correct' : 'wrong'
}

function getAnswer(id) {
  const q = props.questions.find(q => q.id === id)
  return q?.answer
}
</script>

<style scoped>
.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 0.35rem 0;
}
.nav-dot {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 3px;
  border: 1px solid var(--color-border);
  background: var(--color-card);
  cursor: pointer;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
}
.nav-dot.current {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  font-weight: 700;
}
.nav-dot.correct {
  background: #f0fdf4;
  border-color: #22c55e;
  color: #166534;
}
.nav-dot.wrong {
  background: #fef2f2;
  border-color: #ef4444;
  color: #991b1b;
}
</style>
