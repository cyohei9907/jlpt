import { ref, computed, shallowRef } from 'vue'
import { getExamData } from '../data'

export function useExam(level, time) {
  const examData = shallowRef(null)
  const loading = ref(true)
  const currentType = ref('type_1')
  const currentIndex = ref(0)
  const userAnswers = ref({})
  const revealed = ref({})

  async function load() {
    loading.value = true
    examData.value = await getExamData(level, time)
    loading.value = false
  }

  const availableTypes = computed(() => {
    if (!examData.value) return []
    return Object.keys(examData.value).sort()
  })

  const currentQuestions = computed(() => {
    if (!examData.value) return []
    return examData.value[currentType.value] || []
  })

  const sections = computed(() => {
    const qs = currentQuestions.value
    if (!qs.length) return []
    const groups = []
    let current = null
    for (const q of qs) {
      const title = q.bigTitle || ''
      if (!current || current.title !== title) {
        current = { title, questions: [] }
        groups.push(current)
      }
      current.questions.push(q)
    }
    return groups
  })

  const totalQuestions = computed(() => currentQuestions.value.length)

  const answeredCount = computed(() => {
    return currentQuestions.value.filter(q => userAnswers.value[q.id] != null).length
  })

  function switchType(type) {
    currentType.value = type
    currentIndex.value = 0
  }

  function selectAnswer(questionId, option) {
    if (revealed.value[questionId]) return
    userAnswers.value[questionId] = option
    revealed.value[questionId] = true
  }

  function resetAnswers() {
    userAnswers.value = {}
    revealed.value = {}
  }

  return {
    loading,
    examData,
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
    resetAnswers,
  }
}
