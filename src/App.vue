<template>
  <AppHeader />
  <main class="app-main">
    <router-view />
  </main>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<style scoped>
.app-main {
  min-height: calc(100vh - 50px);
}
</style>
