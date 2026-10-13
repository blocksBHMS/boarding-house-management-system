<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
watch(() => props.open, (v) => {
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
}, { immediate: true })
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 grid place-items-center p-4 bg-ink/50" @mousedown.self="emit('close')">
      <div class="brut-card w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" :aria-label="title">
        <div class="flex items-center justify-between gap-4 border-b-2 border-ink px-5 py-3">
          <h2 class="brut-title text-2xl">{{ title }}</h2>
          <button type="button" class="btn btn-sm" aria-label="Close" @click="emit('close')"><Icon name="x" :size="18" /></button>
        </div>
        <div class="p-5"><slot /></div>
        <div v-if="$slots.footer" class="flex flex-wrap justify-end gap-3 border-t-2 border-ink px-5 py-3">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>