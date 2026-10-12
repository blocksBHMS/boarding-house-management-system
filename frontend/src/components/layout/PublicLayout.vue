<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Menu, X, Building2, ArrowRight, ShieldCheck, Phone, MapPin } from 'lucide-vue-next'

const route = useRoute()
const menuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
    <!-- Clean, High-End Navigation Bar -->
    <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Brand Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group" @click="menuOpen = false">
          <div class="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-600 transition-colors">
            <Building2 class="w-4 h-4" />
          </div>
          <div>
            <span class="text-base font-extrabold tracking-tight text-slate-950 block leading-tight">BLOCKS</span>
            <span class="text-[9px] font-bold tracking-widest uppercase text-slate-400 block leading-tight">RESIDENCES</span>
          </div>
        </RouterLink>

        <!-- Center Nav Links -->
        <nav class="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <RouterLink
            to="/"
            :class="[
              'px-3.5 py-1.5 rounded-lg transition-colors',
              route.path === '/'
                ? 'bg-slate-100 text-slate-950 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50',
            ]"
          >
            Overview
          </RouterLink>
          <RouterLink
            to="/explore"
            :class="[
              'px-3.5 py-1.5 rounded-lg transition-colors',
              route.path === '/explore'
                ? 'bg-slate-100 text-slate-950 font-bold'
                : 'hover:text-slate-900 hover:bg-slate-50',
            ]"
          >
            Available Rooms & Beds
          </RouterLink>
        </nav>

        <!-- Right Action Button -->
        <div class="hidden md:flex items-center gap-3">
          <RouterLink
            to="/login"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-950 hover:bg-indigo-600 transition-colors shadow-xs"
          >
            <span>Resident Portal</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>

        <!-- Mobile Menu Toggle -->
        <button
          class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          type="button"
          aria-label="Toggle navigation"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </button>
      </div>

      <!-- Mobile Dropdown -->
      <nav
        v-if="menuOpen"
        class="border-t border-slate-200 bg-white px-5 py-4 space-y-2 md:hidden shadow-lg animate-in slide-in-from-top-1"
      >
        <RouterLink
          to="/"
          class="block py-2 text-xs font-semibold text-slate-800 hover:text-indigo-600"
          @click="menuOpen = false"
        >
          Overview
        </RouterLink>
        <RouterLink
          to="/explore"
          class="block py-2 text-xs font-semibold text-slate-800 hover:text-indigo-600"
          @click="menuOpen = false"
        >
          Available Rooms & Beds
        </RouterLink>
        <div class="pt-2 border-t border-slate-100">
          <RouterLink
            to="/login"
            class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-indigo-600 transition-colors"
            @click="menuOpen = false"
          >
            <span>Resident Sign In</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- Page Content -->
    <main class="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <RouterView />
    </main>

    <!-- Professional Footer -->
    <footer class="border-t border-slate-200/90 bg-white mt-20">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div class="space-y-3 md:col-span-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white">
                <Building2 class="w-4 h-4" />
              </div>
              <span class="text-sm font-bold text-slate-950">Blocks Residences Manila</span>
            </div>
            <p class="text-xs text-slate-500 max-w-md leading-relaxed">
              Professionally managed boarding house accommodations designed for students and working professionals. Transparent billing, fiber connectivity, and dedicated landlord operations.
            </p>
          </div>

          <div class="space-y-2 text-xs">
            <p class="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Location</p>
            <p class="text-slate-600 flex items-center gap-1.5"><MapPin class="w-3.5 h-3.5 text-slate-400" /> Sampaloc, Manila, Philippines</p>
            <p class="text-slate-500 text-[11px]">Minutes from University Belt & Transit Hubs</p>
          </div>

          <div class="space-y-2 text-xs">
            <p class="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Resident Services</p>
            <p class="text-slate-600 flex items-center gap-1.5"><Phone class="w-3.5 h-3.5 text-slate-400" /> +63 917 555 0100</p>
            <p class="text-slate-500 text-[11px]">Direct Landlord Desk (8:00 AM – 6:00 PM)</p>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 BlocksBHMS. All rights reserved.</p>
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1 text-slate-500">
              <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
              Verified Resident Ledger
            </span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
