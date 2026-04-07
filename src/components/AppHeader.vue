<template>
  <header class="app-header">
    <router-link to="/" class="logo">JLPT 練習</router-link>
    <nav class="header-nav">
      <router-link v-if="isLoggedIn" to="/wrong-answers" class="nav-link">错题集</router-link>
      <div v-if="isLoggedIn" class="user-info">
        <img :src="user.picture" class="avatar" alt="" />
        <span class="user-name">{{ user.name }}</span>
        <button class="btn-logout" @click="logout">登出</button>
      </div>
      <button v-else class="btn-login" @click="handleLogin" :disabled="loginLoading">
        <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loginLoading ? '...' : 'Google ログイン' }}
      </button>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, isLoggedIn, getGoogleClientId, loginWithGoogle, logout } = useAuth()
const loginLoading = ref(false)
let googleClientId = null

onMounted(async () => {
  try {
    googleClientId = await getGoogleClientId()
    // Load Google Identity Services
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)
  } catch {
    // API not available (local dev without backend)
  }
})

function handleLogin() {
  if (!googleClientId || !window.google) return

  loginLoading.value = true
  window.google.accounts.id.initialize({
    client_id: googleClientId,
    callback: async (response) => {
      try {
        await loginWithGoogle(response.credential)
      } catch (err) {
        console.error('Login failed:', err)
      } finally {
        loginLoading.value = false
      }
    },
  })
  window.google.accounts.id.prompt()
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: var(--color-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo {
  font-weight: 700;
  font-size: 1.05rem;
  text-decoration: none;
  color: var(--color-primary);
}
.header-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.nav-link {
  font-size: 0.9rem;
  text-decoration: none;
  color: var(--color-text);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: background 0.15s;
}
.nav-link:hover {
  background: var(--color-bg-soft);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
.user-name {
  font-size: 0.85rem;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.btn-logout {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
}
.btn-login {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-card);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.btn-login:hover {
  border-color: var(--color-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.google-icon {
  flex-shrink: 0;
}
</style>
