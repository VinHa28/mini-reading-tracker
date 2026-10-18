<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ current: number; total: number | null }>();

const percent = computed(() => {
  if (!props.total) return 0;
  return Math.min(100, Math.round((props.current / props.total) * 100));
});

const label = computed(() =>
  props.total
    ? `${props.current} / ${props.total} trang (${percent.value}%)`
    : `Đã đọc ${props.current} trang`,
);
</script>

<template>
  <div class="progress">
    <div class="progress__label">{{ label }}</div>
    <div
      v-if="total"
      class="progress__track"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress__fill" :style="{ width: percent + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.progress { display: flex; flex-direction: column; gap: var(--space-2); }
.progress__label { font-size: var(--text-sm); font-weight: 500; }
.progress__track {
  height: 8px;
  border-radius: var(--radius-pill);
  background: #e9e2d1;
  overflow: hidden;
}
.progress__fill {
  height: 100%;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  transition: width 0.25s ease;
}
</style>