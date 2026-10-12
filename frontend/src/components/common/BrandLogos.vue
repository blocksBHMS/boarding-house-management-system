<script setup lang="ts">
defineProps<{
  brand: 'gcash' | 'maya' | 'cash' | 'bank_transfer' | 'other'
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <!-- GCash Official Style Badge & Mark -->
  <div v-if="brand === 'gcash'" class="inline-flex items-center gap-1.5 text-[#007DFE] font-bold">
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="#007DFE" />
      <path d="M12 6a6 6 0 0 0-4.9 9.5l1.6-1.2A4 4 0 1 1 12 16c-1.1 0-2.1-.4-2.8-1.2l-1.4 1.4A6 6 0 1 0 12 6z" fill="#FFFFFF" />
      <path d="M12 9a3 3 0 0 0-2.4 4.8l1.6-1.2A1 1 0 1 1 12 14c-.6 0-1-.4-1-1h-2a3 3 0 1 0 3-4z" fill="#007DFE" />
    </svg>
    <span class="tracking-tight text-xs">GCash</span>
  </div>

  <!-- Maya Official Style Mark -->
  <div v-else-if="brand === 'maya'" class="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <rect width="24" height="24" rx="6" fill="#00D665" />
      <path d="M6 15l3-6 3 6M12 15l3-6 3 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </svg>
    <span class="tracking-tight text-xs">Maya</span>
  </div>

  <!-- Cash Icon -->
  <div v-else-if="brand === 'cash'" class="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
    <span class="text-xs">Cash</span>
  </div>

  <!-- Bank Transfer Icon -->
  <div v-else-if="brand === 'bank_transfer'" class="inline-flex items-center gap-1.5 text-indigo-700 font-semibold">
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m2 7 10-5 10 5M4 10v9M8 10v9M12 10v9M16 10v9M20 10v9M2 21h20" />
    </svg>
    <span class="text-xs">Bank Transfer</span>
  </div>

  <!-- Other Icon -->
  <div v-else class="inline-flex items-center gap-1.5 text-slate-700 font-medium">
    <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
    <span class="text-xs">Other</span>
  </div>
</template>
