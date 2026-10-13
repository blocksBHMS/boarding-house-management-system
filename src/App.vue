<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Topbar from './components/layout/Topbar.vue'
import ToastHost from './components/ui/ToastHost.vue'
import AlertModal from './components/AlertModal.vue'

const route = useRoute()
const menu = ref(false)
watch(() => route.path, () => { menu.value = false })
</script>

<template>
  <RouterView v-if="route.meta.bare" />
  <div v-else class="min-h-screen md:flex">
    <Sidebar :open="menu" @close="menu = false" />
    <div class="min-w-0 flex-1 p-4 md:p-8">
      <Topbar @menu="menu = true" />
      <main><RouterView /></main>
    </div>
  </div>
  <ToastHost />
  <AlertModal />
</template>