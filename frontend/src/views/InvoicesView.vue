<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Receipt,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
  Clock,
  Wallet,
} from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatCurrency, formatDate, formatMonth } from '@/utils/formatters'
import type { ChargeType, PaymentMethod } from '@/types/models'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppStatCard from '@/components/ui/AppStatCard.vue'

const store = useHouseStore()

// Filter & Search
const filterStatus = ref<'all' | 'unpaid' | 'partial' | 'paid'>('all')
const searchQuery = ref('')

const filteredInvoices = computed(() => {
  return store.detailedInvoices.filter((inv) => {
    if (filterStatus.value !== 'all' && inv.status !== filterStatus.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const tenant = inv.tenancy?.tenantDetails
      const name = tenant ? `${tenant.first_name} ${tenant.last_name}`.toLowerCase() : ''
      const invNum = `inv-${inv.id}`.toLowerCase()
      const roomNum = inv.tenancy?.roomDetails?.room_number?.toLowerCase() || ''
      if (!name.includes(q) && !invNum.includes(q) && !roomNum.includes(q)) {
        return false
      }
    }
    return true
  })
})

// Modal: Batch Invoicing
const showBatchModal = ref(false)
const batchMonth = ref('2026-11-01')
const batchElectric = ref(380)
const batchWater = ref(150)
const batchSuccessMsg = ref('')

function handleBatchGenerate() {
  const count = store.batchGenerateMonthlyInvoices(batchMonth.value, batchElectric.value, batchWater.value)
  batchSuccessMsg.value = `Successfully generated ${count} new monthly invoices for active leases!`
  setTimeout(() => {
    showBatchModal.value = false
    batchSuccessMsg.value = ''
  }, 1600)
}

// Modal: Create Single Invoice
const showCreateModal = ref(false)
const selectedTenancyId = ref<number>(store.tenancies[0]?.id || 1)
const billingMonth = ref('2026-10-01')

interface TempItem {
  chargeType: ChargeType
  amount: number
}

const newItems = ref<TempItem[]>([
  { chargeType: 'rent', amount: 3500 },
  { chargeType: 'electricity', amount: 350 },
  { chargeType: 'water', amount: 150 },
])

const modalTotal = computed(() => {
  return newItems.value.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
})

function addLineItem() {
  newItems.value.push({ chargeType: 'other', amount: 0 })
}

function removeLineItem(index: number) {
  newItems.value.splice(index, 1)
}

function handleCreateInvoice() {
  store.createInvoice({
    tenancyId: Number(selectedTenancyId.value),
    billingMonth: billingMonth.value,
    items: newItems.value,
  })
  showCreateModal.value = false
}

// Modal: Record Payment
const showPaymentModal = ref(false)
const selectedInvoiceId = ref<number>(1)
const paymentAmount = ref<number>(0)
const paymentDate = ref('2026-10-12')
const paymentMethod = ref<PaymentMethod>('gcash')

function openPaymentModal(invoiceId: number, balance: number) {
  selectedInvoiceId.value = invoiceId
  paymentAmount.value = balance
  showPaymentModal.value = true
}

function handleRecordPayment() {
  store.recordPayment({
    invoiceId: Number(selectedInvoiceId.value),
    paymentDate: paymentDate.value,
    amount: Number(paymentAmount.value),
    method: paymentMethod.value,
  })
  showPaymentModal.value = false
}
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
          Billing & Invoicing
        </span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Statements of Account
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Prepare monthly rent statements, automated submetered utilities, and track settlement status.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <AppButton variant="secondary" size="md" @click="showBatchModal = true">
          <Zap class="w-4 h-4 text-amber-500 mr-1" />
          <span>Batch Generate Month</span>
        </AppButton>

        <AppButton variant="primary" size="md" @click="showCreateModal = true">
          <Plus class="w-4 h-4 mr-1" />
          <span>Create Statement</span>
        </AppButton>
      </div>
    </div>

    <!-- 3 Executive KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      <AppStatCard
        title="Total Invoiced"
        :value="formatCurrency(store.totalMonthlyBilled)"
        subtitle="Current billing cycle"
        :icon="Receipt"
        trend="Active cycle"
        trend-type="neutral"
        color="indigo"
      />
      <AppStatCard
        title="Settled Collections"
        :value="formatCurrency(store.totalCollected)"
        subtitle="Recorded tenant payments"
        :icon="DollarSign"
        trend="+12.4% vs last mo"
        trend-type="positive"
        color="emerald"
      />
      <AppStatCard
        title="Unpaid Balance"
        :value="formatCurrency(store.totalOutstanding)"
        subtitle="Awaiting tenant settlement"
        :icon="Clock"
        trend="3 Due"
        trend-type="negative"
        color="rose"
      />
    </div>

    <!-- Filter Toolbar + Data Grid Container -->
    <div class="enterprise-card overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <!-- Live Search -->
        <div class="relative w-full sm:w-80">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by resident name, room, or #INV..."
            class="field-control pl-9 text-xs"
          />
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 text-xs font-semibold w-full sm:w-auto">
          <button
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center"
            :class="filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filterStatus = 'all'"
          >
            All ({{ store.detailedInvoices.length }})
          </button>
          <button
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center"
            :class="filterStatus === 'unpaid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filterStatus = 'unpaid'"
          >
            Unpaid
          </button>
          <button
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center"
            :class="filterStatus === 'partial' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filterStatus = 'partial'"
          >
            Partial
          </button>
          <button
            class="flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all cursor-pointer text-center"
            :class="filterStatus === 'paid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
            @click="filterStatus = 'paid'"
          >
            Paid
          </button>
        </div>
      </div>

      <!-- High-Density Invoices Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="table-header">
              <th class="py-3 px-5">Statement #</th>
              <th class="py-3 px-5">Resident & Stay</th>
              <th class="py-3 px-5">Billing Month</th>
              <th class="py-3 px-5">Line Items Breakdown</th>
              <th class="py-3 px-5">Total Billed</th>
              <th class="py-3 px-5">Paid</th>
              <th class="py-3 px-5">Balance</th>
              <th class="py-3 px-5">Status</th>
              <th class="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="invoice in filteredInvoices"
              :key="invoice.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-3.5 px-5 font-mono font-semibold text-slate-800">
                #INV-{{ String(invoice.id).padStart(4, '0') }}
              </td>

              <td class="py-3.5 px-5">
                <div class="flex items-center gap-2.5">
                  <img
                    v-if="invoice.tenancy?.tenantDetails?.avatarUrl"
                    :src="invoice.tenancy.tenantDetails.avatarUrl"
                    class="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div class="font-bold text-slate-900 leading-tight">
                      {{ invoice.tenancy?.tenantDetails?.first_name }} {{ invoice.tenancy?.tenantDetails?.last_name }}
                    </div>
                    <div class="text-[10px] text-slate-400">
                      Room {{ invoice.tenancy?.roomDetails?.room_number }} • {{ invoice.tenancy?.bedDetails?.bed_label }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-5 font-medium text-slate-700">
                {{ formatMonth(invoice.billing_month) }}
              </td>

              <td class="py-3.5 px-5">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="item in invoice.items"
                    :key="item.id"
                    class="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize font-medium"
                  >
                    {{ item.charge_type }}: {{ formatCurrency(item.amount) }}
                  </span>
                </div>
              </td>

              <td class="py-3.5 px-5 font-mono font-semibold text-slate-900">
                {{ formatCurrency(invoice.totalAmount) }}
              </td>

              <td class="py-3.5 px-5 font-mono font-medium text-emerald-600">
                {{ formatCurrency(invoice.totalPaid) }}
              </td>

              <td
                class="py-3.5 px-5 font-mono font-bold"
                :class="invoice.balance > 0 ? 'text-rose-600' : 'text-slate-400'"
              >
                {{ formatCurrency(invoice.balance) }}
              </td>

              <td class="py-3.5 px-5">
                <AppBadge
                  :variant="
                    invoice.status === 'paid'
                      ? 'success'
                      : invoice.status === 'partial'
                      ? 'warning'
                      : 'danger'
                  "
                >
                  {{ invoice.status.toUpperCase() }}
                </AppBadge>
              </td>

              <td class="py-3.5 px-5 text-right">
                <AppButton
                  v-if="invoice.balance > 0"
                  variant="outline"
                  size="sm"
                  class="text-xs py-1 px-2.5 h-7"
                  @click="openPaymentModal(invoice.id, invoice.balance)"
                >
                  <CreditCard class="w-3.5 h-3.5 text-indigo-600" />
                  <span>Settle</span>
                </AppButton>
                <span v-else class="text-[11px] text-emerald-600 font-semibold">Settled</span>
              </td>
            </tr>

            <tr v-if="filteredInvoices.length === 0">
              <td colspan="9" class="py-12 text-center text-slate-400 text-xs">
                No invoices found matching criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Batch Generate Invoices -->
    <AppModal
      :show="showBatchModal"
      title="1-Click Batch Monthly Billing"
      description="Automatically generate rent + utility bills for all active resident leases."
      max-width="md"
      @close="showBatchModal = false"
    >
      <div v-if="batchSuccessMsg" class="py-6 text-center space-y-2">
        <CheckCircle2 class="w-12 h-12 text-emerald-500 mx-auto" />
        <h4 class="text-base font-bold text-slate-900">{{ batchSuccessMsg }}</h4>
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleBatchGenerate">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Billing Month</label>
          <input
            v-model="batchMonth"
            type="date"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Standard Electricity Share per Tenant (₱)</label>
          <input
            v-model.number="batchElectric"
            type="number"
            step="10"
            class="field-control font-mono"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Standard Water Share per Tenant (₱)</label>
          <input
            v-model.number="batchWater"
            type="number"
            step="10"
            class="field-control font-mono"
            required
          />
        </div>

        <p class="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
          Note: This will generate an individual invoice for all active leases with their exact agreed base rent rate.
        </p>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showBatchModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Generate Invoices
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Create Single Invoice -->
    <AppModal
      :show="showCreateModal"
      title="Generate Tenant Statement"
      description="Create a custom billing statement with itemized charges."
      max-width="md"
      @close="showCreateModal = false"
    >
      <form class="space-y-4" @submit.prevent="handleCreateInvoice">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Select Tenancy</label>
          <select
            v-model.number="selectedTenancyId"
            class="field-control"
          >
            <option
              v-for="tenancy in store.detailedTenancies"
              :key="tenancy.id"
              :value="tenancy.id"
            >
              {{ tenancy.tenantDetails?.first_name }} {{ tenancy.tenantDetails?.last_name }} ({{ tenancy.bedDetails?.bed_label }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Billing Month</label>
          <input
            v-model="billingMonth"
            type="date"
            class="field-control"
            required
          />
        </div>

        <div class="border-t border-slate-100 pt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-700">Line Items & Utility Charges</span>
            <button
              type="button"
              class="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              @click="addLineItem"
            >
              + Add Line
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, idx) in newItems"
              :key="idx"
              class="flex items-center gap-2"
            >
              <select
                v-model="item.chargeType"
                class="field-control text-xs flex-1"
              >
                <option value="rent">Rent</option>
                <option value="electricity">Electricity</option>
                <option value="water">Water</option>
                <option value="penalty">Penalty</option>
                <option value="other">Other</option>
              </select>

              <input
                v-model.number="item.amount"
                type="number"
                step="10"
                placeholder="Amount (₱)"
                class="field-control text-xs w-32 font-mono"
                required
              />

              <button
                type="button"
                class="text-slate-400 hover:text-rose-600 text-xs px-1 cursor-pointer"
                @click="removeLineItem(idx)"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs font-bold">
            <span class="text-slate-700">Total Statement Amount:</span>
            <span class="text-indigo-600 font-mono text-sm">{{ formatCurrency(modalTotal) }}</span>
          </div>
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showCreateModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Generate Statement
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Record Payment -->
    <AppModal
      :show="showPaymentModal"
      title="Record Payment Settlement"
      description="Record a verified tenant payment towards this invoice."
      max-width="md"
      @close="showPaymentModal = false"
    >
      <form class="space-y-4" @submit.prevent="handleRecordPayment">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Payment Date</label>
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
          <label class="block text-xs font-semibold text-slate-700 mb-1">Payment Channel</label>
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

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showPaymentModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Confirm Payment
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
