<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { searchBooks } from "@/api/books";
import { addToShelf } from "@/api/shelf";
import { ApiError } from "@/api/client";
import BookCard from "@/components/BookCard.vue";
import Pagination from "@/components/Pagination.vue";
import type { BookSummary } from "@/types/api";

const router = useRouter();

const query = ref("");
const page = ref(1);
const items = ref<BookSummary[]>([]);
const total = ref(0);
const pageSize = ref(20);

const loading = ref(false);
const error = ref<string | null>(null);
const searched = ref(false);

// workId -> trạng thái nút thêm vừa thao tác ở trang này
const addStates = reactive<Record<string, "adding" | "added">>({});
const addError = ref<string | null>(null);

const pageCount = computed(() => Math.ceil(total.value / pageSize.value));

async function runSearch(p = 1) {
  const q = query.value.trim();
  if (!q) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await searchBooks(q, p);
    items.value = res.items;
    total.value = res.total;
    page.value = res.page;
    pageSize.value = res.pageSize;
    searched.value = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : "Đã có lỗi xảy ra";
  } finally {
    loading.value = false;
  }
}

function addStateOf(b: BookSummary): "idle" | "adding" | "added" {
  if (b.inShelf) return "added";
  return addStates[b.workId] ?? "idle";
}

async function handleAdd(b: BookSummary) {
  addError.value = null;
  addStates[b.workId] = "adding";
  try {
    await addToShelf(b.workId);
    addStates[b.workId] = "added";
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      addStates[b.workId] = "added"; // đã có trong tủ rồi
    } else {
      delete addStates[b.workId];
      addError.value = e instanceof ApiError ? e.message : "Không thêm được sách";
    }
  }
}

function openBook(b: BookSummary) {
  router.push({ name: "book-detail", params: { workId: b.workId } });
}
</script>

<template>
  <h1>Tìm sách</h1>

  <form class="search" @submit.prevent="runSearch(1)">
    <input v-model="query" type="text" placeholder="Nhập tên sách hoặc tác giả" />
    <button type="submit" :disabled="loading">Tìm</button>
  </form>

  <p v-if="addError" class="msg msg--error">{{ addError }}</p>

  <p v-if="loading" class="msg">Đang tải...</p>
  <div v-else-if="error" class="msg msg--error">
    <p>{{ error }}</p>
    <button type="button" @click="runSearch(page)">Thử lại</button>
  </div>
  <p v-else-if="searched && items.length === 0" class="msg">
    Không có kết quả cho "{{ query }}". Thử từ khóa khác nhé.
  </p>
  <template v-else-if="items.length">
    <p class="msg">Tìm thấy {{ total }} kết quả</p>
    <div class="grid">
      <BookCard v-for="b in items" :key="b.workId" :book="b" :add-state="addStateOf(b)" @add="handleAdd(b)"
        @open="openBook(b)" />
    </div>
    <Pagination :page="page" :page-count="pageCount" @change="runSearch" />
  </template>
  <p v-else class="msg">Nhập từ khóa để bắt đầu tìm sách.</p>
</template>

<style scoped>
.search {
  display: flex;
  gap: var(--space-2);
  margin: var(--space-4) 0 var(--space-5);
}

.search input {
  flex: 1;
  min-height: var(--tap-target);
  padding: 0 var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font: inherit;
}

.search button {
  min-height: var(--tap-target);
  padding: 0 var(--space-5);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.search button:disabled {
  opacity: 0.6;
  cursor: default;
}

.msg {
  color: var(--color-text-muted);
}

.msg--error {
  color: var(--color-danger);
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

@media (max-width: 719px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }
}
</style>