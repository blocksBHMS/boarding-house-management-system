import type { Account } from '../types'

const KEYS = ['token', 'refresh', 'role', 'account']

export function saveSession(access: string, refresh: string, account: Partial<Account> & { role: string }, username: string): void {
  localStorage.setItem('token', access)
  localStorage.setItem('refresh', refresh)
  localStorage.setItem('role', account.role ?? '')
  localStorage.setItem('account', JSON.stringify({
    username: account.username ?? username,
    first_name: account.first_name ?? '',
    last_name: account.last_name ?? '',
    role: account.role ?? '',
  }))
}

export function clearSession(): void {
  KEYS.forEach((k) => localStorage.removeItem(k))
}

export function currentUser(): { name: string; role: string; initials: string } {
  let a: Partial<Account> = {}
  try { a = JSON.parse(localStorage.getItem('account') ?? '{}') as Partial<Account> } catch { a = {} }
  const full = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim()
  const name = full || a.username || 'Account'
  const role = a.role || localStorage.getItem('role') || ''
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => (w[0] ?? '').toUpperCase()).join('') || '?'
  return { name, role, initials }
}