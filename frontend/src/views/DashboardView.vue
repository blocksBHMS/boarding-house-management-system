<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  AlertCircle,
  Plus,
  Receipt,
  CreditCard,
  DoorOpen,
  DollarSign,
  TrendingUp,
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  Building,
} from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { propertyBuildingPhoto } from '@/mocks/seedData'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AppStatCard from '@/components/ui/AppStatCard.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import BrandLogos from '@/components/common/BrandLogos.vue'

const store = useHouseStore()
const router = useRouter()

const monthlyBars = [
  { month: 'May', height: 45, amount: 18500 },
  { month: 'Jun', height: 55, amount: 22000 },
  { month: 'Jul', height: 50, amount: 20500 },
  { month: 'Aug', height: 68, amount: 27000 },
  { month: 'Sep', height: 75, amount: 30000 },
  { month: 'Oct', height: 85, amount: store.totalCollected },
]

const recentPayments = computed(() => {
  return [...store.payments].reverse().slice(0, 5)
})
</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- Executive Header with Property Identity -->
    <div class="enterprise-card overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
        <div class="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                Manila Branch
              </span>
              <span class="text-xs text-slate-400">•</span>
              <span class="text-xs text-slate-500 font-medium">Daily Operations Dashboard</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Blocks Boarding House
            </h1>
            <p class="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
              Monitoring resident occupancies, automated utility invoices, and real-time ledger collections across all bedspaces.
            </p>
          </div>

          <!-- Quick Metrics Bar -->
          <div class="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total Rooms</span>
              <span class="text-xl font-bold text-slate-900 mt-0.5 block">{{ store.totalRoomsCount }} Rooms</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Total Bedspaces</span>
              <span class="text-xl font-bold text-slate-900 mt-0.5 block">{{ store.totalBedsCount }} Beds</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Active Residents</span>
              <span class="text-xl font-bold text-emerald-600 mt-0.5 block">{{ store.occupiedBedsCount }} Tenants</span>
            </div>
            <div>
              <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Available Now</span>
              <span class="text-xl font-bold text-indigo-600 mt-0.5 block">{{ store.vacantBedsCount }} Vacancies</span>
            </div>
          </div>
        </div>

        <div class="relative min-h-48 lg:min-h-full border-t lg:border-t-0 lg:border-l border-slate-100">
          <img
            :src="propertyBuildingPhoto"
            alt="Blocks Boarding House Facade"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-6 flex flex-col justify-end text-white">
            <p class="text-xs font-semibold uppercase tracking-wider text-indigo-200">Property Location</p>
            <p class="text-sm font-medium text-slate-100">1248 Loyola St., Sampaloc, Manila</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 High-Tier KPI Metric Widgets -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <AppStatCard
        title="Total Invoiced"
        :value="formatCurrency(store.totalMonthlyBilled)"
        subtitle="Current billing cycle"
        :icon="Receipt"
        trend="Active cycle"
        trend-type="neutral"
        color="indigo"
      />
      <AppStatCard
        title="Revenue Collected"
        :value="formatCurrency(store.totalCollected)"
        subtitle="Verified tenant payments"
        :icon="DollarSign"
        trend="+14.2% vs last mo"
        trend-type="positive"
        color="emerald"
      />
      <AppStatCard
        title="Outstanding Balance"
        :value="formatCurrency(store.totalOutstanding)"
        subtitle="Awaiting settlement"
        :icon="Clock"
        trend="3 Invoices Due"
        trend-type="negative"
        color="amber"
      />
      <AppStatCard
        title="Occupancy Capacity"
        :value="`${store.occupancyRate}%`"
        :subtitle="`${store.occupiedBedsCount} of ${store.totalBedsCount} beds occupied`"
        :icon="DoorOpen"
        trend="Near Full"
        trend-type="positive"
        color="indigo"
      />
    </div>

    <!-- Charts & Quick Action Center -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 sm:gap-8">
      <!-- Collection Activity Chart -->
      <section class="enterprise-card p-6">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Collection Revenue Velocity</h2>
            <p class="text-xs text-slate-500 mt-0.5">Verified tenant settlements across recent months</p>
          </div>
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
            {{ formatCurrency(store.totalCollected) }} Total
          </span>
        </div>

        <div class="h-56 flex items-end gap-3 sm:gap-6 pt-4 pb-2 border-b border-slate-100 px-2">
          <div
            v-for="(bar, index) in monthlyBars"
            :key="bar.month"
            class="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative"
          >
            <!-- Hover Tooltip -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-sm whitespace-nowrap pointer-events-none z-10 font-mono">
              {{ formatCurrency(bar.amount) }}
            </div>

            <div
              class="w-full max-w-14 rounded-t-lg transition-all duration-300 group-hover:opacity-90"
              :class="index === monthlyBars.length - 1 ? 'bg-indigo-600 shadow-xs shadow-indigo-500/30' : 'bg-indigo-100 hover:bg-indigo-200'"
              :style="{ height: `${bar.height}%` }"
            />
            <span class="text-[11px] font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              {{ bar.month }}
            </span>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Target collection: 90%</span>
          <span class="font-medium text-indigo-600">6-Month Trend Overview</span>
        </div>
      </section>

      <!-- Quick Action Operations -->
      <aside class="enterprise-card p-6 flex flex-col justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 tracking-tight mb-1">Quick Actions</h2>
          <p class="text-xs text-slate-500 mb-5">Shortcuts for routine property management</p>

          <div class="space-y-2.5">
            <button
              class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left text-xs font-semibold text-slate-800 group"
              @click="router.push('/admin/invoices')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Receipt class="w-4 h-4" />
                </div>
                <span>Create New Invoice</span>
              </div>
              <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-left text-xs font-semibold text-slate-800 group"
              @click="router.push('/admin/payments')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CreditCard class="w-4 h-4" />
                </div>
                <span>Record Tenant Payment</span>
              </div>
              <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left text-xs font-semibold text-slate-800 group"
              @click="router.push('/admin/rooms')"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <DoorOpen class="w-4 h-4" />
                </div>
                <span>View Bed Visualizer</span>
              </div>
              <ArrowRight class="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

        <div class="mt-6 pt-5 border-t border-slate-100 bg-slate-50/50 rounded-xl p-3 text-xs">
          <div class="flex items-center gap-2 text-slate-700 font-semibold mb-1">
            <CheckCircle2 class="w-4 h-4 text-emerald-600" />
            <span>Audit Trail Log</span>
          </div>
          <p class="text-[11px] text-slate-500 leading-relaxed">
            All balance changes are synchronized automatically with local storage state.
          </p>
        </div>
      </aside>
    </div>

    <!-- 3-Column Operations Data Grids -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
      <!-- 1. Room Occupancy Grid -->
      <section class="enterprise-card overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900 tracking-tight">Room Occupancy</h2>
            <p class="text-[11px] text-slate-500">Live bed distribution</p>
          </div>
          <button
            class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            @click="router.push('/admin/rooms')"
          >
            Manage Rooms →
          </button>
        </div>

        <div class="divide-y divide-slate-100">
          <div
            v-for="room in store.detailedRooms"
            :key="room.id"
            class="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-slate-900">Room {{ room.room_number }}</span>
                <span class="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                  {{ room.category }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                {{ room.occupiedBeds }} of {{ room.totalBeds }} beds occupied
              </p>
            </div>

            <AppBadge :variant="room.availableBeds > 0 ? 'success' : 'neutral'">
              {{ room.availableBeds > 0 ? `${room.availableBeds} Vacant` : 'Full' }}
            </AppBadge>
          </div>
        </div>
      </section>

      <!-- 2. Recent Transactions Grid -->
      <section class="enterprise-card overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900 tracking-tight">Recent Ledger Payments</h2>
            <p class="text-[11px] text-slate-500">Latest settled amounts</p>
          </div>
          <button
            class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            @click="router.push('/admin/payments')"
          >
            Full Ledger →
          </button>
        </div>

        <div class="divide-y divide-slate-100">
          <div
            v-for="payment in recentPayments"
            :key="payment.id"
            class="p-4 hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900">Invoice #{{ payment.invoice }}</span>
                <BrandLogos :brand="payment.method" size="sm" />
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                {{ formatDate(payment.payment_date) }}
              </p>
            </div>

            <span class="font-mono text-xs font-bold text-emerald-600">
              +{{ formatCurrency(payment.amount_paid) }}
            </span>
          </div>
        </div>
      </section>

      <!-- 3. Maintenance Queue Grid -->
      <section class="enterprise-card overflow-hidden">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-slate-900 tracking-tight">Maintenance Tickets</h2>
            <p class="text-[11px] text-slate-500">Reported issues</p>
          </div>
          <button
            class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            @click="router.push('/admin/maintenance')"
          >
            View Queue →
          </button>
        </div>

        <div class="divide-y divide-slate-100">
          <div
            v-for="req in store.maintenanceRequests.slice(0, 5)"
            :key="req.id"
            class="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-3"
          >
            <AlertCircle
              class="w-4 h-4 shrink-0 mt-0.5"
              :class="req.status === 'pending' ? 'text-rose-500' : 'text-amber-500'"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-slate-900 truncate">{{ req.title }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[10px] text-slate-400 capitalize">{{ req.category }}</span>
                <span class="text-slate-300 text-[10px]">•</span>
                <span class="text-[10px] font-semibold text-slate-600 uppercase">{{ req.status }}</span>
              </div>
            </div>
          </div>

          <div v-if="store.maintenanceRequests.length === 0" class="p-6 text-center text-xs text-slate-400">
            No active maintenance requests.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
