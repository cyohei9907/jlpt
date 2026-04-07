<template>
  <div class="question-card">
    <div class="question-header" v-if="showTitle && question.bigTitle">
      <div class="big-title" v-html="question.bigTitle"></div>
    </div>

    <div class="question-body">
      <div class="question-number">第 {{ question.questionId }} 題</div>

      <div v-if="question.article" class="article" v-html="question.article"></div>

      <div v-if="picture" class="question-picture">
        <img :src="picture" alt="" loading="lazy" />
      </div>

      <AudioPlayer v-if="hasAudio" :audio="question.audio" />

      <div v-if="hasQuestionText" class="question-text" v-html="question.question"></div>
      <div v-else-if="hasAudio" class="question-hint">音声を聞いて答えてください</div>

      <div v-if="question.littleQuestion" class="little-question" v-html="question.littleQuestion"></div>

      <div class="options" v-if="hasOptions">
        <button
          v-for="n in 4"
          :key="n"
          :class="['option', optionClass(n)]"
          :disabled="isRevealed"
          @click="$emit('answer', question.id, n)"
        >
          <span class="option-num">{{ n }}</span>
          <span class="option-text">{{ question[`option${n}`] }}</span>
        </button>
      </div>
      <div v-else-if="hasAudio" class="options">
        <button
          v-for="n in 4"
          :key="n"
          :class="['option', optionClass(n)]"
          :disabled="isRevealed"
          @click="$emit('answer', question.id, n)"
        >
          <span class="option-num">{{ n }}</span>
        </button>
      </div>

      <div v-if="isRevealed" class="explanation">
        <div class="explanation-label">
          {{ isCorrect ? '正解!' : `不正解 — 正解は ${question.answer}` }}
        </div>
        <div class="explanation-text" v-html="question.assistantNew || question.assistant"></div>
      </div>

      <div v-if="isRevealed && question.extending && question.extending.length" class="extending">
        <div v-for="ext in question.extending" :key="ext.id" class="extending-item">
          <div class="question-text" v-html="ext.question"></div>
          <div class="options">
            <button
              v-for="n in 4"
              :key="n"
              :class="['option', extOptionClass(ext, n)]"
              :disabled="extRevealed[ext.id]"
              @click="answerExtending(ext, n)"
            >
              <span class="option-num">{{ n }}</span>
              <span class="option-text">{{ ext[`option${n}`] }}</span>
            </button>
          </div>
          <div v-if="extRevealed[ext.id]" class="explanation">
            <div class="explanation-label">
              {{ extAnswers[ext.id] === ext.answer ? '正解!' : `不正解 — 正解は ${ext.answer}` }}
            </div>
            <div class="explanation-text" v-html="ext.assistantNew || ext.assistant"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { getResourceUrl } from '../config'
import AudioPlayer from './AudioPlayer.vue'

const props = defineProps({
  question: { type: Object, required: true },
  showTitle: { type: Boolean, default: false },
  userAnswer: { type: Number, default: null },
  isRevealed: { type: Boolean, default: false },
})
const emit = defineEmits(['answer'])

const picture = computed(() => getResourceUrl(props.question.picture))
const hasAudio = computed(() => props.question.audio && props.question.audio !== 'None')
const hasQuestionText = computed(() => {
  const q = props.question.question
  return q && q.replace(/<[^>]*>/g, '').trim().length > 0
})
const hasOptions = computed(() => {
  return [1, 2, 3, 4].some(n => props.question[`option${n}`]?.trim())
})

const isCorrect = computed(() => props.userAnswer === props.question.answer)

function optionClass(n) {
  if (!props.isRevealed) return ''
  if (n === props.question.answer) return 'correct'
  if (n === props.userAnswer) return 'wrong'
  return 'dimmed'
}

const extAnswers = reactive({})
const extRevealed = reactive({})

function answerExtending(ext, n) {
  if (extRevealed[ext.id]) return
  extAnswers[ext.id] = n
  extRevealed[ext.id] = true
}

function extOptionClass(ext, n) {
  if (!extRevealed[ext.id]) return ''
  if (n === ext.answer) return 'correct'
  if (n === extAnswers[ext.id]) return 'wrong'
  return 'dimmed'
}
</script>

<style scoped>
.question-card {
  background: var(--color-card);
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}
.question-header {
  padding: 0.75rem 1rem;
  background: var(--color-bg-soft);
  border-bottom: 1px solid var(--color-border);
}
.big-title {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.question-body {
  padding: 1rem;
}
.question-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
.article {
  background: var(--color-bg-soft);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  line-height: 1.8;
  font-size: 0.95rem;
}
.question-picture {
  margin: 0.75rem 0;
  text-align: center;
}
.question-picture img {
  max-width: 100%;
  border-radius: 6px;
}
.question-text {
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 0.75rem;
}
.little-question {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-card);
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
  transition: all 0.15s;
}
.option:not(:disabled):hover {
  border-color: var(--color-primary);
  background: rgba(66, 133, 244, 0.05);
}
.option-num {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}
.option.correct {
  border-color: #28a745;
  background: #d4edda;
}
.option.correct .option-num {
  background: #28a745;
  color: #fff;
}
.option.wrong {
  border-color: #dc3545;
  background: #f8d7da;
}
.option.wrong .option-num {
  background: #dc3545;
  color: #fff;
}
.option.dimmed {
  opacity: 0.5;
}
.explanation {
  background: var(--color-bg-soft);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-top: 0.5rem;
}
.explanation-label {
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.explanation-text {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-text-muted);
}
.extending {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--color-border);
}
.extending-item {
  margin-bottom: 1rem;
}
.question-hint {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 0.75rem;
}
</style>
