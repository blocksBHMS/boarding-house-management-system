<script setup lang="ts">
import { ref, computed } from 'vue'
import { Wrench, CheckCircle2, Clock, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatDate } from '@/utils/formatters'
import type { MaintenanceStatus } from '@/types/models'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppStatCard from '@/components/ui/AppStatCard.vue'

const store = useHouseStore()

const filterStatus = ref<'all' | 'pending' | 'in_progress' | 'resolved'>('all')

const filteredRequests = computed(() => {
  if (filterStatus.value === 'all') return store.maintenanceRequests
  return store.maintenanceRequests.filter((r) => r.status === filterStatus.value)
})

function getTenantName(tenantId: number) {
  const t = store.accounts.find((a) => a.id === tenantId)
  return t ? `${t.first_name} ${t.last_name}` : 'Resident'
}

function getTenantAvatar(tenantId: number) {
  const t = store.accounts.find((a) => a.id === tenantId)
  return t?.avatarUrl
}

function getRoomNumber(roomId: number) {
  const r = store.rooms.find((rm) => rm.id === roomId)
  return r ? r.room_number : `Room ${roomId}`
}

function setStatus(id: number, status: MaintenanceStatus) {
  store.updateMaintenanceStatus(id, status)
}
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
          Facilities & Repairs
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Maintenance Ticket Queue
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Track resident facility reports, repair progress, and maintenance resolutions.
        </p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 text-xs font-semibold">
        <button
          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="filterStatus = 'all'"
        >
          All ({{ store.maintenanceRequests.length }})
        </button>
        <button
          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="filterStatus === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="filterStatus = 'pending'"
        >
          Pending
        </button>
        <button
          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="filterStatus === 'in_progress' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="filterStatus = 'in_progress'"
        >
          In Progress
        </button>
        <button
          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="filterStatus === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
          @click="filterStatus = 'resolved'"
        >
          Resolved
        </button>
      </div>
    </div>

    <!-- 3 Executive KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <AppStatCard
        title="Active Issue Queue"
        :value="`${store.pendingMaintenanceCount} Tickets`"
        subtitle="Requiring technician action"
        :icon="AlertCircle"
        trend="Attention"
        trend-type="negative"
        color="rose"
      />
      <AppStatCard
        title="Under Repair"
        :value="`${store.maintenanceRequests.filter(m => m.status === 'in_progress').length} In Progress`"
        subtitle="Currently being serviced"
        :icon="Clock"
        trend="Active Work"
        trend-type="neutral"
        color="amber"
      />
      <AppStatCard
        title="Completed Resolutions"
        :value="`${store.maintenanceRequests.filter(m => m.status === 'resolved').length} Fixed`"
        subtitle="Successfully completed"
        :icon="CheckCircle2"
        trend="Resolved"
        trend-type="positive"
        color="emerald"
      />
    </div>

    <!-- Requests Grid / List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="req in filteredRequests"
        :key="req.id"
        class="enterprise-card p-6 flex flex-col justify-between card-lift"
      >
        <div>
          <!-- Header -->
          <div class="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900">
                Room {{ getRoomNumber(req.room_id) }}
              </span>
              <span class="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100 capitalize">
                {{ req.category }}
              </span>
            </div>

            <AppBadge
              :variant="
                req.status === 'resolved'
                  ? 'success'
                  : req.status === 'in_progress'
                  ? 'warning'
                  : 'danger'
              "
            >
              {{ req.status.replace('_', ' ').toUpperCase() }}
            </AppBadge>
          </div>

          <h3 class="font-bold text-sm text-slate-900 mb-2 leading-snug">{{ req.title }}</h3>
          <p class="text-xs text-slate-600 leading-relaxed mb-5">{{ req.description }}</p>

          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center gap-3">
            <img
              v-if="getTenantAvatar(req.tenant_id)"
              :src="getTenantAvatar(req.tenant_id)"
              class="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div
              v-else
              class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center"
            >
              R
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold text-slate-900 leading-tight truncate">
                {{ getTenantName(req.tenant_id) }}
              </p>
              <p class="text-[10px] text-slate-400 mt-0.5">
                Submitted {{ formatDate(req.created_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Status Toggle Actions -->
        <div class="pt-4 mt-5 border-t border-slate-100 flex items-center justify-end gap-2">
          <AppButton
            v-if="req.status === 'pending'"
            variant="outline"
            size="sm"
            class="text-xs py-1 px-3 h-8"
            @click="setStatus(req.id, 'in_progress')"
          >
            Mark In Progress
          </AppButton>

          <AppButton
            v-if="req.status !== 'resolved'"
            variant="primary"
            size="sm"
            class="text-xs py-1 px-3 h-8 bg-emerald-600 hover:bg-emerald-700 border-emerald-700"
            @click="setStatus(req.id, 'resolved')"
          >
            <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
            <span>Mark Resolved</span>
          </AppButton>

          <span v-else class="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 py-1">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <span>Issue Resolved</span>
          </span>
        </div>
      </div>

      <div
        v-if="filteredRequests.length === 0"
        class="col-span-full py-16 text-center enterprise-card p-8 text-slate-400 text-xs"
      >
        No maintenance tickets in this status category.
      </div>
    </div>
  </div>
</template>
