import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('token', () => {
    it('should set and get token', () => {
      setToken('test-token')
      expect(getToken()).toBe('test-token')
    })

    it('should remove token', () => {
      setToken('test-token')
      removeToken()
      expect(getToken()).toBeNull()
    })

    it('should return null when no token', () => {
      expect(getToken()).toBeNull()
    })
  })

  describe('user', () => {
    it('should set and get user', () => {
      const user = { id: 1, username: 'admin', role: 'admin' as const }
      setUser(user)
      expect(getUser()).toEqual(user)
    })

    it('should remove user', () => {
      setUser({ id: 1, username: 'admin', role: 'admin' as const })
      removeUser()
      expect(getUser()).toBeNull()
    })

    it('should return null when no user', () => {
      expect(getUser()).toBeNull()
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'not-valid-json')
      expect(getUser()).toBeNull()
    })
  })
})
