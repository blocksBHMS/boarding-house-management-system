import { ref } from 'vue'

export const alertModalState = ref({
  isOpen: false,
  message: ''
})

export const neoAlert = (message: string) => {
  alertModalState.value = {
    isOpen: true,
    message
  }
}

export const closeNeoAlert = () => {
  alertModalState.value.isOpen = false
}