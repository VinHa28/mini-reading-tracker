<script setup lang="ts">
defineProps<{
    src?: string | null,
    title: string,
    size?: "card" | "row" | "hero"
}>()
</script>

<template>
    <div class="cover" :class="`cover--${size ?? 'card'}`">
        <img v-if="src" :src="src" :alt="`Bìa sách ${title}`">
        <span v-else class="cover__placeholder">
            {{ title }}
        </span>
    </div>
</template>

<style scoped>
.cover {
    background: var(--color-accent-soft);
    border-radius: var(--radius-sm);
    overflow: hidden;
    aspect-ratio: 2 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cover--card {
    width: 100%;
}

.cover--row {
    width: 84px;
    flex-shrink: 0;
}

.cover--hero {
    width: 240px;
}

.cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cover__placeholder {
    padding: var(--space-2);
    font-family: var(--font-serif);
    font-size: var(--text-sm);
    text-align: center;
    color: var(--color-accent);
}
</style>