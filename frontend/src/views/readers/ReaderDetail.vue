<template>
  <div class="page-container">
    <div class="table-container" v-loading="loading">
      <template v-if="reader">
        <el-descriptions title="读者详情" :column="2" border>
          <el-descriptions-item label="读者证号">{{ reader.readerNo }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ reader.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ reader.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ reader.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ formatReaderType(reader.readerType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="reader.status === 'active' ? 'success' : 'danger'">{{ formatReaderStatus(reader.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前借阅">{{ reader.currentBorrowed }}/{{ reader.borrowLimit }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(reader.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </div>
    <el-card header="借阅历史" style="margin-top:20px">
      <el-table :data="historyList" v-loading="historyLoading" stripe>
        <el-table-column prop="bookTitle" label="书名" show-overflow-tooltip />
        <el-table-column prop="barcode" label="条码" />
        <el-table-column label="借书日期"><template #default="{ row }">{{ formatDate(row.borrowDate) }}</template></el-table-column>
        <el-table-column prop="dueDate" label="应还日期" />
        <el-table-column label="归还日期"><template #default="{ row }">{{ formatDate(row.returnDate) }}</template></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'borrowing' ? 'primary' : row.status === 'overdue' ? 'danger' : 'success'" size="small">{{ formatBorrowStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :total="historyTotal" v-model:page="historyPage" v-model:page-size="historyPageSize" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getById, getBorrowHistory } from '@/utils/api/reader'
import { formatDate, formatReaderType, formatReaderStatus, formatBorrowStatus } from '@/utils/format'
import type { Reader, BorrowRecord } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const route = useRoute()
const reader = ref<Reader | null>(null)
const loading = ref(true)
const historyList = ref<BorrowRecord[]>([])
const historyLoading = ref(false)
const historyTotal = ref(0)
const historyPage = ref(1)
const historyPageSize = ref(20)

onMounted(async () => {
  const id = Number(route.params.id)
  try { reader.value = await getById(id) } catch { /* handled */ } finally { loading.value = false }
  fetchHistory()
})

async function fetchHistory() {
  historyLoading.value = true
  try {
    const result = await getBorrowHistory(Number(route.params.id), { page: historyPage.value, pageSize: historyPageSize.value })
    historyList.value = result.list; historyTotal.value = result.total
  } catch { historyList.value = [] } finally { historyLoading.value = false }
}
</script>
