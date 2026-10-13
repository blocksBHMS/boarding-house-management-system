import { reactive } from 'vue'

export interface Toast { id: number; tone: 'ok' | 'error' | 'info'; text: string }

export const toasts = reactive<Toast[]>([])
let counter = 0

export function toast(text: string, tone: Toast['tone'] = 'ok'): void {
  const id = ++counter
  toasts.push({ id, tone, text })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, tone === 'error' ? 7000 : 4000)
}