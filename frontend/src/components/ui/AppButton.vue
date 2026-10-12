<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
  }
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
      size === 'sm' && 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
      size === 'md' && 'px-4 py-2 text-sm rounded-lg gap-2',
      size === 'lg' && 'px-5 py-2.5 text-base rounded-xl gap-2.5',
      variant === 'primary' &&
        'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-xs border border-indigo-700/80',
      variant === 'secondary' &&
        'bg-slate-100 text-slate-800 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200/80 shadow-xs',
      variant === 'outline' &&
        'bg-white text-slate-700 border border-slate-300/80 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-xs',
      variant === 'danger' &&
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs border border-rose-700/80',
      variant === 'ghost' &&
        'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:bg-slate-200/60',
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
