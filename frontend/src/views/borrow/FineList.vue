<template>
  <div class="page-container">
    <div class="page-header"><h3>罚款管理</h3></div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="未缴" value="unpaid" />
            <el-option label="已缴" value="paid" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="readerName" label="读者" />
        <el-table-column prop="readerNo" label="读者证号" />
        <el-table-column prop="bookTitle" label="书名" show-overflow-tooltip />
        <el-table-column prop="overdueDays" label="逾期天数" />
        <el-table-column prop="amount" label="金额">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }"><el-tag :type="row.status === 'unpaid' ? 'danger' : 'success'" size="small">{{ row.status === 'unpaid' ? '未缴' : '已缴' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }"><el-button v-if="row.status === 'unpaid'" size="small" type="warning" @click="handlePay(row)">标记已缴</el-button></template>
        </el-table-column>
      </el-table>
      <Pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { list as listFines, pay } from '@/utils/api/fine'
import type { Fine } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const loading = ref(false)
const list = ref<Fine[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({ status: '' })

async function fetchData() {
  loading.value = true
  try {
    const result = await listFines({ page: page.value, pageSize: pageSize.value, status: filters.status || undefined })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchData() }

async function handlePay(row: Fine) {
  try { await pay(row.id); ElMessage.success('罚款已标记为已缴纳'); fetchData() }
  catch { /* handled */ }
}

fetchData()
</script>
