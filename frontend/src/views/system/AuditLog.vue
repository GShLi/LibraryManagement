<template>
  <div class="page-container">
    <div class="page-header"><h3>操作日志</h3></div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="操作类型">
          <el-input v-model="filters.action" placeholder="操作类型" clearable />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column label="时间">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="username" label="操作人" width="100" />
        <el-table-column prop="ipAddress" label="IP" width="140" />
        <el-table-column prop="action" label="操作类型" width="120" />
        <el-table-column label="详情">
          <template #default="{ row }"><el-button size="small" @click="showDetail(row)">查看</el-button></template>
        </el-table-column>
      </el-table>
      <Pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { getLogs } from '@/utils/api/system'
import { formatDate } from '@/utils/format'
import type { AuditLog } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const loading = ref(false)
const list = ref<AuditLog[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({ action: '' })

async function fetchData() {
  loading.value = true
  try {
    const result = await getLogs({ page: page.value, pageSize: pageSize.value, action: filters.action || undefined })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchData() }

function showDetail(row: AuditLog) {
  ElMessageBox.alert(row.detail, '操作详情')
}

fetchData()
</script>
