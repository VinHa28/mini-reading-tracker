import { ref } from "vue";
import { defineStore } from "pinia";

export type ToastType = "success" | "error";

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  body?: string;
}

const AUTO_CLOSE_MS = 4000;

export const useToastStore = defineStore("toast", () => {
  const toasts = ref<ToastItem[]>([]);
  let seq = 0;

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function push(type: ToastType, title: string, body?: string) {
    const id = ++seq;
    toasts.value.push({ id, type, title, body });
    setTimeout(() => dismiss(id), AUTO_CLOSE_MS);
  }

  const success = (title: string, body?: string) => push("success", title, body);
  const error = (title: string, body?: string) => push("error", title, body);

  return { toasts, success, error, dismiss };
});