<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DoorOpen,
  BedDouble,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Image,
  Eye,
  MapPin,
  Sparkles,
  Phone,
  User,
  ArrowRight,
  SlidersHorizontal,
  Wifi,
  ShieldCheck,
  Zap,
} from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { formatCurrency } from '@/utils/formatters'
import type { RoomWithBeds } from '@/types/models'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppModal from '@/components/ui/AppModal.vue'

const store = useHouseStore()

// Search & Filter state
const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const selectedFloor = ref<string>('all')
const onlyVacant = ref(false)

const filteredRooms = computed(() => {
  return store.detailedRooms.filter((room) => {
    // Search filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const matchNum = room.room_number.toLowerCase().includes(q)
      const matchDesc = room.description?.toLowerCase().includes(q)
      const matchAmenity = room.amenities?.some((a) => a.toLowerCase().includes(q))
      if (!matchNum && !matchDesc && !matchAmenity) return false
    }

    // Category filter
    if (selectedCategory.value !== 'all' && room.category !== selectedCategory.value) {
      return false
    }

    // Floor filter
    if (selectedFloor.value !== 'all' && room.floor !== selectedFloor.value) {
      return false
    }

    // Vacant only filter
    if (onlyVacant.value && room.availableBeds === 0) {
      return false
    }

    return true
  })
})

// Modal: Gallery & Details
const showGalleryModal = ref(false)
const activeRoom = ref<RoomWithBeds | null>(null)
const activePhotoIndex = ref(0)

function openGallery(room: RoomWithBeds) {
  activeRoom.value = room
  activePhotoIndex.value = 0
  showGalleryModal.value = true
}

// Modal: Viewing Inquiry
const showInquiryModal = ref(false)
const inquiryRoom = ref<RoomWithBeds | null>(null)
const guestName = ref('')
const guestContact = ref('')
const targetMoveIn = ref('2026-11-01')
const guestNotes = ref('')
const inquirySuccess = ref(false)

function openInquiry(room: RoomWithBeds) {
  inquiryRoom.value = room
  inquirySuccess.value = false
  showInquiryModal.value = true
}

function handleInquirySubmit() {
  if (!inquiryRoom.value || !guestName.value || !guestContact.value) return

  store.submitInquiry({
    guestName: guestName.value,
    contactNumber: guestContact.value,
    preferredRoomId: inquiryRoom.value.id,
    targetMoveIn: targetMoveIn.value,
    notes: guestNotes.value,
  })

  inquirySuccess.value = true
  setTimeout(() => {
    showInquiryModal.value = false
    guestName.value = ''
    guestContact.value = ''
    guestNotes.value = ''
  }, 1800)
}
</script>

<template>
  <div class="space-y-8 pb-20 pt-6">
    <!-- Breadcrumb & Header -->
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <RouterLink to="/" class="hover:text-slate-900 transition-colors">Home</RouterLink>
        <span>/</span>
        <span class="text-indigo-600">Available Residences</span>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Explore Rooms & Bedspaces
          </h1>
          <p class="text-sm text-slate-500 mt-1.5 max-w-2xl">
            Transparent boarding living in Sampaloc, Manila. Individual submetered electricity, high-speed fiber Wi-Fi, and 24/7 security.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs shrink-0">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span class="font-bold text-slate-900">{{ store.vacantBedsCount }} of {{ store.totalBedsCount }}</span>
          <span>Spaces Available</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search Control Panel -->
    <div class="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
      <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
        <!-- Search bar -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by room (e.g. 101, 201), aircon, desk..."
            class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
          />
        </div>

        <!-- Category Dropdown -->
        <select
          v-model="selectedCategory"
          class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
        >
          <option value="all">All Room Types</option>
          <option value="Air-conditioned">Air-Conditioned</option>
          <option value="Standard Fan">Standard Fan</option>
        </select>

        <!-- Floor Dropdown -->
        <select
          v-model="selectedFloor"
          class="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
        >
          <option value="all">All Floors</option>
          <option value="Ground Floor">Ground Floor</option>
          <option value="2nd Floor">2nd Floor</option>
        </select>

        <!-- Vacancy Toggle -->
        <button
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-2"
          :class="onlyVacant ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
          @click="onlyVacant = !onlyVacant"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Vacancies Only</span>
        </button>
      </div>
    </div>

    <!-- Clean, High-End Property Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="room in filteredRooms"
        :key="room.id"
        class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
      >
        <div>
          <!-- Unobstructed Clean Photo Container -->
          <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" @click="openGallery(room)">
            <img
              :src="room.imageUrl"
              :alt="`Room ${room.room_number}`"
              class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            
            <!-- Minimal top status tag -->
            <div class="absolute top-3 left-3">
              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs flex items-center gap-1.5',
                  room.availableBeds > 0
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-700/50'
                ]"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="room.availableBeds > 0 ? 'bg-emerald-400' : 'bg-slate-400'"
                />
                {{ room.availableBeds > 0 ? `${room.availableBeds} of ${room.totalBeds} Beds Open` : 'Fully Occupied' }}
              </span>
            </div>

            <!-- Photos count pill -->
            <div class="absolute top-3 right-3">
              <span class="px-2 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                <Image class="w-3 h-3" />
                {{ room.galleryImages.length }}
              </span>
            </div>
          </div>

          <!-- Room Information Body -->
          <div class="p-5 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-bold text-slate-900 leading-tight">
                  Room {{ room.room_number }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ room.category }} • {{ room.floor }} • {{ room.genderPolicy }}
                </p>
              </div>

              <div class="text-right">
                <span class="text-base font-extrabold text-slate-900 block font-mono">
                  {{ formatCurrency(room.startingRate) }}
                </span>
                <span class="text-[10px] text-slate-400 block -mt-0.5">/ bed / month</span>
              </div>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {{ room.description }}
            </p>

            <!-- Minimal Amenities Line -->
            <div class="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 overflow-hidden">
              <span class="truncate">
                {{ room.amenities.slice(0, 3).join(' • ') }}
              </span>
              <span v-if="room.amenities.length > 3" class="text-slate-400 shrink-0">
                +{{ room.amenities.length - 3 }} more
              </span>
            </div>
          </div>
        </div>

        <!-- Clean Action Bar -->
        <div class="px-5 pb-5 pt-0 flex items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            class="flex-1"
            @click="openGallery(room)"
          >
            <Eye class="w-3.5 h-3.5 mr-1" />
            <span>View Details</span>
          </AppButton>

          <AppButton
            variant="primary"
            size="sm"
            class="flex-1"
            :disabled="room.availableBeds === 0"
            @click="openInquiry(room)"
          >
            <span>Inquire Space</span>
          </AppButton>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredRooms.length === 0"
      class="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8"
    >
      <DoorOpen class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h3 class="font-bold text-slate-900 text-base">No rooms match your filter</h3>
      <p class="text-xs text-slate-500 mt-1">Try resetting the category, floor, or search keywords.</p>
    </div>

    <!-- Modal: Multi-Photo Gallery & Allocation -->
    <AppModal
      :show="showGalleryModal"
      :title="`Room ${activeRoom?.room_number || ''} — Residence Details`"
      :description="`${activeRoom?.category} • ${activeRoom?.floor} • ${activeRoom?.genderPolicy}`"
      max-width="lg"
      @close="showGalleryModal = false"
    >
      <div v-if="activeRoom" class="space-y-5">
        <!-- Main Highlight Photo -->
        <div class="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900">
          <img
            :src="activeRoom.galleryImages[activePhotoIndex] || activeRoom.imageUrl"
            :alt="`Room ${activeRoom.room_number}`"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Thumbnails Strip -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            v-for="(img, idx) in activeRoom.galleryImages"
            :key="idx"
            class="w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer"
            :class="activePhotoIndex === idx ? 'border-indigo-600 scale-102' : 'border-transparent opacity-60 hover:opacity-100'"
            @click="activePhotoIndex = idx"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- Room Description & Amenities -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Features & Included Utilities</h4>
          <p class="text-xs text-slate-600 leading-relaxed">{{ activeRoom.description }}</p>
          <div class="flex flex-wrap gap-1.5 pt-1">
            <span
              v-for="amenity in activeRoom.amenities"
              :key="amenity"
              class="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
            >
              {{ amenity }}
            </span>
          </div>
        </div>

        <!-- Bed Slots Allocation Breakdown -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
            <span>Bed Space Allocations</span>
            <span class="text-slate-500 font-normal lowercase">{{ activeRoom.availableBeds }} of {{ activeRoom.totalBeds }} vacant</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div
              v-for="bed in activeRoom.beds"
              :key="bed.id"
              class="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs"
            >
              <div class="flex items-center gap-2">
                <BedDouble class="w-3.5 h-3.5 text-slate-400" />
                <span class="font-semibold text-slate-900">{{ bed.bed_label }}</span>
              </div>
              <AppBadge :variant="bed.isOccupied ? 'danger' : 'success'" size="sm">
                {{ bed.isOccupied ? 'Occupied' : 'Vacant' }}
              </AppBadge>
            </div>
          </div>
        </div>

        <!-- Booking CTA inside Gallery -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span class="text-[11px] text-slate-500 block">Monthly Rate</span>
            <p class="text-lg font-bold text-slate-900 font-mono">{{ formatCurrency(activeRoom.startingRate) }}/mo</p>
          </div>
          <AppButton
            variant="primary"
            size="md"
            :disabled="activeRoom.availableBeds === 0"
            @click="openInquiry(activeRoom); showGalleryModal = false"
          >
            <span>Inquire This Room</span>
          </AppButton>
        </div>
      </div>
    </AppModal>

    <!-- Modal: In-Person Viewing Inquiry -->
    <AppModal
      :show="showInquiryModal"
      title="Inquire & Schedule Viewing"
      :description="`Inquire about available bedspaces in Room ${inquiryRoom?.room_number || ''}`"
      max-width="md"
      @close="showInquiryModal = false"
    >
      <div v-if="inquirySuccess" class="py-8 text-center space-y-2">
        <CheckCircle2 class="w-12 h-12 text-emerald-500 mx-auto" />
        <h4 class="text-base font-bold text-slate-900">Inquiry Received</h4>
        <p class="text-xs text-slate-600">
          Our property manager (Maria Santos Reyes) will contact you at {{ guestContact }} shortly to confirm your viewing schedule.
        </p>
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleInquirySubmit">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
          <input
            v-model="guestName"
            type="text"
            placeholder="e.g. Juan Dela Cruz"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Mobile / Viber Number</label>
          <input
            v-model="guestContact"
            type="tel"
            placeholder="e.g. 0917-123-4567"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Target Move-In Date</label>
          <input
            v-model="targetMoveIn"
            type="date"
            class="field-control"
            required
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Inquiry Questions or Requests (Optional)</label>
          <textarea
            v-model="guestNotes"
            rows="2"
            placeholder="e.g. Bringing desktop PC, prefer bottom bunk..."
            class="field-control"
          />
        </div>

        <div class="pt-2 flex justify-end gap-2">
          <AppButton variant="secondary" size="sm" @click="showInquiryModal = false">
            Cancel
          </AppButton>
          <AppButton variant="primary" size="sm" type="submit">
            Submit Inquiry
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>
