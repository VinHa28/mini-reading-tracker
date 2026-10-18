<script setup lang="ts">
import AppNav from '@/components/AppNav.vue'
</script>

<template>
  <AppNav />
  <main class="page">
    <RouterView />
  </main>
</template>

<style scoped>
.page {
  max-width: calc(var(--container) + 48px);
  margin: 0 auto;
  padding: var(--space-6) var(--space-5);
}

@media (max-width: 719px) {
  .page {
    padding: var(--space-5) var(--space-4);
  }
}
</style>