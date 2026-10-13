<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { house, loadHouse, accountName, bedFullLabel, tenancyLabel, invNo, invoiceTotals, bedsInRoom } from '../store/house'
import { tenancyService } from '../services/api'
import { neoAlert } from '@/composables/useAlert'


// modal state
const showModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  tenant: '' as number | '',
  bed: '' as number | '',
  check_in_date: '',
  agreed_rate: '',
})

// search
const searchQuery = ref('')

const filteredTenancies = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return house.tenancies
  return house.tenancies.filter((t) => {
    const name = accountName(t.tenant).toLowerCase()
    const bed  = bedFullLabel(t.bed).toLowerCase()
    return name.includes(q) || bed.includes(q)
  })
})

// Only tenant-role accounts in dropdown
const tenantAccounts = computed(() =>
  house.accounts.filter((a) => a.role === 'tenant')
)

// Only unoccupied beds in dropdown
const vacantBeds = computed(() =>
  house.beds.filter((b) => !b.is_occupied)
)

// actions
const openModal = () => {
  form.value = { tenant: '', bed: '', check_in_date: '', agreed_rate: '' }
  error.value = ''
  showModal.value = true
}

const createTenancy = async () => {
  if (!form.value.tenant || !form.value.bed || !form.value.check_in_date || !form.value.agreed_rate) {
    error.value = 'All fields are required.'
    return
  }
  try {
    isSubmitting.value = true
    error.value = ''
    await tenancyService.create({
      tenant: Number(form.value.tenant),
      bed: Number(form.value.bed),
      check_in_date: form.value.check_in_date,
      agreed_rate: form.value.agreed_rate,
    })
    await loadHouse(['tenancies', 'beds'])
    showModal.value = false
  } catch (e: any) {
    error.value = e?.response?.data?.detail ?? 'Failed to create tenancy.'
  } finally {
    isSubmitting.value = false
  }
}

const deleteTenancy = async (id: number) => {
  if (!confirm('End this tenancy? This cannot be undone.')) return
  try {
    await tenancyService.delete(id)
    await loadHouse(['tenancies', 'beds'])
  } catch {
    neoAlert('Failed to delete tenancy.')
  }
}

onMounted(() => loadHouse(['tenancies', 'accounts', 'beds']))
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

    <!-- Actions & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center">
      <button
        @click="openModal"
        class="w-full md:w-auto border-2 border-black bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 transition-colors whitespace-nowrap"
      >
        + New Tenancy
      </button>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="[ Search by tenant or bed... ]"
        class="w-full border-2 border-black bg-white px-4 py-3 font-mono text-sm shadow-[4px_4px_0_0_#000] focus:outline-none"
      />
    </div>

    <!-- Table -->
    <div class="border-2 border-black bg-white shadow-[4px_4px_0_0_#000] mt-6">
      <div class="p-4 border-b-2 border-black bg-[#F4F4F0]">
        <h3 class="text-lg font-black uppercase tracking-wider">Active Tenancies</h3>
      </div>

      <div v-if="house.tenancies.length === 0" class="p-8 text-center font-mono text-sm text-gray-500">
        No tenancies yet. Create one above.
      </div>

      <div v-else class="overflow-x-auto p-4">
        <table class="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="py-2 pr-4 font-bold uppercase">Tenant</th>
              <th class="py-2 pr-4 font-bold uppercase">Bed</th>
              <th class="py-2 pr-4 font-bold uppercase">Check-in</th>
              <th class="py-2 pr-4 font-bold uppercase">Rate / mo</th>
              <th class="py-2 font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in filteredTenancies"
              :key="t.id"
              class="border-b border-gray-300 hover:bg-[#F4F4F0] transition-colors"
            >
              <td class="py-3 pr-4">🛏 {{ accountName(t.tenant) }}</td>
              <td class="py-3 pr-4">{{ bedFullLabel(t.bed) }}</td>
              <td class="py-3 pr-4">{{ t.check_in_date }}</td>
              <td class="py-3 pr-4">₱{{ Number(t.agreed_rate).toLocaleString('en-PH') }}</td>
              <td class="py-3 font-bold">
                <button
                  @click="deleteTenancy(t.id)"
                  class="hover:bg-red-700 hover:text-white px-1 transition-colors"
                >[ END ]</button>
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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showModal = false"
      >
        <div class="bg-white border-2 border-black shadow-[6px_6px_0_0_#000] w-full max-w-md mx-4">
          <div class="p-4 border-b-2 border-black bg-[#F4F4F0] flex justify-between items-center">
            <h2 class="font-black uppercase tracking-wider text-sm">New Tenancy</h2>
            <button @click="showModal = false" class="font-mono font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>

          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="error" class="bg-red-100 border-2 border-red-700 text-red-800 px-3 py-2 text-xs">{{ error }}</div>

            <div>
              <label class="block font-bold uppercase mb-1">Tenant</label>
              <select v-model="form.tenant" class="w-full border-2 border-black px-3 py-2 bg-white focus:outline-none">
                <option value="" disabled>Select tenant</option>
                <option v-for="a in tenantAccounts" :key="a.id" :value="a.id">
                  {{ a.first_name }} {{ a.last_name }} (@{{ a.username }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Bed</label>
              <select v-model="form.bed" class="w-full border-2 border-black px-3 py-2 bg-white focus:outline-none">
                <option value="" disabled>Select vacant bed</option>
                <option v-for="b in vacantBeds" :key="b.id" :value="b.id">
                  {{ bedFullLabel(b.id) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Check-in Date</label>
              <input
                v-model="form.check_in_date"
                type="date"
                class="w-full border-2 border-black px-3 py-2 focus:outline-none"
              />
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Agreed Rate (₱ / month)</label>
              <input
                v-model="form.agreed_rate"
                type="number"
                step="0.01"
                placeholder="e.g. 3000"
                class="w-full border-2 border-black px-3 py-2 focus:outline-none"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button
                @click="createTenancy"
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

  </div>
</template>