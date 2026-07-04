import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

import request from '@/utils/request'
import { login, register, getMe, logout } from '@/utils/api/auth'

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should login and return token', async () => {
    const mockPost = vi.mocked(request.post)
    mockPost.mockResolvedValue({
      data: {
        code: 200, message: 'ok',
        data: { token: 'jwt-token', user: { id: 1, username: 'admin', role: 'admin' } }
      }
    })

    const result = await login({ username: 'admin', password: 'pass' })
    expect(result.token).toBe('jwt-token')
    expect(result.user.username).toBe('admin')
  })

  it('should register user', async () => {
    const mockPost = vi.mocked(request.post)
    mockPost.mockResolvedValue({
      data: { code: 201, message: 'ok', data: { userId: 1, username: 'newuser', readerNo: 'R-001' } }
    })

    const result = await register({ username: 'newuser', password: 'pass', name: 'New', phone: '13800138000' })
    expect(result.userId).toBe(1)
    expect(result.readerNo).toBe('R-001')
  })

  it('should get current user', async () => {
    const mockGet = vi.mocked(request.get)
    mockGet.mockResolvedValue({
      data: { code: 200, message: 'ok', data: { id: 1, username: 'admin', role: 'admin' } }
    })

    const result = await getMe()
    expect(result.username).toBe('admin')
  })

  it('should logout', async () => {
    const mockPost = vi.mocked(request.post)
    mockPost.mockResolvedValue({ data: { code: 200, message: 'ok', data: null } })

    await expect(logout()).resolves.toBeUndefined()
  })
})
