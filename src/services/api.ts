import axios from 'axios'
import type { Account, Bed, Invoice, InvoiceItem, LoginResponse, Payment, Room, Tenancy } from '../types'

// One axios instance for the whole app. Vite proxies /api to Django.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

let unauthorizedHandler: (() => void) | null = null

/** main.ts registers what happens when the token is rejected (clear session, go to login). */
export function onUnauthorized(fn: () => void): void {
  unauthorizedHandler = fn
}

// Django issues JWTs (access + refresh), so the scheme is Bearer.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const isAuthCall = /^\/?(login|register)\//.test(error.config?.url ?? '')
      if (error.response?.status === 401 && !isAuthCall) unauthorizedHandler?.()
    }
    return Promise.reject(error)
  },
)

export const authService = {
  login: (data: { username: string; password: string }) => api.post<LoginResponse>('/login/', data),
  register: (data: Record<string, string>) => api.post('/register/', data),
}

export const roomService = {
  getAll: () => api.get<Room[]>('/rooms/'),
  create: (data: { room_number: string }) => api.post<Room>('/rooms/create/', data),
  update: (id: number, data: { room_number: string }) => api.put<Room>(`/rooms/${id}/update/`, data),
  remove: (id: number) => api.delete(`/rooms/${id}/delete/`),
}

export const bedService = {
  getAll: () => api.get<Bed[]>('/beds/'),
  create: (data: { room_id: number; bed_label: string }) => api.post<Bed>('/beds/create/', data),
  update: (id: number, data: { room_id: number; bed_label: string; is_occupied?: boolean }) => api.put<Bed>(`/beds/${id}/update/`, data),
  remove: (id: number) => api.delete(`/beds/${id}/delete/`),
}

export const tenancyService = {
  getAll: () => api.get<Tenancy[]>('/tenancies/'),
  create: (data: { tenant: number; bed: number; check_in_date: string; agreed_rate: string }) => api.post<Tenancy>('/tenancies/create/', data),
  delete: (id: number) => api.delete(`/tenancies/${id}/delete/`)
}

export const accountService = {
  getAll: () => api.get<Account[]>('/accounts/'),
  create: (data: Omit<Account, 'id'> & { password: string }) => api.post<Account>('/accounts/', data),
  remove: (id: number) => api.delete(`/accounts/${id}/delete/`)
}

export const invoiceService = {
  getAll: () => api.get<Invoice[]>('/invoices/'),
  create: (data: { tenancy_id: number; billing_month: string }) => api.post<Invoice>('/invoices/create/', data),
}

export const invoiceItemService = {
  getAll: () => api.get<InvoiceItem[]>('/invoice-items/'),
  create: (data: { invoice_id: number; line_no: number; charge_type: string; amount: string }) => api.post<InvoiceItem>('/invoice-items/create/', data),
}

export const paymentService = {
  getAll: () => api.get<Payment[]>('/payments/'),
  create: (data: { invoice: number; payment_date: string; amount_paid: string; method: string }) => api.post<Payment>('/payments/create/', data),
}

export default api