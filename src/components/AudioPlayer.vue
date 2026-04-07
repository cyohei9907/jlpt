<template>
  <div class="audio-player" v-if="url">
    <!-- Download state -->
    <button v-if="!loaded" class="download-btn" :disabled="downloading" @click="handleDownload">
      <template v-if="downloading">
        <span class="spinner"></span> 読み込み中...
      </template>
      <template v-else>
        ↓ 音声を読み込む
      </template>
    </button>

    <!-- Player state -->
    <template v-else>
      <audio ref="audioEl" :src="blobUrl" preload="auto"></audio>
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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { getResourceUrl } from '../config'

const props = defineProps({ audio: { type: String, default: null } })

const url = computed(() => getResourceUrl(props.audio))
const loaded = ref(false)
const downloading = ref(false)
const blobUrl = ref(null)
const audioEl = ref(null)
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)

watch(() => props.audio, () => {
  cleanup()
  loaded.value = false
  downloading.value = false
  blobUrl.value = null
  playing.value = false
  currentTime.value = 0
  duration.value = 0
})

async function handleDownload() {
  if (!url.value) return
  downloading.value = true
  try {
    const res = await fetch(url.value)
    const blob = await res.blob()
    blobUrl.value = URL.createObjectURL(blob)
    loaded.value = true
    await nextTick()
    bindEvents()
  } catch (err) {
    console.error('Audio download failed:', err)
  } finally {
    downloading.value = false
  }
}

function toggle() {
  if (!audioEl.value) return
  playing.value ? audioEl.value.pause() : audioEl.value.play()
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

function bindEvents() {
  const el = audioEl.value
  if (!el) return
  el.addEventListener('timeupdate', onTimeUpdate)
  el.addEventListener('loadedmetadata', onLoaded)
  el.addEventListener('play', onPlay)
  el.addEventListener('pause', onPause)
  el.addEventListener('ended', onEnded)
}

function cleanup() {
  const el = audioEl.value
  if (el) {
    el.pause()
    el.removeEventListener('timeupdate', onTimeUpdate)
    el.removeEventListener('loadedmetadata', onLoaded)
    el.removeEventListener('play', onPlay)
    el.removeEventListener('pause', onPause)
    el.removeEventListener('ended', onEnded)
  }
  if (blobUrl.value) {
    URL.revokeObjectURL(blobUrl.value)
  }
}

onBeforeUnmount(cleanup)
</script>

<style scoped>
.audio-player {
  background: var(--color-bg-soft);
  border-radius: 4px;
  padding: 0.4rem 0.6rem;
  margin: 0.4rem 0;
}
.download-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
  padding: 0.3rem 0;
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 0.78rem;
  cursor: pointer;
  justify-content: center;
}
.download-btn:disabled {
  color: var(--color-text-muted);
  cursor: default;
}
.spinner {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.audio-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.play-btn {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
}
.progress {
  flex: 1;
  height: 3px;
  cursor: pointer;
}
.time {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}
</style>
