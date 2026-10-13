<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 22 })

// Each icon is a list of path strings on a 24x24 grid.
const ICONS: Record<string, string[]> = {
  home: ['M3 11 12 3l9 8', 'M5 10v11h14V10', 'M10 21v-6h4v6'],
  grid: ['M4 4h6v6H4z', 'M14 4h6v6h-6z', 'M4 14h6v6H4z', 'M14 14h6v6h-6z'],
  rooms: ['M6 21V3h12v18', 'M3 21h18', 'M10 7h1', 'M13 7h1', 'M10 11h1', 'M13 11h1', 'M10 15h4v6'],
  bed: ['M3 18v-7h18v7', 'M3 21v-3', 'M21 21v-3', 'M5 11V6h14v5', 'M8 11V8h8v3'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7'],
  id: ['M3 4h18v16H3z', 'M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z', 'M7 18c0-2.5 2.2-4 5-4s5 1.5 5 4'],
  file: ['M6 2h9l5 5v15H6z', 'M14 2v6h6', 'M9 13h8', 'M9 17h8'],
  list: ['M4 3h16v18H4z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
  wallet: ['M3 7h18v13H3z', 'M3 7l2-3h12v3', 'M16 13.5h3'],
  logout: ['M9 3H4v18h5', 'M16 7l5 5-5 5', 'M21 12H9'],
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  chevron: ['M9 6l6 6-6 6'],
  plus: ['M12 5v14', 'M5 12h14'],
  x: ['M5 5l14 14', 'M19 5 5 19'],
}
const paths = computed(() => ICONS[props.name] ?? [])
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" class="shrink-0">
    <path v-for="d in paths" :key="d" :d="d" />
  </svg>
</template>