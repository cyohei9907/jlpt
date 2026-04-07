<template>
  <div class="home">
    <div class="hero">
      <h1 class="home-title">JLPTcraft</h1>
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
            {{ exam.time.slice(4) }}月
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
  max-width: 480px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}
.hero {
  text-align: center;
  padding: 1.5rem 0 1rem;
}
.home-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--color-text);
}
.home-subtitle {
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-top: 0.15rem;
}
.level-tabs {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.level-tab {
  padding: 0.3rem 1.6rem;
  border: 1px solid var(--color-border);
  border-radius: 99px;
  background: var(--color-card);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s;
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
.year-list {
  display: flex;
  flex-direction: column;
}
.year-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-border);
}
.year-label {
  width: 2.8rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  flex-shrink: 0;
}
.month-cards {
  display: flex;
  gap: 0.35rem;
}
.month-card {
  padding: 0.25rem 0.8rem;
  border-radius: 4px;
  background: var(--color-bg-soft);
  color: var(--color-text);
  font-size: 0.8rem;
  transition: all 0.12s;
}
.month-card:hover {
  background: var(--color-primary);
  color: #fff;
}
.show-more {
  display: block;
  margin: 0.75rem auto 0;
  padding: 0.3rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 99px;
  background: none;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  cursor: pointer;
}
.show-more:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
