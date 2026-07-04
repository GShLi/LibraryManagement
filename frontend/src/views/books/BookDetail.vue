<template>
  <div class="page-container">
    <div class="table-container" v-loading="loading">
      <template v-if="book">
        <el-descriptions title="图书详情" :column="2" border>
          <el-descriptions-item label="ISBN">{{ book.isbn }}</el-descriptions-item>
          <el-descriptions-item label="书名">{{ book.title }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ book.author }}</el-descriptions-item>
          <el-descriptions-item label="出版社">{{ book.publisher }}</el-descriptions-item>
          <el-descriptions-item label="出版日期">{{ book.publishDate }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ book.categoryCode }} {{ book.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="定价">¥{{ book.price }}</el-descriptions-item>
          <el-descriptions-item label="页数">{{ book.pages || '-' }}</el-descriptions-item>
          <el-descriptions-item label="语种">{{ book.language }}</el-descriptions-item>
          <el-descriptions-item label="版次">{{ book.edition || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="book.status === 'active' ? 'success' : 'danger'">{{ book.status === 'active' ? '正常' : '已下架' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可借/总数">{{ book.availableCopies }}/{{ book.totalCopies }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top:20px"><el-button @click="router.back()">返回</el-button></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getById } from '@/utils/api/book'
import type { Book } from '@/types'

const route = useRoute()
const router = useRouter()
const book = ref<Book | null>(null)
const loading = ref(true)

onMounted(async () => {
  try { book.value = await getById(Number(route.params.id)) }
  catch { router.push('/admin/books') }
  finally { loading.value = false }
})
</script>
