<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, UserPlus, Phone, Calendar, LogOut, CheckCircle2, Search, Users, DollarSign, DoorOpen } from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppStatCard from '@/components/ui/AppStatCard.vue'

const store = useHouseStore()

const searchQuery = ref('')
const showCheckInModal = ref(false)
const selectedTenantId = ref<number>(2)
const selectedBedId = ref<number>(
  store.beds.find((b) => !store.tenancies.some((t) => t.bed === b.id))?.id || 1
)
const checkInDate = ref('2026-10-12')
const agreedRate = ref(3000)

const totalContractedRent = computed(() => {
  return store.detailedTenancies.reduce((acc, curr) => acc + curr.agreed_rate, 0)
})

const filteredTenancies = computed(() => {
  if (!searchQuery.value.trim()) return store.detailedTenancies
  const q = searchQuery.value.toLowerCase()
  return store.detailedTenancies.filter((t) => {
    const name = t.tenantDetails ? `${t.tenantDetails.first_name} ${t.tenantDetails.last_name}`.toLowerCase() : ''
    const room = t.roomDetails?.room_number?.toLowerCase() || ''
    const bed = t.bedDetails?.bed_label?.toLowerCase() || ''
    const contact = t.tenantDetails?.contact_number?.toLowerCase() || ''
    return name.includes(q) || room.includes(q) || bed.includes(q) || contact.includes(q)
  })
})

function handleCheckIn() {
  const bedObj = store.beds.find((b) => b.id === Number(selectedBedId.value))
  if (!bedObj) return

  store.checkInTenant({
    tenantId: Number(selectedTenantId.value),
    roomId: bedObj.room_id,
    bedId: bedObj.id,
    checkInDate: checkInDate.value,
    agreedRate: Number(agreedRate.value),
  })

  showCheckInModal.value = false
}

function handleEndTenancy(id: number, tenantName?: string) {
  if (confirm(`Are you sure you want to end tenancy and process check-out for ${tenantName || 'this resident'}?`)) {
    store.endTenancy(id)
  }
}
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
          Resident Leases
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tenancies & Agreements
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Active resident leases, move-in check-in records, and monthly contracted rates.
        </p>
      </div>

      <AppButton variant="primary" size="md" @click="showCheckInModal = true">
        <UserPlus class="w-4 h-4 mr-1" />
        <span>New Resident Check-In</span>
      </AppButton>
    </div>

    <!-- 3 Executive KPI Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <AppStatCard
        title="Active Resident Leases"
        :value="`${store.detailedTenancies.length} Tenants`"
        subtitle="Currently occupied bedspaces"
        :icon="Users"
        trend="Good Standing"
        trend-type="positive"
        color="indigo"
      />
      <AppStatCard
        title="Contracted Monthly Revenue"
        :value="formatCurrency(totalContractedRent)"
        subtitle="Base rent from active leases"
        :icon="DollarSign"
        trend="Monthly Base"
        trend-type="neutral"
        color="emerald"
      />
      <AppStatCard
        title="Available Capacity"
        :value="`${store.vacantBedsCount} Spaces`"
        subtitle="Vacant beds for move-in"
        :icon="DoorOpen"
        trend="Ready to lease"
        trend-type="positive"
        color="amber"
      />
    </div>

    <!-- Search Toolbar + Data Grid Container -->
    <div class="enterprise-card overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search resident name, room, bed, or phone..."
            class="field-control pl-9 text-xs"
          />
        </div>

        <div class="text-xs text-slate-500 font-medium">
          Showing {{ filteredTenancies.length }} of {{ store.detailedTenancies.length }} Leases
        </div>
      </div>

      <!-- High-Density Tenancies Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="table-header">
              <th class="py-3 px-5">Resident</th>
              <th class="py-3 px-5">Contact Details</th>
              <th class="py-3 px-5">Assigned Space</th>
              <th class="py-3 px-5">Check-In Date</th>
              <th class="py-3 px-5">Agreed Rent Rate</th>
              <th class="py-3 px-5">Lease Status</th>
              <th class="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="tenancy in filteredTenancies"
              :key="tenancy.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-5">
                <div class="flex items-center gap-3">
                  <img
                    v-if="tenancy.tenantDetails?.avatarUrl"
                    :src="tenancy.tenantDetails.avatarUrl"
                    class="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div
                    v-else
                    class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center"
                  >
                    {{ tenancy.tenantDetails?.first_name[0] }}{{ tenancy.tenantDetails?.last_name[0] }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 leading-tight">
                      {{ tenancy.tenantDetails?.first_name }} {{ tenancy.tenantDetails?.last_name }}
                    </div>
                    <div class="text-[10px] text-slate-400">@{{ tenancy.tenantDetails?.username }}</div>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-5 font-mono text-slate-700">
                {{ tenancy.tenantDetails?.contact_number }}
              </td>

              <td class="py-3.5 px-5">
                <div class="font-bold text-slate-900">Room {{ tenancy.roomDetails?.room_number }}</div>
                <div class="text-[10px] text-slate-400">{{ tenancy.bedDetails?.bed_label }}</div>
              </td>

              <td class="py-3.5 px-5 text-slate-600 font-medium">
                {{ formatDate(tenancy.check_in_date) }}
              </td>

              <td class="py-3.5 px-5 font-mono font-bold text-slate-900">
                {{ formatCurrency(tenancy.agreed_rate) }}<span class="text-[10px] text-slate-400 font-normal">/mo</span>
              </td>

              <td class="py-3.5 px-5">
                <AppBadge variant="success">Active Lease</AppBadge>
              </td>

              <td class="py-3.5 px-5 text-right">
                <AppButton
                  variant="ghost"
                  size="sm"
                  class="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs py-1 px-2.5 h-7"
                  @click="handleEndTenancy(tenancy.id, tenancy.tenantDetails?.first_name)"
                >
                  <LogOut class="w-3.5 h-3.5 mr-1" />
                  <span>Check Out</span>
                </AppButton>
              </td>
            </tr>

            <tr v-if="filteredTenancies.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                No resident leases match your search.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: New Check-in -->
    <AppModal
      :show="showCheckInModal"
      title="Resident Check-In & Lease Registration"
      description="Register a new lease agreement and assign tenant to an available vacant bed space."
      max-width="md"
      @close="showCheckInModal = false"
    >
      <form class="space-y-4" @submit.prevent="handleCheckIn">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Select Resident</label>
          <select
            v-model.number="selectedTenantId"
            class="field-control"
          >
            <option
              v-for="tenant in store.accounts.filter(a => a.role === 'tenant')"
              :key="tenant.id"
              :value="tenant.id"
            >
              {{ tenant.first_name }} {{ tenant.last_name }} ({{ tenant.contact_number }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Select Available Bed Space</label>
          <select
            v-model.number="selectedBedId"
            class="field-control"
          >
            <template v-for="room in store.detailedRooms" :key="room.id">
              <optgroup :label="`Room ${room.room_number} (${room.floor})`">
                <option
                  v-for="bed in room.beds.filter(b => !b.isOccupied)"
                  :key="bed.id"
                  :value="bed.id"
                >
                  {{ bed.bed_label }} — Available
                </option>
              </optgroup>
            </template>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Move-In Check-In Date</label>
          <input
            v-model="checkInDate"
            type="date"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Agreed Monthly Rate (PHP)</label>
          <input
            v-model.number="agreedRate"
            type="number"
            step="50"
            class="field-control font-mono font-bold"
            required
          />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showCheckInModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Confirm Check-In
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
