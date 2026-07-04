<template>
  <div class="app-sidebar">
    <div class="logo">
      <span v-if="!appStore.sidebarCollapsed">图书管理系统</span>
      <span v-else>图书</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      router
    >
      <el-menu-item index="/admin/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>
      
      <el-sub-menu index="books">
        <template #title>
          <el-icon><Reading /></el-icon>
          <span>图书管理</span>
        </template>
        <el-menu-item index="/admin/books">图书列表</el-menu-item>
        <el-menu-item index="/admin/books/add">图书入库</el-menu-item>
        <el-menu-item index="/admin/categories">分类管理</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="borrow">
        <template #title>
          <el-icon><Tickets /></el-icon>
          <span>借阅管理</span>
        </template>
        <el-menu-item index="/admin/borrow">借书</el-menu-item>
        <el-menu-item index="/admin/return">还书</el-menu-item>
        <el-menu-item index="/admin/borrows">借阅记录</el-menu-item>
        <el-menu-item index="/admin/overdue">逾期管理</el-menu-item>
        <el-menu-item index="/admin/fines">罚款管理</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="readers">
        <template #title>
          <el-icon><User /></el-icon>
          <span>读者管理</span>
        </template>
        <el-menu-item index="/admin/readers">读者列表</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu index="stats">
        <template #title>
          <el-icon><DataAnalysis /></el-icon>
          <span>统计分析</span>
        </template>
        <el-menu-item index="/admin/stats/overview">概览统计</el-menu-item>
        <el-menu-item index="/admin/stats/borrow-ranking">借阅排行</el-menu-item>
        <el-menu-item index="/admin/stats/overdue">逾期统计</el-menu-item>
      </el-sub-menu>
      
      <el-sub-menu v-if="authStore.isAdmin" index="system">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </template>
        <el-menu-item index="/admin/users">用户管理</el-menu-item>
        <el-menu-item index="/admin/settings">系统配置</el-menu-item>
        <el-menu-item index="/admin/logs">操作日志</el-menu-item>
        <el-menu-item index="/admin/backup">数据备份</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { Odometer, Reading, Tickets, User, DataAnalysis, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
</script>

<style scoped lang="scss">
.app-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  span {
    white-space: nowrap;
    overflow: hidden;
  }
}

.el-menu {
  border-right: none;
  flex: 1;
}
</style>
