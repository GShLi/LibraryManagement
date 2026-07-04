<template>
  <div class="return-scanner">
    <el-input v-model="barcode" placeholder="扫描/输入图书条码" @keyup.enter="searchBorrow" clearable>
      <template #append>
        <el-button @click="searchBorrow" :loading="loading">查询</el-button>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listByBookId } from '@/utils/api/bookCopy'
import { list as listBorrows } from '@/utils/api/borrow'

const emit = defineEmits<{
  found: [borrowInfo: Record<string, unknown>]
}>()

const barcode = ref('')
const loading = ref(false)

async function searchBorrow() {
  const val = barcode.value.trim()
  if (!val) return

  loading.value = true
  try {
    // Search for borrowing records that match this barcode
    const result = await listBorrows({ status: 'borrowing' })
    const found = result.list.find(item => item.barcode === val)
    if (found) {
      emit('found', found)
    } else {
      ElMessage.warning('未找到该条码的借阅记录')
    }
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>
