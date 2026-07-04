<template>
  <el-container class="layout-container">
    <el-aside :width="appStore.sidebarCollapsed ? '64px' : '220px'" class="layout-aside">
      <AppSidebar />
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <AppHeader />
      </el-header>
      <AppBreadcrumb />
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppBreadcrumb from '@/components/common/AppBreadcrumb.vue'

const appStore = useAppStore()
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #304156;
  overflow-y: auto;
  transition: width 0.3s;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.layout-main {
  background: #f0f2f5;
  min-height: calc(100vh - 100px);
}
</style>
