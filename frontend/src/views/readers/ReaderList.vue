<template>
  <div class="page-container">
    <div class="page-header"><h3>读者管理</h3></div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="正常" value="active" />
            <el-option label="已冻结" value="frozen" />
            <el-option label="已挂失" value="lost" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="filters.readerType" placeholder="全部" clearable>
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="职工" value="staff" />
            <el-option label="外部读者" value="external" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filters.keyword" placeholder="姓名/证号" clearable />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="readerNo" label="读者证号" width="160" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="readerType" label="类型" width="80">
          <template #default="{ row }">{{ formatReaderType(row.readerType) }}</template>
        </el-table-column>
        <el-table-column label="当前借阅" width="110">
          <template #default="{ row }">{{ row.currentBorrowed }}/{{ row.borrowLimit }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'lost' ? 'warning' : 'danger'" size="small">{{ formatReaderStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="110">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/admin/readers/${row.userId}`)">详情</el-button>
            <el-button size="small" :type="row.status === 'lost' ? 'success' : 'warning'" @click="toggleStatus(row)">{{ row.status === 'lost' ? '解挂' : '挂失' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :total="total" v-model:page="page" v-model:page-size="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { list, updateStatus } from '@/utils/api/reader'
import { formatDate, formatReaderType, formatReaderStatus } from '@/utils/format'
import type { Reader } from '@/types'
import Pagination from '@/components/common/Pagination.vue'

const router = useRouter()
const loading = ref(false)
const list = ref<Reader[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive({ status: '', readerType: '', keyword: '' })

async function fetchData() {
  loading.value = true
  try {
    const result = await list({ page: page.value, pageSize: pageSize.value, ...filters })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchData() }

async function toggleStatus(row: Reader) {
  const newStatus = row.status === 'lost' ? 'active' : 'lost'
  await updateStatus(row.userId, newStatus)
  ElMessage.success(newStatus === 'active' ? '解挂成功' : '已挂失')
  fetchData()
}

fetchData()
</script>
