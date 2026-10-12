<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Wifi,
  Shield,
  Zap,
  Users,
  DoorOpen,
  Sparkles,
  Search,
  Eye,
} from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import { propertyBuildingPhoto } from '@/mocks/seedData'
import { formatCurrency } from '@/utils/formatters'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'

const store = useHouseStore()
const router = useRouter()

const rooms = computed(() =>
  store.detailedRooms.filter((room) => room.availableBeds > 0).slice(0, 3)
)

function navigateToExplore() {
  router.push('/explore')
}
</script>

<template>
  <div class="space-y-16 pb-20 pt-6">
    <!-- Luxury Co-Living Hero Section -->
    <section class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
      <!-- Left Editorial Column -->
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
          <MapPin class="w-3.5 h-3.5 text-indigo-600" />
          <span>Sampaloc, Manila • University Belt</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
          Boarding living,<br />
          <span class="text-indigo-600">elevated.</span>
        </h1>

        <p class="text-base text-slate-600 leading-relaxed max-w-lg">
          Thoughtfully operated student and professional residences in Manila. Experience clear submetered utility billing, high-speed fiber mesh Wi-Fi, and 24/7 on-site management.
        </p>

        <!-- Interactive Quick Explore Widget -->
        <div class="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3 max-w-lg">
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <div class="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 w-full text-xs text-slate-600">
              <DoorOpen class="w-4 h-4 text-slate-400" />
              <span>Air-Conditioned & Fan Rooms Available</span>
            </div>

            <AppButton
              variant="primary"
              size="md"
              class="w-full sm:w-auto shrink-0 shadow-xs"
              @click="navigateToExplore"
            >
              <span>Explore Spaces</span>
              <ArrowRight class="w-4 h-4 ml-1" />
            </AppButton>
          </div>

          <div class="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-500">
            <div class="flex items-center gap-1.5 font-medium text-emerald-700">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{{ store.vacantBedsCount }} of {{ store.totalBedsCount }} Bed Spaces Ready</span>
            </div>
            <span>Move-in immediately</span>
          </div>
        </div>
      </div>

      <!-- Right Curated Photo Showcase -->
      <div class="relative">
        <div class="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200/60 relative">
          <img
            :src="propertyBuildingPhoto"
            alt="Blocks Boarding House Residence"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          <!-- Floating Info Pill over photo -->
          <div class="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg text-slate-900 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-950 leading-tight">Blocks Residences</p>
              <p class="text-[11px] text-slate-500 mt-0.5">1248 Loyola St., Sampaloc • Near LRT-2</p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-indigo-600 block">From ₱2,200/mo</span>
              <span class="text-[10px] text-slate-400">All utilities metered</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Core Pillars -->
    <section class="space-y-6 pt-4">
      <div class="max-w-xl">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
          Designed For Focus
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
          Hospitality Standards for Daily Boarding
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <article class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
            <Zap class="w-5 h-5" />
          </div>
          <h3 class="text-sm font-bold text-slate-900">Submetered Utility Clarity</h3>
          <p class="mt-2 text-xs text-slate-500 leading-relaxed">
            No unexpected utility surcharges. Electricity and water consumption are tracked and itemized transparently on your monthly statement.
          </p>
        </article>

        <article class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
            <Wifi class="w-5 h-5" />
          </div>
          <h3 class="text-sm font-bold text-slate-900">High-Speed Fiber Mesh</h3>
          <p class="mt-2 text-xs text-slate-500 leading-relaxed">
            Dedicated enterprise access points on each floor ensure reliable connectivity for online classes, research, and remote work.
          </p>
        </article>

        <article class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 mb-4">
            <Shield class="w-5 h-5" />
          </div>
          <h3 class="text-sm font-bold text-slate-900">Digital Resident Ledger</h3>
          <p class="mt-2 text-xs text-slate-500 leading-relaxed">
            Settle balances through GCash or bank transfer with instant digital receipts, and submit maintenance tickets directly to management.
          </p>
        </article>
      </div>
    </section>

    <!-- Curated Rooms Preview -->
    <section class="space-y-6 pt-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Immediate Move-In
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Featured Available Rooms
          </h2>
        </div>

        <AppButton variant="outline" size="sm" @click="navigateToExplore">
          <span>View All {{ store.totalRoomsCount }} Rooms</span>
          <ArrowRight class="w-3.5 h-3.5 ml-1" />
        </AppButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article
          v-for="room in rooms"
          :key="room.id"
          class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
          @click="navigateToExplore"
        >
          <div>
            <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                :src="room.imageUrl"
                :alt="`Room ${room.room_number}`"
                class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div class="absolute top-3 left-3">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-xs flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {{ room.availableBeds }} Beds Open
                </span>
              </div>
            </div>

            <div class="p-5 space-y-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="text-base font-bold text-slate-900">Room {{ room.room_number }}</h3>
                  <p class="text-xs text-slate-500">{{ room.category }} • {{ room.floor }}</p>
                </div>
                <div class="text-right">
                  <span class="text-base font-extrabold text-slate-900 block font-mono">
                    {{ formatCurrency(room.startingRate) }}
                  </span>
                  <span class="text-[10px] text-slate-400 block -mt-0.5">/ mo</span>
                </div>
              </div>
              <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {{ room.description }}
              </p>
            </div>
          </div>

          <div class="px-5 pb-5 pt-0">
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:text-indigo-700">
              <span>Inspect bed allocations</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Resident Portal CTA -->
    <section class="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div class="space-y-2 max-w-xl">
        <span class="text-xs font-bold uppercase tracking-wider text-indigo-400">Resident Services</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Already a resident at Blocks?
        </h2>
        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Access your digital statement of account, settle payments via GCash, or submit facility maintenance tickets directly.
        </p>
      </div>

      <AppButton
        variant="primary"
        size="lg"
        class="shrink-0 bg-indigo-600 hover:bg-indigo-500 shadow-xs"
        @click="router.push('/login')"
      >
        <span>Sign In to Portal</span>
        <ArrowRight class="w-4 h-4 ml-1" />
      </AppButton>
    </section>
  </div>
</template>
