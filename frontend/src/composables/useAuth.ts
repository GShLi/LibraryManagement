import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const currentUser = computed(() => authStore.currentUser)

  async function login(username: string, password: string, rememberMe: boolean = false) {
    await authStore.login({ username, password, rememberMe })
    if (authStore.isAdmin || authStore.isLibrarian) {
      router.push('/admin/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }

  async function logout() {
    authStore.logout()
    router.push('/login')
  }

  function checkPermission(role: string | string[]): boolean {
    return authStore.hasPermission(role)
  }

  return {
    authStore,
    isLoggedIn,
    currentUser,
    login,
    logout,
    checkPermission
  }
}
