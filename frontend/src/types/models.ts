/**
 * Domain Models strictly mapped to Django REST Framework backend schemas,
 * with graceful frontend extensions for marketing, photos, and proposed features.
 */

export type UserRole = 'landlord' | 'tenant'

export interface UserAccount {
  id: number
  username: string
  first_name: string
  middle_name?: string
  last_name: string
  contact_number: string
  role: UserRole
  created_at: string
  full_name?: string
  avatarUrl?: string
}

export interface Room {
  id: number
  room_number: string
}

export interface Bed {
  id: number
  room_id: number
  bed_label: string
}

export interface Tenancy {
  id: number
  tenant: number // FK to UserAccount
  room: number   // FK to Room
  bed: number    // FK to Bed
  check_in_date: string // YYYY-MM-DD
  agreed_rate: number
}

export type ChargeType = 'rent' | 'electricity' | 'water' | 'penalty' | 'other'

export interface InvoiceItem {
  id: number
  invoice_id: number
  line_no: number
  charge_type: ChargeType
  amount: number
}

export interface Invoice {
  id: number
  tenancy_id: number // FK to Tenancy
  billing_month: string // YYYY-MM-DD
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'gcash' | 'other'

export interface Payment {
  id: number
  invoice: number // FK to Invoice
  payment_date: string
  amount_paid: number
  method: PaymentMethod
  reference_number?: string // GCash / Bank reference code
  status?: 'verified' | 'pending'
}

/**
 * [PROPOSED BACKEND EXTENSIONS]
 * These models represent essential operational features identified during UI audit
 * to be proposed to the backend team for Phase 2.
 */
export type MaintenanceCategory = 'plumbing' | 'electrical' | 'aircon' | 'wifi' | 'carpentry' | 'other'
export type MaintenanceStatus = 'pending' | 'in_progress' | 'resolved'

export interface MaintenanceRequest {
  id: number
  tenant_id: number
  room_id: number
  category: MaintenanceCategory
  title: string
  description: string
  status: MaintenanceStatus
  created_at: string
}

export interface ViewingInquiry {
  id: number
  guest_name: string
  contact_number: string
  preferred_room_id: number
  target_move_in: string
  notes?: string
  created_at: string
  status: 'new' | 'contacted' | 'booked'
}

/**
 * Rich/Composed View Models used by the UI for seamless rendering & marketing
 */
export interface BedWithStatus extends Bed {
  isOccupied: boolean
  currentTenant?: UserAccount
  activeTenancyId?: number
  agreedRate?: number
}

export interface RoomWithBeds extends Room {
  beds: BedWithStatus[]
  totalBeds: number
  occupiedBeds: number
  availableBeds: number

  // Marketing & Showcase Extensions
  imageUrl: string
  galleryImages: string[]
  category: 'Air-conditioned' | 'Standard Fan'
  genderPolicy: 'Male Only' | 'Female Only' | 'Co-ed / Any'
  floor: 'Ground Floor' | '2nd Floor'
  amenities: string[]
  description: string
  startingRate: number
}

export interface TenancyDetailed extends Tenancy {
  tenantDetails?: UserAccount
  roomDetails?: Room
  bedDetails?: Bed
  status: 'active' | 'terminated'
}

export interface InvoiceDetailed extends Invoice {
  tenancy?: TenancyDetailed
  items: InvoiceItem[]
  payments: Payment[]
  totalAmount: number
  totalPaid: number
  balance: number
  status: 'paid' | 'partial' | 'unpaid'
}
