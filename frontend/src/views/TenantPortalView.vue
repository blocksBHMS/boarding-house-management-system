<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowRight,
  BedDouble,
  Receipt,
  Wrench,
  Users,
  Megaphone,
  CheckCircle2,
  CreditCard,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatCurrency, formatDate, formatMonth } from '@/utils/formatters'
import type { MaintenanceCategory } from '@/types/models'
import AppModal from '@/components/ui/AppModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import BrandLogos from '@/components/common/BrandLogos.vue'

const store = useHouseStore()
const latestInvoice = computed(() => store.tenantInvoices[store.tenantInvoices.length - 1] || null)
const roomImage = computed(() => store.detailedRooms.find((room) => room.id === store.tenantActiveTenancy?.room)?.imageUrl)

const showPayModal = ref(false)
const payInvoiceId = ref(1)
const payAmount = ref(0)
const paymentReference = ref('')
const paymentComplete = ref(false)

function openPayment(invoiceId: number, balance: number) {
  payInvoiceId.value = invoiceId
  payAmount.value = balance
  paymentReference.value = ''
  paymentComplete.value = false
  showPayModal.value = true
}

function submitPayment() {
  if (!paymentReference.value.trim() || payAmount.value <= 0) return
  store.recordPayment({
    invoiceId: payInvoiceId.value,
    paymentDate: new Date().toISOString().split('T')[0],
    amount: Number(payAmount.value),
    method: 'gcash',
    referenceNumber: paymentReference.value.trim(),
  })
  paymentComplete.value = true
}

const showMaintenanceModal = ref(false)
const maintenanceCategory = ref<MaintenanceCategory>('plumbing')
const maintenanceTitle = ref('')
const maintenanceDescription = ref('')
const maintenanceComplete = ref(false)

function submitMaintenance() {
  if (!maintenanceTitle.value.trim()) return
  store.reportMaintenance({
    category: maintenanceCategory.value,
    title: maintenanceTitle.value.trim(),
    description: maintenanceDescription.value.trim(),
  })
  maintenanceComplete.value = true
}

function closeMaintenance() {
  showMaintenanceModal.value = false
  maintenanceTitle.value = ''
  maintenanceDescription.value = ''
  maintenanceComplete.value = false
}
</script>

<template>
  <div class="space-y-8 pb-16">
    <!-- Resident Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Resident Stay Portal</span>
          <span class="text-slate-300 text-xs">•</span>
          <span class="text-xs text-slate-500">Unit 201 Residence</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Welcome home, {{ store.currentUser?.first_name }}.
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Here is your active tenancy overview, monthly statements, and roommate directory.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <AppButton variant="outline" size="sm" @click="showMaintenanceModal = true">
          <Wrench class="w-3.5 h-3.5 text-indigo-600" />
          <span>Report Maintenance</span>
        </AppButton>
      </div>
    </div>

    <!-- Active Stay & Billing Command Card -->
    <section
      v-if="store.tenantActiveTenancy"
      class="enterprise-card overflow-hidden shadow-xs"
    >
      <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr]">
        <div class="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                Active Residence
              </span>
              <span class="text-xs text-slate-400 font-mono">
                Lease #{{ String(store.tenantActiveTenancy.id).padStart(4, '0') }}
              </span>
            </div>

            <div class="flex items-baseline gap-3">
              <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
                Room {{ store.tenantActiveTenancy.roomDetails?.room_number }}
              </h2>
              <span class="text-lg font-bold text-indigo-600">
                {{ store.tenantActiveTenancy.bedDetails?.bed_label }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Air-conditioned 2nd Floor Room • 4 Resident Capacity</p>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Check-In Date</span>
              <span class="font-bold text-slate-800 text-sm mt-0.5 block">
                {{ formatDate(store.tenantActiveTenancy.check_in_date) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Agreed Monthly Rate</span>
              <span class="font-bold text-slate-800 text-sm mt-0.5 block">
                {{ formatCurrency(store.tenantActiveTenancy.agreed_rate) }}
              </span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px] uppercase tracking-wider font-medium">Lease Status</span>
              <span class="font-bold text-emerald-600 text-sm mt-0.5 block">
                Good Standing
              </span>
            </div>
          </div>
        </div>

        <!-- Billing Highlights Box -->
        <div class="bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span class="font-semibold uppercase tracking-wider text-indigo-300">Statement Balance</span>
              <span v-if="latestInvoice" class="font-mono text-slate-300">{{ formatMonth(latestInvoice.billing_month) }}</span>
            </div>

            <template v-if="latestInvoice">
              <div class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                {{ formatCurrency(latestInvoice.balance) }}
              </div>
              <p class="text-xs text-slate-400 mt-2">
                {{ latestInvoice.balance > 0 ? 'Due by the 5th of this month' : 'All obligations are fully settled.' }}
              </p>
            </template>
          </div>

          <div class="mt-8 pt-6 border-t border-slate-800">
            <template v-if="latestInvoice">
              <button
                v-if="latestInvoice.balance > 0"
                class="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-xs transition-all cursor-pointer"
                @click="openPayment(latestInvoice.id, latestInvoice.balance)"
              >
                <span>Instant Settle with GCash</span>
                <ArrowRight class="w-4 h-4" />
              </button>
              <div v-else class="flex items-center gap-2 text-emerald-400 text-sm font-semibold py-2">
                <CheckCircle2 class="w-5 h-5" />
                <span>Account is completely up to date.</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 2 Columns: Invoices vs Payment History -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Invoices List -->
      <section class="enterprise-card p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Billing Statements</h2>
            <p class="text-xs text-slate-500 mt-0.5">Rent and submetered charges</p>
          </div>
          <Receipt class="w-5 h-5 text-indigo-600" />
        </div>

        <div class="space-y-4">
          <div
            v-for="invoice in [...store.tenantInvoices].reverse()"
            :key="invoice.id"
            class="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xs font-bold text-slate-900">
                  {{ formatMonth(invoice.billing_month) }} Statement
                </h3>
                <p class="text-[11px] text-slate-400">
                  Invoice #{{ String(invoice.id).padStart(4, '0') }} • Billed {{ formatDate(invoice.billing_month) }}
                </p>
              </div>

              <AppBadge
                :variant="invoice.status === 'paid' ? 'success' : invoice.status === 'partial' ? 'warning' : 'danger'"
              >
                {{ invoice.status }}
              </AppBadge>
            </div>

            <div class="divide-y divide-slate-100 text-xs">
              <div
                v-for="item in invoice.items"
                :key="item.id"
                class="py-1.5 flex items-center justify-between text-slate-600"
              >
                <span class="capitalize">{{ item.charge_type }}</span>
                <span class="font-mono text-slate-900">{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-500">Remaining Balance:</span>
              <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-slate-900">
                  {{ formatCurrency(invoice.balance) }}
                </span>
                <button
                  v-if="invoice.balance > 0"
                  class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  @click="openPayment(invoice.id, invoice.balance)"
                >
                  Pay
                </button>
              </div>
            </div>
          </div>

          <div v-if="store.tenantInvoices.length === 0" class="py-8 text-center text-xs text-slate-400">
            No invoices issued yet.
          </div>
        </div>
      </section>

      <!-- Payment Receipts History -->
      <section class="enterprise-card p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h2 class="text-base font-bold text-slate-900 tracking-tight">Payment Receipts</h2>
            <p class="text-xs text-slate-500 mt-0.5">Recorded transaction history</p>
          </div>
          <CreditCard class="w-5 h-5 text-emerald-600" />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="table-header">
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3">Method</th>
                <th class="py-2.5 px-3">Reference</th>
                <th class="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="payment in [...store.tenantPayments].reverse()"
                :key="payment.id"
                class="hover:bg-slate-50/60 transition-colors"
              >
                <td class="py-3 px-3 font-medium text-slate-800">
                  {{ formatDate(payment.payment_date) }}
                </td>
                <td class="py-3 px-3">
                  <BrandLogos :brand="payment.method" size="sm" />
                </td>
                <td class="py-3 px-3 font-mono text-[11px] text-slate-500">
                  {{ payment.reference_number || '—' }}
                </td>
                <td class="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                  +{{ formatCurrency(payment.amount_paid) }}
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="store.tenantPayments.length === 0" class="py-8 text-center text-xs text-slate-400">
            No payments recorded on your ledger yet.
          </div>
        </div>
      </section>
    </div>

    <!-- 3 Bottom Columns: Roommates, Maintenance, House Guidelines -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Roommates -->
      <section class="enterprise-card p-5">
        <div class="flex items-center gap-2 mb-4">
          <Users class="w-4 h-4 text-indigo-600" />
          <h2 class="text-sm font-bold text-slate-900 tracking-tight">Roommates</h2>
        </div>

        <div class="space-y-3">
          <div
            v-for="roommate in store.tenantRoommates"
            :key="roommate.id"
            class="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
          >
            <img
              v-if="roommate.tenantDetails?.avatarUrl"
              :src="roommate.tenantDetails.avatarUrl"
              :alt="roommate.tenantDetails.full_name"
              class="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div
              v-else
              class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center"
            >
              {{ roommate.tenantDetails?.first_name?.[0] }}
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-xs font-bold text-slate-900 truncate">
                {{ roommate.tenantDetails?.full_name }}
              </p>
              <p class="text-[11px] text-slate-400">
                {{ roommate.bedDetails?.bed_label }}
              </p>
            </div>
          </div>

          <div v-if="store.tenantRoommates.length === 0" class="text-xs text-slate-400 py-3 text-center">
            No roommates assigned.
          </div>
        </div>
      </section>

      <!-- Maintenance Tickets -->
      <section class="enterprise-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Wrench class="w-4 h-4 text-indigo-600" />
            <h2 class="text-sm font-bold text-slate-900 tracking-tight">Maintenance</h2>
          </div>
          <button
            class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            @click="showMaintenanceModal = true"
          >
            + Report
          </button>
        </div>

        <div v-if="store.tenantMaintenanceRequests.length" class="space-y-2.5">
          <div
            v-for="req in store.tenantMaintenanceRequests"
            :key="req.id"
            class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60"
          >
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs font-bold text-slate-900 truncate">{{ req.title }}</p>
              <AppBadge :variant="req.status === 'resolved' ? 'success' : 'warning'" size="sm">
                {{ req.status.replace('_', ' ') }}
              </AppBadge>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">{{ formatDate(req.created_at) }}</p>
          </div>
        </div>
        <p v-else class="text-xs text-slate-400 py-3 text-center">
          No maintenance tickets submitted.
        </p>
      </section>

      <!-- House Guidelines & Contacts -->
      <section class="enterprise-card p-5 bg-gradient-to-br from-indigo-50/80 to-white border-indigo-100">
        <div class="flex items-center gap-2 mb-3 text-indigo-800">
          <Megaphone class="w-4 h-4" />
          <h2 class="text-sm font-bold tracking-tight">House Courtesy</h2>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">
          Quiet study hours are strictly observed starting at 10:00 PM. High-draw cooking appliances are reserved for the 1st floor common kitchen.
        </p>
        <div class="mt-4 pt-3 border-t border-indigo-100 text-[11px] text-indigo-900 font-semibold flex items-center justify-between">
          <span>Landlord Office: 8 AM – 6 PM</span>
          <span class="text-indigo-600">Local #101</span>
        </div>
      </section>
    </div>

    <!-- Modal: Pay Invoice with GCash -->
    <AppModal
      :show="showPayModal"
      title="Settle Invoice via GCash"
      description="Transfer via GCash and record the official reference number for instant account credit."
      max-width="md"
      @close="showPayModal = false"
    >
      <div v-if="paymentComplete" class="py-6 text-center space-y-2">
        <CheckCircle2 class="mx-auto h-12 w-12 text-emerald-500" />
        <h3 class="text-base font-bold text-slate-900">Payment Recorded Successfully</h3>
        <p class="text-xs text-slate-500">
          Your balance has been updated and recorded on the ledger.
        </p>
        <div class="pt-4">
          <AppButton variant="primary" size="md" @click="showPayModal = false">
            View Updated Statement
          </AppButton>
        </div>
      </div>

      <form v-else class="space-y-4" @submit.prevent="submitPayment">
        <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
          <BrandLogos brand="gcash" size="md" />
          <div class="text-right">
            <span class="text-[11px] text-slate-500 block">GCash Account</span>
            <span class="text-xs font-bold text-slate-900 font-mono">0917-555-0192 (Maria R.)</span>
          </div>
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-700">Amount to Pay (PHP)</label>
          <input
            v-model="payAmount"
            type="number"
            min="1"
            class="field-control font-mono font-bold"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-700">GCash 13-Digit Reference Number</label>
          <input
            v-model="paymentReference"
            type="text"
            placeholder="e.g. 1002938475892"
            class="field-control font-mono"
            required
          />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showPayModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Confirm & Record Payment
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Report Maintenance -->
    <AppModal
      :show="showMaintenanceModal"
      title="Submit a Maintenance Request"
      description="Report an issue with your room, electrical fixtures, or plumbing."
      max-width="md"
      @close="closeMaintenance"
    >
      <div v-if="maintenanceComplete" class="py-6 text-center space-y-2">
        <CheckCircle2 class="mx-auto h-12 w-12 text-emerald-500" />
        <h3 class="text-base font-bold text-slate-900">Ticket Submitted</h3>
        <p class="text-xs text-slate-500">
          Our maintenance team has been notified and scheduled for inspection.
        </p>
        <div class="pt-4">
          <AppButton variant="primary" size="md" @click="closeMaintenance">
            Done
          </AppButton>
        </div>
      </div>

      <form v-else class="space-y-4" @submit.prevent="submitMaintenance">
        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-700">Category</label>
          <select v-model="maintenanceCategory" class="field-control">
            <option value="plumbing">Plumbing (Faucet, Shower, Toilet)</option>
            <option value="electrical">Electrical (Sockets, Lighting, Fan)</option>
            <option value="aircon">Air Conditioning Unit</option>
            <option value="wifi">Wi-Fi Connection</option>
            <option value="carpentry">Carpentry & Bed Fixtures</option>
            <option value="other">Other Facilities</option>
          </select>
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-700">Short Summary</label>
          <input
            v-model="maintenanceTitle"
            type="text"
            placeholder="e.g. Bathroom faucet leaking continuously"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="mb-1 block text-xs font-semibold text-slate-700">Detailed Description</label>
          <textarea
            v-model="maintenanceDescription"
            rows="3"
            placeholder="Describe the exact location and urgency..."
            class="field-control"
          />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="closeMaintenance">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Submit Request
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
