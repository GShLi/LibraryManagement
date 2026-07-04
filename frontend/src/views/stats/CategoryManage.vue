<template>
  <div class="page-container">
    <div class="page-header"><h3>分类管理</h3></div>
    <div class="table-container">
      <el-table :data="categories" v-loading="loading" stripe row-key="code">
        <el-table-column prop="code" label="分类号" width="150" />
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="level" label="层级" width="80" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTree } from '@/utils/api/category'
import type { CategoryItem } from '@/types'

const categories = ref<CategoryItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await getTree({ flat: true })
    categories.value = result.list || []
  } catch { /* handled */ } finally { loading.value = false }
})
</script>
