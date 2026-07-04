<template>
  <div class="page-container">
    <div class="page-header"><h3>逾期统计</h3></div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="维度">
          <el-select v-model="filters.dimension">
            <el-option label="按读者" value="reader" />
            <el-option label="按图书" value="book" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="fetchData">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="rank" label="排名" width="60" />
        <el-table-column v-if="filters.dimension === 'reader'" prop="readerName" label="读者" />
        <el-table-column v-if="filters.dimension === 'reader'" prop="readerNo" label="读者证号" />
        <el-table-column v-if="filters.dimension === 'book'" prop="title" label="书名" show-overflow-tooltip />
        <el-table-column v-if="filters.dimension === 'book'" prop="author" label="作者" />
        <el-table-column prop="overdueCount" label="逾期次数" />
        <el-table-column prop="totalFineAmount" label="罚款总额">
          <template #default="{ row }">¥{{ row.totalFineAmount }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getOverdueStats } from '@/utils/api/stats'
import type { OverdueStatsItem } from '@/types'

const loading = ref(false)
const list = ref<OverdueStatsItem[]>([])
const filters = reactive({ dimension: 'reader' })

async function fetchData() {
  loading.value = true
  try {
    const result = await getOverdueStats({ dimension: filters.dimension })
    list.value = result.list.map((item, index) => ({ ...item, rank: index + 1 }))
  } catch { list.value = [] } finally { loading.value = false }
}

fetchData()
</script>
