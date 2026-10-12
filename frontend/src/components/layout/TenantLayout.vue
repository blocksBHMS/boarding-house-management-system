<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ArrowLeft, LogOut, Building2, CheckCircle2 } from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'

const store = useHouseStore()
const router = useRouter()

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col text-slate-900">
    <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-4">
          <RouterLink to="/portal" class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Building2 class="w-4 h-4" />
            </div>
            <div>
              <span class="text-base font-extrabold tracking-tight text-slate-900 leading-tight block">Blocks</span>
              <span class="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 leading-tight block">Resident Portal</span>
            </div>
          </RouterLink>

          <span class="hidden sm:block h-4 w-px bg-slate-200" />

          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Resident</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <RouterLink
            to="/"
            class="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft class="h-3.5 w-3.5" />
            <span>Public Site</span>
          </RouterLink>

          <div class="h-4 w-px bg-slate-200 hidden sm:block" />

          <div class="flex items-center gap-3">
            <div class="text-right">
              <p class="text-xs font-bold text-slate-900 leading-tight">
                {{ store.currentUser?.first_name }} {{ store.currentUser?.last_name }}
              </p>
              <p class="text-[10px] text-slate-500">
                {{ store.tenantActiveTenancy?.roomDetails?.room_number ? `Room ${store.tenantActiveTenancy.roomDetails.room_number}` : 'Resident' }}
              </p>
            </div>

            <img
              v-if="store.currentUser?.avatarUrl"
              :src="store.currentUser.avatarUrl"
              :alt="store.currentUser.first_name"
              class="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs"
            >
              {{ store.currentUser?.first_name?.[0] || 'R' }}
            </div>

            <button
              class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              type="button"
              title="Sign Out"
              aria-label="Sign Out"
              @click="logout"
            >
              <LogOut class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>
