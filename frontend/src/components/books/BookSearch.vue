<template>
  <div class="search-form">
    <el-form :model="filters" inline>
      <el-form-item label="书名">
        <el-input v-model="filters.keyword" placeholder="书名关键词" clearable />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="filters.author" placeholder="作者" clearable />
      </el-form-item>
      <el-form-item label="ISBN">
        <el-input v-model="filters.isbn" placeholder="ISBN" clearable />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="filters.categoryCode" placeholder="全部分类" clearable>
          <el-option v-for="cat in categories" :key="cat.code" :label="cat.name" :value="cat.code" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getTree } from '@/utils/api/category'
import type { CategoryItem } from '@/types'

const props = defineProps<{
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  search: []
}>()

const filters = reactive<Record<string, unknown>>({
  keyword: '',
  author: '',
  isbn: '',
  categoryCode: ''
})

const categories = reactive<CategoryItem[]>([])

onMounted(async () => {
  try {
    const result = await getTree({ flat: true })
    categories.push(...(result.list || []))
  } catch {
    // ignore
  }
})

function handleSearch() {
  emit('update:modelValue', { ...filters })
  emit('search')
}

function handleReset() {
  filters.keyword = ''
  filters.author = ''
  filters.isbn = ''
  filters.categoryCode = ''
  emit('update:modelValue', { ...filters })
  emit('search')
}
</script>
