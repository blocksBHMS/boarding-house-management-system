import axios from 'axios'

/** Turns a Django/DRF error response into one readable line. */
export function apiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return 'Cannot reach the server. Check that Django is running.'
    const data: unknown = err.response.data
    if (typeof data === 'string') return data.length > 0 && data.length < 200 ? data : fallback
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>
      if (typeof d.message === 'string') return d.message
      if (typeof d.detail === 'string') return d.detail
      const parts = Object.entries(d).map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(' ') : String(msg)}`)
      if (parts.length) return parts.join(' | ')
    }
  }
  return fallback
}