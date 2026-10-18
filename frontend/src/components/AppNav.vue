<script setup lang="ts">
const links = [
  { to: '/', label: 'Tìm sách' },
  { to: '/shelf', label: 'Tủ sách của tôi' },
]
</script>

<template>
  <header class="nav">
    <div class="nav__inner">
      <RouterLink to="/" class="nav__brand">
        <span class="nav__logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
        </span>
        Reading Tracker
      </RouterLink>
      <nav class="nav__links">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="nav__link">
          {{ l.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.nav__inner {
  max-width: calc(var(--container) + 48px);
  margin: 0 auto;
  padding: 0 var(--space-5);
  min-height: var(--nav-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}
.nav__logo {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav__links {
  display: flex;
  gap: var(--space-2);
}
.nav__link {
  display: inline-flex;
  align-items: center;
  min-height: var(--tap-target);
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}
.nav__link:hover {
  background: var(--color-accent-soft);
}
.nav__link.router-link-exact-active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-weight: 600;
}

@media (max-width: 719px) {
  .nav__inner {
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-3) var(--space-4) var(--space-2);
    gap: var(--space-2);
  }
  .nav__links {
    justify-content: space-between;
  }
  .nav__link {
    flex: 1;
    justify-content: center;
  }
}
</style>