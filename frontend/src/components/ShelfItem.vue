<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BookCover from "@/components/BookCover.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import StarRating from "@/components/StarRating.vue";
import type { ReadingStatus, ShelfBook } from "@/types/api";

const props = defineProps<{
    entry: ShelfBook;
    showFinishedBanner?: boolean;
    serverError?: string | null;
}>();

const emit = defineEmits<{
    "update-page": [page: number];
    "change-status": [status: ReadingStatus];
    rate: [rating: number | null];
    "save-note": [note: string | null];
    remove: [];
}>();

const NOTE_MAX = 500;

const coverUrl = computed(() =>
    props.entry.coverId
        ? `https://covers.openlibrary.org/b/id/${props.entry.coverId}-M.jpg`
        : null,
);

// Hiện tại
const pageInput = ref<string | number>(String(props.entry.currentPage));
const pageError = ref<string | null>(null);

// Khi dữ liệu từ server trả
watch(
    () => props.entry.currentPage,
    (v) => {
        pageInput.value = String(v);
        pageError.value = null;
    },
);

function submitPage() {
    const raw = String(pageInput.value).trim();
    const n = Number(raw);
    if (raw === "" || !Number.isInteger(n) || n < 0) {
        pageError.value = "Số trang phải là số nguyên không âm.";
        return;
    }
    const total = props.entry.totalPages;
    if (total !== null && n > total) {
        pageError.value = `Số trang vượt quá tổng số trang (${total}).`;
        return;
    }
    pageError.value = null;
    if (n !== props.entry.currentPage) emit("update-page", n);
}

const noteDraft = ref(props.entry.note ?? "");
watch(
    () => props.entry.note,
    (v) => (noteDraft.value = v ?? ""),
);

function saveNote() {
    const text = noteDraft.value.trim();
    const current = props.entry.note ?? "";
    if (text === current) return;
    emit("save-note", text === "" ? null : text);
}

// Trạng thái 
function onStatusChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const next = select.value as ReadingStatus;
    select.value = props.entry.status;
    emit("change-status", next);
}

</script>

<template>
    <article class="item">
        <RouterLink class="item__cover" :to="{ name: 'book-detail', params: { workId: entry.workId } }">
            <BookCover :src="coverUrl" :title="entry.title" :author="entry.authors" size="card" />
        </RouterLink>

        <div class="item__body">
            <div class="item__head">
                <div class="item__titles">
                    <RouterLink class="item__title" :to="{ name: 'book-detail', params: { workId: entry.workId } }">
                        {{ entry.title }}
                    </RouterLink>
                    <div class="item__authors">{{ entry.authors || "Chưa rõ tác giả" }}</div>
                </div>
                <div class="item__head-actions">
                    <StatusBadge :status="entry.status" />
                    <button type="button" class="icon-btn" aria-label="Xóa khỏi tủ" @click="emit('remove')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                        </svg>
                    </button>
                </div>
            </div>

            <div v-if="showFinishedBanner" class="banner" role="status">
                <span class="banner__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"
                        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                </span>
                Bạn vừa đọc đến trang cuối. Sách đã tự chuyển sang “Đã đọc xong”.
            </div>

            <ProgressBar :current="entry.currentPage" :total="entry.totalPages" />

            <div class="controls">
                <div class="field">
                    <label :for="`pg-${entry.id}`">Trang hiện tại</label>
                    <form class="field__row" @submit.prevent="submitPage">
                        <input :id="`pg-${entry.id}`" v-model="pageInput" type="number" min="0" inputmode="numeric"
                            class="input input--page" :class="{ 'input--error': pageError }"
                            :aria-invalid="!!pageError" />
                        <button type="submit" class="btn-secondary">Cập nhật</button>
                    </form>
                    <div v-if="pageError" class="field__error" role="alert">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7.5v5M12 16v.5" />
                        </svg>
                        {{ pageError }}
                    </div>
                </div>

                <div class="field">
                    <label :for="`st-${entry.id}`">Trạng thái</label>
                    <div class="select">
                        <select :id="`st-${entry.id}`" :value="entry.status" @change="onStatusChange">
                            <option value="WANT_TO_READ">Muốn đọc</option>
                            <option value="READING">Đang đọc</option>
                            <option value="FINISHED">Đã đọc xong</option>
                        </select>
                        <svg class="select__icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            aria-hidden="true">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>

                <div class="field">
                    <div class="field__label">Đánh giá</div>
                    <div class="field__row field__row--tight">
                        <StarRating :model-value="entry.rating ?? 0" @update:model-value="emit('rate', $event)" />
                        <button v-if="entry.rating" type="button" class="link-btn" @click="emit('rate', null)">
                            Xóa đánh giá
                        </button>
                    </div>
                </div>
            </div>

            <div class="field">
                <label :for="`nt-${entry.id}`">Ghi chú</label>
                <textarea :id="`nt-${entry.id}`" v-model="noteDraft" rows="2" :maxlength="NOTE_MAX"
                    class="input input--note" placeholder="Ghi chú ngắn về cuốn sách..." @blur="saveNote" />
                <div class="note-count">{{ noteDraft.length }} / {{ NOTE_MAX }}</div>
            </div>

            <p v-if="serverError" class="server-error" role="alert">{{ serverError }}</p>
        </div>
    </article>
</template>

<style scoped>
.item {
    display: flex;
    gap: var(--space-5);
    padding: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
}

.item__cover {
    flex: none;
    width: 120px;
    align-self: flex-start;
}

.item__body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.item__head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-4);
}

.item__titles {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.item__title {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: var(--text-xl);
    line-height: 1.3;
}

.item__title:hover {
    color: var(--color-accent);
}

.item__authors {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
}

.item__head-actions {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--space-3);
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tap-target);
    height: var(--tap-target);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: pointer;
}

.icon-btn:hover {
    color: var(--color-danger);
    border-color: var(--color-danger);
    background: var(--color-danger-soft);
}

.banner {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 12px 14px;
    border-radius: var(--radius);
    background: var(--color-done-bg);
    color: var(--color-done-fg);
    font-size: var(--text-sm);
    font-weight: 500;
}

.banner__icon {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-pill);
    background: var(--color-done-fg);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
}

.controls {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 36px;
    align-items: flex-start;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.field label,
.field__label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-muted);
}

.field__row {
    display: flex;
    gap: var(--space-2);
}

.field__row--tight {
    gap: 0;
    align-items: center;
}

.field__error {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--color-danger);
}

.input {
    box-sizing: border-box;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-sans);
}

.input--page {
    width: 100px;
    height: var(--tap-target);
    padding: 0 12px;
    font-size: var(--text-base);
}

.input--error {
    border: 2px solid var(--color-danger);
}

.input--note {
    width: 100%;
    padding: 10px 12px;
    font-size: var(--text-md);
    line-height: 1.5;
    resize: none;
}

.note-count {
    text-align: right;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
}

.btn-secondary {
    min-height: var(--tap-target);
    padding: 0 var(--space-4);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    font: 600 var(--text-md) / 1 var(--font-sans);
    cursor: pointer;
}

.btn-secondary:hover {
    background: var(--color-accent-soft);
}

.select {
    position: relative;
    width: 180px;
}

.select select {
    appearance: none;
    -webkit-appearance: none;
    width: 100%;
    box-sizing: border-box;
    height: var(--tap-target);
    padding: 0 40px 0 12px;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    font: 500 var(--text-md) / 1 var(--font-sans);
}

.select__icon {
    position: absolute;
    right: 12px;
    top: 0;
    bottom: 0;
    margin: auto 0;
    pointer-events: none;
    color: var(--color-text-muted);
}

.link-btn {
    min-height: var(--tap-target);
    padding: 0 var(--space-2);
    border: 0;
    background: transparent;
    color: var(--color-accent);
    font: 600 var(--text-sm) / 1 var(--font-sans);
    text-decoration: underline;
    cursor: pointer;
}

.server-error {
    margin: 0;
    color: var(--color-danger);
    font-size: var(--text-sm);
}

@media (max-width: 719px) {
    .item {
        gap: var(--space-3);
        padding: var(--space-4);
        flex-wrap: wrap;
    }

    .item__cover {
        width: 84px;
    }

    .item__body {
        display: contents;
    }

    .item__head {
        flex: 1;
        min-width: 0;
        flex-direction: column;
        gap: var(--space-3);
    }

    .item__body> :not(.item__head) {
        flex: 0 0 100%;
    }

    .item__title {
        font-size: var(--text-lg);
    }

    .controls {
        flex-direction: column;
        gap: var(--space-4);
        align-items: stretch;
    }

    .select {
        width: 100%;
    }

    .field__row .input--page {
        flex: 1;
    }
}
</style>