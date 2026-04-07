<template>
  <div class="history-page">
    <div class="page-header">
      <h1 class="page-title">練習履歴</h1>
      <button v-if="history.length" class="btn-clear" @click="handleClear">全て削除</button>
    </div>

    <div v-if="loading" class="loading">読み込み中...</div>

    <div v-else-if="history.length === 0" class="empty">
      まだ練習履歴がありません。
    </div>

    <div v-else class="history-list">
      <template v-for="(group, date) in groupedByDate" :key="date">
        <div class="date-header">{{ date }}</div>
        <div v-for="item in group" :key="item.id" class="history-card">
          <div class="history-info">
            <span class="history-level">{{ item.examLevel?.toUpperCase() }}</span>
            <span class="history-exam">{{ formatExamTime(item.examTime) }}</span>
            <span class="history-type">{{ typeLabel(item.questionType) }}</span>
          </div>
          <div class="history-score">
            <span :class="['score', scoreClass(item)]">
              {{ item.correctCount }}/{{ item.totalQuestions }}
            </span>
            <span class="score-pct">{{ Math.round(item.correctCount / item.totalQuestions * 100) }}%</span>
          </div>
          <div class="history-actions">
            <router-link :to="`/exam/${item.examLevel}/${item.examTime}`" class="btn-retry">再挑戦</router-link>
            <button class="btn-delete" @click="handleDelete(item.id)">削除</button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useHistory } from '../composables/useHistory'
import { TYPE_LABELS } from '../config'

const { history, loading, fetchHistory, deleteHistory, clearAllHistory } = useHistory()

const groupedByDate = computed(() => {
  const groups = {}
  for (const item of history.value) {
    const ts = item.practicedAt
    let date
    if (ts && ts._seconds) {
      date = new Date(ts._seconds * 1000).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    } else if (ts) {
      date = new Date(ts).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
    } else {
      date = '不明'
    }
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
  }
  return groups
})

function formatExamTime(time) {
  if (!time) return ''
  return `${time.slice(0, 4)}年${time.slice(4)}月`
}

function typeLabel(type) {
  return TYPE_LABELS[`type_${type}`] || `Type ${type}`
}

function scoreClass(item) {
  const pct = item.correctCount / item.totalQuestions
  if (pct >= 0.8) return 'high'
  if (pct >= 0.5) return 'mid'
  return 'low'
}

async function handleDelete(id) {
  await deleteHistory(id)
}

async function handleClear() {
  if (confirm('全ての履歴を削除しますか？')) {
    await clearAllHistory()
  }
}

onMounted(fetchHistory)
</script>

<style scoped>
.history-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.page-title {
  font-size: 1.4rem;
}
.btn-clear {
  padding: 0.4rem 0.8rem;
  border: 1px solid #dc3545;
  border-radius: 6px;
  background: none;
  color: #dc3545;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-clear:hover {
  background: #dc3545;
  color: #fff;
}
.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
.date-header {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 0.75rem 0 0.25rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.5rem;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.history-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-card);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.history-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}
.history-level {
  background: var(--color-primary);
  color: #fff;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}
.history-exam {
  font-size: 0.85rem;
  white-space: nowrap;
}
.history-type {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-score {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}
.score {
  font-weight: 700;
  font-size: 0.9rem;
}
.score.high { color: #28a745; }
.score.mid { color: #ffc107; }
.score.low { color: #dc3545; }
.score-pct {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.history-actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}
.btn-retry {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: none;
  color: var(--color-primary);
  font-size: 0.75rem;
  text-decoration: none;
}
.btn-retry:hover {
  background: var(--color-primary);
  color: #fff;
}
.btn-delete {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  cursor: pointer;
}
.btn-delete:hover {
  border-color: #dc3545;
  color: #dc3545;
}
</style>
