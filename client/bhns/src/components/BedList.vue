<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHouse } from '../composables/useHouse'
import { house, loadHouse } from '../store/house'
import type { Bed } from '../composables/useHouse'
import HouseScene from '../components/HouseScene.vue'
import { currentUser } from '../services/session'
import { neoAlert } from '../composables/useAlert'

const isTenant = currentUser().role === 'tenant'
const { rooms, addBed, renameBed, deleteBed, assignTenant } = useHouse()

const beds = computed(() => rooms.value.flatMap((room) => room.beds.map((bed) => ({ bed, room }))))
const roomsWithCapacity = computed(() => rooms.value.filter((room) => room.physicalBedsCount < 2))
const tenantAccounts = computed(() => house.accounts.filter((account) => account.role === 'tenant'))

const show3DView = ref(localStorage.getItem('bhns_show_3d') !== 'false')
const toggle3DView = () => {
  show3DView.value = !show3DView.value
  localStorage.setItem('bhns_show_3d', String(show3DView.value))
}

const modal = ref({
  isOpen: false,
  type: '' as 'EDIT_BED' | 'VIEW_TENANT' | 'DELETE_BED' | 'ASSIGN_TENANT' | 'ADD_BED',
  bedId: null as number | null,
  roomId: null as number | null,
  inputValue: '',
  tenantInfo: '',
  selectedAccount: '' as number | string,
  rateValue: '1500',
  bedType: 'single' as 'single' | 'bunk'
})

const openAddBedModal = () => {
  const availableRoom = roomsWithCapacity.value[0]
  if (!availableRoom) return
  modal.value = { 
    isOpen: true, 
    type: 'ADD_BED', 
    roomId: availableRoom.id,
    bedId: null, inputValue: '', tenantInfo: '', selectedAccount: '', rateValue: '1500', bedType: 'single'
  }
}

const openEditBedModal = (roomId: number, bed: Bed) => {
  modal.value = { isOpen: true, type: 'EDIT_BED', roomId, bedId: bed.dbId, inputValue: bed.label.replace('Bed ', ''), tenantInfo: '', selectedAccount: '', rateValue: '1500', bedType: 'single' }
}

const openDeleteBedModal = (bed: Bed) => {
  modal.value = { isOpen: true, type: 'DELETE_BED', roomId: null, bedId: bed.dbId, inputValue: '', tenantInfo: '', selectedAccount: '', rateValue: '1500', bedType: 'single' }
}

const openViewTenantModal = (bed: Bed) => {
  const info = `Occupant: ${bed.tenant}\nRate: ₱${bed.rate.toLocaleString()} / mo`
  modal.value = { isOpen: true, type: 'VIEW_TENANT', roomId: null, bedId: null, inputValue: '', tenantInfo: info, selectedAccount: '', rateValue: '1500', bedType: 'single' }
}

const openAssignModal = (bedDbId: number) => {
  modal.value = { isOpen: true, type: 'ASSIGN_TENANT', roomId: null, bedId: bedDbId, inputValue: '', tenantInfo: '', selectedAccount: '', rateValue: '1500', bedType: 'single' }
}

const closeModal = () => {
  modal.value.isOpen = false
}

const submitModal = async () => {
  if (modal.value.type === 'ADD_BED' && modal.value.roomId) {
    const room = rooms.value.find(r => r.id === modal.value.roomId)
    if (!room) return
    
    // Check our new physical bed count property
    if (room.physicalBedsCount >= 2) {
      neoAlert('This room already holds the maximum limit of 2 physical beds.')
      return
    }
    
    // Pass the type straight to the nigga backend logic
    await addBed(modal.value.roomId, modal.value.bedType)
  }
  else if (modal.value.type === 'EDIT_BED' && modal.value.roomId && modal.value.bedId) {
    const label = modal.value.inputValue.trim()
    if (!label) return
    await renameBed(modal.value.bedId, modal.value.roomId, label)
  }
  else if (modal.value.type === 'DELETE_BED' && modal.value.bedId) {
    await deleteBed(modal.value.bedId) 
  }
  else if (modal.value.type === 'ASSIGN_TENANT' && modal.value.bedId) {
    if (!modal.value.selectedAccount) {
      neoAlert('Please select a tenant.')
      return
    }
    const rate = Number(modal.value.rateValue)
    if (!Number.isFinite(rate) || rate < 0) {
      neoAlert('Enter a valid monthly rate.')
      return
    }
    await assignTenant(modal.value.bedId, modal.value.selectedAccount, rate)
  }
  closeModal()
}

onMounted(() => loadHouse(['accounts']))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-4 gap-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-wider">Beds Management</h2>
        <p class="font-mono text-xs text-gray-700">View, assign, and manage beds across boarding house rooms.</p>
      </div>
      <div class="flex gap-2">
        <button @click="toggle3DView" class="border-2 border-black bg-white text-black px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_#000]">
          {{ show3DView ? 'Hide Top View' : 'Show Top View' }}
        </button>
        <button v-if="!isTenant" @click="openAddBedModal" :disabled="roomsWithCapacity.length === 0" class="border-2 border-black bg-black text-white px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-teal-700 transition-colors shadow-[4px_4px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50">
          + Add New Bed
        </button>
      </div>
    </div>

    <div v-if="show3DView" class="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white h-[350px] relative overflow-hidden">
      <div class="absolute top-2 left-2 z-10 font-mono text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] pointer-events-none">
        3D House Overview
      </div>
      <HouseScene mode="top" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      <div
        v-for="{ bed, room } in beds" :key="bed.id"
        class="border-2 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col h-full"
        :class="bed.isOccupied ? 'bg-white' : 'bg-white border-dashed'"
      >
        <div class="flex justify-between items-center border-b-2 pb-2 mb-3" :class="bed.isOccupied ? 'border-black' : 'border-dashed border-gray-400'">
          <h3 class="font-bold text-base uppercase">{{ bed.label }}</h3>
          <div class="font-mono text-[10px] px-2 py-1 uppercase border border-black" :class="bed.isOccupied ? 'bg-gray-800 text-white' : 'bg-white text-black'">
            [ {{ bed.isOccupied ? 'OCCUPIED' : 'VACANT' }} ]
          </div>
        </div>

        <div class="flex-grow space-y-2 font-mono text-xs mb-4">
          <p>Rate: <span class="font-bold">₱{{ bed.rate.toLocaleString() }} / mo</span></p>
          <div class="pt-2">
            <p>🛏 ROOM: {{ room.name }} (Floor {{ room.floor }})</p>
            <p v-if="bed.isOccupied" class="mt-2 text-teal-800 font-bold">👤 OCCUPANT: {{ bed.tenant ?? '[ OCCUPIED ]' }}</p>
            <p v-else class="mt-2 text-gray-400">👤 OCCUPANT: -- [ NO TENANT ]</p>
          </div>
        </div>

        <div v-if="!isTenant" class="flex flex-col gap-2 mt-auto pt-4 border-t" :class="bed.isOccupied ? 'border-black' : 'border-dashed border-gray-400'">
          <div class="flex gap-2">
            <button class="flex-1 border-2 border-black bg-[#F4F4F0] py-1 font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors" @click="openEditBedModal(room.id, bed)">[ EDIT ]</button>
            <button v-if="bed.tenant" class="flex-1 border-2 border-black bg-[#F4F4F0] py-1 font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors" @click="openViewTenantModal(bed)">[ VIEW TENANT ]</button>
            <button v-else-if="!bed.isOccupied" @click="openAssignModal(bed.dbId)" class="flex-1 border-2 border-black bg-black text-white py-1 font-mono text-xs font-bold hover:bg-teal-700 transition-colors">[ ASSIGN ]</button>
          </div>
          <button @click="openDeleteBedModal(bed)" class="w-full border-2 border-red-700 text-red-700 bg-white py-1 font-mono text-xs font-bold hover:bg-red-700 hover:text-white transition-colors">
            [ DELETE BED ]
          </button>
        </div>
      </div>
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <div v-if="modal.isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeModal">
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md">
          
          <div class="bg-[#EAE8DD] border-b-4 border-black p-4 flex justify-between items-center">
            <h3 class="font-black uppercase tracking-wider text-sm">
              {{ modal.type === 'EDIT_BED' ? 'Edit Bed Name' : modal.type === 'DELETE_BED' ? 'Delete Bed' : modal.type === 'ASSIGN_TENANT' ? 'Assign Tenant to Bed' : modal.type === 'ADD_BED' ? 'Add New Bed' : 'Tenant Information' }}
            </h3>
            <button @click="closeModal" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>
          
          <div class="p-6 space-y-4 font-mono text-sm">

            <div v-if="modal.type === 'ADD_BED'" class="space-y-4">
              <div>
                <label class="block font-bold uppercase mb-1">Select Room</label>
                <select v-model="modal.roomId" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                  <!-- FIX: Displays actual Physical Beds used instead of slots -->
                  <option v-for="room in rooms" :key="room.id" :value="room.id" :disabled="room.physicalBedsCount >= 2">
                    {{ room.name }} ({{ room.physicalBedsCount }}/2 Physical Beds Used)
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-bold uppercase mb-1">Physical Bed Type</label>
                <select v-model="modal.bedType" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                  <option value="single">Single Bed (1 Tenant Slot)</option>
                  <option value="bunk">Bunk Bed (2 Tenant Slots)</option>
                </select>
              </div>
            </div>
            
            <div v-if="modal.type === 'EDIT_BED'">
              <label class="block font-bold uppercase mb-1">New Bed Label</label>
              <input v-model="modal.inputValue" type="text" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] font-bold" @keyup.enter="submitModal" />
            </div>

            <div v-if="modal.type === 'ASSIGN_TENANT'" class="space-y-4">
              <div>
                <label class="block font-bold uppercase mb-1">Select Tenant</label>
                <select v-model="modal.selectedAccount" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                  <option value="" disabled>Choose account...</option>
                  <option v-for="acc in tenantAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.first_name }} {{ acc.last_name }} ({{ acc.username }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-bold uppercase mb-1">Monthly Rate (₱)</label>
                <input v-model.number="modal.rateValue" type="number" step="0.01" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] font-bold" />
              </div>
            </div>

            <div v-if="modal.type === 'VIEW_TENANT'" class="font-bold whitespace-pre-wrap leading-loose">
              {{ modal.tenantInfo }}
            </div>

            <div v-if="modal.type === 'DELETE_BED'" class="text-red-700 font-bold uppercase text-center py-2">
              Are you sure you want to delete this bed? This cannot be undone.
            </div>
            
            <div class="flex gap-2 pt-2">
              <button v-if="modal.type !== 'VIEW_TENANT'" @click="submitModal" :class="modal.type === 'DELETE_BED' ? 'bg-red-700 hover:shadow-[2px_2px_0_0_#B91C1C]' : 'bg-teal-700 hover:shadow-[2px_2px_0_0_#000]'" class="flex-1 text-white border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all">
                {{ modal.type === 'DELETE_BED' ? 'Delete' : modal.type === 'ADD_BED' ? 'Create' : 'Confirm' }}
              </button>
              <button @click="closeModal" class="flex-1 bg-white text-black border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-gray-200 hover:translate-y-1 transition-all">
                {{ modal.type === 'VIEW_TENANT' ? 'Close' : 'Cancel' }}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>