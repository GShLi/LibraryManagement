import type { UserInfo } from '@/types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUser(): UserInfo | null {
  const user = localStorage.getItem(USER_KEY)
  if (!user) return null
  try {
    return JSON.parse(user)
  } catch {
    return null
  }
}

export function setUser(user: UserInfo): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function getRememberMe(): boolean {
  return localStorage.getItem('rememberMe') === 'true'
}

export function setRememberMe(value: boolean): void {
  localStorage.setItem('rememberMe', String(value))
}
