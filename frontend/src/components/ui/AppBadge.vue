<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
    size?: 'sm' | 'md'
    dot?: boolean
  }>(),
  {
    variant: 'neutral',
    size: 'sm',
    dot: true,
  }
)
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none',
      size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
      {
        'bg-emerald-50 text-emerald-700 border border-emerald-200/80': variant === 'success',
        'bg-rose-50 text-rose-700 border border-rose-200/80': variant === 'danger',
        'bg-amber-50 text-amber-700 border border-amber-200/80': variant === 'warning',
        'bg-sky-50 text-sky-700 border border-sky-200/80': variant === 'info',
        'bg-slate-100 text-slate-700 border border-slate-200/80': variant === 'neutral',
      },
    ]"
  >
    <span
      v-if="dot"
      :class="[
        'h-1.5 w-1.5 rounded-full shrink-0',
        {
          'bg-emerald-500': variant === 'success',
          'bg-rose-500': variant === 'danger',
          'bg-amber-500': variant === 'warning',
          'bg-sky-500': variant === 'info',
          'bg-slate-400': variant === 'neutral',
        },
      ]"
    />
    <slot />
  </span>
</template>
