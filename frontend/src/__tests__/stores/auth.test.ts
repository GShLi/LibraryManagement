import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/utils/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/utils/auth', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  getUser: vi.fn(() => null),
  setUser: vi.fn(),
  removeUser: vi.fn()
}))

import { login, register, getMe } from '@/utils/api/auth'
import { getToken, setToken, getUser, setUser, removeToken, removeUser } from '@/utils/auth'

describe('AuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with no user', () => {
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(false)
    expect(store.currentUser).toBeNull()
  })

  it('should login successfully', async () => {
    const mockLogin = vi.mocked(login as any)
    mockLogin.mockResolvedValue({
      token: 'test-token',
      user: { id: 1, username: 'admin', role: 'admin' }
    })

    const store = useAuthStore()
    await store.login({ username: 'admin', password: 'pass', rememberMe: false })

    expect(store.isLoggedIn).toBe(true)
    expect(store.currentUser?.username).toBe('admin')
    expect(setToken).toHaveBeenCalledWith('test-token')
    expect(setUser).toHaveBeenCalled()
  })

  it('should logout and clear state', () => {
    const store = useAuthStore()
    store.logout()

    expect(store.isLoggedIn).toBe(false)
    expect(removeToken).toHaveBeenCalled()
    expect(removeUser).toHaveBeenCalled()
  })

  it('should check isAdmin role', () => {
    const store = useAuthStore()
    expect(store.isAdmin).toBe(false)
    store.user = { id: 1, username: 'admin', role: 'admin' }
    expect(store.isAdmin).toBe(true)
    expect(store.isLibrarian).toBe(false)
    expect(store.isReader).toBe(false)
  })

  it('should check hasPermission', () => {
    const store = useAuthStore()
    store.user = { id: 1, username: 'admin', role: 'admin' }
    expect(store.hasPermission('admin')).toBe(true)
    expect(store.hasPermission('librarian')).toBe(false)
    expect(store.hasPermission(['admin', 'librarian'])).toBe(true)
  })

  it('should register user', async () => {
    const mockRegister = vi.mocked(register as any)
    mockRegister.mockResolvedValue({ userId: 1, username: 'newuser', readerNo: 'R-001' })

    const store = useAuthStore()
    const result = await store.register({
      username: 'newuser', password: 'pass123', name: 'New', phone: '13800138000'
    })

    expect(result.username).toBe('newuser')
    expect(result.readerNo).toBe('R-001')
  })

  it('should fetch user info', async () => {
    const mockGetMe = vi.mocked(getMe as any)
    mockGetMe.mockResolvedValue({
      id: 1, username: 'admin', role: 'admin',
      reader: { name: 'Admin', readerNo: 'R-001' }
    })

    const store = useAuthStore()
    await store.fetchUser()

    expect(store.currentUser?.username).toBe('admin')
    expect(store.currentUser?.name).toBe('Admin')
  })
})
