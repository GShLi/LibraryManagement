<template>
  <div class="page-container">
    <div class="page-header"><h3>还书</h3></div>
    <el-card>
      <ReturnScanner @found="handleFound" />
      <div v-if="borrowInfo" class="table-container" style="margin-top:20px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="借阅ID">{{ borrowInfo.id }}</el-descriptions-item>
          <el-descriptions-item label="书名">{{ borrowInfo.bookTitle }}</el-descriptions-item>
          <el-descriptions-item label="读者">{{ borrowInfo.readerName }} ({{ borrowInfo.readerNo }})</el-descriptions-item>
          <el-descriptions-item label="条码">{{ borrowInfo.barcode }}</el-descriptions-item>
          <el-descriptions-item label="借书日期">{{ borrowInfo.borrowDate }}</el-descriptions-item>
          <el-descriptions-item label="应还日期">{{ borrowInfo.dueDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="borrowInfo.status === 'overdue' ? 'danger' : 'success'">{{ borrowInfo.status === 'overdue' ? '已逾期' : '借阅中' }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" :loading="returning" @click="handleReturn" style="margin-top:16px">确认归还</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { returnBook } from '@/utils/api/borrow'
import type { BorrowRecord } from '@/types'
import ReturnScanner from '@/components/borrow/ReturnScanner.vue'

const borrowInfo = ref<BorrowRecord | null>(null)
const returning = ref(false)

function handleFound(info: Record<string, unknown>) { borrowInfo.value = info as BorrowRecord }

async function handleReturn() {
  if (!borrowInfo.value) return
  returning.value = true
  try {
    const result = await returnBook(borrowInfo.value.id)
    if (result.overdue) { ElMessage.warning(`还书成功，逾期 ${result.overdueDays} 天，罚款 ¥${result.fine?.amount || 0}`) }
    else { ElMessage.success('还书成功') }
    borrowInfo.value = null
  } catch { /* handled */ } finally { returning.value = false }
}
</script>
