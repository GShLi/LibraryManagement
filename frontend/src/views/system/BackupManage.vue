<template>
  <div class="page-container">
    <div class="page-header">
      <h3>数据备份</h3>
      <el-button type="primary" :loading="creating" @click="handleCreateBackup">创建备份</el-button>
    </div>
    <div class="table-container">
      <el-table :data="backups" v-loading="loading" stripe>
        <el-table-column prop="filename" label="文件名" show-overflow-tooltip />
        <el-table-column prop="fileSize" label="文件大小" :formatter="(_r:any,_c:any,_i:any) => formatFileSize(_r.fileSize)" />
        <el-table-column label="创建时间">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }"><el-button size="small" type="warning" @click="handleRestore(row)">恢复</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listBackups, createBackup, restoreBackup } from '@/utils/api/system'
import { formatDate, formatFileSize } from '@/utils/format'
import type { BackupItem } from '@/types'

const loading = ref(true)
const creating = ref(false)
const backups = ref<BackupItem[]>([])

async function fetchBackups() {
  loading.value = true
  try { const result = await listBackups(); backups.value = result.list || [] }
  catch { backups.value = [] } finally { loading.value = false }
}

async function handleCreateBackup() {
  creating.value = true
  try { await createBackup(); ElMessage.success('备份创建成功'); await fetchBackups() }
  catch { /* handled */ } finally { creating.value = false }
}

async function handleRestore(row: BackupItem) {
  try {
    await ElMessageBox.confirm('恢复将替换当前数据库，确认继续？', '确认恢复', { type: 'warning' })
    await restoreBackup(row.id)
    ElMessage.success('数据恢复成功')
  } catch { /* cancelled */ }
}

onMounted(() => { fetchBackups() })
</script>
