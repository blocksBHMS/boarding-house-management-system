export function peso(value: number | string | null | undefined): string {
  const v = Number(value) || 0
  const hasFraction = Math.abs(v % 1) > 0
  return '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: hasFraction ? 2 : 0, maximumFractionDigits: 2 })
}

function parts(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

export function fmtDate(iso: string): string {
  const p = parts(iso)
  if (!p) return iso
  return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtMonth(iso: string): string {
  const p = parts(iso)
  if (!p) return iso
  return new Date(p[0], p[1] - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Today as YYYY-MM-DD in local time. */
export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Current month as YYYY-MM in local time. */
export function thisMonth(): string {
  return todayISO().slice(0, 7)
}