<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { house, loadHouse, tenancyLabel, invNo, invoiceTotals } from '../store/house'
import { paymentService } from '../services/api'
import { currentUser } from '../services/session'
import { apiError } from '../utils/errors'

const isTenant = currentUser().role === 'tenant'

const showModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const actionError = ref('')
const reviewPaymentId = ref<number | null>(null)
const rejectionReason = ref('')
const isReviewing = ref(false)
const reviewError = ref('')

const form = ref({
  invoice: '' as number | '',
  payment_date: new Date().toISOString().slice(0, 10),
  amount_paid: '',
  method: 'cash'
})

const sortedPayments = computed(() =>
  [...house.payments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()),
)

const selectableInvoices = computed(() =>
  isTenant
    ? house.invoices.filter((invoice) => invoiceTotals(invoice.id).balance > 0)
    : house.invoices,
)

const openModal = () => {
  form.value = { invoice: '', payment_date: new Date().toISOString().slice(0, 10), amount_paid: '', method: 'cash' }
  error.value = ''
  showModal.value = true
}

const createPayment = async () => {
  if (!form.value.invoice || !form.value.amount_paid) {
    error.value = 'Invoice and Amount are required.'
    return
  }
  if (Number(form.value.amount_paid) <= 0) {
    error.value = 'Payment amount must be greater than zero.'
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
  } catch (e: unknown) {
    error.value = apiError(e, isTenant ? 'Failed to submit payment.' : 'Failed to record payment.')
  } finally {
    isSubmitting.value = false
  }
}

async function approvePayment(paymentId: number) {
  actionError.value = ''
  try {
    await paymentService.review(paymentId, { status: 'paid' })
    await loadHouse(['payments'])
  } catch (e: unknown) {
    actionError.value = apiError(e, 'Failed to approve payment.')
  }
}

function openRejectModal(paymentId: number) {
  reviewPaymentId.value = paymentId
  rejectionReason.value = ''
  reviewError.value = ''
}

async function rejectPayment() {
  if (reviewPaymentId.value === null || !rejectionReason.value.trim()) {
    reviewError.value = 'Please provide a reason for rejecting this payment.'
    return
  }
  isReviewing.value = true
  reviewError.value = ''
  try {
    await paymentService.review(reviewPaymentId.value, {
      status: 'rejected',
      rejection_reason: rejectionReason.value.trim(),
    })
    await loadHouse(['payments'])
    reviewPaymentId.value = null
  } catch (e: unknown) {
    reviewError.value = apiError(e, 'Failed to reject payment.')
  } finally {
    isReviewing.value = false
  }
}

onMounted(() => loadHouse(
  isTenant ? ['items', 'invoices', 'payments'] : ['items', 'invoices', 'tenancies', 'accounts', 'payments'],
))
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <div class="flex flex-wrap gap-4 font-mono text-sm font-bold mb-8">
      <router-link v-if="!isTenant" to="/tenancies"     active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ TENANCIES ]</router-link>
      <router-link v-if="!isTenant" to="/accounts"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ ACCOUNTS ]</router-link>
      <router-link to="/invoices"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ INVOICES ]</router-link>
      <router-link to="/invoice-items" active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ CHARGES ]</router-link>
      <router-link to="/payments"      active-class="bg-black text-white" class="border-2 border-black bg-[#EAE8DD] px-4 py-2 uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:text-white transition-colors">[ PAYMENTS ]</router-link>
    </div>

    <div class="flex justify-between items-end border-b-2 border-black pb-4">
      <div>
        <h2 class="text-2xl font-black uppercase tracking-wider">Payments</h2>
        <p class="font-mono text-xs text-gray-700">
          {{ isTenant ? 'Submit a payment for landlord approval and track its status.' : 'Review tenant submissions and recorded transactions.' }}
        </p>
      </div>
      <button
        @click="openModal"
        class="border-2 border-black bg-black text-white px-6 py-3 font-mono text-sm font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 transition-colors"
      >
        {{ isTenant ? '+ Submit Payment' : '+ Record Payment' }}
      </button>
    </div>

    <div v-if="actionError" class="border-2 border-red-700 bg-red-100 px-4 py-3 font-mono text-xs font-bold text-red-800">
      {{ actionError }}
    </div>

    <div class="border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
      <div v-if="sortedPayments.length === 0" class="p-8 text-center font-mono text-sm text-gray-500 font-bold uppercase">
        No payments found.
      </div>

      <div v-else class="overflow-x-auto p-4">
        <table class="w-full text-left font-mono text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="py-2 pr-4 font-bold uppercase">Date</th>
              <th v-if="!isTenant" class="py-2 pr-4 font-bold uppercase">Tenant</th>
              <th class="py-2 pr-4 font-bold uppercase">Invoice</th>
              <th class="py-2 pr-4 font-bold uppercase">Method</th>
              <th class="py-2 font-bold uppercase text-right">Amount</th>
              <th class="py-2 px-4 font-bold uppercase text-center">Status</th>
              <th v-if="!isTenant" class="py-2 font-bold uppercase text-right">Review</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pay in sortedPayments"
              :key="pay.id"
              class="border-b border-gray-300 hover:bg-[#F4F4F0] transition-colors"
            >
              <td class="py-3 pr-4 font-bold">{{ pay.payment_date }}</td>
              <td v-if="!isTenant" class="py-3 pr-4">{{ tenancyLabel(house.invoices.find((invoice) => invoice.id === pay.invoice)?.tenancy_id ?? 0) }}</td>
              <td class="py-3 pr-4">{{ invNo(pay.invoice) }}</td>
              <td class="py-3 pr-4 uppercase text-xs">{{ pay.method }}</td>
              <td class="py-3 text-right font-bold">₱{{ Number(pay.amount_paid).toLocaleString('en-PH') }}</td>
              <td class="py-3 px-4 text-center">
                <span
                  class="inline-block border-2 border-black px-2 py-1 text-[10px] font-bold uppercase"
                  :class="{
                    'bg-teal-700 text-white': pay.status === 'paid',
                    'bg-yellow-400 text-black': pay.status === 'pending',
                    'bg-red-700 text-white': pay.status === 'rejected',
                  }"
                >
                  {{ pay.status }}
                </span>
                <p v-if="pay.status === 'rejected' && pay.rejection_reason" class="mt-1 max-w-48 text-left text-[10px] text-red-800">
                  {{ pay.rejection_reason }}
                </p>
              </td>
              <td v-if="!isTenant" class="py-3 text-right">
                <div v-if="pay.status === 'pending'" class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="border-2 border-black bg-teal-700 px-2 py-1 text-[10px] font-bold uppercase text-white hover:bg-black"
                    @click="approvePayment(pay.id)"
                  >Approve</button>
                  <button
                    type="button"
                    class="border-2 border-black bg-white px-2 py-1 text-[10px] font-bold uppercase hover:bg-red-700 hover:text-white"
                    @click="openRejectModal(pay.id)"
                  >Reject</button>
                </div>
                <span v-else class="text-xs text-gray-500">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="showModal = false">
        <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md">
          
          <div class="bg-[#EAE8DD] border-b-4 border-black p-4 flex justify-between items-center">
            <h2 class="font-black uppercase tracking-wider text-sm">{{ isTenant ? 'Submit Payment' : 'Record Payment' }}</h2>
            <button @click="showModal = false" class="font-bold hover:bg-black hover:text-white px-2">✕</button>
          </div>

          <div class="p-6 space-y-4 font-mono text-sm">
            <div v-if="error" class="bg-red-100 border-2 border-red-700 text-red-800 px-3 py-2 text-xs font-bold uppercase">{{ error }}</div>

            <div>
              <label class="block font-bold uppercase mb-1">Invoice</label>
              <select v-model="form.invoice" class="w-full border-2 border-black px-3 py-3 bg-[#F4F4F0] focus:outline-none focus:bg-white font-bold shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.1)]">
                <option value="" disabled>Select invoice</option>
                <option v-for="inv in selectableInvoices" :key="inv.id" :value="inv.id">
                  {{ invNo(inv.id) }} — {{ isTenant ? `${inv.billing_month.slice(0, 7)} · Balance ₱${invoiceTotals(inv.id).balance.toLocaleString('en-PH')}` : tenancyLabel(inv.tenancy_id) }}
                </option>
              </select>
              <p v-if="isTenant && selectableInvoices.length === 0" class="mt-2 text-xs text-gray-600">
                You have no invoices with an outstanding balance.
              </p>
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

            <p v-if="isTenant" class="border-l-4 border-yellow-500 bg-yellow-50 px-3 py-2 text-xs">
              Your submission stays pending and will not change the invoice balance until approved by your landlord.
            </p>

            <div class="flex gap-2 pt-2">
              <button
                @click="createPayment"
                :disabled="isSubmitting || (isTenant && selectableInvoices.length === 0)"
                class="flex-1 bg-teal-700 text-white border-2 border-black py-3 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-black hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {{ isSubmitting ? 'Saving...' : isTenant ? 'Submit Payment' : 'Record Payment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="reviewPaymentId !== null" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="reviewPaymentId = null">
        <div class="w-full max-w-md border-4 border-black bg-white shadow-[8px_8px_0_0_#000]">
          <div class="flex items-center justify-between border-b-4 border-black bg-[#EAE8DD] p-4">
            <h2 class="text-sm font-black uppercase tracking-wider">Reject Payment</h2>
            <button type="button" class="px-2 font-bold hover:bg-black hover:text-white" @click="reviewPaymentId = null">✕</button>
          </div>
          <form class="space-y-4 p-6 font-mono text-sm" @submit.prevent="rejectPayment">
            <div v-if="reviewError" class="border-2 border-red-700 bg-red-100 px-3 py-2 text-xs font-bold text-red-800">
              {{ reviewError }}
            </div>
            <label class="block font-bold uppercase">
              Reason for rejection
              <textarea
                v-model="rejectionReason"
                required
                rows="3"
                class="mt-1 w-full border-2 border-black bg-[#F4F4F0] px-3 py-3 font-normal normal-case focus:bg-white focus:outline-none"
              />
            </label>
            <button
              type="submit"
              :disabled="isReviewing"
              class="w-full border-2 border-black bg-red-700 py-3 font-bold uppercase text-white shadow-[4px_4px_0_0_#000] hover:bg-black disabled:opacity-50"
            >
              {{ isReviewing ? 'Rejecting...' : 'Confirm Rejection' }}
            </button>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>