<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import Icon from '../ui/Icon.vue'
import { currentUser } from '../../services/session'

const emit = defineEmits<{ menu: [] }>()
const route = useRoute()
const user = currentUser()
</script>

<template>
  <header class="mb-6 flex items-center gap-3 border-b-2 border-ink pb-3">
    <button type="button" class="btn btn-sm md:hidden" aria-label="Open menu" @click="emit('menu')">
      <Icon name="menu" :size="20" />
    </button>

    <nav aria-label="Breadcrumb" class="flex min-w-0 flex-1 items-center gap-2 text-sm">
      <RouterLink to="/overview" aria-label="Overview" class="text-ink"><Icon name="home" :size="18" /></RouterLink>
      <Icon name="chevron" :size="14" />
      <span>Workspace</span>
      <template v-if="route.meta.group">
        <Icon name="chevron" :size="14" /><span class="hidden sm:inline">{{ route.meta.group }}</span>
        <Icon name="chevron" :size="14" class="hidden sm:inline" />
      </template>
      <template v-else><Icon name="chevron" :size="14" /></template>
      <span class="truncate font-semibold">{{ route.meta.title }}</span>
    </nav>

    <div class="flex items-center gap-3">
      <div class="hidden text-right leading-tight sm:block">
        <p class="font-semibold">{{ user.name }}</p>
        <p class="text-sm capitalize text-muted">{{ user.role }}</p>
      </div>
      <span class="grid size-11 place-items-center rounded-full border-2 border-ink bg-leaf font-display text-xl font-bold text-white" aria-hidden="true">
        {{ user.initials }}
      </span>
    </div>
  </header>
</template>