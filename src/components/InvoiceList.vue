<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { house, loadHouse, tenancyLabel, invNo, invoiceTotals } from '../store/house'
import { invoiceService } from '../services/api'
import { currentUser } from '../services/session'

// --- ROLE BASED ACCESS ---
const isTenant = currentUser().role === 'tenant'
const sessionAccount = JSON.parse(localStorage.getItem('account') || '{}')

const showModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  tenancy_id: '' as number | '',
  billing_month: new Date().toISOString().slice(0, 7)
})

// --- FILTERED DATA ---
const sortedInvoices = computed(() => {
  let invs = house.invoices
  
  if (isTenant) {
    const myAcc = house.accounts.find(a => a.username === sessionAccount.username)
    if (!myAcc) return []
    const myTenancies = house.tenancies.filter(t => t.tenant === myAcc.id).map(t => t.id)
    invs = invs.filter(i => myTenancies.includes(i.tenancy_id))
  }
  
  return [...invs].sort((a, b) => b.id - a.id)
})

// --- ACTIONS ---
const openModal = () => {
  if (isTenant) return
  form.value = { tenancy_id: '', billing_month: new Date().toISOString().slice(0, 7) }
  error.value = ''
  showModal.value = true
}

const createInvoice = async () => {
  if (!form.value.tenancy_id || !form.value.billing_month) {
    error.value = 'Tenancy and Billing Month are required.'
    return
  }
  try {
    isSubmitting.value = true
    error.value = ''
    await invoiceService.create({
      tenancy_id: Number(form.value.tenancy_id),
      billing_month: form.value.billing_month,
    })
    await loadHouse(['invoices'])
    showModal.value = false
  } catch (e: any) {
    error.value = e?.response?.data?.detail ?? 'Failed to create invoice.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => loadHouse(['items', 'invoices', 'tenancies', 'accounts', 'payments']))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <!-- Sub-Navigation Tabs -->
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
        <h2 class="text-2xl font-black uppercase tracking-wider">Invoices</h2>
        <p class="font-mono text-xs text-gray-700">Monthly billing and statements.</p>
      </div>
      <button
        v-if="!isTenant"
        @click="openModal"
        class="border-2 border-black bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 transition-colors"
      >
        + Add Invoice
      </button>
    </div>

    <!-- Table -->
    <div class="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div v-if="sortedInvoices.length === 0" class="p-8 text-center font-mono text-sm text-gray-500 font-bold uppercase">
        No invoices found.
      </div>

      <div v-else class="overflow-x-auto p-4">
        <table class="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="py-2 pr-4 font-bold uppercase">Invoice #</th>
              <th class="py-2 pr-4 font-bold uppercase">Tenant</th>
              <th class="py-2 pr-4 font-bold uppercase">Billing Month</th>
              <th class="py-2 pr-4 font-bold uppercase text-right">Total</th>
              <th class="py-2 pr-4 font-bold uppercase text-right">Balance</th>
              <th class="py-2 font-bold uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="inv in sortedInvoices"
              :key="inv.id"
              class="border-b border-gray-300 hover:bg-[#F4F4F0] transition-colors"
            >
              <td class="py-3 pr-4 font-bold">{{ invNo(inv.id) }}</td>
              <td class="py-3 pr-4">{{ tenancyLabel(inv.tenancy_id) }}</td>
              <td class="py-3 pr-4">{{ inv.billing_month }}</td>
              <td class="py-3 pr-4 text-right">₱{{ invoiceTotals(inv.id).total.toLocaleString('en-PH') }}</td>
              <td class="py-3 pr-4 text-right text-red-700 font-bold">₱{{ invoiceTotals(inv.id).balance.toLocaleString('en-PH') }}</td>
              <td class="py-3 text-center">
                <span 
                  class="px-2 py-1 text-[10px] uppercase font-bold border-2 border-black"
                  :class="{
                    'bg-teal-700 text-white': invoiceTotals(inv.id).status === 'paid',
                    'bg-yellow-400 text-black': invoiceTotals(inv.id).status === 'partial',
                    'bg-red-700 text-white': invoiceTotals(inv.id).status === 'unpaid',
                    'bg-gray-300 text-black': invoiceTotals(inv.id).status === 'none'
                  }"
                >
                  {{ invoiceTotals(inv.id).status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div v-if="showModal && !isTenant" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="showModal = false">
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md">
          
          <div class="bg-[#EAE8DD] border-b-4 border-black p-4 flex justify-between items-center">
            <h2 class="font-black uppercase tracking-wider text-sm">Create Invoice</h2>
            <button @click="showModal = false" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>

          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="error" class="bg-red-100 border-2 border-red-700 text-red-800 px-3 py-2 text-xs font-bold uppercase">{{ error }}</div>

            <div>
              <label class="block font-bold uppercase mb-1">Tenancy</label>
              <select v-model="form.tenancy_id" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                <option value="" disabled>Select tenant</option>
                <option v-for="t in house.tenancies" :key="t.id" :value="t.id">
                  {{ tenancyLabel(t.id) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Billing Month (YYYY-MM)</label>
              <input
                v-model="form.billing_month"
                type="month"
                class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
              />
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="createInvoice"
                :disabled="isSubmitting"
                class="flex-1 bg-teal-700 text-white border-2 border-black py-3 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {{ isSubmitting ? 'Creating...' : 'Create Invoice' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>