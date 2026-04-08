import { authHeaders, getApiBase } from './useAuth'

const API_BASE = getApiBase()

export async function fetchSavedAnswers(level, time) {
  try {
    const res = await fetch(`${API_BASE}/api/answers/${level}/${time}`, {
      headers: authHeaders(),
    })
    if (!res.ok) return {}
    const { data } = await res.json()
    return data || {}
  } catch {
    return {}
  }
}

export async function syncAnswers(level, time, questionType, answers, submitted) {
  try {
    await fetch(`${API_BASE}/api/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        examLevel: level,
        examTime: time,
        questionType,
        answers,
        submitted,
      }),
    })
  } catch (err) {
    console.error('Failed to sync answers:', err)
  }
}
