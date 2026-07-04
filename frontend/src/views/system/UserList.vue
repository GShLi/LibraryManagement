<template>
  <div class="page-container">
    <div class="page-header">
      <h3>用户管理</h3>
      <el-button type="primary" @click="showCreateDialog = true">创建用户</el-button>
    </div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部" clearable>
            <el-option label="系统管理员" value="admin" />
            <el-option label="图书管理员" value="librarian" />
            <el-option label="读者" value="reader" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="正常" value="active" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">{{ formatRole(row.role) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">{{ row.status === 'active' ? '正常' : '已禁用' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" :formatter="(_r:any,_c:any,_i:any) => formatDate(_r.createdAt)" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="showEditDialog(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 'disabled' ? 'success' : 'warning'" @click="toggleStatus(row)">{{ row.status === 'disabled' ? '启用' : '禁用' }}</el-button>
            <el-button size="small" @click="showResetPwd(row)">重置密码</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { list, updateStatus, resetPassword, deleteUser } from '@/utils/api/user'
import { formatRole, formatDate } from '@/utils/format'
import type { User } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const loading = ref(false)
const list = ref<User[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({ role: '', status: '', keyword: '' })
const showCreateDialog = ref(false)

async function fetchData() {
  loading.value = true
  try {
    const result = await list({ page: page.value, pageSize: pageSize.value, ...filters })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchData() }

async function toggleStatus(row: User) {
  const newStatus = row.status === 'disabled' ? 'active' : 'disabled'
  await updateStatus(row.id, newStatus)
  ElMessage.success(newStatus === 'active' ? '已启用' : '已禁用')
  fetchData()
}

function showEditDialog(_row: User) { ElMessage.info('编辑功能开发中') }
function showResetPwd(_row: User) { ElMessage.info('密码重置功能开发中') }

async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(`确认删除用户 ${row.username}？`, '确认删除', { type: 'warning' })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch { /* cancelled */ }
}

fetchData()
</script>
