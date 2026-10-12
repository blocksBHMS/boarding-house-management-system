import type {
  UserAccount,
  Room,
  Bed,
  Tenancy,
  Invoice,
  InvoiceItem,
  Payment,
  MaintenanceRequest,
  ViewingInquiry,
} from '@/types/models'

export const initialAccounts: UserAccount[] = [
  {
    id: 1,
    username: 'landlord_maria',
    first_name: 'Maria',
    middle_name: 'Santos',
    last_name: 'Reyes',
    contact_number: '0917-555-0100',
    role: 'landlord',
    created_at: '2026-01-01T08:00:00Z',
    full_name: 'Maria Santos Reyes',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    username: 'juan_dc',
    first_name: 'Juan',
    middle_name: 'Protacio',
    last_name: 'Dela Cruz',
    contact_number: '0917-123-4567',
    role: 'tenant',
    created_at: '2026-06-01T09:00:00Z',
    full_name: 'Juan Protacio Dela Cruz',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    username: 'clara_s',
    first_name: 'Maria Clara',
    middle_name: 'De Los',
    last_name: 'Santos',
    contact_number: '0918-765-4321',
    role: 'tenant',
    created_at: '2026-07-15T10:30:00Z',
    full_name: 'Maria Clara De Los Santos',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    username: 'ibarra_c',
    first_name: 'Crisostomo',
    middle_name: 'Magsalin',
    last_name: 'Ibarra',
    contact_number: '0922-334-4556',
    role: 'tenant',
    created_at: '2026-08-01T14:15:00Z',
    full_name: 'Crisostomo Magsalin Ibarra',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    username: 'andres_b',
    first_name: 'Andres',
    middle_name: 'Castro',
    last_name: 'Bonifacio',
    contact_number: '0933-998-8776',
    role: 'tenant',
    created_at: '2026-09-01T11:00:00Z',
    full_name: 'Andres Castro Bonifacio',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 6,
    username: 'emilio_a',
    first_name: 'Emilio',
    middle_name: 'Famy',
    last_name: 'Aguinaldo',
    contact_number: '0944-112-2334',
    role: 'tenant',
    created_at: '2026-09-15T16:00:00Z',
    full_name: 'Emilio Famy Aguinaldo',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  },
]

export const propertyBuildingPhoto = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'

export interface RoomMetadata {
  imageUrl: string
  galleryImages: string[]
  category: 'Air-conditioned' | 'Standard Fan'
  genderPolicy: 'Male Only' | 'Female Only' | 'Co-ed / Any'
  floor: 'Ground Floor' | '2nd Floor'
  amenities: string[]
  description: string
  startingRate: number
}

export const initialRooms: (Room & RoomMetadata)[] = [
  {
    id: 1,
    room_number: '101',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Air-conditioned',
    genderPolicy: 'Co-ed / Any',
    floor: 'Ground Floor',
    amenities: ['Inverter Aircon', 'Study Desks', 'Private Restroom', 'Locker Cabinets', 'Wi-Fi 6'],
    description: 'Spacious ground floor 2-bed room with dedicated study desks and split-type aircon.',
    startingRate: 3500.0,
  },
  {
    id: 2,
    room_number: '102',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Air-conditioned',
    genderPolicy: 'Male Only',
    floor: 'Ground Floor',
    amenities: ['Window Aircon', '3 Single Beds', 'Submetered Electricity', 'Individual Lockers'],
    description: 'Bright triple sharing room with individual storage lockers and quiet corner layout.',
    startingRate: 2800.0,
  },
  {
    id: 3,
    room_number: '103',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Standard Fan',
    genderPolicy: 'Female Only',
    floor: 'Ground Floor',
    amenities: ['Ceiling Fan', 'Bunk Bed', 'Natural Ventilation', 'Large Wardrobe', 'High-Speed Wi-Fi'],
    description: 'Affordable, well-ventilated 2-bed fan room with large windows facing the garden.',
    startingRate: 2200.0,
  },
  {
    id: 4,
    room_number: '201',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Air-conditioned',
    genderPolicy: 'Male Only',
    floor: '2nd Floor',
    amenities: ['Inverter Aircon', 'Balcony Access', 'Reading Lamps', 'Private Shower'],
    description: 'Premium 2nd floor room with balcony access and peaceful university view.',
    startingRate: 3200.0,
  },
  {
    id: 5,
    room_number: '202',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Air-conditioned',
    genderPolicy: 'Male Only',
    floor: '2nd Floor',
    amenities: ['Heavy Duty Bunk Beds', 'Split-type AC', 'Study Table', 'Large Mirrors'],
    description: '4-bed dormitory room popular among student groups and budget-conscious workers.',
    startingRate: 2500.0,
  },
  {
    id: 6,
    room_number: '203',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
    ],
    category: 'Standard Fan',
    genderPolicy: 'Female Only',
    floor: '2nd Floor',
    amenities: ['Dual Wall Fans', 'Private Balcony', 'Individual Desks', 'Submetered Utilities'],
    description: 'Sunny second floor double-sharing room with private vanity mirror and balcony.',
    startingRate: 2400.0,
  },
]

export const initialBeds: Bed[] = [
  // Room 101 (2 Beds)
  { id: 1, room_id: 1, bed_label: 'Bed 101-A' },
  { id: 2, room_id: 1, bed_label: 'Bed 101-B' },

  // Room 102 (3 Beds)
  { id: 3, room_id: 2, bed_label: 'Bed 102-A' },
  { id: 4, room_id: 2, bed_label: 'Bed 102-B' },
  { id: 5, room_id: 2, bed_label: 'Bed 102-C' },

  // Room 103 (2 Beds)
  { id: 6, room_id: 3, bed_label: 'Bed 103-A' },
  { id: 7, room_id: 3, bed_label: 'Bed 103-B' },

  // Room 201 (2 Beds)
  { id: 8, room_id: 4, bed_label: 'Bed 201-A' },
  { id: 9, room_id: 4, bed_label: 'Bed 201-B' },

  // Room 202 (4 Beds)
  { id: 10, room_id: 5, bed_label: 'Bed 202-A' },
  { id: 11, room_id: 5, bed_label: 'Bed 202-B' },
  { id: 12, room_id: 5, bed_label: 'Bed 202-C' },
  { id: 13, room_id: 5, bed_label: 'Bed 202-D' },

  // Room 203 (2 Beds)
  { id: 14, room_id: 6, bed_label: 'Bed 203-A' },
  { id: 15, room_id: 6, bed_label: 'Bed 203-B' },
]

export const initialTenancies: Tenancy[] = [
  {
    id: 1,
    tenant: 2, // Juan Dela Cruz
    room: 1,
    bed: 1,
    check_in_date: '2026-06-01',
    agreed_rate: 3500.0,
  },
  {
    id: 2,
    tenant: 3, // Maria Clara
    room: 1,
    bed: 2,
    check_in_date: '2026-07-15',
    agreed_rate: 3500.0,
  },
  {
    id: 3,
    tenant: 4, // Crisostomo Ibarra
    room: 2,
    bed: 3,
    check_in_date: '2026-08-01',
    agreed_rate: 2800.0,
  },
  {
    id: 4,
    tenant: 5, // Andres Bonifacio
    room: 4,
    bed: 8,
    check_in_date: '2026-09-01',
    agreed_rate: 3200.0,
  },
  {
    id: 5,
    tenant: 6, // Emilio Aguinaldo
    room: 5,
    bed: 10,
    check_in_date: '2026-09-15',
    agreed_rate: 2500.0,
  },
]

export const initialInvoices: Invoice[] = [
  { id: 1, tenancy_id: 1, billing_month: '2026-10-01' },
  { id: 2, tenancy_id: 2, billing_month: '2026-10-01' },
  { id: 3, tenancy_id: 3, billing_month: '2026-10-01' },
  { id: 4, tenancy_id: 4, billing_month: '2026-10-01' },
  { id: 5, tenancy_id: 5, billing_month: '2026-10-01' },
]

export const initialInvoiceItems: InvoiceItem[] = [
  { id: 1, invoice_id: 1, line_no: 1, charge_type: 'rent', amount: 3500.0 },
  { id: 2, invoice_id: 1, line_no: 2, charge_type: 'electricity', amount: 420.0 },
  { id: 3, invoice_id: 1, line_no: 3, charge_type: 'water', amount: 150.0 },

  { id: 4, invoice_id: 2, line_no: 1, charge_type: 'rent', amount: 3500.0 },
  { id: 5, invoice_id: 2, line_no: 2, charge_type: 'electricity', amount: 380.0 },
  { id: 6, invoice_id: 2, line_no: 3, charge_type: 'water', amount: 150.0 },

  { id: 7, invoice_id: 3, line_no: 1, charge_type: 'rent', amount: 2800.0 },
  { id: 8, invoice_id: 3, line_no: 2, charge_type: 'electricity', amount: 310.0 },
  { id: 9, invoice_id: 3, line_no: 3, charge_type: 'water', amount: 150.0 },

  { id: 10, invoice_id: 4, line_no: 1, charge_type: 'rent', amount: 3200.0 },
  { id: 11, invoice_id: 4, line_no: 2, charge_type: 'electricity', amount: 450.0 },
  { id: 12, invoice_id: 4, line_no: 3, charge_type: 'water', amount: 150.0 },
  { id: 13, invoice_id: 4, line_no: 4, charge_type: 'penalty', amount: 200.0 },

  { id: 14, invoice_id: 5, line_no: 1, charge_type: 'rent', amount: 2500.0 },
  { id: 15, invoice_id: 5, line_no: 2, charge_type: 'electricity', amount: 290.0 },
  { id: 16, invoice_id: 5, line_no: 3, charge_type: 'water', amount: 150.0 },
]

export const initialPayments: Payment[] = [
  {
    id: 1,
    invoice: 1,
    payment_date: '2026-10-05',
    amount_paid: 4070.0,
    method: 'gcash',
    reference_number: 'GCASH-1002938475',
    status: 'verified',
  },
  {
    id: 2,
    invoice: 2,
    payment_date: '2026-10-07',
    amount_paid: 2000.0,
    method: 'cash',
    reference_number: 'CASH-REC-002',
    status: 'verified',
  },
  {
    id: 3,
    invoice: 4,
    payment_date: '2026-10-10',
    amount_paid: 4000.0,
    method: 'bank_transfer',
    reference_number: 'BDO-REF-998822',
    status: 'verified',
  },
]

export const initialMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 1,
    tenant_id: 2, // Juan Dela Cruz
    room_id: 1,
    category: 'electrical',
    title: 'Study desk light flickering',
    description: 'The desk LED light above Bed 101-A keeps flickering in the evening.',
    status: 'in_progress',
    created_at: '2026-10-10T14:30:00Z',
  },
  {
    id: 2,
    tenant_id: 4, // Crisostomo
    room_id: 2,
    category: 'wifi',
    title: 'Weak Wi-Fi signal in corner area',
    description: 'Mesh node signal drops occasionally during high traffic.',
    status: 'pending',
    created_at: '2026-10-11T09:15:00Z',
  },
]

export const initialInquiries: ViewingInquiry[] = [
  {
    id: 1,
    guest_name: 'Gabriel Silang',
    contact_number: '0919-888-2233',
    preferred_room_id: 2,
    target_move_in: '2026-11-01',
    notes: 'Inquiring for college brother starting classes next month.',
    created_at: '2026-10-11T16:00:00Z',
    status: 'new',
  },
]
