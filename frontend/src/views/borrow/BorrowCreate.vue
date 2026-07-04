<template>
  <div class="page-container">
    <div class="page-header"><h3>借书</h3></div>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card header="Step 1: 识别读者">
          <el-input v-model="readerNo" placeholder="读者证号/手机号" @keyup.enter="searchReader" clearable>
            <template #append><el-button @click="searchReader" :loading="searchingReader">查询</el-button></template>
          </el-input>
        </el-card>
        <el-card header="Step 2: 扫描图书" style="margin-top:16px">
          <BorrowScanner :books="selectedBooks" @add="handleAddBook" @remove="handleRemoveBook" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card v-if="reader" header="读者信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="姓名">{{ reader.name }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ formatReaderType(reader.readerType) }}</el-descriptions-item>
            <el-descriptions-item label="当前借阅">{{ reader.currentBorrowed }}/{{ reader.borrowLimit }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ formatReaderStatus(reader.status) }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card v-if="selectedBooks.length > 0" header="已选图书" style="margin-top:16px">
          <el-table :data="selectedBooks">
            <el-table-column prop="barcode" label="条码" />
            <el-table-column prop="title" label="书名" />
          </el-table>
          <el-form-item label="借阅天数" style="margin-top:12px">
            <el-input-number v-model="borrowDays" :min="1" :max="365" />
          </el-form-item>
          <el-button type="primary" :loading="borrowing" @click="handleBorrow" style="width:100%">确认借出 ({{ selectedBooks.length }} 本)</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { list as listReaders } from '@/utils/api/reader'
import { list as listBooks } from '@/utils/api/book'
import { create as borrowCreate } from '@/utils/api/borrow'
import { formatReaderType, formatReaderStatus } from '@/utils/format'
import type { Reader } from '@/types'
import BorrowScanner from '@/components/borrow/BorrowScanner.vue'

interface BorrowItem { barcode: string; title: string }
const readerNo = ref('')
const searchingReader = ref(false)
const reader = ref<Reader | null>(null)
const selectedBooks = ref<BorrowItem[]>([])
const borrowDays = ref(30)
const borrowing = ref(false)

async function searchReader() {
  if (!readerNo.value.trim()) return
  searchingReader.value = true
  try {
    const result = await listReaders({ keyword: readerNo.value.trim(), pageSize: 1 })
    if (result.list.length > 0) { reader.value = result.list[0] }
    else { ElMessage.warning('未找到该读者') }
  } catch { /* handled */ } finally { searchingReader.value = false }
}

async function handleAddBook(barcode: string) {
  if (selectedBooks.value.some(b => b.barcode === barcode)) { ElMessage.warning('该书已在列表中'); return }
  try {
    const result = await listBooks({ keyword: barcode, pageSize: 1 })
    if (result.list.length > 0) { selectedBooks.value.push({ barcode, title: result.list[0].title }) }
    else { ElMessage.warning('未找到该图书') }
  } catch { /* handled */ }
}

function handleRemoveBook(index: number) { selectedBooks.value.splice(index, 1) }

async function handleBorrow() {
  if (!reader.value) { ElMessage.warning('请先识别读者'); return }
  if (selectedBooks.value.length === 0) { ElMessage.warning('请添加图书'); return }
  borrowing.value = true
  try {
    const result = await borrowCreate({ readerNo: reader.value.readerNo, barcodes: selectedBooks.value.map(b => b.barcode), borrowDays: borrowDays.value })
    ElMessage.success(`借书成功！共 ${result.borrowRecords.length} 本`)
    selectedBooks.value = []; reader.value = null
  } catch { /* handled */ } finally { borrowing.value = false }
}
</script>
