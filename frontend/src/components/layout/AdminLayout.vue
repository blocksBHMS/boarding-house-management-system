<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  Receipt,
  CreditCard,
  Wrench,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  Building2,
  Bell,
} from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'

const route = useRoute()
const router = useRouter()
const store = useHouseStore()
const mobileOpen = ref(false)

const links = computed(() => [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Rooms & Beds', path: '/admin/rooms', icon: DoorOpen },
  { label: 'Tenancies', path: '/admin/tenants', icon: Users },
  {
    label: 'Invoices',
    path: '/admin/invoices',
    icon: Receipt,
    badge: store.overdueInvoicesCount > 0 ? `${store.overdueInvoicesCount}` : undefined,
    badgeVariant: 'warning',
  },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  {
    label: 'Maintenance',
    path: '/admin/maintenance',
    icon: Wrench,
    badge: store.pendingMaintenanceCount > 0 ? `${store.pendingMaintenanceCount}` : undefined,
    badgeVariant: 'danger',
  },
])

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 md:grid md:grid-cols-[260px_1fr]">
    <!-- Mobile backdrop -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs md:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-65 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo Header -->
      <div class="flex h-16 items-center justify-between border-b border-slate-800/80 px-6">
        <RouterLink to="/admin" class="flex items-center gap-2.5" @click="mobileOpen = false">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Building2 class="w-4 h-4" />
          </div>
          <div>
            <span class="font-bold text-base tracking-tight text-white block leading-tight">Blocks</span>
            <span class="text-[10px] font-medium tracking-wider uppercase text-slate-400 block">Workspace</span>
          </div>
        </RouterLink>
        <button
          class="rounded-lg p-1.5 text-slate-400 hover:text-white md:hidden"
          type="button"
          aria-label="Close navigation"
          @click="mobileOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto" aria-label="Management navigation">
        <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Management
        </p>

        <RouterLink
          v-for="link in links"
          :key="link.path"
          :to="link.path"
          :class="[
            'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all group',
            route.path === link.path
              ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
              : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200',
          ]"
          @click="mobileOpen = false"
        >
          <div class="flex items-center gap-3">
            <component
              :is="link.icon"
              :class="[
                'h-4 w-4 transition-colors',
                route.path === link.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-300',
              ]"
            />
            <span>{{ link.label }}</span>
          </div>

          <span
            v-if="link.badge"
            :class="[
              'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
              route.path === link.path
                ? 'bg-white/20 text-white'
                : link.badgeVariant === 'danger'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400',
            ]"
          >
            {{ link.badge }}
          </span>
        </RouterLink>
      </nav>

      <!-- Sidebar Footer: Occupancy meter & user summary -->
      <div class="border-t border-slate-800/80 p-4 space-y-4">
        <div class="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
          <div class="flex items-center justify-between text-xs mb-2">
            <span class="text-slate-400 font-medium">Occupancy Rate</span>
            <span class="font-bold text-white">{{ store.occupancyRate }}%</span>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              class="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
              :style="{ width: `${store.occupancyRate}%` }"
            />
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{{ store.occupiedBedsCount }} occupied</span>
            <span>{{ store.vacantBedsCount }} vacant</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 text-xs">
          <RouterLink
            to="/"
            class="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <span>Public Site</span>
            <ArrowUpRight class="h-3 w-3" />
          </RouterLink>
          <button
            class="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            @click="logout"
          >
            <LogOut class="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Shell -->
    <div class="min-w-0 flex flex-col">
      <!-- Top header -->
      <header
        class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md"
      >
        <div class="flex items-center gap-3">
          <button
            class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            type="button"
            aria-label="Open navigation"
            @click="mobileOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <div>
            <h1 class="text-sm font-bold text-slate-900 leading-tight">Property Operations</h1>
            <p class="hidden sm:block text-xs text-slate-500">Live operational command center</p>
          </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-4">
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Online</span>
          </div>

          <div class="h-5 w-px bg-slate-200 hidden sm:block" />

          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <p class="text-xs font-bold text-slate-900 leading-tight">Maria Reyes</p>
              <p class="text-[11px] text-slate-500">Property Owner</p>
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
              MR
            </div>
          </div>
        </div>
      </header>

      <!-- Main Router Outlet -->
      <main class="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div class="mx-auto max-w-7xl">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
