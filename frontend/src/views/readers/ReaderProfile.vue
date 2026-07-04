<template>
  <div class="page-container">
    <el-card header="基本信息" v-loading="loading">
      <template v-if="reader">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="读者证号">{{ reader.readerNo }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{ reader.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ reader.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ reader.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ formatReaderType(reader.readerType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ formatReaderStatus(reader.status) }}</el-descriptions-item>
          <el-descriptions-item label="当前借阅">{{ reader.currentBorrowed }}/{{ reader.borrowLimit }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getById } from '@/utils/api/reader'
import { getUser } from '@/utils/auth'
import { formatReaderType, formatReaderStatus } from '@/utils/format'
import type { Reader } from '@/types'

const reader = ref<Reader | null>(null)
const loading = ref(true)

onMounted(async () => {
  const user = getUser()
  if (user) {
    try { reader.value = await getById(user.id) }
    catch { /* handled */ } finally { loading.value = false }
  }
})
</script>
