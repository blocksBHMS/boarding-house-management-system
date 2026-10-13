<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { house, loadHouse, tenancyLabel, invNo } from '../store/house'
import { paymentService } from '../services/api'
import { currentUser } from '../services/session'

// --- ROLE BASED ACCESS ---
const isTenant = currentUser().role === 'tenant'
const sessionAccount = JSON.parse(localStorage.getItem('account') || '{}')

const showModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')

const form = ref({
  invoice: '' as number | '',
  payment_date: new Date().toISOString().slice(0, 10),
  amount_paid: '',
  method: 'cash'
})

const sortedPayments = computed(() => {
  let pays = house.payments
  
  if (isTenant) {
    const myAcc = house.accounts.find(a => a.username === sessionAccount.username)
    if (!myAcc) return []
    const myTenancies = house.tenancies.filter(t => t.tenant === myAcc.id).map(t => t.id)
    const myInvoiceIds = house.invoices.filter(i => myTenancies.includes(i.tenancy_id)).map(i => i.id)
    pays = pays.filter(p => myInvoiceIds.includes(p.invoice))
  }
  
  return [...pays].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
})

// --- ACTIONS ---
const openModal = () => {
  if (isTenant) return
  form.value = { invoice: '', payment_date: new Date().toISOString().slice(0, 10), amount_paid: '', method: 'cash' }
  error.value = ''
  showModal.value = true
}

const createPayment = async () => {
  if (!form.value.invoice || !form.value.amount_paid) {
    error.value = 'Invoice and Amount are required.'
    return
  }
  try {
    isSubmitting.value = true
    error.value = ''
    await paymentService.create({
      invoice: Number(form.value.invoice),
      payment_date: form.value.payment_date || '',
      amount_paid: String(form.value.amount_paid),
      method: form.value.method
    })
    await loadHouse(['payments'])
    showModal.value = false
  } catch (e: any) {
    error.value = e?.response?.data?.detail ?? 'Failed to record payment.'
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
        <h2 class="text-2xl font-black uppercase tracking-wider">Payments</h2>
        <p class="font-mono text-xs text-gray-700">Recorded tenant transactions.</p>
      </div>
      <button
        v-if="!isTenant"
        @click="openModal"
        class="border-2 border-black bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 transition-colors"
      >
        + Add Payment
      </button>
    </div>

    <!-- Table -->
    <div class="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div v-if="sortedPayments.length === 0" class="p-8 text-center font-mono text-sm text-gray-500 font-bold uppercase">
        No payments found.
      </div>

      <div v-else class="overflow-x-auto p-4">
        <table class="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="py-2 pr-4 font-bold uppercase">Date</th>
              <th class="py-2 pr-4 font-bold uppercase">Invoice</th>
              <th class="py-2 pr-4 font-bold uppercase">Method</th>
              <th class="py-2 font-bold uppercase text-right">Amount Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pay in sortedPayments"
              :key="pay.id"
              class="border-b border-gray-300 hover:bg-[#F4F4F0] transition-colors"
            >
              <td class="py-3 pr-4 font-bold">{{ pay.payment_date }}</td>
              <td class="py-3 pr-4">{{ invNo(pay.invoice) }}</td>
              <td class="py-3 pr-4 uppercase text-xs">{{ pay.method }}</td>
              <td class="py-3 text-right text-teal-700 font-bold">₱{{ Number(pay.amount_paid).toLocaleString('en-PH') }}</td>
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
            <h2 class="font-black uppercase tracking-wider text-sm">Record Payment</h2>
            <button @click="showModal = false" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>

          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="error" class="bg-red-100 border-2 border-red-700 text-red-800 px-3 py-2 text-xs font-bold uppercase">{{ error }}</div>

            <div>
              <label class="block font-bold uppercase mb-1">Invoice</label>
              <select v-model="form.invoice" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                <option value="" disabled>Select invoice</option>
                <option v-for="inv in house.invoices" :key="inv.id" :value="inv.id">
                  {{ invNo(inv.id) }} — {{ tenancyLabel(inv.tenancy_id) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold uppercase mb-1">Payment Date</label>
              <input
                v-model="form.payment_date"
                type="date"
                class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-bold uppercase mb-1">Amount (₱)</label>
                <input
                  v-model="form.amount_paid"
                  type="number"
                  step="0.01"
                  class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]"
                />
              </div>
              <div>
                <label class="block font-bold uppercase mb-1">Method</label>
                <select v-model="form.method" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
            </div>

            <div class="flex gap-2 pt-2">
              <button
                @click="createPayment"
                :disabled="isSubmitting"
                class="flex-1 bg-teal-700 text-white border-2 border-black py-3 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : 'Record Payment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>