import { ref, computed } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE || ''

function decodeJwtPayload(token) {
  const base64 = token.split('.')[1]
  // Handle URL-safe base64
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/') +
    '='.repeat((4 - base64.length % 4) % 4)
  return JSON.parse(decodeURIComponent(
    atob(padded).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  ))
}

const user = ref(null)
const token = ref(localStorage.getItem('jlpt_token'))

// Restore user from token on load
if (token.value) {
  try {
    const payload = decodeJwtPayload(token.value)
    // Check expiry
    if (payload.exp && payload.exp * 1000 > Date.now()) {
      user.value = { id: payload.userId, email: payload.email, name: payload.name, picture: payload.picture }
    } else {
      token.value = null
      localStorage.removeItem('jlpt_token')
    }
  } catch (e) {
    console.error('Token restore failed:', e)
    token.value = null
    localStorage.removeItem('jlpt_token')
  }
}

export function useAuth() {
  const isLoggedIn = computed(() => !!user.value)

  async function getGoogleClientId() {
    const res = await fetch(`${API_BASE}/api/config`)
    const data = await res.json()
    return data.googleClientId
  }

  async function loginWithGoogle(credential) {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    token.value = data.token
    user.value = data.user
    localStorage.setItem('jlpt_token', data.token)
    return data.user
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('jlpt_token')
  }

  return { user, token, isLoggedIn, getGoogleClientId, loginWithGoogle, logout }
}

export function authHeaders() {
  return token.value ? { Authorization: `Bearer ${token.value}` } : {}
}

export function getApiBase() {
  return API_BASE
}
