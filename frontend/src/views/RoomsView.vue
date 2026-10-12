<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, DoorOpen, BedDouble, CheckCircle2, User, Phone, Sparkles } from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'

const store = useHouseStore()

// Filter state
const filter = ref<'all' | 'vacant' | 'full'>('all')

const filteredRooms = computed(() => {
  if (filter.value === 'vacant') {
    return store.detailedRooms.filter((r) => r.availableBeds > 0)
  }
  if (filter.value === 'full') {
    return store.detailedRooms.filter((r) => r.availableBeds === 0)
  }
  return store.detailedRooms
})

// Modal: Add Room
const showAddRoomModal = ref(false)
const newRoomNumber = ref('')
const newBedCount = ref(2)

function handleAddRoom() {
  if (!newRoomNumber.value.trim()) return
  store.addRoom(newRoomNumber.value.trim(), newBedCount.value)
  newRoomNumber.value = ''
  newBedCount.value = 2
  showAddRoomModal.value = false
}

// Modal: Quick Check-in from vacant bed
const showCheckInModal = ref(false)
const selectedRoomId = ref<number>(1)
const selectedBedId = ref<number>(1)
const selectedTenantId = ref<number>(2)
const checkInDate = ref('2026-10-12')
const agreedRate = ref(3000)

function openAssignModal(roomId: number, bedId: number) {
  selectedRoomId.value = roomId
  selectedBedId.value = bedId
  showCheckInModal.value = true
}

function handleCheckIn() {
  store.checkInTenant({
    tenantId: Number(selectedTenantId.value),
    roomId: Number(selectedRoomId.value),
    bedId: Number(selectedBedId.value),
    checkInDate: checkInDate.value,
    agreedRate: Number(agreedRate.value),
  })
  showCheckInModal.value = false
}
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
          Unit Inventory
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Rooms & Bedspace Visualizer
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Interactive floor plan layout. View real-time bed allocations, tenant occupancies, and vacancies.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 text-xs font-semibold">
          <button
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filter = 'all'"
          >
            All Rooms ({{ store.totalRoomsCount }})
          </button>
          <button
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="filter === 'vacant' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filter = 'vacant'"
          >
            Has Vacancy
          </button>
          <button
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="filter === 'full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filter = 'full'"
          >
            Fully Occupied
          </button>
        </div>

        <AppButton variant="primary" size="md" @click="showAddRoomModal = true">
          <Plus class="w-4 h-4 mr-1" />
          <span>Add New Room</span>
        </AppButton>
      </div>
    </div>

    <!-- Rooms Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="enterprise-card p-6 flex flex-col justify-between card-lift"
      >
        <div>
          <!-- Room Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <DoorOpen class="w-5 h-5" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-base">Room {{ room.room_number }}</h3>
                <p class="text-[11px] text-slate-400 font-medium">{{ room.category }} • {{ room.floor }}</p>
              </div>
            </div>

            <AppBadge :variant="room.availableBeds === 0 ? 'danger' : 'success'">
              {{ room.occupiedBeds }}/{{ room.totalBeds }} Occupied
            </AppBadge>
          </div>

          <!-- Bed Slots List -->
          <div class="mt-5 space-y-3">
            <div
              v-for="bed in room.beds"
              :key="bed.id"
              :class="[
                'p-3.5 rounded-xl border transition-all',
                bed.isOccupied
                  ? 'bg-slate-50/80 border-slate-200/80'
                  : 'bg-emerald-50/40 border-emerald-200/70 border-dashed hover:border-emerald-400',
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <BedDouble
                    :class="[
                      'w-4 h-4',
                      bed.isOccupied ? 'text-slate-400' : 'text-emerald-600',
                    ]"
                  />
                  <span class="font-bold text-xs text-slate-900">{{ bed.bed_label }}</span>
                </div>
                <AppBadge :variant="bed.isOccupied ? 'danger' : 'success'" size="sm">
                  {{ bed.isOccupied ? 'Occupied' : 'Vacant' }}
                </AppBadge>
              </div>

              <!-- Tenant Info (if occupied) -->
              <div v-if="bed.isOccupied" class="mt-2 text-xs text-slate-600 space-y-1">
                <div class="flex items-center gap-1.5 text-slate-900 font-bold">
                  <User class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ bed.currentTenant?.first_name }} {{ bed.currentTenant?.last_name }}</span>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                  <span class="font-mono">Rate: {{ formatCurrency(bed.agreedRate) }}/mo</span>
                  <span class="text-slate-400 font-mono">{{ bed.currentTenant?.contact_number }}</span>
                </div>
              </div>

              <!-- Vacant Action (if free) -->
              <div v-else class="mt-2 flex items-center justify-between pt-1">
                <span class="text-[11px] text-emerald-700 font-medium">Ready for tenant assignment</span>
                <AppButton
                  variant="outline"
                  size="sm"
                  class="text-xs py-1 px-2.5 h-7"
                  @click="openAssignModal(room.id, bed.id)"
                >
                  <Plus class="w-3 h-3 text-indigo-600 mr-1" />
                  <span>Assign</span>
                </AppButton>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Capacity: {{ room.totalBeds }} bedspaces</span>
          <span v-if="room.availableBeds > 0" class="text-emerald-600 font-semibold">
            {{ room.availableBeds }} space vacant
          </span>
          <span v-else class="text-slate-400 font-medium">Fully booked</span>
        </div>
      </div>
    </div>

    <!-- Modal: Add New Room -->
    <AppModal
      :show="showAddRoomModal"
      title="Add New Room Unit"
      description="Create a new room and configure its available bed spaces."
      max-width="md"
      @close="showAddRoomModal = false"
    >
      <form class="space-y-4" @submit.prevent="handleAddRoom">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Room Label / Number</label>
          <input
            v-model="newRoomNumber"
            type="text"
            placeholder="e.g. Room 301"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Bedspaces Capacity</label>
          <select
            v-model.number="newBedCount"
            class="field-control"
          >
            <option :value="1">1 Bed (Single Private Room)</option>
            <option :value="2">2 Beds (Double Sharing)</option>
            <option :value="3">3 Beds (Triple Sharing)</option>
            <option :value="4">4 Beds (Quad Sharing)</option>
          </select>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showAddRoomModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Create Room
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Assign Bed to Tenant -->
    <AppModal
      :show="showCheckInModal"
      title="Assign Bed (Register Tenancy)"
      description="Register an active tenancy lease for this vacant bed space."
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
            Confirm Assignment
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
