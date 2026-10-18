import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { getShelf, removeShelfBook, updateShelfBook } from "@/api/shelf";
import { ApiError } from "@/api/client";
import type { ShelfBook, UpdateShelfPayload } from "@/types/api";

// Store dạng "setup": ref = state, computed = getter, function = action.
export const useShelfStore = defineStore("shelf", () => {
  const items = ref<ShelfBook[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // count ngay từ danh sách đang có
  const stats = computed(() => ({
    total: items.value.length,
    WANT_TO_READ: items.value.filter((b) => b.status === "WANT_TO_READ").length,
    READING: items.value.filter((b) => b.status === "READING").length,
    FINISHED: items.value.filter((b) => b.status === "FINISHED").length,
  }));

  async function fetchAll() {
    loading.value = true;
    error.value = null;
    try {
      items.value = await getShelf();
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : "Đã có lỗi xảy ra";
    } finally {
      loading.value = false;
    }
  }

  // Cập nhật rồi thay đúng cuốn đó bằng dữ liệu server trả về
  async function update(id: number, payload: UpdateShelfPayload) {
    const updated = await updateShelfBook(id, payload);
    const i = items.value.findIndex((b) => b.id === id);
    if (i !== -1) items.value[i] = updated;
    return updated;
  }

  async function remove(id: number) {
    await removeShelfBook(id);
    items.value = items.value.filter((b) => b.id !== id);
  }

  return { items, loading, error, stats, fetchAll, update, remove };
});