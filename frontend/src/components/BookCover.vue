<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  src?: string | null;
  title: string;
  author?: string;
  size?: "card" | "row" | "hero";
}>();

// Bộ màu nền cho bìa giả (lấy từ thiết kế)
const COLORS = ["#8A6A2F", "#5B4B73", "#7A3E3E", "#3B4A6B", "#2F5D50", "#6B5B3E", "#4A6B5B"];

const background = computed(() => {
  let h = 0;
  for (const ch of props.title) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return COLORS[h % COLORS.length];
});

const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);
const showImage = computed(() => !!props.src && !failed.value);
</script>

<template>
  <div class="cover" :class="`cover--${size ?? 'card'}`">
    <img
      v-if="showImage"
      :src="src!"
      :alt="`Bìa sách ${title}`"
      loading="lazy"
      @error="failed = true"
    />
    <div v-else class="fake" :style="{ background }" role="img" :aria-label="`Bìa sách ${title}`">
      <div class="fake__author">{{ author }}</div>
      <div class="fake__title">{{ title }}</div>
      <div class="fake__bar" />
    </div>
  </div>
</template>

<style scoped>
.cover {
  container-type: inline-size;
  background: var(--color-accent-soft);
  border-radius: var(--radius-sm);
  overflow: hidden;
  aspect-ratio: 2 / 3;
}
.cover--card { width: 100%; }
.cover--row { width: 84px; flex-shrink: 0; }
.cover--hero { width: 240px; }

.cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fake {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10cqw 9cqw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #f7f3ea;
}
.fake__author {
  font-size: max(7px, 4.2cqw);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fake__title {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 13cqw;
  line-height: 1.15;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  -webkit-box-orient: vertical;
}
.fake__bar {
  height: max(2px, 0.9cqw);
  width: 17cqw;
  background: #f7f3ea;
  opacity: 0.7;
}
</style>