<script setup lang="ts">
import BookCover from '@/components/BookCover.vue';
import type { BookSummary } from '@/types/api';
defineProps<{
    book: BookSummary;
    addState: "idle" | "adding" | "added";
}>()

const emit = defineEmits<{
    add: [];
    open: [];
}>();

</script>

<template>
    <article class="card">
        <button class="card__open" type="button" @click="emit('open')">
            <BookCover :src="book.coverUrl" :title="book.title" size="card" />
            <h3 class="card__title">{{ book.title }}</h3>
        </button>
        <p class="card__meta">
            {{ book.authors.join(", ") || "Chưa rõ tác giả" }}
            <template v-if="book.firstPublishYear">· {{ book.firstPublishYear }}</template>
        </p>

        <button class="card__add" type="button" :disabled="addState !== 'idle'" @click="emit('add')">
            <template v-if="addState === 'idle'">+ Thêm vào tủ</template>
            <template v-else-if="addState === 'adding'">Đang thêm...</template>
            <template v-else>✓ Đã thêm</template>
        </button>
    </article>
</template>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: var(--space-3);
    box-shadow: var(--shadow-sm);
}

.card__open {
    all: unset;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    cursor: pointer;
}

.card__title {
    font-size: var(--text-md);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card__meta {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-text-muted);
}

.card__add {
    margin-top: auto;
    min-height: var(--tap-target);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-sm);
    background: var(--color-accent);
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.card__add:hover:not(:disabled) {
    background: var(--color-accent-hover);
}

.card__add:disabled {
    background: var(--color-accent-soft);
    color: var(--color-accent);
    cursor: default;
}
</style>