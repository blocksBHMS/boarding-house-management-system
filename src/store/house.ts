import { reactive } from 'vue'
import type { AxiosResponse } from 'axios'
import { accountService, bedService, invoiceItemService, invoiceService, paymentService, roomService, tenancyService } from '../services/api'
import type { Account, Bed, Invoice, InvoiceItem, Payment, Room, Tenancy } from '../types'

export type HouseKey = 'rooms' | 'beds' | 'tenancies' | 'accounts' | 'invoices' | 'items' | 'payments'
export const ALL_KEYS: HouseKey[] = ['rooms', 'beds', 'tenancies', 'accounts', 'invoices', 'items', 'payments']

/** One shared copy of the data every page needs, so names (not IDs) show everywhere. */
export const house = reactive({
  rooms: [] as Room[],
  beds: [] as Bed[],
  tenancies: [] as Tenancy[],
  accounts: [] as Account[],
  invoices: [] as Invoice[],
  items: [] as InvoiceItem[],
  payments: [] as Payment[],
  loading: false,
  failed: [] as HouseKey[],
})

const fetchers: Record<HouseKey, () => Promise<AxiosResponse<unknown>>> = {
  rooms: roomService.getAll,
  beds: bedService.getAll,
  tenancies: tenancyService.getAll,
  accounts: accountService.getAll,
  invoices: invoiceService.getAll,
  items: invoiceItemService.getAll,
  payments: paymentService.getAll,
}

// DRF may return a plain array or a paginated { results: [] }.
function asList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  const results = (data as { results?: unknown } | null)?.results
  return Array.isArray(results) ? results : []
}

/** Loads the given collections in parallel. One failing endpoint never blocks the others. */
export async function loadHouse(keys: HouseKey[] = ALL_KEYS, silent = false): Promise<void> {
  if (!silent) house.loading = true
  const results = await Promise.allSettled(keys.map((k) => fetchers[k]()))
  results.forEach((r, i) => {
    const key = keys[i]
    if (!key) return
    house.failed = house.failed.filter((f) => f !== key)
    if (r.status === 'fulfilled') {
      ;(house as unknown as Record<string, unknown>)[key] = asList(r.value.data)
    } else {
      house.failed.push(key)
    }
  })
  house.loading = false
}

export const naturalSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true })

export const roomOf = (id: number) => house.rooms.find((r) => r.id === id)
export const bedOf = (id: number) => house.beds.find((b) => b.id === id)
export const bedsInRoom = (roomId: number) =>
  house.beds.filter((b) => b.room_id === roomId).sort((a, b) => naturalSort(a.bed_label, b.bed_label))

export function accountName(id: number | undefined): string {
  if (id === undefined) return '—'
  const a = house.accounts.find((x) => x.id === id)
  if (!a) return `Tenant #${id}`
  return `${a.first_name} ${a.last_name}`.trim() || a.username
}

export function tenancyOfBed(bedId: number): Tenancy | undefined {
  return house.tenancies
    .filter((t) => t.bed === bedId)
    .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date) || b.id - a.id)[0]
}

export function bedFullLabel(bedId: number): string {
  const b = bedOf(bedId)
  if (!b) return `Bed #${bedId}`
  return `Room ${roomOf(b.room_id)?.room_number ?? b.room_id}, Bed ${b.bed_label}`
}

export function tenancyLabel(id: number): string {
  const t = house.tenancies.find((x) => x.id === id)
  if (!t) return `Tenancy #${id}`
  return `${accountName(t.tenant)} (${bedFullLabel(t.bed)})`
}

export const invNo = (id: number) => `INV-${String(id).padStart(4, '0')}`

export function invoiceTenant(invoiceId: number): string {
  const inv = house.invoices.find((i) => i.id === invoiceId)
  const t = inv ? house.tenancies.find((x) => x.id === inv.tenancy_id) : undefined
  return t ? accountName(t.tenant) : '—'
}

const cents = (n: number) => Math.round(n * 100) / 100

export function invoiceTotals(invoiceId: number) {
  const lines = house.items.filter((i) => i.invoice_id === invoiceId)
  const total = cents(lines.reduce((s, i) => s + (Number(i.amount) || 0), 0))
  const paid = cents(house.payments.filter((p) => p.invoice === invoiceId).reduce((s, p) => s + (Number(p.amount_paid) || 0), 0))
  const balance = Math.max(cents(total - paid), 0)
  const status: 'none' | 'paid' | 'partial' | 'unpaid' =
    lines.length === 0 ? 'none' : paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid'
  return { total, paid, balance, status, lineCount: lines.length }
}

export const statusTag = { paid: 'tag-leaf', partial: 'tag-sand', unpaid: 'tag-rust', none: '' } as const
export const statusLabel = { paid: 'Paid', partial: 'Partial', unpaid: 'Unpaid', none: 'No charges' } as const