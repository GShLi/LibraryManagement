import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getMe, logout as logoutApi } from '@/utils/api/auth'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'
import type { UserInfo, LoginRequest, RegisterRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const user = ref<UserInfo | null>(getUser())

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isLibrarian = computed(() => user.value?.role === 'librarian')
  const isReader = computed(() => user.value?.role === 'reader')
  const currentUser = computed(() => user.value)

  async function login(data: LoginRequest) {
    const result = await loginApi(data)
    token.value = result.token
    user.value = result.user
    setToken(result.token)
    setUser(result.user)
    return result
  }

  async function register(data: RegisterRequest) {
    return await registerApi(data)
  }

  async function fetchUser() {
    try {
      const userData = await getMe()
      user.value = {
        id: userData.id,
        username: userData.username,
        role: userData.role as UserInfo['role'],
        name: userData.reader?.name,
        readerNo: userData.reader?.readerNo
      }
      setUser(user.value)
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    removeToken()
    removeUser()
    logoutApi().catch(() => {})
  }

  function hasPermission(role: string | string[]): boolean {
    if (!user.value) return false
    if (Array.isArray(role)) {
      return role.includes(user.value.role)
    }
    return user.value.role === role
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isLibrarian,
    isReader,
    currentUser,
    login,
    register,
    fetchUser,
    logout,
    hasPermission
  }
})
