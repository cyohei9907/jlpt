<template>
  <div class="home">
    <div class="hero">
      <h1 class="home-title">JLPT 真題練習</h1>
      <p class="home-subtitle">日本語能力試験 過去問題集</p>
    </div>

    <div class="level-tabs">
      <button
        v-for="level in ['n1', 'n2']"
        :key="level"
        :class="['level-tab', { active: activeLevel === level }]"
        @click="activeLevel = level; expanded = false"
      >
        {{ level.toUpperCase() }}
      </button>
    </div>

    <div class="year-list">
      <div v-for="year in displayedYears" :key="year" class="year-row">
        <div class="year-label">{{ year }}</div>
        <div class="month-cards">
          <router-link
            v-for="exam in getExamsForYear(year)"
            :key="exam.time"
            :to="`/exam/${exam.level}/${exam.time}`"
            class="month-card"
          >
            <span class="month-num">{{ exam.time.slice(4) }}月</span>
          </router-link>
        </div>
      </div>
    </div>

    <button v-if="!expanded && years.length > 5" class="show-more" @click="expanded = true">
      もっと見る（{{ years.length - 5 }}年分）
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAvailableExams } from '../data'

const exams = getAvailableExams()
const activeLevel = ref('n1')
const expanded = ref(false)

const filteredExams = computed(() =>
  exams.filter(e => e.level === activeLevel.value)
)

const years = computed(() =>
  [...new Set(filteredExams.value.map(e => e.time.slice(0, 4)))].sort((a, b) => b.localeCompare(a))
)

const displayedYears = computed(() =>
  expanded.value ? years.value : years.value.slice(0, 5)
)

function getExamsForYear(year) {
  return filteredExams.value
    .filter(e => e.time.startsWith(year))
    .sort((a, b) => b.time.localeCompare(a.time))
}
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}
.hero {
  text-align: center;
  padding: 2.5rem 0 1.5rem;
}
.home-title {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 0.25rem;
}
.home-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

/* Level Tabs */
.level-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.level-tab {
  padding: 0.6rem 2.5rem;
  border: 2px solid var(--color-border);
  border-radius: 99px;
  background: var(--color-card);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
}
.level-tab.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
.level-tab:not(.active):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Year rows */
.year-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.year-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}
.year-label {
  width: 3.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  flex-shrink: 0;
}
.month-cards {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}
.month-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  background: var(--color-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: all 0.15s;
}
.month-card:hover {
  background: var(--color-primary);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(66, 133, 244, 0.3);
}
.month-num {
  font-size: 0.95rem;
}
.show-more {
  display: block;
  margin: 1rem auto 0;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 99px;
  background: var(--color-card);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}
.show-more:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
