import { ref } from 'vue'
import { authHeaders, getApiBase } from './useAuth'

const API_BASE = getApiBase()

export function useWrongAnswers() {
  const wrongAnswers = ref([])
  const loading = ref(false)

  async function saveWrongAnswer(question, examLevel, examTime, userAnswer) {
    try {
      await fetch(`${API_BASE}/api/wrong-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          questionId: question.id,
          examLevel,
          examTime,
          questionType: question.type,
          userAnswer,
          correctAnswer: question.answer,
          questionData: {
            bigTitle: question.bigTitle,
            question: question.question,
            article: question.article,
            option1: question.option1,
            option2: question.option2,
            option3: question.option3,
            option4: question.option4,
            answer: question.answer,
            audio: question.audio,
            picture: question.picture,
            assistant: question.assistant,
            assistantNew: question.assistantNew,
          },
        }),
      })
    } catch (err) {
      console.error('Failed to save wrong answer:', err)
    }
  }

  async function fetchWrongAnswers(filters = {}) {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.level) params.set('level', filters.level)
      if (filters.type) params.set('type', filters.type)
      const res = await fetch(`${API_BASE}/api/wrong-answers?${params}`, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      wrongAnswers.value = data.items
    } catch (err) {
      console.error('Failed to fetch wrong answers:', err)
      wrongAnswers.value = []
    } finally {
      loading.value = false
    }
  }

  async function removeWrongAnswer(id) {
    try {
      await fetch(`${API_BASE}/api/wrong-answers/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      wrongAnswers.value = wrongAnswers.value.filter(w => w.id !== id)
    } catch (err) {
      console.error('Failed to remove wrong answer:', err)
    }
  }

  return { wrongAnswers, loading, saveWrongAnswer, fetchWrongAnswers, removeWrongAnswer }
}
