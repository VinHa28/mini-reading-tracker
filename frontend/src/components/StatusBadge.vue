<script setup lang="ts">
import type { ReadingStatus } from "@/types/api";

defineProps<{ status: ReadingStatus }>();

const LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Muốn đọc",
  READING: "Đang đọc",
  FINISHED: "Đã đọc xong",
};
</script>

<template>
  <span class="badge" :class="`badge--${status}`">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path v-if="status === 'WANT_TO_READ'" d="M7 3h10v18l-5-4-5 4z" />
      <template v-else-if="status === 'READING'">
        <path d="M2 5.5C5 4 8.5 4 12 6c3.5-2 7-2 10-.5V19c-3-1.5-6.5-1.5-10 .5-3.5-2-7-2-10-.5z" />
        <path d="M12 6v13.5" />
      </template>
      <path v-else d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
    {{ LABELS[status] }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.badge--WANT_TO_READ {
  background: var(--color-want-bg);
  color: var(--color-want-fg);
}

.badge--READING {
  background: var(--color-reading-bg);
  color: var(--color-reading-fg);
}

.badge--FINISHED {
  background: var(--color-done-bg);
  color: var(--color-done-fg);
}
</style>