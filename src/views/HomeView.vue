<template>
  <div class="home">
    <h1 class="home-title">JLPT 真題練習</h1>
    <p class="home-subtitle">日本語能力試験 過去問題集</p>

    <div class="level-sections">
      <div v-for="level in ['n1', 'n2']" :key="level" class="level-section">
        <h2 class="level-heading">{{ level.toUpperCase() }}</h2>
        <div class="exam-grid">
          <router-link
            v-for="exam in examsByLevel[level]"
            :key="exam.time"
            :to="`/exam/${exam.level}/${exam.time}`"
            class="exam-card"
          >
            <span class="exam-year">{{ exam.time.slice(0, 4) }}年</span>
            <span class="exam-month">{{ exam.time.slice(4) }}月</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAvailableExams } from '../data'

const exams = getAvailableExams()

const examsByLevel = computed(() => {
  const map = {}
  for (const e of exams) {
    if (!map[e.level]) map[e.level] = []
    map[e.level].push(e)
  }
  return map
})
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.home-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}
.home-subtitle {
  text-align: center;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}
.level-section {
  margin-bottom: 2rem;
}
.level-heading {
  font-size: 1.3rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary);
  margin-bottom: 1rem;
}
.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}
.exam-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--color-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s, box-shadow 0.15s;
}
.exam-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}
.exam-year {
  font-size: 1.1rem;
  font-weight: 600;
}
.exam-month {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}
</style>
