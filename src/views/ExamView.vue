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

      <!-- Submitted banner -->
      <div v-if="isTypeSubmitted" class="submitted-banner">
        <span class="submitted-score">{{ correctCount }}/{{ totalQuestions }} 正解（{{ scorePercent }}%）</span>
        <span class="submitted-label">提出済み</span>
      </div>

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

      <!-- Submit button -->
      <div v-if="canSubmit" class="submit-bar">
        <button class="submit-btn" @click="handleSubmit">
          この部分を提出する（{{ answeredCount }}/{{ totalQuestions }}）
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useExam } from '../composables/useExam'
import { useAuth } from '../composables/useAuth'
import { useWrongAnswers } from '../composables/useWrongAnswers'
import { useHistory } from '../composables/useHistory'
import { fetchSavedAnswers, syncAnswers } from '../composables/useAnswerSync'
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
const { savePractice } = useHistory()

// Track submitted state per type
const submittedTypes = ref({})

const isTypeSubmitted = computed(() => !!submittedTypes.value[currentType.value])

const correctCount = computed(() =>
  currentQuestions.value.filter(q => userAnswers.value[q.id] === q.answer).length
)

const scorePercent = computed(() =>
  totalQuestions.value ? Math.round(correctCount.value / totalQuestions.value * 100) : 0
)

const canSubmit = computed(() =>
  isLoggedIn.value &&
  answeredCount.value === totalQuestions.value &&
  !isTypeSubmitted.value
)

// Debounce sync timer
let syncTimer = null

function handleAnswer(questionId, option) {
  selectAnswer(questionId, option)
  if (!isLoggedIn.value) return

  // Save wrong answer
  const q = currentQuestions.value.find(q => q.id === questionId)
  if (q && option !== q.answer) {
    saveWrongAnswer(q, props.level, props.time, option)
  }

  // Debounced sync to server
  clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const typeNum = parseInt(currentType.value.split('_')[1])
    const answersMap = {}
    currentQuestions.value.forEach(q => {
      if (userAnswers.value[q.id] != null) {
        answersMap[q.id] = userAnswers.value[q.id]
      }
    })
    syncAnswers(props.level, props.time, typeNum, answersMap, false)
  }, 1000)
}

async function handleSubmit() {
  const typeNum = parseInt(currentType.value.split('_')[1])
  const answersMap = {}
  currentQuestions.value.forEach(q => {
    if (userAnswers.value[q.id] != null) {
      answersMap[q.id] = userAnswers.value[q.id]
    }
  })

  // Mark as submitted
  await syncAnswers(props.level, props.time, typeNum, answersMap, true)

  // Save practice history
  await savePractice(props.level, props.time, typeNum, totalQuestions.value, correctCount.value)

  submittedTypes.value = { ...submittedTypes.value, [currentType.value]: true }
}

// Restore saved answers on load
async function loadWithAnswers() {
  await load()

  if (!isLoggedIn.value) return

  const saved = await fetchSavedAnswers(props.level, props.time)
  if (!saved || !Object.keys(saved).length) return

  // Restore answers for all types
  for (const [typeKey, record] of Object.entries(saved)) {
    if (!record.answers) continue

    // Get questions for this type
    const questions = currentType.value === typeKey
      ? currentQuestions.value
      : [] // We'll just restore into userAnswers directly

    for (const [qId, option] of Object.entries(record.answers)) {
      const numId = Number(qId)
      userAnswers.value[numId] = option
      revealed.value[numId] = true
    }

    if (record.submitted) {
      submittedTypes.value = { ...submittedTypes.value, [typeKey]: true }
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

onMounted(loadWithAnswers)
</script>

<style scoped>
.exam {
  max-width: 640px;
  margin: 0 auto;
  padding: 0 0.75rem 1.5rem;
}
.exam-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}
.back-btn {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.8rem;
}
.exam-title {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}
.exam-progress {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
.submitted-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.6rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 4px;
  margin: 0.35rem 0;
  font-size: 0.78rem;
}
.submitted-score {
  font-weight: 600;
  color: #166534;
}
.submitted-label {
  color: #22c55e;
  font-size: 0.7rem;
}
.questions-scroll {
  margin-top: 0.35rem;
}
.submit-bar {
  position: sticky;
  bottom: 0;
  padding: 0.5rem 0;
  background: var(--color-bg);
}
.submit-btn {
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}
.submit-btn:hover {
  opacity: 0.9;
}
</style>
