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
  gap: 0.35rem;
  padding: 0.5rem 0;
}
.nav-dot {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-card);
  cursor: pointer;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.nav-dot.current {
  border-color: var(--color-primary);
  font-weight: 700;
}
.nav-dot.correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}
.nav-dot.wrong {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}
</style>
