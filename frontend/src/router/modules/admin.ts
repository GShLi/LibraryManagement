import type { RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: DefaultLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '仪表盘', roles: ['admin', 'librarian'] }
      },
      {
        path: 'books',
        name: 'BookList',
        component: () => import('@/views/books/BookList.vue'),
        meta: { title: '图书列表', roles: ['admin', 'librarian'] }
      },
      {
        path: 'books/add',
        name: 'BookAdd',
        component: () => import('@/views/books/BookAdd.vue'),
        meta: { title: '图书入库', roles: ['admin', 'librarian'] }
      },
      {
        path: 'books/:id/edit',
        name: 'BookEdit',
        component: () => import('@/views/books/BookEdit.vue'),
        meta: { title: '图书编辑', roles: ['admin', 'librarian'] }
      },
      {
        path: 'books/:id',
        name: 'BookDetail',
        component: () => import('@/views/books/BookDetail.vue'),
        meta: { title: '图书详情', roles: ['admin', 'librarian', 'reader'] }
      },
      {
        path: 'borrow',
        name: 'BorrowCreate',
        component: () => import('@/views/borrow/BorrowCreate.vue'),
        meta: { title: '借书', roles: ['admin', 'librarian'] }
      },
      {
        path: 'return',
        name: 'ReturnCreate',
        component: () => import('@/views/borrow/ReturnCreate.vue'),
        meta: { title: '还书', roles: ['admin', 'librarian'] }
      },
      {
        path: 'borrows',
        name: 'BorrowList',
        component: () => import('@/views/borrow/BorrowList.vue'),
        meta: { title: '借阅记录', roles: ['admin', 'librarian'] }
      },
      {
        path: 'overdue',
        name: 'OverdueList',
        component: () => import('@/views/borrow/OverdueList.vue'),
        meta: { title: '逾期管理', roles: ['admin', 'librarian'] }
      },
      {
        path: 'fines',
        name: 'FineList',
        component: () => import('@/views/borrow/FineList.vue'),
        meta: { title: '罚款管理', roles: ['admin', 'librarian'] }
      },
      {
        path: 'readers',
        name: 'ReaderList',
        component: () => import('@/views/readers/ReaderList.vue'),
        meta: { title: '读者管理', roles: ['admin', 'librarian'] }
      },
      {
        path: 'readers/:id',
        name: 'ReaderDetail',
        component: () => import('@/views/readers/ReaderDetail.vue'),
        meta: { title: '读者详情', roles: ['admin', 'librarian'] }
      },
      {
        path: 'stats/overview',
        name: 'StatsOverview',
        component: () => import('@/views/stats/Overview.vue'),
        meta: { title: '概览统计', roles: ['admin', 'librarian'] }
      },
      {
        path: 'stats/borrow-ranking',
        name: 'BorrowRanking',
        component: () => import('@/views/stats/BorrowRanking.vue'),
        meta: { title: '借阅排行', roles: ['admin', 'librarian'] }
      },
      {
        path: 'stats/overdue',
        name: 'OverdueStats',
        component: () => import('@/views/stats/OverdueStats.vue'),
        meta: { title: '逾期统计', roles: ['admin', 'librarian'] }
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('@/views/system/UserList.vue'),
        meta: { title: '用户管理', roles: ['admin'] }
      },
      {
        path: 'settings',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: { title: '系统配置', roles: ['admin'] }
      },
      {
        path: 'logs',
        name: 'AuditLog',
        component: () => import('@/views/system/AuditLog.vue'),
        meta: { title: '操作日志', roles: ['admin'] }
      },
      {
        path: 'backup',
        name: 'BackupManage',
        component: () => import('@/views/system/BackupManage.vue'),
        meta: { title: '数据备份', roles: ['admin'] }
      },
      {
        path: 'profile',
        name: 'ReaderProfile',
        component: () => import('@/views/readers/ReaderProfile.vue'),
        meta: { title: '个人中心', roles: ['reader'] }
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('@/views/stats/CategoryManage.vue'),
        meta: { title: '分类管理', roles: ['admin', 'librarian'] }
      }
    ]
  }
]

export default adminRoutes
