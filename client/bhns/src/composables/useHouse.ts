import { computed } from 'vue'
import axios from 'axios'
import { bedService, roomService, tenancyService } from '../services/api'
import { accountName, bedsInRoom, house, loadHouse, naturalSort, tenancyOfBed } from '../store/house'
import { neoAlert } from './useAlert'

export interface Bed {
  id: string
  dbId: number
  label: string
  isOccupied: boolean
  rate: number
  tenant: string | null
}
export interface Room {
  id: number
  name: string
  floor: number
  rate: number
  beds: Bed[]
  physicalBedsCount: number
}

const letter = (i: number) => String.fromCharCode(65 + i)
const floorOf = (num: string) => {
  const n = parseInt(num, 10)
  return Number.isFinite(n) && n >= 100 ? Math.floor(n / 100) : 1
}

const errMsg = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data
    return d ? (typeof d === 'string' ? d : JSON.stringify(d)) : e.message
  }
  return String(e)
}

const run = async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await fn()
  } catch (e) {
    neoAlert(errMsg(e))
    return undefined
  }
}

export const refreshHouse = () => loadHouse(['rooms', 'beds', 'tenancies', 'accounts'], true)

let started = false
const ensureLoaded = () => {
  if (started) return
  started = true
  void loadHouse(['rooms', 'beds', 'tenancies', 'accounts'], true)
}

const rooms = computed<Room[]>(() =>
  [...house.rooms]
    .sort((a, b) => naturalSort(a.room_number, b.room_number))
    .map((r) => {
      const rawBeds = bedsInRoom(r.id)
      const beds: Bed[] = rawBeds.map((b) => {
        const t = tenancyOfBed(b.id)
        return {
          id: `${r.room_number}-${b.bed_label}`,
          dbId: b.id,
          label: `Bed ${b.bed_label}`,
          isOccupied: b.is_occupied,
          rate: t ? Number(t.agreed_rate) || 0 : 0,
          tenant: t ? accountName(t.tenant) : null,
        }
      })
      return {
        id: r.id,
        name: `Room ${r.room_number}`,
        floor: floorOf(r.room_number),
        rate: Math.max(0, ...beds.map((b) => b.rate)),
        beds,
        // Count physical beds by looking at unique letters (A, B)
        physicalBedsCount: new Set(rawBeds.map(b => b.bed_label.charAt(0))).size
      }
    }),
)

const floors = computed(() => [...new Set(rooms.value.map((r) => r.floor))].sort((a, b) => a - b))
const totalRooms = computed(() => rooms.value.length)
const totalBeds = computed(() => rooms.value.reduce((n, r) => n + r.beds.length, 0))
const occupiedBeds = computed(() => rooms.value.reduce((n, r) => n + r.beds.filter((b) => b.isOccupied).length, 0))
const vacantBeds = computed(() => totalBeds.value - occupiedBeds.value)

const addRoom = (bedCount = 0) =>
  run(async () => {
    const used = new Set(house.rooms.map((r) => r.room_number))
    let n = 101
    while (used.has(String(n))) n++
    const { data } = await roomService.create({ room_number: String(n) })
    for (let i = 0; i < Math.min(bedCount, 2); i++) {
      await bedService.create({ room_id: data.id, bed_label: `${letter(i)} (Single)` })
    }
    await loadHouse(['rooms', 'beds'], true)
    return data
  })

const renameRoom = (id: number, roomNumber: string) =>
  run(async () => {
    await roomService.update(id, { room_number: roomNumber })
    await loadHouse(['rooms'], true)
  })

const deleteRoom = (id: number) =>
  run(async () => {
    await roomService.remove(id)
    await loadHouse(['rooms', 'beds'], true)
  })

// FIX: Handles strictly 2 physical beds, building proper descriptive labels
const addBed = async (roomId: number, type: 'single' | 'bunk' = 'single') => {
  const existing = bedsInRoom(roomId).map((b) => b.bed_label)
  const physicalBedsUsed = new Set(existing.map(l => l.charAt(0))).size

  if (physicalBedsUsed >= 2) {
    neoAlert('This room already holds the maximum of 2 physical beds.')
    return false
  }

  // Find next available letter A or B
  let i = 0
  while (existing.some((l) => l.startsWith(letter(i)))) i++
  const newLetter = letter(i)

  const res = await run(async () => {
    if (type === 'single') {
      await bedService.create({ room_id: roomId, bed_label: `${newLetter} (Single)` })
    } else {
      await bedService.create({ room_id: roomId, bed_label: `${newLetter} (Bunk Lower)` })
      await bedService.create({ room_id: roomId, bed_label: `${newLetter} (Bunk Upper)` })
    }
    await loadHouse(['beds'], true)
    return true
  })
  return !!res
}

const renameBed = (bedDbId: number, roomId: number, label: string) =>
  run(async () => {
    await bedService.update(bedDbId, { room_id: roomId, bed_label: label })
    await loadHouse(['beds'], true)
  })

const deleteBed = (bedDbId: number) =>
  run(async () => {
    await bedService.remove(bedDbId)
    await loadHouse(['beds'], true)
  })

const assignTenant = async (bedDbId: number, accountId: number | string, rate: number) => {
  await run(async () => {
    await tenancyService.create({
      tenant: Number(accountId),
      bed: bedDbId,
      check_in_date: new Date().toISOString().slice(0, 10),
      agreed_rate: String(rate),
    })
    await loadHouse(['tenancies', 'beds', 'accounts'], true)
  })
}

export const useHouse = () => {
  ensureLoaded()
  return {
    rooms, floors, totalRooms, totalBeds, occupiedBeds, vacantBeds,
    addRoom, renameRoom, deleteRoom, addBed, renameBed, deleteBed, assignTenant,
  }
}