<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, CreditCard, Wallet, Banknote, Search, CheckCircle2 } from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PaymentMethod } from '@/types/models'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppStatCard from '@/components/ui/AppStatCard.vue'
import BrandLogos from '@/components/common/BrandLogos.vue'

const store = useHouseStore()

const showPaymentModal = ref(false)
const selectedInvoiceId = ref<number>(store.invoices[0]?.id || 1)
const paymentAmount = ref<number>(1000)
const paymentDate = ref('2026-10-12')
const paymentMethod = ref<PaymentMethod>('gcash')
const paymentRef = ref('')
const searchQuery = ref('')
const selectedChannel = ref('all')

function handleRecordPayment() {
  store.recordPayment({
    invoiceId: Number(selectedInvoiceId.value),
    paymentDate: paymentDate.value,
    amount: Number(paymentAmount.value),
    method: paymentMethod.value,
    referenceNumber: paymentRef.value.trim() || undefined,
  })
  showPaymentModal.value = false
  paymentRef.value = ''
}

function getInvoiceInfo(invoiceId: number) {
  const inv = store.detailedInvoices.find((i) => i.id === invoiceId)
  return {
    tenantName: inv?.tenancy?.tenantDetails
      ? `${inv.tenancy.tenantDetails.first_name} ${inv.tenancy.tenantDetails.last_name}`
      : 'Resident',
    roomBed: inv?.tenancy ? `Room ${inv.tenancy.roomDetails?.room_number} • ${inv.tenancy.bedDetails?.bed_label}` : '',
    avatar: inv?.tenancy?.tenantDetails?.avatarUrl,
  }
}

const filteredPayments = computed(() => {
  return [...store.payments].reverse().filter((p) => {
    if (selectedChannel.value !== 'all' && p.method !== selectedChannel.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const invInfo = getInvoiceInfo(p.invoice)
      const matchName = invInfo.tenantName.toLowerCase().includes(q)
      const matchRef = p.reference_number?.toLowerCase().includes(q)
      const matchInv = `inv-${p.invoice}`.includes(q)
      if (!matchName && !matchRef && !matchInv) return false
    }
    return true
  })
})
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
          Financial Ledger
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Payment Transactions
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Chronological audit trail of all rent settlements, deposits, and submetered utility collections.
        </p>
      </div>

      <AppButton variant="primary" size="md" @click="showPaymentModal = true">
        <Plus class="w-4 h-4 mr-1" />
        <span>Record Tenant Payment</span>
      </AppButton>
    </div>

    <!-- 3 Executive KPI Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <AppStatCard
        title="Total Ledger Collected"
        :value="formatCurrency(store.totalCollected)"
        subtitle="Verified tenant payments"
        :icon="Banknote"
        trend="Verified"
        trend-type="positive"
        color="emerald"
      />
      <AppStatCard
        title="Receipts Issued"
        :value="`${store.payments.length} Receipts`"
        subtitle="Current operating records"
        :icon="CreditCard"
        trend="Live Sync"
        trend-type="neutral"
        color="indigo"
      />
      <AppStatCard
        title="Outstanding Receivables"
        :value="formatCurrency(store.totalOutstanding)"
        subtitle="Pending statement balances"
        :icon="Wallet"
        trend="3 Invoices"
        trend-type="negative"
        color="rose"
      />
    </div>

    <!-- Search & Filter Bar + Data Grid Container -->
    <div class="enterprise-card overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by resident, reference, or invoice..."
            class="field-control pl-9 text-xs"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto text-xs">
          <select
            v-model="selectedChannel"
            class="field-control text-xs w-full sm:w-auto"
          >
            <option value="all">All Payment Channels</option>
            <option value="gcash">GCash</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <!-- High-Density Payments Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="table-header">
              <th class="py-3 px-5">Receipt ID</th>
              <th class="py-3 px-5">Date Settled</th>
              <th class="py-3 px-5">Resident & Stay</th>
              <th class="py-3 px-5">Invoice Reference</th>
              <th class="py-3 px-5">Channel & Code</th>
              <th class="py-3 px-5 text-right">Amount Credited</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="payment in filteredPayments"
              :key="payment.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-5 font-mono font-semibold text-slate-800">
                #RCP-{{ String(payment.id).padStart(4, '0') }}
              </td>

              <td class="py-3.5 px-5 text-slate-600 font-medium">
                {{ formatDate(payment.payment_date) }}
              </td>

              <td class="py-3.5 px-5">
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="getInvoiceInfo(payment.invoice).avatar"
                    :src="getInvoiceInfo(payment.invoice).avatar"
                    class="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div
                    v-else
                    class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center"
                  >
                    R
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 leading-tight">
                      {{ getInvoiceInfo(payment.invoice).tenantName }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                      {{ getInvoiceInfo(payment.invoice).roomBed }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-5 font-mono font-semibold text-indigo-600">
                INV-{{ String(payment.invoice).padStart(4, '0') }}
              </td>

              <td class="py-3.5 px-5">
                <div>
                  <BrandLogos :brand="payment.method" size="sm" />
                  <p v-if="payment.reference_number" class="text-[10px] font-mono text-slate-400 mt-0.5">
                    {{ payment.reference_number }}
                  </p>
                </div>
              </td>

              <td class="py-3.5 px-5 text-right font-mono font-bold text-sm text-emerald-600">
                +{{ formatCurrency(payment.amount_paid) }}
              </td>
            </tr>

            <tr v-if="filteredPayments.length === 0">
              <td colspan="6" class="py-12 text-center text-slate-400 text-xs">
                No payment transactions found matching criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Record Payment -->
    <AppModal
      :show="showPaymentModal"
      title="Record Tenant Payment Receipt"
      description="Credit a verified resident payment to an outstanding statement."
      max-width="md"
      @close="showPaymentModal = false"
    >
      <form class="space-y-4" @submit.prevent="handleRecordPayment">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Select Statement to Credit</label>
          <select
            v-model.number="selectedInvoiceId"
            class="field-control"
          >
            <option
              v-for="invoice in store.detailedInvoices"
              :key="invoice.id"
              :value="invoice.id"
            >
              #INV-{{ String(invoice.id).padStart(4, '0') }} — {{ invoice.tenancy?.tenantDetails?.first_name }} {{ invoice.tenancy?.tenantDetails?.last_name }} (Balance: {{ formatCurrency(invoice.balance) }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date Received</label>
          <input
            v-model="paymentDate"
            type="date"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (PHP)</label>
          <input
            v-model.number="paymentAmount"
            type="number"
            step="10"
            class="field-control font-mono font-bold"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Payment Method / Channel</label>
          <select
            v-model="paymentMethod"
            class="field-control"
          >
            <option value="gcash">GCash</option>
            <option value="cash">Cash Settlement</option>
            <option value="bank_transfer">Bank Transfer (BDO / BPI)</option>
            <option value="other">Other Official Channel</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Official Reference Code</label>
          <input
            v-model="paymentRef"
            type="text"
            placeholder="e.g. GCASH-1002938475892"
            class="field-control font-mono"
          />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showPaymentModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Confirm & Credit Ledger
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
