import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type {
  UserAccount,
  Room,
  Bed,
  Tenancy,
  Invoice,
  InvoiceItem,
  Payment,
  RoomWithBeds,
  BedWithStatus,
  TenancyDetailed,
  InvoiceDetailed,
  PaymentMethod,
  ChargeType,
  MaintenanceRequest,
  MaintenanceCategory,
  MaintenanceStatus,
  ViewingInquiry,
} from '@/types/models'
import {
  initialAccounts,
  initialRooms,
  initialBeds,
  initialTenancies,
  initialInvoices,
  initialInvoiceItems,
  initialPayments,
  initialMaintenanceRequests,
  initialInquiries,
} from '@/mocks/seedData'

const STORAGE_KEY = 'blocksbhms_state_v3'

export const useHouseStore = defineStore('boardingHouse', () => {
  // Load initial from localStorage
  const savedState = localStorage.getItem(STORAGE_KEY)
  const parsed = savedState ? JSON.parse(savedState) : null

  // Core collections
  const accounts = ref<UserAccount[]>(parsed?.accounts || [...initialAccounts])
  const rooms = ref<(Room & any)[]>(parsed?.rooms || [...initialRooms])
  const beds = ref<Bed[]>(parsed?.beds || [...initialBeds])
  const tenancies = ref<Tenancy[]>(parsed?.tenancies || [...initialTenancies])
  const invoices = ref<Invoice[]>(parsed?.invoices || [...initialInvoices])
  const invoiceItems = ref<InvoiceItem[]>(parsed?.invoiceItems || [...initialInvoiceItems])
  const payments = ref<Payment[]>(parsed?.payments || [...initialPayments])
  const maintenanceRequests = ref<MaintenanceRequest[]>(
    parsed?.maintenanceRequests || [...initialMaintenanceRequests]
  )
  const inquiries = ref<ViewingInquiry[]>(parsed?.inquiries || [...initialInquiries])

  // Authentication State
  // Default: Null/Guest when browsing public site, or restored from storage
  const currentUserId = ref<number | null>(parsed?.currentUserId ?? null)
  const isAuthenticated = computed(() => currentUserId.value !== null)

  const currentUser = computed(() => {
    if (!currentUserId.value) return null
    return accounts.value.find((acc) => acc.id === currentUserId.value) || null
  })

  const isLandlord = computed(() => currentUser.value?.role === 'landlord')
  const isTenant = computed(() => currentUser.value?.role === 'tenant')

  // Save changes to localStorage
  watch(
    [accounts, rooms, beds, tenancies, invoices, invoiceItems, payments, maintenanceRequests, inquiries, currentUserId],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accounts: accounts.value,
          rooms: rooms.value,
          beds: beds.value,
          tenancies: tenancies.value,
          invoices: invoices.value,
          invoiceItems: invoiceItems.value,
          payments: payments.value,
          maintenanceRequests: maintenanceRequests.value,
          inquiries: inquiries.value,
          currentUserId: currentUserId.value,
        })
      )
    },
    { deep: true }
  )

  function login(userId: number) {
    currentUserId.value = userId
  }

  function logout() {
    currentUserId.value = null
  }

  function resetAllData() {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  // --- DERIVED / COMPUTED VIEW MODELS ---

  const detailedTenancies = computed<TenancyDetailed[]>(() => {
    return tenancies.value.map((t) => {
      const tenantDetails = accounts.value.find((a) => a.id === t.tenant)
      const roomDetails = rooms.value.find((r) => r.id === t.room)
      const bedDetails = beds.value.find((b) => b.id === t.bed)
      return {
        ...t,
        tenantDetails,
        roomDetails,
        bedDetails,
        status: 'active',
      }
    })
  })

  const detailedRooms = computed<RoomWithBeds[]>(() => {
    return rooms.value.map((room) => {
      const roomBeds = beds.value.filter((b) => b.room_id === room.id)
      const bedStatuses: BedWithStatus[] = roomBeds.map((bed) => {
        const activeTenancy = detailedTenancies.value.find((t) => t.bed === bed.id)
        return {
          ...bed,
          isOccupied: !!activeTenancy,
          currentTenant: activeTenancy?.tenantDetails,
          activeTenancyId: activeTenancy?.id,
          agreedRate: activeTenancy?.agreed_rate,
        }
      })

      const totalBeds = bedStatuses.length
      const occupiedBeds = bedStatuses.filter((b) => b.isOccupied).length

      return {
        ...room,
        beds: bedStatuses,
        totalBeds,
        occupiedBeds,
        availableBeds: totalBeds - occupiedBeds,
        imageUrl: room.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
        galleryImages: room.galleryImages || [room.imageUrl],
        category: room.category || 'Air-conditioned',
        genderPolicy: room.genderPolicy || 'Co-ed / Any',
        floor: room.floor || 'Ground Floor',
        amenities: room.amenities || ['Wi-Fi', 'Locker Cabinets'],
        description: room.description || `Boarding room with ${totalBeds} bed spaces.`,
        startingRate: room.startingRate || 3000,
      }
    })
  })

  const detailedInvoices = computed<InvoiceDetailed[]>(() => {
    return invoices.value.map((inv) => {
      const tenancy = detailedTenancies.value.find((t) => t.id === inv.tenancy_id)
      const items = invoiceItems.value.filter((item) => item.invoice_id === inv.id)
      const invoicePayments = payments.value.filter((p) => p.invoice === inv.id)

      const totalAmount = items.reduce((acc, curr) => acc + Number(curr.amount), 0)
      const totalPaid = invoicePayments.reduce((acc, curr) => acc + Number(curr.amount_paid), 0)
      const balance = Math.max(0, totalAmount - totalPaid)

      let status: 'paid' | 'partial' | 'unpaid' = 'unpaid'
      if (totalPaid >= totalAmount && totalAmount > 0) {
        status = 'paid'
      } else if (totalPaid > 0) {
        status = 'partial'
      }

      return {
        ...inv,
        tenancy,
        items,
        payments: invoicePayments,
        totalAmount,
        totalPaid,
        balance,
        status,
      }
    })
  })

  // System KPIs
  const totalRoomsCount = computed(() => rooms.value.length)
  const totalBedsCount = computed(() => beds.value.length)
  const occupiedBedsCount = computed(() => {
    return detailedRooms.value.reduce((acc, r) => acc + r.occupiedBeds, 0)
  })
  const vacantBedsCount = computed(() => totalBedsCount.value - occupiedBedsCount.value)
  const occupancyRate = computed(() => {
    if (totalBedsCount.value === 0) return 0
    return Math.round((occupiedBedsCount.value / totalBedsCount.value) * 100)
  })

  const totalMonthlyBilled = computed(() => {
    return detailedInvoices.value.reduce((acc, inv) => acc + inv.totalAmount, 0)
  })
  const totalCollected = computed(() => {
    return detailedInvoices.value.reduce((acc, inv) => acc + inv.totalPaid, 0)
  })
  const totalOutstanding = computed(() => {
    return detailedInvoices.value.reduce((acc, inv) => acc + inv.balance, 0)
  })
  const overdueInvoicesCount = computed(() => {
    return detailedInvoices.value.filter((i) => i.status !== 'paid').length
  })
  const pendingMaintenanceCount = computed(() => {
    return maintenanceRequests.value.filter((m) => m.status !== 'resolved').length
  })

  // Tenant Portal Data
  const tenantActiveTenancy = computed(() => {
    if (!currentUserId.value) return null
    return detailedTenancies.value.find((t) => t.tenant === currentUserId.value)
  })
  const tenantRoommates = computed(() => {
    if (!tenantActiveTenancy.value) return []
    return detailedTenancies.value.filter(
      (t) => t.room === tenantActiveTenancy.value?.room && t.id !== tenantActiveTenancy.value?.id
    )
  })
  const tenantInvoices = computed(() => {
    if (!tenantActiveTenancy.value) return []
    return detailedInvoices.value.filter(
      (inv) => inv.tenancy_id === tenantActiveTenancy.value?.id
    )
  })
  const tenantPayments = computed(() => {
    const invIds = tenantInvoices.value.map((inv) => inv.id)
    return payments.value.filter((p) => invIds.includes(p.invoice))
  })
  const tenantMaintenanceRequests = computed(() => {
    if (!currentUserId.value) return []
    return maintenanceRequests.value.filter((m) => m.tenant_id === currentUserId.value)
  })

  // --- ACTIONS ---

  function addRoom(roomNumber: string, bedCount: number, category: string = 'Air-conditioned', floor: string = 'Ground Floor') {
    const newRoomId = rooms.value.length ? Math.max(...rooms.value.map((r) => r.id)) + 1 : 1
    const newRoom = {
      id: newRoomId,
      room_number: roomNumber,
      imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      galleryImages: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
      category,
      genderPolicy: 'Co-ed / Any',
      floor,
      amenities: ['High-Speed Wi-Fi', 'Locker Cabinets'],
      description: `Newly configured ${roomNumber} with ${bedCount} slots.`,
      startingRate: 3000,
    }
    rooms.value.push(newRoom)

    let nextBedId = beds.value.length ? Math.max(...beds.value.map((b) => b.id)) + 1 : 1
    const letters = ['A', 'B', 'C', 'D', 'E', 'F']
    for (let i = 0; i < bedCount; i++) {
      const letter = letters[i] || `${i + 1}`
      beds.value.push({
        id: nextBedId++,
        room_id: newRoomId,
        bed_label: `${roomNumber}-${letter}`,
      })
    }
    return newRoom
  }

  function checkInTenant(data: {
    tenantId: number
    roomId: number
    bedId: number
    checkInDate: string
    agreedRate: number
  }) {
    const newId = tenancies.value.length ? Math.max(...tenancies.value.map((t) => t.id)) + 1 : 1
    const newTenancy: Tenancy = {
      id: newId,
      tenant: data.tenantId,
      room: data.roomId,
      bed: data.bedId,
      check_in_date: data.checkInDate,
      agreed_rate: Number(data.agreedRate),
    }
    tenancies.value.push(newTenancy)
    return newTenancy
  }

  function endTenancy(tenancyId: number) {
    tenancies.value = tenancies.value.filter((t) => t.id !== tenancyId)
  }

  function createInvoice(data: {
    tenancyId: number
    billingMonth: string
    items: { chargeType: ChargeType; amount: number }[]
  }) {
    const newInvoiceId = invoices.value.length
      ? Math.max(...invoices.value.map((i) => i.id)) + 1
      : 1
    const newInvoice: Invoice = {
      id: newInvoiceId,
      tenancy_id: data.tenancyId,
      billing_month: data.billingMonth,
    }
    invoices.value.push(newInvoice)

    let nextItemId = invoiceItems.value.length
      ? Math.max(...invoiceItems.value.map((item) => item.id)) + 1
      : 1

    data.items.forEach((item, index) => {
      invoiceItems.value.push({
        id: nextItemId++,
        invoice_id: newInvoiceId,
        line_no: index + 1,
        charge_type: item.chargeType,
        amount: Number(item.amount),
      })
    })

    return newInvoice
  }

  function batchGenerateMonthlyInvoices(billingMonth: string, estElectric: number = 350, estWater: number = 150) {
    let generatedCount = 0
    detailedTenancies.value.forEach((tenancy) => {
      const alreadyHas = invoices.value.some(
        (inv) => inv.tenancy_id === tenancy.id && inv.billing_month === billingMonth
      )
      if (!alreadyHas) {
        createInvoice({
          tenancyId: tenancy.id,
          billingMonth,
          items: [
            { chargeType: 'rent', amount: tenancy.agreed_rate },
            { chargeType: 'electricity', amount: estElectric },
            { chargeType: 'water', amount: estWater },
          ],
        })
        generatedCount++
      }
    })
    return generatedCount
  }

  function recordPayment(data: {
    invoiceId: number
    paymentDate: string
    amount: number
    method: PaymentMethod
    referenceNumber?: string
  }) {
    const newId = payments.value.length ? Math.max(...payments.value.map((p) => p.id)) + 1 : 1
    const newPayment: Payment = {
      id: newId,
      invoice: data.invoiceId,
      payment_date: data.paymentDate,
      amount_paid: Number(data.amount),
      method: data.method,
      reference_number: data.referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'verified',
    }
    payments.value.push(newPayment)
    return newPayment
  }

  function reportMaintenance(data: {
    category: MaintenanceCategory
    title: string
    description: string
  }) {
    if (!tenantActiveTenancy.value || !currentUserId.value) return
    const newId = maintenanceRequests.value.length
      ? Math.max(...maintenanceRequests.value.map((m) => m.id)) + 1
      : 1
    const newRequest: MaintenanceRequest = {
      id: newId,
      tenant_id: currentUserId.value,
      room_id: tenantActiveTenancy.value.room,
      category: data.category,
      title: data.title,
      description: data.description,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    maintenanceRequests.value.push(newRequest)
    return newRequest
  }

  function updateMaintenanceStatus(id: number, status: MaintenanceStatus) {
    const req = maintenanceRequests.value.find((m) => m.id === id)
    if (req) req.status = status
  }

  function submitInquiry(data: {
    guestName: string
    contactNumber: string
    preferredRoomId: number
    targetMoveIn: string
    notes?: string
  }) {
    const newId = inquiries.value.length
      ? Math.max(...inquiries.value.map((i) => i.id)) + 1
      : 1
    const newInquiry: ViewingInquiry = {
      id: newId,
      guest_name: data.guestName,
      contact_number: data.contactNumber,
      preferred_room_id: data.preferredRoomId,
      target_move_in: data.targetMoveIn,
      notes: data.notes,
      created_at: new Date().toISOString(),
      status: 'new',
    }
    inquiries.value.push(newInquiry)
    return newInquiry
  }

  return {
    // State
    accounts,
    rooms,
    beds,
    tenancies,
    invoices,
    invoiceItems,
    payments,
    maintenanceRequests,
    inquiries,
    currentUserId,
    currentUser,
    isAuthenticated,
    isLandlord,
    isTenant,

    // Computeds
    detailedRooms,
    detailedTenancies,
    detailedInvoices,
    totalRoomsCount,
    totalBedsCount,
    occupiedBedsCount,
    vacantBedsCount,
    occupancyRate,
    totalMonthlyBilled,
    totalCollected,
    totalOutstanding,
    overdueInvoicesCount,
    pendingMaintenanceCount,

    // Tenant Portal
    tenantActiveTenancy,
    tenantRoommates,
    tenantInvoices,
    tenantPayments,
    tenantMaintenanceRequests,

    // Auth Actions
    login,
    logout,
    resetAllData,

    // App Actions
    addRoom,
    checkInTenant,
    endTenancy,
    createInvoice,
    batchGenerateMonthlyInvoices,
    recordPayment,
    reportMaintenance,
    updateMaintenanceStatus,
    submitInquiry,
  }
})
