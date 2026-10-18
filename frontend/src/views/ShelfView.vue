<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { useShelfStore } from "@/stores/shelf";
import { ApiError } from "@/api/client";
import ShelfItem from "@/components/ShelfItem.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import type { ReadingStatus, ShelfBook, UpdateShelfPayload } from "@/types/api";

type Tab = "ALL" | ReadingStatus;

const store = useShelfStore();
// storeToRefs: lấy state/getter của store mà vẫn giữ tính reactive
const { items, loading, error, stats } = storeToRefs(store);

const activeTab = ref<Tab>("ALL");

const tabs = computed(() => [
  { key: "ALL" as Tab, label: "Tất cả", count: stats.value.total },
  { key: "WANT_TO_READ" as Tab, label: "Muốn đọc", count: stats.value.WANT_TO_READ },
  { key: "READING" as Tab, label: "Đang đọc", count: stats.value.READING },
  { key: "FINISHED" as Tab, label: "Đã đọc xong", count: stats.value.FINISHED },
]);

const statCards = computed(() => [
  { label: "Tổng", value: stats.value.total, dot: "#231F1A" },
  { label: "Muốn đọc", value: stats.value.WANT_TO_READ, dot: "#33507F" },
  { label: "Đang đọc", value: stats.value.READING, dot: "#7A4A00" },
  { label: "Đã đọc xong", value: stats.value.FINISHED, dot: "#1F5240" },
]);

const visibleItems = computed(() =>
  activeTab.value === "ALL"
    ? items.value
    : items.value.filter((b) => b.status === activeTab.value),
);

// Update 
const itemErrors = reactive<Record<number, string | null>>({});
const finishedBanner = reactive<Record<number, boolean>>({});

// Thông báo ở cấp trang: thẻ sách có thể bị lọc khỏi tab hiện tại
// (vd đang ở tab "Đang đọc" mà sách tự chuyển sang "Đã đọc xong"),
// nên thông báo trong thẻ sẽ biến mất cùng thẻ.
const notice = ref<string | null>(null);
let noticeTimer: ReturnType<typeof setTimeout> | undefined;

function showNotice(message: string) {
  notice.value = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = null), 8000);
}

async function patch(book: ShelfBook, payload: UpdateShelfPayload) {
  itemErrors[book.id] = null;
  try {
    const updated = await store.update(book.id, payload);
    // Server tự chuyển sang FINISHED khi đọc đến trang cuối
    const autoFinished =
      book.status !== "FINISHED" &&
      updated.status === "FINISHED" &&
      payload.status === undefined;
    finishedBanner[book.id] = autoFinished;
    if (autoFinished && activeTab.value !== "ALL" && activeTab.value !== "FINISHED") {
      showNotice(`Bạn vừa đọc đến trang cuối “${updated.title}”. Sách đã tự chuyển sang “Đã đọc xong”.`);
    }
  } catch (e) {
    itemErrors[book.id] = e instanceof ApiError ? e.message : "Không cập nhật được";
  }
}

// Delete có popub
const toDelete = ref<ShelfBook | null>(null);
const deleting = ref(false);
const deleteError = ref<string | null>(null);

async function confirmDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  deleteError.value = null;
  try {
    await store.remove(toDelete.value.id);
    toDelete.value = null;
  } catch (e) {
    deleteError.value = e instanceof ApiError ? e.message : "Không xóa được sách";
    toDelete.value = null;
  } finally {
    deleting.value = false;
  }
}

// Đổi trạng thái có popup confirm
const STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Muốn đọc",
  READING: "Đang đọc",
  FINISHED: "Đã đọc xong",
};

const pendingStatus = ref<{ book: ShelfBook; status: ReadingStatus } | null>(null);
const changingStatus = ref(false);

async function confirmStatusChange() {
  if (!pendingStatus.value) return;
  const { book, status } = pendingStatus.value;
  changingStatus.value = true;
  await patch(book, { status }); 
  changingStatus.value = false;
  pendingStatus.value = null;
}

onMounted(() => store.fetchAll());
</script>

<template>
  <div class="shelf">
    <h1>Tủ sách của tôi</h1>

    <p v-if="loading && !items.length" class="msg">Đang tải...</p>

    <div v-else-if="error" class="msg msg--error">
      <p>{{ error }}</p>
      <button type="button" class="btn" @click="store.fetchAll()">Thử lại</button>
    </div>

    <template v-else>
      <div class="stats">
        <div v-for="s in statCards" :key="s.label" class="stat">
          <div class="stat__label">
            <span class="stat__dot" :style="{ background: s.dot }" />
            {{ s.label }}
          </div>
          <div class="stat__value">{{ s.value }}</div>
        </div>
      </div>

      <div class="tabs" role="tablist" aria-label="Lọc theo trạng thái">
        <button v-for="t in tabs" :key="t.key" type="button" role="tab" class="tab"
          :class="{ 'tab--active': activeTab === t.key }" :aria-selected="activeTab === t.key"
          @click="activeTab = t.key">
          {{ t.label }}
          <span class="tab__count">{{ t.count }}</span>
        </button>
      </div>

      <div v-if="notice" class="notice" role="status">
        <span class="notice__icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
        </span>
        <span class="notice__text">{{ notice }}</span>
        <button type="button" class="notice__link" @click="activeTab = 'FINISHED'; notice = null">
          Xem mục “Đã đọc xong”
        </button>
        <button type="button" class="notice__close" aria-label="Đóng thông báo" @click="notice = null">×</button>
      </div>

      <p v-if="deleteError" class="msg msg--error">{{ deleteError }}</p>

      <div v-if="visibleItems.length" class="list">
        <ShelfItem v-for="b in visibleItems" :key="b.id" :entry="b" :show-finished-banner="finishedBanner[b.id]"
          :server-error="itemErrors[b.id]" @update-page="patch(b, { currentPage: $event })"
          @change-status="pendingStatus = { book: b, status: $event }" @rate="patch(b, { rating: $event })"
          @save-note="patch(b, { note: $event })" @remove="toDelete = b" />
      </div>

      <div v-else class="empty">
        <h2>{{ items.length ? "Chưa có sách nào ở mục này" : "Tủ sách của bạn đang trống" }}</h2>
        <p>
          {{ items.length ? "Thử chọn mục khác hoặc thêm sách mới." : "Tìm một cuốn sách và thêm vào tủ để bắt đầu theo dõi." }}
        </p>
        <RouterLink to="/" class="btn">Tìm sách</RouterLink>
      </div>
    </template>

    <ConfirmDialog :open="!!toDelete" title="Xóa khỏi tủ sách?"
      :message="`“${toDelete?.title ?? ''}” sẽ bị xóa khỏi tủ sách cùng tiến độ, đánh giá và ghi chú. Thao tác này không thể hoàn tác.`"
      confirm-label="Xóa sách" busy-label="Đang xóa..." :busy="deleting" @confirm="confirmDelete"
      @cancel="toDelete = null" />

    <ConfirmDialog :open="!!pendingStatus" title="Đổi trạng thái?"
      :message="pendingStatus ? `Chuyển “${pendingStatus.book.title}” sang “${STATUS_LABELS[pendingStatus.status]}”?` : ''"
      confirm-label="Chuyển" busy-label="Đang chuyển..." variant="primary" :busy="changingStatus"
      @confirm="confirmStatusChange" @cancel="pendingStatus = null" />
  </div>
</template>

<style scoped>
.shelf {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.shelf h1 {
  font-size: var(--text-2xl);
  line-height: 1.3;
}

.msg {
  margin: 0;
  color: var(--color-text-muted);
}

.msg--error {
  color: var(--color-danger);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--tap-target);
  padding: 0 var(--space-5);
  border: 0;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  font: 600 var(--text-base) / 1 var(--font-sans);
  cursor: pointer;
}

.btn:hover {
  background: var(--color-accent-hover);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: var(--space-4);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.stat__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.stat__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
}

.stat__value {
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: var(--tap-target);
  padding: 0 var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  font: 600 var(--text-md) / 1 var(--font-sans);
  cursor: pointer;
}

.tab--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: var(--radius-pill);
  background: #eee8da;
  color: var(--color-text-muted);
  font-size: 13px;
}

.tab--active .tab__count {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.notice {
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
.notice__icon {
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
.notice__text { flex: 1; min-width: 0; }
.notice__link {
  flex: none;
  min-height: var(--tap-target);
  padding: 0 var(--space-2);
  border: 0;
  background: transparent;
  color: var(--color-done-fg);
  font: 600 var(--text-sm) / 1 var(--font-sans);
  text-decoration: underline;
  cursor: pointer;
}
.notice__close {
  flex: none;
  width: var(--tap-target);
  height: var(--tap-target);
  border: 0;
  background: transparent;
  color: var(--color-done-fg);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-4);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius);
}

.empty h2 {
  font-size: var(--text-xl);
}

.empty p {
  margin: 0 0 var(--space-3);
  color: var(--color-text-muted);
}

@media (max-width: 719px) {
  .shelf {
    gap: var(--space-5);
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
  }

  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: var(--space-1);
  }

  .tab {
    flex: none;
  }
  .notice {
    flex-wrap: wrap;
  }
  .notice__text {
    flex: 1 1 calc(100% - 100px);
  }
}
</style>