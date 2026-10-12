<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  title: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{ (event: 'close'): void }>()
const dialog = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

function close() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.show,
  async (show) => {
    if (show) {
      previousFocus = document.activeElement as HTMLElement
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
      await nextTick()
      dialog.value?.focus()
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeydown)
      previousFocus?.focus()
    }
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-3 scale-98"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="opacity-0 translate-y-2 scale-98"
        >
          <section
            ref="dialog"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            tabindex="-1"
            :class="[
              'w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl outline-none',
              maxWidth === 'sm' && 'max-w-sm',
              maxWidth === 'md' && 'max-w-md',
              maxWidth === 'lg' && 'max-w-lg',
              maxWidth === 'xl' && 'max-w-2xl',
              !maxWidth && 'max-w-lg',
            ]"
          >
            <header class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div class="pr-6">
                <h2 class="text-lg font-bold text-slate-900 tracking-tight">{{ title }}</h2>
                <p v-if="description" class="mt-1 text-xs leading-relaxed text-slate-500">
                  {{ description }}
                </p>
              </div>
              <button
                class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                type="button"
                aria-label="Close dialog"
                @click="close"
              >
                <X class="h-4 w-4" />
              </button>
            </header>
            <div class="max-h-[75vh] overflow-y-auto px-6 py-6">
              <slot />
            </div>
            <footer
              v-if="$slots.footer"
              class="flex justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-6 py-4"
            >
              <slot name="footer" />
            </footer>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
