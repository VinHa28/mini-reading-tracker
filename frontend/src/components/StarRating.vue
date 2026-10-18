<script setup lang="ts">
defineProps<{ modelValue: number }>();
const emit = defineEmits<{ "update:modelValue": [value: number] }>();
</script>

<template>
  <div class="stars" role="radiogroup" aria-label="Đánh giá">
    <button v-for="n in 5" :key="n" type="button" class="star" role="radio" :aria-checked="modelValue === n"
      :aria-label="`${n} sao`" @click="emit('update:modelValue', n)">
      <svg width="24" height="24" viewBox="0 0 24 24" :fill="n <= modelValue ? '#B7791F' : 'none'"
        :stroke="n <= modelValue ? '#B7791F' : '#9C917B'" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.stars {
  display: flex;
  align-items: center;
}

.star {
  width: 40px;
  height: var(--tap-target);
  padding: 0;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>