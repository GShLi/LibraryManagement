import type { RouteRecordRaw } from 'vue-router'

const errorRoutes: RouteRecordRaw[] = [
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/NotFound.vue'),
    meta: { title: '404' }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/Forbidden.vue'),
    meta: { title: '403' }
  }
]

export default errorRoutes
