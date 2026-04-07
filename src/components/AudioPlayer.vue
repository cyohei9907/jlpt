<template>
  <div class="audio-player" v-if="src">
    <audio ref="audioEl" :src="src" preload="auto"></audio>
    <div class="audio-controls">
      <button class="play-btn" @click="toggle">
        {{ playing ? '⏸' : '▶' }}
      </button>
      <input
        type="range"
        class="progress"
        min="0"
        :max="duration"
        :value="currentTime"
        step="0.1"
        @input="seek"
      />
      <span class="time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { getResourceUrl } from '../config'

const props = defineProps({ audio: { type: String, default: null } })

const src = ref(getResourceUrl(props.audio))
const audioEl = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)

watch(() => props.audio, (v) => {
  src.value = getResourceUrl(v)
  playing.value = false
  currentTime.value = 0
  duration.value = 0
})

function toggle() {
  if (!audioEl.value) return
  if (playing.value) {
    audioEl.value.pause()
  } else {
    audioEl.value.play()
  }
}

function seek(e) {
  if (!audioEl.value) return
  audioEl.value.currentTime = Number(e.target.value)
}

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function onTimeUpdate() { currentTime.value = audioEl.value.currentTime }
function onLoaded() { duration.value = audioEl.value.duration || 0 }
function onPlay() { playing.value = true }
function onPause() { playing.value = false }
function onEnded() { playing.value = false }

onMounted(() => {
  const el = audioEl.value
  if (!el) return
  el.addEventListener('timeupdate', onTimeUpdate)
  el.addEventListener('loadedmetadata', onLoaded)
  el.addEventListener('play', onPlay)
  el.addEventListener('pause', onPause)
  el.addEventListener('ended', onEnded)
})

onBeforeUnmount(() => {
  const el = audioEl.value
  if (!el) return
  el.pause()
  el.removeEventListener('timeupdate', onTimeUpdate)
  el.removeEventListener('loadedmetadata', onLoaded)
  el.removeEventListener('play', onPlay)
  el.removeEventListener('pause', onPause)
  el.removeEventListener('ended', onEnded)
})
</script>

<style scoped>
.audio-player {
  background: var(--color-bg-soft);
  border-radius: 8px;
  padding: 0.75rem;
  margin: 0.75rem 0;
}
.audio-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.play-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
}
.progress {
  flex: 1;
  height: 4px;
  cursor: pointer;
}
.time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
