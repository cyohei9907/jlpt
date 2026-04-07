<template>
  <div class="exam">
    <header class="exam-header">
      <router-link to="/" class="back-btn">&larr; 戻る</router-link>
      <h1 class="exam-title">{{ level.toUpperCase() }} {{ time.slice(0, 4) }}年{{ time.slice(4) }}月</h1>
      <span class="exam-progress">{{ answeredCount }}/{{ totalQuestions }}</span>
    </header>

    <div v-if="loading" class="loading">読み込み中...</div>

    <template v-else>
      <TypeTabs
        :types="availableTypes"
        :model-value="currentType"
        @update:model-value="switchType"
      />

      <QuestionNav
        :questions="currentQuestions"
        v-model="currentIndex"
        :user-answers="userAnswers"
        :revealed="revealed"
      />

      <div class="questions-scroll">
        <template v-for="(section, si) in sections" :key="si">
          <QuestionCard
            v-for="(q, qi) in section.questions"
            :key="q.id"
            :ref="el => setQuestionRef(q.id, el)"
            :question="q"
            :show-title="qi === 0"
            :user-answer="userAnswers[q.id]"
            :is-revealed="!!revealed[q.id]"
            @answer="handleAnswer"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useExam } from '../composables/useExam'
import { useAuth } from '../composables/useAuth'
import { useWrongAnswers } from '../composables/useWrongAnswers'
import TypeTabs from '../components/TypeTabs.vue'
import QuestionNav from '../components/QuestionNav.vue'
import QuestionCard from '../components/QuestionCard.vue'

const props = defineProps({
  level: { type: String, required: true },
  time: { type: String, required: true },
})

const {
  loading,
  currentType,
  currentIndex,
  userAnswers,
  revealed,
  availableTypes,
  currentQuestions,
  sections,
  totalQuestions,
  answeredCount,
  load,
  switchType,
  selectAnswer,
} = useExam(props.level, props.time)

const { isLoggedIn } = useAuth()
const { saveWrongAnswer } = useWrongAnswers()

function handleAnswer(questionId, option) {
  selectAnswer(questionId, option)
  // Save wrong answer if logged in and answer is wrong
  if (isLoggedIn.value) {
    const q = currentQuestions.value.find(q => q.id === questionId)
    if (q && option !== q.answer) {
      saveWrongAnswer(q, props.level, props.time, option)
    }
  }
}

const questionRefs = {}

function setQuestionRef(id, el) {
  if (el) questionRefs[id] = el
}

watch(currentIndex, (idx) => {
  const q = currentQuestions.value[idx]
  if (q && questionRefs[q.id]?.$el) {
    questionRefs[q.id].$el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

onMounted(load)
</script>

<style scoped>
.exam {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}
.exam-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  background: var(--color-bg);
  z-index: 10;
}
.back-btn {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
}
.exam-title {
  flex: 1;
  font-size: 1.1rem;
  text-align: center;
}
.exam-progress {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
.questions-scroll {
  margin-top: 0.5rem;
}
</style>
