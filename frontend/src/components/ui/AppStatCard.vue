<script setup lang="ts">
import type { Component } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon?: Component
  trend?: string
  trendType?: 'positive' | 'negative' | 'neutral'
  color?: 'indigo' | 'emerald' | 'amber' | 'rose'
}>()
</script>

<template>
  <div class="enterprise-card p-5 sm:p-6 relative overflow-hidden group hover:border-slate-300">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          {{ title }}
        </span>
        <div class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {{ value }}
        </div>
      </div>
      
      <div
        v-if="icon"
        :class="[
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105',
          color === 'emerald' && 'bg-emerald-50 text-emerald-600 border-emerald-100',
          color === 'amber' && 'bg-amber-50 text-amber-600 border-amber-100',
          color === 'rose' && 'bg-rose-50 text-rose-600 border-rose-100',
          (!color || color === 'indigo') && 'bg-indigo-50 text-indigo-600 border-indigo-100',
        ]"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>

    <div v-if="trend || subtitle" class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <div v-if="trend" class="flex items-center gap-1.5 font-medium">
        <span
          :class="[
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]',
            trendType === 'positive' && 'bg-emerald-50 text-emerald-700',
            trendType === 'negative' && 'bg-rose-50 text-rose-700',
            (!trendType || trendType === 'neutral') && 'bg-slate-100 text-slate-600',
          ]"
        >
          <TrendingUp v-if="trendType === 'positive'" class="w-3 h-3" />
          <TrendingDown v-if="trendType === 'negative'" class="w-3 h-3" />
          <Minus v-if="!trendType || trendType === 'neutral'" class="w-3 h-3" />
          {{ trend }}
        </span>
      </div>
      <p v-if="subtitle" class="text-slate-500 truncate ml-auto">{{ subtitle }}</p>
    </div>
  </div>
</template>
