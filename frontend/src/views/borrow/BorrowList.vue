<template>
  <div class="page-container">
    <div class="page-header"><h3>借阅记录</h3></div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="借阅中" value="borrowing" />
            <el-option label="已归还" value="returned" />
            <el-option label="逾期" value="overdue" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="readerName" label="读者" width="100" />
        <el-table-column prop="readerNo" label="读者证号" width="160" />
        <el-table-column prop="bookTitle" label="书名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="barcode" label="条码" width="160" />
        <el-table-column label="借书日期" width="110">
          <template #default="{ row }">{{ formatDate(row.borrowDate) }}</template>
        </el-table-column>
        <el-table-column prop="dueDate" label="应还日期" width="110" />
        <el-table-column label="归还日期" width="110">
          <template #default="{ row }">{{ formatDate(row.returnDate) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'borrowing' ? 'primary' : row.status === 'overdue' ? 'danger' : 'success'" size="small">
              {{ formatBorrowStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="renewCount" label="续借次数" width="80" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button v-if="row.status === 'borrowing'" size="small" type="primary" @click="handleReturn(row)">还书</el-button>
            <el-button v-if="row.status === 'borrowing'" size="small" @click="handleRenew(row)">续借</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { list as listBorrows, returnBook, renew } from '@/utils/api/borrow'
import { formatDate, formatBorrowStatus } from '@/utils/format'
import type { BorrowRecord } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const loading = ref(false)
const list = ref<BorrowRecord[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({ status: '' })

async function fetchData() {
  loading.value = true
  try {
    const result = await listBorrows({ page: page.value, pageSize: pageSize.value, status: filters.status || undefined })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchData() }

async function handleReturn(row: BorrowRecord) {
  try {
    const result = await returnBook(row.id)
    if (result.overdue) { ElMessage.warning(`还书成功，逾期 ${result.overdueDays} 天`) }
    else { ElMessage.success('还书成功') }
    fetchData()
  } catch { /* handled */ }
}

async function handleRenew(row: BorrowRecord) {
  try {
    const result = await renew(row.id)
    ElMessage.success(`续借成功，新应还日期: ${result.newDueDate}`)
    fetchData()
  } catch { /* handled */ }
}

fetchData()
</script>
