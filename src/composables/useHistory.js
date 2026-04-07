import { ref } from 'vue'
import { authHeaders, getApiBase } from './useAuth'

const API_BASE = getApiBase()

export function useHistory() {
  const history = ref([])
  const loading = ref(false)

  async function savePractice(examLevel, examTime, questionType, totalQuestions, correctCount) {
    try {
      await fetch(`${API_BASE}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ examLevel, examTime, questionType, totalQuestions, correctCount }),
      })
    } catch (err) {
      console.error('Failed to save history:', err)
    }
  }

  async function fetchHistory() {
    loading.value = true
    try {
      const res = await fetch(`${API_BASE}/api/history`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Fetch failed')
      const data = await res.json()
      history.value = data.items
    } catch (err) {
      console.error('Failed to fetch history:', err)
      history.value = []
    } finally {
      loading.value = false
    }
  }

  async function deleteHistory(id) {
    try {
      await fetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE', headers: authHeaders() })
      history.value = history.value.filter(h => h.id !== id)
    } catch (err) {
      console.error('Failed to delete history:', err)
    }
  }

  async function clearAllHistory() {
    try {
      await fetch(`${API_BASE}/api/history`, { method: 'DELETE', headers: authHeaders() })
      history.value = []
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  return { history, loading, savePractice, fetchHistory, deleteHistory, clearAllHistory }
}
