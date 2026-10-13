<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { house, loadHouse } from '../store/house'
import api, { accountService } from '../services/api'
import { currentUser } from '../services/session'
import { neoAlert } from '../composables/useAlert'

// ── permissions ──────────────────────────────────────────────
const activeUser = currentUser()
const isLandlord = activeUser.role === 'landlord'

// ── modal state ──────────────────────────────────────────────
const showModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  username: '',
  first_name: '',
  last_name: '',
  contact_number: '',
  role: 'tenant' as 'tenant' | 'landlord',
  password: '',
})

// ── delete modal state ───────────────────────────────────────
const deleteModal = ref({
  isOpen: false,
  accountId: null as number | null,
  username: ''
})

// ── actions ──────────────────────────────────────────────────
const openModal = () => {
  form.value = { username: '', first_name: '', last_name: '', contact_number: '', role: 'tenant', password: '' }
  error.value = ''
  showModal.value = true
}

const createAccount = async () => {
  if (!form.value.username || !form.value.first_name || !form.value.last_name || !form.value.password) {
    error.value = 'Username, name, and password are required.'
    return
  }
  try {
    isSubmitting.value = true
    error.value = ''
    await accountService.create(form.value)
    await loadHouse(['accounts'])
    showModal.value = false
  } catch (e: any) {
    const data = e?.response?.data
    if (data?.username) error.value = `Username: ${data.username[0]}`
    else error.value = data?.detail ?? 'Failed to create account.'
  } finally {
    isSubmitting.value = false
  }
}

const openDeleteModal = (acc: any) => {
  deleteModal.value = {
    isOpen: true,
    accountId: acc.id,
    username: acc.username
  }
}

// Delete nigga accounts
const deleteAccount = async () => {
  if (!deleteModal.value.accountId) return
  try {
    isSubmitting.value = true
    
    await api.delete(`/accounts/${deleteModal.value.accountId}/delete/`)
    
    await loadHouse(['accounts'], true)
    deleteModal.value.isOpen = false
  } catch (e: any) {
    deleteModal.value.isOpen = false 
    const data = e?.response?.data
    let msg = 'Failed to delete account.'
    if (data?.detail) msg = data.detail
    else if (typeof data === 'string') msg = data
    else if (data && typeof data === 'object') msg = 'Cannot delete this account. It is likely tied to existing tenancies, invoices, or payments.'
    
    neoAlert(msg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => loadHouse(['accounts']))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <!-- Sub-Navigation Tabs -->
    <div class="flex flex-wrap gap-4 font-mono text-sm font-bold mb-8">
      <router-link to="/tenancies"     active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ TENANCIES ]</router-link>
      <router-link to="/accounts"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ ACCOUNTS ]</router-link>
      <router-link to="/invoices"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ INVOICES ]</router-link>
      <router-link to="/invoice-items" active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ CHARGES ]</router-link>
      <router-link to="/payments"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ PAYMENTS ]</router-link>
    </div>

    <!-- Actions -->
    <div v-if="isLandlord" class="flex items-center gap-4">
      <button
        @click="openModal"
        class="border-2 border-black bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 transition-colors whitespace-nowrap"
      >
        + New Account
      </button>
    </div>

    <!-- Table -->
    <div class="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div class="p-4 border-b-2 border-black bg-[#F4F4F0]">
        <h3 class="text-lg font-black uppercase tracking-wider">User Accounts</h3>
      </div>

      <div v-if="house.accounts.length === 0" class="p-8 text-center font-mono text-sm text-gray-500">
        No accounts yet.
      </div>

      <div v-else class="overflow-x-auto p-4">
        <table class="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="py-2 pr-4 font-bold uppercase">Name</th>
              <th class="py-2 pr-4 font-bold uppercase">Username</th>
              <th class="py-2 pr-4 font-bold uppercase">Contact</th>
              <th class="py-2 font-bold uppercase">Role</th>
              <!-- para sa mga nigga lanlords lang ang actions -->
              <th v-if="isLandlord" class="py-2 font-bold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="acc in house.accounts"
              :key="acc.id"
              class="border-b border-gray-300 hover:bg-[#F4F4F0] transition-colors"
            >
              <td class="py-3 pr-4">{{ acc.first_name }} {{ acc.last_name }}</td>
              <td class="py-3 pr-4 text-gray-500">@{{ acc.username }}</td>
              <td class="py-3 pr-4">{{ acc.contact_number }}</td>
              <td class="py-3">
                <span
                  :class="acc.role === 'landlord'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black'"
                  class="px-2 py-1 text-[10px] uppercase font-bold"
                >
                  [ {{ acc.role.toUpperCase() }} ]
                </span>
              </td>
              <!-- Render Actions for landlords -->
              <td v-if="isLandlord" class="py-3 text-right">
                <!-- Prevent users from deleting their own account -->
                <button 
                  v-if="`${acc.first_name} ${acc.last_name}` !== activeUser.name"
                  @click="openDeleteModal(acc)" 
                  class="text-xs font-bold text-red-700 hover:text-white hover:bg-red-700 border-2 border-transparent hover:border-black px-2 py-1 transition-colors"
                >
                  [ DELETE ]
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <div class="bg-white border-2 border-black shadow-[6px_6px_0_0_#000] w-full max-w-md mx-4">
          <div class="p-4 border-b-2 border-black bg-[#F4F4F0] flex justify-between items-center">
            <h2 class="font-black uppercase tracking-wider text-sm">New Account</h2>
            <button @click="showModal = false" class="font-mono font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>

          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="error" class="bg-red-100 border-2 border-red-700 text-red-800 px-3 py-2 text-xs">{{ error }}</div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase mb-1">First Name</label>
                <input v-model="form.first_name" type="text" class="w-full border-2 border-black px-3 py-2 focus:outline-none" />
              </div>
              <div>
                <label class="block font-bold uppercase mb-1">Last Name</label>
                <input v-model="form.last_name" type="text" class="w-full border-2 border-black px-3 py-2 focus:outline-none" />
              </div>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Username</label>
              <input v-model="form.username" type="text" class="w-full border-2 border-black px-3 py-2 focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Contact Number</label>
              <input v-model="form.contact_number" type="text" class="w-full border-2 border-black px-3 py-2 focus:outline-none" />
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Role</label>
              <select v-model="form.role" class="w-full border-2 border-black px-3 py-2 bg-white focus:outline-none">
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Password</label>
              <input v-model="form.password" type="password" class="w-full border-2 border-black px-3 py-2 focus:outline-none" />
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="createAccount"
                :disabled="isSubmitting"
                class="flex-1 bg-black text-white border-2 border-black py-2 font-bold uppercase hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : 'Create' }}
              </button>
              <button
                @click="showModal = false"
                class="flex-1 border-2 border-black py-2 font-bold uppercase hover:bg-black hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div 
        v-if="deleteModal.isOpen" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" 
        @click.self="deleteModal.isOpen = false"
      >
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md mx-4">
          <div class="bg-[#EAE8DD] border-b-4 border-black p-4 flex justify-between items-center">
            <h3 class="font-black uppercase tracking-wider text-sm">Delete Account</h3>
            <button @click="deleteModal.isOpen = false" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>
          
          <div class="p-6 space-y-4 font-mono text-sm">
            <div class="text-red-700 font-bold uppercase text-center py-4">
              Are you sure you want to delete <span class="text-black bg-red-100 px-1 border border-red-700">@{{ deleteModal.username }}</span>?<br><br>This cannot be undone.
            </div>
            
            <div class="flex gap-2 pt-2">
              <button 
                @click="deleteAccount" 
                :disabled="isSubmitting"
                class="flex-1 text-white bg-red-700 border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {{ isSubmitting ? 'Deleting...' : 'Delete' }}
              </button>
              <button 
                @click="deleteModal.isOpen = false" 
                class="flex-1 bg-white text-black border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-gray-200 hover:translate-y-1 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>