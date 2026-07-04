import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getToken } from '@/utils/auth'
import { getUser } from '@/utils/auth'

import authRoutes from './modules/auth'
import adminRoutes from './modules/admin'
import errorRoutes from './modules/error'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/admin/dashboard'
  },
  ...authRoutes,
  ...adminRoutes,
  ...errorRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const publicRoutes = ['/login', '/register', '/404', '/403']

router.beforeEach((to, _from, next) => {
  const token = getToken()
  const user = getUser()

  if (token && user) {
    if (to.path === '/login' || to.path === '/register') {
      if (user.role === 'admin' || user.role === 'librarian') {
        next('/admin/dashboard')
      } else {
        next('/admin/dashboard')
      }
      return
    }

    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      const requiredRoles = to.meta.roles as string[]
      if (!requiredRoles.includes(user.role)) {
        next('/403')
        return
      }
    }

    next()
  } else {
    if (publicRoutes.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
