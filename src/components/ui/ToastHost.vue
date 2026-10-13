<script setup lang="ts">
import { toasts } from '../../composables/toast'

const tone = { ok: 'bg-leaf text-white', error: 'bg-rust text-white', info: 'bg-sand text-ink' } as const
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" :class="['brut-flat px-4 py-3 shadow-[4px_4px_0_var(--color-ink)]', tone[t.tone]]">
      {{ t.text }}
    </div>
  </div>
</template>