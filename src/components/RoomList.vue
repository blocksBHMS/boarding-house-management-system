<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHouse } from '../composables/useHouse'
import { house, loadHouse } from '../store/house'
import HouseScene from '../components/HouseScene.vue'
import { currentUser } from '../services/session'
import { neoAlert } from '../composables/useAlert'

const isTenant = currentUser().role === 'tenant'
const { rooms, totalRooms, totalBeds, occupiedBeds, vacantBeds, addRoom, addBed, renameRoom, deleteRoom, assignTenant } = useHouse()

const occ = (r: { beds: { tenant: string | null }[] }) => r.beds.filter((b) => b.tenant).length

const show3DView = ref(localStorage.getItem('bhns_show_3d') !== 'false')
const toggle3DView = () => {
  show3DView.value = !show3DView.value
  localStorage.setItem('bhns_show_3d', String(show3DView.value))
}

const modal = ref({
  isOpen: false,
  type: '' as 'ADD_ROOM' | 'EDIT_ROOM' | 'DELETE_ROOM' | 'ASSIGN_TENANT',
  roomId: null as number | null,
  bedDbId: null as number | null,
  inputValue: '',
  selectedAccount: '' as number | string,
  rateValue: '1500'
})

const openAddRoomModal = () => { modal.value = { isOpen: true, type: 'ADD_ROOM', roomId: null, bedDbId: null, inputValue: '2', selectedAccount: '', rateValue: '1500' } }
const openEditRoomModal = (room: any) => { modal.value = { isOpen: true, type: 'EDIT_ROOM', roomId: room.id, bedDbId: null, inputValue: room.name.replace('Room ', ''), selectedAccount: '', rateValue: '1500' } }
const openDeleteRoomModal = (roomId: number) => { modal.value = { isOpen: true, type: 'DELETE_ROOM', roomId, bedDbId: null, inputValue: '', selectedAccount: '', rateValue: '1500' } }
const openAssignModal = (bedDbId: number) => { modal.value = { isOpen: true, type: 'ASSIGN_TENANT', roomId: null, bedDbId, inputValue: '', selectedAccount: '', rateValue: '1500' } }
const closeModal = () => { modal.value.isOpen = false }

const submitModal = async () => {
  if (modal.value.type === 'ADD_ROOM') {
    const beds = Number(modal.value.inputValue)
    if (!Number.isInteger(beds) || beds < 0 || beds > 2) {
      neoAlert('Invalid physical bed count (0-2 max).')
      return
    }
    await addRoom(beds)
  } 
  else if (modal.value.type === 'EDIT_ROOM' && modal.value.roomId) {
    const name = modal.value.inputValue.trim()
    if (!name) return
    await renameRoom(modal.value.roomId, name)
  }
  else if (modal.value.type === 'DELETE_ROOM' && modal.value.roomId) {
    await deleteRoom(modal.value.roomId) 
  }
  else if (modal.value.type === 'ASSIGN_TENANT' && modal.value.bedDbId) {
    if (!modal.value.selectedAccount) { neoAlert('Please select a tenant.'); return }
    const rate = Number(modal.value.rateValue)
    if (!Number.isFinite(rate) || rate < 0) { neoAlert('Enter a valid monthly rate.'); return }
    await assignTenant(modal.value.bedDbId, modal.value.selectedAccount, rate)
  }
  closeModal()
}

onMounted(() => loadHouse(['accounts']))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-black pb-4 gap-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-wider">Rooms Management</h2>
        <p class="font-mono text-xs text-gray-700">View, edit, and assign beds to your boarding house rooms.</p>
      </div>
      <div class="flex gap-2">
        <button @click="toggle3DView" class="border-2 border-black bg-white text-black px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0_0_#000]">
          {{ show3DView ? 'Hide 3D View' : 'Show 3D View' }}
        </button>
        <button v-if="!isTenant" @click="openAddRoomModal" class="border-2 border-black bg-black text-white px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-teal-700 transition-colors shadow-[4px_4px_0_0_#000]">
          + Add New Room
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 font-mono text-xs">
      <div class="border-2 border-black bg-white p-2 flex gap-4">
        <div>TOTAL ROOMS: <span class="font-bold">{{ totalRooms }}</span></div>
        <div>TOTAL BEDS: <span class="font-bold">{{ totalBeds }}</span></div>
      </div>
      <div class="border-2 border-black bg-white p-2 flex gap-4">
        <div>OCCUPIED BEDS: <span class="font-bold">{{ occupiedBeds }}</span></div>
        <div>VACANT BEDS: <span class="font-bold">{{ vacantBeds }}</span></div>
      </div>
    </div>

    <div v-if="show3DView" class="border-2 border-black shadow-[6px_6px_0_0_#000] bg-white h-[350px] relative overflow-hidden">
      <div class="absolute top-2 left-2 z-10 font-mono text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] pointer-events-none">
        3D House Overview
      </div>
      <HouseScene />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      <div v-for="room in rooms" :key="room.id" class="border-2 border-black p-4 shadow-[4px_4px_0_0_#000] flex flex-col h-full" :class="occ(room) === room.beds.length ? 'bg-[#EAE8DD]' : 'bg-white'">
        <div class="flex justify-between items-start border-b-2 border-black pb-2 mb-3">
          <div>
            <h3 class="font-bold text-lg uppercase">{{ room.name }}</h3>
            <p class="font-mono text-sm mt-1">Rate: ₱{{ room.rate.toLocaleString() }} / mo</p>
          </div>
          <div class="font-mono text-[10px] px-2 py-1 uppercase border-2 border-black" :class="occ(room) === 0 ? 'bg-white text-black' : occ(room) === room.beds.length ? 'bg-teal-700 text-white' : 'bg-black text-white'">
            [ {{ occ(room) }} / {{ room.beds.length }} {{ occ(room) === 0 ? 'Vacant' : occ(room) === room.beds.length ? 'Full' : 'Occupied' }} ]
          </div>
        </div>

        <div class="flex-grow space-y-3 font-mono text-xs mb-6">
          <div v-for="bed in room.beds" :key="bed.id" class="flex justify-between items-center" :class="bed.tenant ? '' : 'text-gray-500'">
            <span class="flex items-center gap-2">
              <span :class="bed.tenant ? 'text-teal-700' : ''">🛏</span>
              {{ bed.label.toUpperCase() }}: {{ bed.tenant ?? '[ VACANT ]' }}
            </span>
            <span v-if="bed.tenant" class="bg-gray-200 border border-black px-1">[OCCUPIED]</span>
            <button v-else-if="!isTenant" @click="openAssignModal(bed.dbId)" class="hover:text-black hover:underline cursor-pointer">(+ Assign)</button>
          </div>
        </div>

        <div v-if="!isTenant" class="flex flex-col gap-2 mt-auto pt-4 border-t border-dashed border-gray-400">
          <div class="flex gap-2">
            <button @click="openEditRoomModal(room)" class="flex-1 border-2 border-black bg-[#F4F4F0] py-1 font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors">[ EDIT ]</button>
          </div>
          <button @click="openDeleteRoomModal(room.id)" class="w-full border-2 border-red-700 text-red-700 bg-white py-1 font-mono text-xs font-bold hover:bg-red-700 hover:text-white transition-colors">
            [ DELETE ROOM ]
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
              {{ modal.type === 'ADD_ROOM' ? 'Add New Room' : modal.type === 'EDIT_ROOM' ? 'Edit Room Name' : modal.type === 'ASSIGN_TENANT' ? 'Assign Tenant to Bed' : 'Delete Room' }}
            </h3>
            <button @click="closeModal" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>
          
          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="modal.type === 'ADD_ROOM' || modal.type === 'EDIT_ROOM'">
              <label class="block font-bold uppercase mb-1">
                {{ modal.type === 'ADD_ROOM' ? 'How many physical beds (0-2)?' : 'New Room Number/Name' }}
              </label>
              <input v-model="modal.inputValue" :type="modal.type === 'ADD_ROOM' ? 'number' : 'text'" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] font-bold" @keyup.enter="submitModal" />
            </div>

            <div v-if="modal.type === 'ASSIGN_TENANT'" class="space-y-4">
              <div>
                <label class="block font-bold uppercase mb-1">Select Tenant</label>
                <select v-model="modal.selectedAccount" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                  <option value="" disabled>Choose account...</option>
                  <option v-for="acc in house.accounts" :key="acc.id" :value="acc.id">
                    {{ acc.first_name }} {{ acc.last_name }} ({{ acc.username }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block font-bold uppercase mb-1">Monthly Rate (₱)</label>
                <input v-model.number="modal.rateValue" type="number" step="0.01" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)] font-bold" />
              </div>
            </div>

            <div v-if="modal.type === 'DELETE_ROOM'" class="text-red-700 font-bold uppercase text-center py-2">
              Are you sure you want to delete this room and all its beds? This cannot be undone.
            </div>
            
            <div class="flex gap-2 pt-2">
              <button @click="submitModal" :class="modal.type === 'DELETE_ROOM' ? 'bg-red-700 hover:shadow-[2px_2px_0_0_#B91C1C]' : 'bg-teal-700 hover:shadow-[2px_2px_0_0_#000]'" class="flex-1 text-white border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all">
                {{ modal.type === 'DELETE_ROOM' ? 'Delete' : 'Confirm' }}
              </button>
              <button @click="closeModal" class="flex-1 bg-white text-black border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-gray-200 hover:translate-y-1 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>