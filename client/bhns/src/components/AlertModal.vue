<script setup lang="ts">
import { alertModalState, closeNeoAlert } from '../composables/useAlert'
</script>
<template>
  <Teleport to="body">
    <div v-if="alertModalState.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" @click.self="closeNeoAlert">
      <div class="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] w-full max-w-sm">
        
        <div class="bg-red-500 border-b-4 border-black p-4 flex justify-between items-center text-white">
          <h3 class="font-black uppercase tracking-wider text-sm">System Notice</h3>
          <button @click="closeNeoAlert" class="font-bold hover:text-black px-2 transition-colors">✕</button>
        </div>
        
        <div class="p-8 font-mono text-sm font-bold text-center leading-relaxed">
          {{ alertModalState.message }}
        </div>
        
        <div class="p-4 border-t-4 border-black bg-[#EAE8DD]">
          <button @click="closeNeoAlert" class="w-full bg-black text-white border-2 border-black py-2 font-bold uppercase shadow-[4px_4px_0_0_#000] hover:bg-teal-700 hover:translate-y-1 transition-all">
            Understood
          </button>
        </div>
        
      </div>
    </div>
  </Teleport>
</template>