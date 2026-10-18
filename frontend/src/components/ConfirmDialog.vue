<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  busyLabel?: string;
  variant?: "danger" | "primary";
}>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();

function onKey(e: KeyboardEvent) {
  if (props.open && e.key === "Escape") emit("cancel");
}
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click.self="emit('cancel')">
      <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title">
        <h2 id="dlg-title">{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" :disabled="busy" @click="emit('cancel')">
            Hủy
          </button>
          <button type="button" class="btn" :class="variant === 'primary' ? 'btn--primary' : 'btn--danger'"
            :disabled="busy" @click="emit('confirm')">
            {{ busy ? (busyLabel ?? "Đang xử lý...") : (confirmLabel ?? "Xác nhận") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background: var(--color-overlay);
}

.dialog {
  width: 100%;
  max-width: 420px;
  padding: var(--space-5);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  font-family: var(--font-sans);
}

.dialog h2 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.dialog p {
  margin: 0 0 var(--space-5);
  color: var(--color-text-muted);
  line-height: 1.6;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.btn {
  min-height: var(--tap-target);
  padding: 0 var(--space-5);
  border-radius: var(--radius);
  font: 600 var(--text-md) / 1 var(--font-sans);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.btn--secondary {
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);
}

.btn--danger {
  border: 1px solid var(--color-danger);
  background: var(--color-danger);
  color: #fff;
}

.btn--danger:hover:not(:disabled) {
  background: var(--color-danger-hover);
}

.btn--primary {
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

@media (max-width: 719px) {
  .dialog__actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>