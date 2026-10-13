<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import Icon from '../ui/Icon.vue'
import { clearSession, currentUser } from '../../services/session'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const router = useRouter()

// Check if the logged-in user is a tenant nigga
const isTenant = currentUser().role === 'tenant'

// Filter out the nigga 'People' group if they are a tenant
const groups = [
  { label: '', items: [
    { to: '/overview', text: 'Overview', icon: 'home' },
  ] },
  { label: 'Property', items: [
    { to: '/rooms', text: 'Rooms', icon: 'rooms' },
    { to: '/beds', text: 'Beds', icon: 'bed' },
  ] },
  ...(isTenant ? [] : [{ 
    label: 'People', items: [
      { to: '/tenancies', text: 'Tenancies', icon: 'user' },
      { to: '/accounts', text: 'Accounts', icon: 'id' },
    ] 
  }]),
  { label: 'Money', items: [
    { to: '/invoices', text: 'Invoices', icon: 'file' },
    { to: '/invoice-items', text: 'Charges', icon: 'list' },
    { to: '/payments', text: 'Payments', icon: 'wallet' },
  ] },
]

function logout() {
  clearSession()
  router.push('/login')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-30 bg-ink/50 md:hidden" @click="emit('close')" />
  <aside :class="[
    'fixed inset-y-0 left-0 z-40 w-[280px] p-4 transition-transform md:sticky md:top-0 md:h-screen md:shrink-0 md:translate-x-0',
    open ? 'translate-x-0' : '-translate-x-full',
  ]">
    <div class="brut-card flex h-full flex-col overflow-y-auto p-4">
      <RouterLink to="/overview" class="flex items-center gap-3 pb-4 no-underline text-ink">
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
          <path d="M4 22 22 6l18 16v16H4z" fill="var(--color-teal)" stroke="var(--color-ink)" stroke-width="2.5" stroke-linejoin="miter" />
          <rect x="12" y="24" width="6" height="6" fill="var(--color-paper)" />
          <rect x="26" y="24" width="6" height="6" fill="var(--color-paper)" />
          <rect x="19" y="29" width="6" height="9" fill="var(--color-paper)" />
        </svg>
        <span class="leading-none">
          <span class="brut-title block text-4xl">BHMS.</span>
          <span class="block text-[0.7rem] uppercase leading-tight tracking-wide">Boarding house<br>management</span>
        </span>
      </RouterLink>

      <nav class="flex-1 border-t-2 border-ink pt-2" aria-label="Main">
        <div v-for="g in groups" :key="g.label">
          <p v-if="g.label" class="nav-group">{{ g.label }}</p>
          <RouterLink v-for="i in g.items" :key="i.to" :to="i.to" class="nav-link" active-class="nav-active">
            <Icon :name="i.icon" />
            <span>{{ i.text }}</span>
          </RouterLink>
        </div>
      </nav>

      <div class="border-t-2 border-ink pt-3">
        <button type="button" class="nav-link w-full" @click="logout">
          <Icon name="logout" /><span>Log out</span>
        </button>
        <p class="mt-3 px-3 text-xs text-muted">A little less admin. A little more home.</p> // uyyy
      </div>
    </div>
  </aside>
</template>