<template>
  <div class="page-container">
    <div class="page-header">
      <h3>图书列表</h3>
      <el-button type="primary" @click="router.push('/admin/books/add')">图书入库</el-button>
    </div>
    <BookSearch v-model="filters" @search="handleSearch" />
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe style="width:100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="isbn" label="ISBN" width="150" />
        <el-table-column prop="title" label="书名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="publisher" label="出版社" width="150" show-overflow-tooltip />
        <el-table-column prop="publishDate" label="出版日期" width="110" :formatter="(_r:any,_c:any,_i:any) => formatDate(_r.publishDate)" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="price" label="定价" width="80">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="可借/总数" width="100">
          <template #default="{ row }">{{ row.availableCopies }}/{{ row.totalCopies }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '正常' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/admin/books/${row.id}`)">详情</el-button>
            <el-button size="small" type="primary" @click="router.push(`/admin/books/${row.id}/edit`)">编辑</el-button>
            <el-button v-if="row.status === 'active'" size="small" type="danger" @click="handleWithdraw(row)">下架</el-button>
            <el-button v-else size="small" type="success" @click="handleRestore(row)">上架</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { list, withdraw, restore } from '@/utils/api/book'
import { formatDate } from '@/utils/format'
import type { Book } from '@/types'
import BookSearch from '@/components/books/BookSearch.vue'
import Pagination from '@/components/common/Pagination.vue'

const router = useRouter()
const loading = ref(false)
const list = ref<Book[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filters = reactive<Record<string, unknown>>({ keyword: '', author: '', isbn: '', categoryCode: '' })

async function fetchBooks() {
  loading.value = true
  try {
    const result = await list({ page: page.value, pageSize: pageSize.value, ...filters })
    list.value = result.list; total.value = result.total
  } catch { list.value = [] } finally { loading.value = false }
}

function handleSearch() { page.value = 1; fetchBooks() }

async function handleWithdraw(row: Book) {
  try {
    await ElMessageBox.prompt('请输入下架原因（damaged/lost/outdated/other）', '图书下架', { confirmButtonText: '确认', cancelButtonText: '取消' })
    await withdraw(row.id, { reason: 'damaged' })
    ElMessage.success('下架成功'); fetchBooks()
  } catch { /* cancelled */ }
}

async function handleRestore(row: Book) {
  await restore(row.id)
  ElMessage.success('上架成功'); fetchBooks()
}

fetchBooks()
</script>
