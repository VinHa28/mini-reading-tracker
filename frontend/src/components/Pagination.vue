<script setup lang="ts">
defineProps<{ page: number; pageCount: number }>();
const emit = defineEmits<{ change: [page: number] }>();
</script>

<template>
    <nav v-if="pageCount > 1" class="pager" aria-label="Phân trang">
        <button type="button" :disabled="page <= 1" @click="emit('change', page - 1)">
            ← Trước
        </button>
        <span>Trang {{ page }} / {{ pageCount }}</span>
        <button type="button" :disabled="page >= pageCount" @click="emit('change', page + 1)">
            Sau →
        </button>
    </nav>
</template>

<style scoped>
.pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    margin-top: var(--space-6);
}

.pager button {
    min-height: var(--tap-target);
    padding: 0 var(--space-4);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font: inherit;
    cursor: pointer;
}

.pager button:disabled {
    opacity: 0.4;
    cursor: default;
}
</style>