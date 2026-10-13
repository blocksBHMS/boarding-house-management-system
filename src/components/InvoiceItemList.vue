<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { house, loadHouse, tenancyLabel, invNo } from '../store/house'
import { invoiceItemService } from '../services/api'
import { currentUser } from '../services/session'

// --- ROLE BASED ACCESS ---
const isTenant = currentUser().role === 'tenant'
const sessionAccount = JSON.parse(localStorage.getItem('account') || '{}')

// --- MODAL STATE ---
const showModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  invoice_id: '' as number | '',
  charge_type: 'rent',
  amount: '',
})

// filtered items based on tenant role, line by line comments para ddi malito
const sortedItems = computed(() => {
  let items = house.items
  
  if (isTenant) {
    // 1. Find my Account ID
    const myAcc = house.accounts.find(a => a.username === sessionAccount.username)
    if (!myAcc) return []
    // 2. Find my Tenancy IDs
    const myTenancies = house.tenancies.filter(t => t.tenant === myAcc.id).map(t => t.id)
    // 3. Find my Invoice IDs
    const myInvoiceIds = house.invoices.filter(i => myTenancies.includes(i.tenancy_id)).map(i => i.id)
    // 4. Filter Items
    items = items.filter(item => myInvoiceIds.includes(item.invoice_id))
  }
  
  return [...items].sort((a, b) => b.id - a.id)
})

// --- ACTIONS ---
const openModal = () => {
  if (isTenant) return
  form.value = { invoice_id: '', charge_type: 'rent', amount: '' }
  error.value = ''
  showModal.value = true
}

const createItem = async () => {
  if (!form.value.invoice_id || !form.value.amount) {
    error.value = 'Invoice and amount are required.'
    return
  }
  try {
    isSubmitting.value = true
    error.value = ''
    await invoiceItemService.create({
      invoice_id: Number(form.value.invoice_id),
      line_no: 1, 
      charge_type: form.value.charge_type,
      amount: String(form.value.amount),
    })
    await loadHouse(['items'])
    showModal.value = false
  } catch (e: any) {
    error.value = e?.response?.data?.detail ?? 'Failed to add charge.'
  } finally {
    isSubmitting.value = false
  }
}

const CHARGE_LABELS: Record<string, string> = {
  rent: 'Rent',
  electricity: 'Electricity',
  water: 'Water',
  penalty: 'Penalty',
  other: 'Other',
}

onMounted(() => loadHouse(['items', 'invoices', 'tenancies', 'accounts']))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <!-- Sub-Navigation Tabs (Admin tabs hidden for tenants) -->
    <div class="flex flex-wrap gap-4 font-mono text-sm font-bold mb-8">
      <router-link v-if="!isTenant" to="/tenancies"     active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ TENANCIES ]</router-link>
      <router-link v-if="!isTenant" to="/accounts"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ ACCOUNTS ]</router-link>
      <router-link to="/invoices"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ INVOICES ]</router-link>
      <router-link to="/invoice-items" active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ CHARGES ]</router-link>
      <router-link to="/payments"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ PAYMENTS ]</router-link>
    </div>

    <!-- Header & Actions -->
    <div class="flex justify-between items-end border-b-2 border-black pb-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-wider">Charges</h2>
        <p class="font-mono text-xs text-gray-700">Line items and penalties associated with invoices.</p>
      </div>
      <button
        v-if="!isTenant"
        @click="openModal"
        class="border-2 border-black bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 transition-colors"
      >
        + Add Charge
      </button>
    </div>

    <!-- Table -->
    <div class="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div v-if="sortedItems.length === 0" class="p-8 text-center font-mono text-sm text-gray-500 font-bold uppercase">
        No charges found.
      </div>

      <div v-else class="overflow-x-auto p-4">
        <table class="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="py-2 pr-4 font-bold uppercase">Invoice</th>
              <th class="py-2 pr-4 font-bold uppercase">Tenant</th>
              <th class="py-2 pr-4 font-bold uppercase">Charge Type</th>
              <th class="py-2 font-bold uppercase text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in sortedItems"
              :key="item.id"
              class="border-b border-gray-300 hover:bg-[#F4F4F0] transition-colors"
            >
              <td class="py-3 pr-4">{{ invNo(item.invoice_id) }}</td>
              <td class="py-3 pr-4">{{ tenancyLabel(
                house.invoices.find(i => i.id === item.invoice_id)?.tenancy_id ?? 0
              ) }}</td>
              <td class="py-3 pr-4">{{ CHARGE_LABELS[item.charge_type] ?? item.charge_type }}</td>
              <td class="py-3 text-right">₱{{ Number(item.amount).toLocaleString('en-PH') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal (Neo-Brutalist) -->
    <Teleport to="body">
      <div v-if="showModal && !isTenant" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="showModal = false">
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md">
          
          <div class="bg-[#EAE8DD] border-b-4 border-black p-4 flex justify-between items-center">
            <h2 class="font-black uppercase tracking-wider text-sm">Add Charge</h2>
            <button @click="showModal = false" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>

          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="error" class="bg-red-100 border-2 border-red-700 text-red-800 px-3 py-2 text-xs font-bold uppercase">{{ error }}</div>

            <div>
              <label class="block font-bold uppercase mb-1">Invoice</label>
              <select v-model="form.invoice_id" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                <option value="" disabled>Select invoice</option>
                <option v-for="inv in house.invoices" :key="inv.id" :value="inv.id">
                  {{ invNo(inv.id) }} — {{ tenancyLabel(inv.tenancy_id) }} ({{ inv.billing_month }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Charge Type</label>
              <select v-model="form.charge_type" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                <option value="rent">Rent</option>
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="penalty">Penalty</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Amount (₱)</label>
              <input
                v-model="form.amount"
                type="number"
                step="0.01"
                placeholder="e.g. 3000"
                class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="createItem"
                :disabled="isSubmitting"
                class="flex-1 bg-teal-700 text-white border-2 border-black py-3 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : 'Add Charge' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>