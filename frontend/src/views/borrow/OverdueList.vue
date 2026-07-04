<template>
  <div class="page-container">
    <div class="page-header"><h3>逾期管理</h3></div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="readerName" label="读者" />
        <el-table-column prop="readerNo" label="读者证号" />
        <el-table-column prop="bookTitle" label="书名" show-overflow-tooltip />
        <el-table-column prop="barcode" label="条码" />
        <el-table-column label="借书日期" :formatter="(_r:any,_c:any,_i:any) => formatDate(_r.borrowDate)" />
        <el-table-column prop="dueDate" label="应还日期" />
        <el-table-column prop="overdueDays" label="逾期天数" />
        <el-table-column label="罚款">
          <template #default="{ row }">
            <span v-if="row.fine">¥{{ row.fine.amount }} ({{ row.fine.status === 'unpaid' ? '未缴' : '已缴' }})</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button v-if="row.fine?.status === 'unpaid'" size="small" type="warning" @click="handlePay(row)">缴纳罚款</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listOverdue } from '@/utils/api/borrow'
import { pay } from '@/utils/api/fine'
import { formatDate } from '@/utils/format'
import type { OverdueRecord } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const loading = ref(false)
const list = ref<OverdueRecord[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

async function fetchData() {
  loading.value = true
  try {
    const result = await listOverdue({ page: page.value, pageSize: pageSize.value })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

async function handlePay(row: OverdueRecord) {
  if (!row.fine?.fineId) return
  try { await pay(row.fine.fineId); ElMessage.success('罚款已标记为已缴纳'); fetchData() }
  catch { /* handled */ }
}

fetchData()
</script>
