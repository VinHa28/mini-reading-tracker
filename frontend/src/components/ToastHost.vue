<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToastStore } from "@/stores/toast";

const store = useToastStore();
const { toasts } = storeToRefs(store);
</script>

<template>
    <Teleport to="body">
        <TransitionGroup name="toast" tag="div" class="toasts" aria-live="polite">
            <div v-for="t in toasts" :key="t.id" class="toast" :role="t.type === 'error' ? 'alert' : 'status'">
                <span class="toast__icon" :class="`toast__icon--${t.type}`">
                    <svg v-if="t.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
                        aria-hidden="true">
                        <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
                        <path d="M12 6v8M12 18v.5" />
                    </svg>
                </span>
                <div class="toast__text">
                    <div class="toast__title">{{ t.title }}</div>
                    <div v-if="t.body" class="toast__body">{{ t.body }}</div>
                </div>
                <button type="button" class="toast__close" aria-label="Đóng thông báo"
                    @click="store.dismiss(t.id)">×</button>
            </div>
        </TransitionGroup>
    </Teleport>
</template>

<style scoped>
.toasts {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    pointer-events: none;
}

.toast {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    width: 380px;
    max-width: calc(100vw - 32px);
    box-sizing: border-box;
    padding: 14px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    font-family: var(--font-sans);
}

.toast__icon {
    flex: none;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-pill);
    display: flex;
    align-items: center;
    justify-content: center;
}

.toast__icon--success {
    background: var(--color-done-bg);
    color: var(--color-done-fg);
}

.toast__icon--error {
    background: var(--color-danger-soft);
    color: var(--color-danger);
}

.toast__text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.toast__title {
    font-size: var(--text-sm);
    font-weight: 600;
}

.toast__body {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
}

.toast__close {
    flex: none;
    width: var(--tap-target);
    height: var(--tap-target);
    margin: -12px -12px -12px 0;
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

@media (max-width: 719px) {
    .toasts {
        top: auto;
        bottom: 16px;
        left: 16px;
        right: 16px;
    }

    .toast {
        width: 100%;
        max-width: none;
    }

    .toast-enter-from,
    .toast-leave-to {
        transform: translateY(8px);
    }
}
</style>