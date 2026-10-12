<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, ShieldCheck, Building2, UserCheck, KeyRound } from 'lucide-vue-next'
import { useHouseStore } from '@/stores/useHouseStore'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const store = useHouseStore()
const username = ref('')
const password = ref('')
const errorMessage = ref('')

function continueAs(userId: number) {
  const account = store.accounts.find((item) => item.id === userId)
  if (!account) return
  store.login(account.id)
  router.push(account.role === 'landlord' ? '/admin' : '/portal')
}

function handleLogin() {
  errorMessage.value = ''
  const account = store.accounts.find(
    (item) => item.username.toLowerCase() === username.value.trim().toLowerCase()
  )
  if (!account) {
    errorMessage.value = 'We could not find an account with that username in this demo.'
    return
  }
  continueAs(account.id)
}
</script>

<template>
  <div class="mx-auto max-w-4xl py-6 sm:py-12">
    <button
      class="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      type="button"
      @click="router.push('/')"
    >
      <ArrowLeft class="h-3.5 w-3.5" />
      <span>Back to Property Overview</span>
    </button>

    <div class="enterprise-card overflow-hidden shadow-card grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      <!-- Left Branded Column -->
      <aside class="bg-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-6">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Building2 class="w-4 h-4" />
            </div>
            <span class="text-base font-bold text-white tracking-tight">BlocksBHMS</span>
          </div>

          <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
            Secure Portal Access
          </span>
          <h1 class="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Your stay,<br />
            streamlined.
          </h1>
          <p class="mt-4 text-xs text-slate-400 leading-relaxed max-w-xs">
            Review monthly utility statements, submit facility maintenance tickets, and track bedspace contracts in real time.
          </p>
        </div>

        <!-- Quick 1-Click Demo Profiles -->
        <div class="mt-10 pt-6 border-t border-slate-800">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Instant 1-Click Demo Profiles
          </p>
          <div class="space-y-2">
            <button
              class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
              type="button"
              @click="continueAs(1)"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="store.accounts.find(a => a.id === 1)?.avatarUrl"
                  :src="store.accounts.find(a => a.id === 1)?.avatarUrl"
                  class="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div v-else class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  MR
                </div>
                <div>
                  <strong class="block text-xs text-white group-hover:text-indigo-300 transition-colors">
                    Maria Santos Reyes
                  </strong>
                  <span class="text-[10px] text-slate-400">Landlord Operations Command</span>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              class="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
              type="button"
              @click="continueAs(2)"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="store.accounts.find(a => a.id === 2)?.avatarUrl"
                  :src="store.accounts.find(a => a.id === 2)?.avatarUrl"
                  class="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div v-else class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  JD
                </div>
                <div>
                  <strong class="block text-xs text-white group-hover:text-indigo-300 transition-colors">
                    Juan Dela Cruz
                  </strong>
                  <span class="text-[10px] text-slate-400">Resident Portal (Room 201)</span>
                </div>
              </div>
              <ArrowRight class="h-4 w-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Right Form Column -->
      <section class="p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
        <div>
          <div class="mb-6">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Account Authentication
            </span>
            <h2 class="text-2xl font-bold text-slate-950 tracking-tight">Sign In</h2>
            <p class="text-xs text-slate-500 mt-1">
              Enter your assigned username to access your dashboard.
            </p>
          </div>

          <form class="space-y-4" @submit.prevent="handleLogin">
            <div
              v-if="errorMessage"
              role="alert"
              class="p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 font-medium"
            >
              {{ errorMessage }}
            </div>

            <div>
              <label for="username" class="mb-1 block text-xs font-semibold text-slate-700">Username</label>
              <input
                id="username"
                v-model="username"
                class="field-control"
                type="text"
                autocomplete="username"
                placeholder="e.g. maria_admin or juan_dc"
                required
              />
            </div>

            <div>
              <label for="password" class="mb-1 block text-xs font-semibold text-slate-700">Password</label>
              <input
                id="password"
                v-model="password"
                class="field-control"
                type="password"
                autocomplete="current-password"
                placeholder="Any password in prototype mode"
                required
              />
            </div>

            <div class="pt-2">
              <AppButton type="submit" variant="primary" size="lg" class="w-full">
                <span>Sign In To Account</span>
                <ArrowRight class="w-4 h-4 ml-1" />
              </AppButton>
            </div>
          </form>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span class="flex items-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
            Encrypted Session
          </span>
          <span>BlocksBHMS v2.0 Enterprise</span>
        </div>
      </section>
    </div>
  </div>
</template>
