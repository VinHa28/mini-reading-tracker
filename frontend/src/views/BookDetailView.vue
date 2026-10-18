<script setup lang="ts">
import { getBook } from '@/api/books';
import { ApiError } from '@/api/client';
import { addToShelf } from '@/api/shelf';
import BookCover from '@/components/BookCover.vue';
import type { BookDetail } from '@/types/api';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast'

const toast = useToastStore();

const props = defineProps<{ workId: string }>()
const router = useRouter();

const book = ref<BookDetail | null>(null);
const loading = ref(false);
const error = ref<ApiError | null>(null);
const adding = ref(false);
const justAdded = ref(false);
const expanded = ref(false);
// const addError = ref<string | null>(null);

// Sách có thể có cả trăm chủ đề: chỉ hiện 10 cái đầu
const topSubjects = computed(() => book.value?.subjects.slice(0, 10) ?? []);

async function load() {
  loading.value = true;
  error.value = null;
  book.value = null;
  justAdded.value = false;
  expanded.value = false;

  try {
    book.value = await getBook(props.workId);
  } catch (e) {
    error.value = e instanceof ApiError ? e : new ApiError("Đã có lỗi xảy ra", 0);
  } finally {
    loading.value = false;
  }
}

// chạy ngay lần đầu (immediate) và mỗi khi workId đổi
watch(() => props.workId, load, { immediate: true });

async function handleAdd() {
  if (!book.value) return;
  adding.value = true;
  try {
    await addToShelf(book.value.workId);
    justAdded.value = true;
    toast.success("Đã thêm vào tủ sách", book.value.title);
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      justAdded.value = true;
      toast.success("Sách đã có trong tủ", book.value.title);
    } else {
      toast.error("Không thêm được sách", e instanceof ApiError ? e.message : undefined);
    }
  } finally {
    adding.value = false;
  }
}

</script>

<template>
  <div class="page-detail">
    <button type="button" class="back" @click="router.back()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      Quay lại
    </button>

    <p v-if="loading" class="state-text">Đang tải...</p>

    <div v-else-if="error" class="state">
      <h2 v-if="error.status === 404">Không tìm thấy sách này</h2>
      <h2 v-else>Không tải được sách</h2>
      <p>{{ error.message }}</p>
      <button v-if="error.status !== 404" type="button" class="btn" @click="load">Thử lại</button>
      <RouterLink v-else to="/" class="link">Về trang tìm sách</RouterLink>
    </div>

    <article v-else-if="book" class="detail">
      <div class="detail__cover">
        <BookCover :src="book.coverUrl" :title="book.title" :author="book.authors.join(', ')" size="hero" />
      </div>

      <div class="detail__body">
        <header class="head">
          <h1>{{ book.title }}</h1>
          <p class="authors">{{ book.authors.join(", ") || "Chưa rõ tác giả" }}</p>
        </header>

        <dl v-if="book.firstPublishYear || book.totalPages" class="facts">
          <div v-if="book.firstPublishYear">
            <dt>Năm xuất bản đầu tiên</dt>
            <dd>{{ book.firstPublishYear }}</dd>
          </div>
          <div v-if="book.totalPages">
            <dt>Số trang</dt>
            <dd>{{ book.totalPages }} trang</dd>
          </div>
        </dl>

        <div class="actions">
          <!-- <p v-if="addError" class="error">{{ addError }}</p> -->
          <button type="button" class="add" :disabled="book.inShelf || justAdded || adding" @click="handleAdd">
            <template v-if="book.inShelf || justAdded">✓ Đã trong tủ sách</template>
            <template v-else-if="adding">Đang thêm...</template>
            <template v-else>+ Thêm vào tủ</template>
          </button>
        </div>

        <section class="block">
          <h2>Mô tả</h2>
          <template v-if="book.description">
            <p class="desc" :class="{ 'desc--clamp': !expanded }">{{ book.description }}</p>
            <button v-if="book.description.length > 280" type="button" class="more" @click="expanded = !expanded">
              {{ expanded ? "Thu gọn" : "Xem thêm" }}
              <svg class="more__icon" :class="{ 'more__icon--up': expanded }" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </template>
          <p v-else class="desc desc--empty">Chưa có mô tả.</p>
        </section>

        <section v-if="topSubjects.length" class="block">
          <h2>Chủ đề</h2>
          <ul class="chips">
            <li v-for="s in topSubjects" :key="s" class="chip">{{ s }}</li>
          </ul>
        </section>
      </div>
    </article>
  </div>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target);
  padding: 0 12px 0 var(--space-2);
  margin: 0 0 var(--space-5) calc(var(--space-2) * -1);
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: var(--color-accent);
  font: 600 var(--text-md) / 1 var(--font-sans);
  cursor: pointer;
}

.back:hover {
  background: var(--color-accent-soft);
}

.state-text {
  color: var(--color-text-muted);
}

.state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-6) 0;
}

.state p {
  margin: 0;
  color: var(--color-text-muted);
}

.link {
  color: var(--color-accent);
  font-weight: 600;
}

.btn {
  min-height: var(--tap-target);
  padding: 0 var(--space-5);
  border: 0;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  font: 600 var(--text-base) / 1 var(--font-sans);
  cursor: pointer;
}

.detail {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-7);
  align-items: flex-start;
}

.detail__cover {
  flex: 0 0 320px;
  max-width: 100%;
}

.detail__cover :deep(.cover) {
  width: 100%;
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

.detail__body {
  flex: 1 1 480px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.head {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.head h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  line-height: 1.25;
}

.authors {
  margin: 0;
  font-size: var(--text-lg);
  color: var(--color-text-muted);
}

.facts {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  margin: 0;
  padding: var(--space-4) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.facts div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.facts dt {
  font-size: 13px;
  color: var(--color-text-muted);
}

.facts dd {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
}

.error {
  margin: 0;
  color: var(--color-danger);
}

.add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  min-width: 220px;
  padding: 0 28px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  font: 600 var(--text-base) / 1 var(--font-sans);
  cursor: pointer;
}

.add:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.add:disabled {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  cursor: default;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block h2 {
  font-size: var(--text-xl);
  font-weight: 600;
}

.desc {
  margin: 0;
  font-size: var(--text-base);
  line-height: 1.7;
  white-space: pre-line;
}

.desc--clamp {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.desc--empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.more {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: var(--tap-target);
  padding: 0 var(--space-2);
  margin-left: calc(var(--space-2) * -1);
  border: 0;
  background: transparent;
  color: var(--color-accent);
  font: 600 var(--text-md) / 1 var(--font-sans);
  cursor: pointer;
}

.more__icon--up {
  transform: rotate(180deg);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  font-size: var(--text-sm);
}

@media (max-width: 719px) {
  .back {
    margin-bottom: var(--space-2);
  }

  .detail {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    gap: 20px;
  }

  .detail__cover {
    flex: none;
    display: flex;
    justify-content: center;
  }

  .detail__cover :deep(.cover) {
    width: 200px;
  }

  .detail__body {
    gap: var(--space-5);
    flex: none;
  }

  .head {
    gap: 6px;
  }

  .head h1 {
    font-size: var(--text-2xl);
  }

  .authors {
    font-size: var(--text-base);
  }

  .facts {
    gap: var(--space-5);
  }

  .add {
    width: 100%;
  }
}
</style>
