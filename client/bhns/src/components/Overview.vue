<script setup lang="ts">
import { computed, onMounted } from 'vue'
import HouseScene from '../components/HouseScene.vue'
import { house, loadHouse, accountName, bedFullLabel, tenancyLabel, invNo, invoiceTotals, bedsInRoom } from '../store/house'


// KPIs 
const totalRooms   = computed(() => house.rooms.length)
const totalBeds    = computed(() => house.beds.length)
const occupiedBeds = computed(() => house.beds.filter(b => b.is_occupied).length)
const vacantBeds   = computed(() => totalBeds.value - occupiedBeds.value)
const activeTenants = computed(() => house.tenancies.filter(t => t.is_active).length)

// Unpaid this month = sum of (total charges - paid) for all invoices with a balance
const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
const unpaidThisMonth = computed(() => {
  return house.invoices
    .filter(inv => inv.billing_month?.startsWith(currentMonth))
    .reduce((sum, inv) => {
      const { total, paid } = invoiceTotals(inv.id)
      const balance = total - paid
      return balance > 0 ? sum + balance : sum
    }, 0)
})
const unpaidCount = computed(() => {
  return house.invoices.filter(inv => {
    if (!inv.billing_month?.startsWith(currentMonth)) return false
    const { total, paid } = invoiceTotals(inv.id)
    return total - paid > 0
  }).length
})

// Beds per room for occupancy bars
const occupiedInRoom = (roomId: number) => bedsInRoom(roomId).filter(b => b.is_occupied).length

onMounted(() => loadHouse(['rooms', 'beds', 'tenancies', 'invoices', 'items', 'payments']))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <!-- TOP KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] flex flex-col justify-between">
        <div class="text-xs font-bold uppercase tracking-wider mb-4">Total Rooms</div>
        <div>
          <h2 class="font-mono text-4xl font-black text-black">{{ String(totalRooms).padStart(2, '0') }}</h2>
          <p class="font-mono text-xs text-gray-700 mt-1">{{ totalBeds }} beds total</p>
        </div>
      </div>

      <div class="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] flex flex-col justify-between">
        <div class="text-xs font-bold uppercase tracking-wider mb-4">Available Beds</div>
        <div>
          <h2 class="font-mono text-4xl font-black text-black">{{ vacantBeds }}/{{ totalBeds }}</h2>
          <p class="font-mono text-xs text-gray-700 mt-1">{{ occupiedBeds }} occupied</p>
        </div>
      </div>

      <div class="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] flex flex-col justify-between">
        <div class="text-xs font-bold uppercase tracking-wider mb-4">Active Tenants</div>
        <div>
          <h2 class="font-mono text-4xl font-black text-black">{{ activeTenants }}</h2>
          <p class="font-mono text-xs text-gray-700 mt-1">Settled and feeling at home</p>
        </div>
      </div>

      <div class="border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000] flex flex-col justify-between">
        <div class="text-xs font-bold uppercase tracking-wider mb-4">Unpaid this month</div>
        <div>
          <h2 class="font-mono text-4xl font-black text-black">
            ₱{{ unpaidThisMonth.toLocaleString('en-PH') }}
          </h2>
          <p class="font-mono text-xs text-gray-700 mt-1">
            {{ unpaidCount }} invoice{{ unpaidCount !== 1 ? 's' : '' }} •
            {{ new Date().toLocaleString('en-PH', { month: 'short', year: 'numeric' }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- MIDDLE SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Room Occupancy Bars -->
      <div class="lg:col-span-1 border-2 border-black bg-white p-4 shadow-[4px_4px_0_0_#000]">
        <h3 class="text-sm font-bold uppercase tracking-wider mb-1">Room Occupancy</h3>
        <p class="text-xs text-gray-700 mb-6">A little room for more good neighbors.</p>

        <div v-if="house.rooms.length === 0" class="font-mono text-xs text-gray-400">
          No rooms yet.
        </div>

        <div v-else class="space-y-4 font-mono text-xs">
          <div v-for="room in house.rooms" :key="room.id">
            <div class="flex justify-between mb-1">
              <span>{{ room.room_number }}</span>
              <span>{{ occupiedInRoom(room.id) }} of {{ bedsInRoom(room.id).length }} beds</span>
            </div>
            <div class="h-3 border-2 border-black w-full relative">
              <div
                class="h-full bg-teal-700 border-r-2 border-black transition-all"
                :style="{
                  width: bedsInRoom(room.id).length
                    ? (occupiedInRoom(room.id) / bedsInRoom(room.id).length) * 100 + '%'
                    : '0%'
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- House Layout -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="border-2 border-black bg-[#EAE8DD] p-4 shadow-[4px_4px_0_0_#000] flex-grow flex flex-col min-h-[320px]">
          <div class="flex justify-between items-center mb-3">
            <div class="text-sm font-bold uppercase tracking-wider">House Layout (Top View)</div>
          </div>

          <div class="flex-grow border-2 border-black min-h-[240px]">
            <HouseScene mode="top" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>