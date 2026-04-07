<template>
  <div class="wrong-answers">
    <h1 class="page-title">错题集</h1>

    <div class="filters">
      <select v-model="filterLevel" @change="load">
        <option value="">全部レベル</option>
        <option value="n1">N1</option>
        <option value="n2">N2</option>
      </select>
      <select v-model="filterType" @change="load">
        <option value="">全部タイプ</option>
        <option value="1">文字・語彙</option>
        <option value="2">文法</option>
        <option value="3">読解</option>
        <option value="4">聴解</option>
      </select>
    </div>

    <div v-if="loading" class="loading">読み込み中...</div>

    <div v-else-if="wrongAnswers.length === 0" class="empty">
      まだ错题がありません。問題を解いてみましょう！
    </div>

    <div v-else class="wrong-list">
      <div v-for="item in wrongAnswers" :key="item.id" class="wrong-card">
        <div class="wrong-meta">
          <span class="wrong-level">{{ item.examLevel?.toUpperCase() }}</span>
          <span class="wrong-time">{{ item.examTime?.slice(0,4) }}年{{ item.examTime?.slice(4) }}月</span>
          <span class="wrong-count">{{ item.wrongCount }}回間違い</span>
          <button class="btn-remove" @click="handleRemove(item.id)">削除</button>
        </div>

        <div v-if="item.questionData?.question" class="wrong-question" v-html="item.questionData.question"></div>

        <div class="wrong-options">
          <div
            v-for="n in 4"
            :key="n"
            :class="['wrong-option', {
              correct: n === item.correctAnswer,
              wrong: n === item.userAnswer && n !== item.correctAnswer,
            }]"
          >
            <span class="opt-num">{{ n }}</span>
            {{ item.questionData?.[`option${n}`] }}
          </div>
        </div>

        <div v-if="item.questionData?.assistant" class="wrong-explanation" v-html="item.questionData.assistantNew || item.questionData.assistant"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWrongAnswers } from '../composables/useWrongAnswers'

const { wrongAnswers, loading, fetchWrongAnswers, removeWrongAnswer } = useWrongAnswers()
const filterLevel = ref('')
const filterType = ref('')

function load() {
  fetchWrongAnswers({ level: filterLevel.value, type: filterType.value })
}

async function handleRemove(id) {
  await removeWrongAnswer(id)
}

onMounted(load)
</script>

<style scoped>
.wrong-answers {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
.page-title {
  font-size: 1.4rem;
  margin-bottom: 1rem;
}
.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.filters select {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--color-card);
}
.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-muted);
}
.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.wrong-card {
  background: var(--color-card);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.wrong-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}
.wrong-level {
  background: var(--color-primary);
  color: #fff;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}
.wrong-time {
  color: var(--color-text-muted);
}
.wrong-count {
  color: #dc3545;
  font-weight: 600;
}
.btn-remove {
  margin-left: auto;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: none;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--color-text-muted);
}
.btn-remove:hover {
  border-color: #dc3545;
  color: #dc3545;
}
.wrong-question {
  line-height: 1.7;
  margin-bottom: 0.75rem;
}
.wrong-options {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}
.wrong-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid var(--color-border);
}
.wrong-option.correct {
  background: #d4edda;
  border-color: #28a745;
}
.wrong-option.wrong {
  background: #f8d7da;
  border-color: #dc3545;
}
.opt-num {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.wrong-explanation {
  background: var(--color-bg-soft);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--color-text-muted);
}
</style>
