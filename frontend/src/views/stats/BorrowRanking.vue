<template>
  <div class="page-container">
    <div class="page-header"><h3>借阅排行</h3></div>
    <div class="search-form">
      <el-form :model="filters" inline>
        <el-form-item label="开始日期">
          <el-date-picker v-model="filters.startDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="filters.endDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="排行数">
          <el-input-number v-model="filters.topN" :min="1" :max="100" />
        </el-form-item>
        <el-form-item><el-button type="primary" @click="fetchData">查询</el-button></el-form-item>
      </el-form>
    </div>
    <div class="table-container">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column prop="rank" label="排名" width="60" />
        <el-table-column prop="title" label="书名" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="borrowCount" label="借阅次数" width="100" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import dayjs from 'dayjs'
import { getBorrowRanking } from '@/utils/api/stats'
import type { BorrowRankingItem } from '@/types'

const loading = ref(false)
const list = ref<BorrowRankingItem[]>([])
const filters = reactive({
  startDate: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  topN: 20
})

async function fetchData() {
  loading.value = true
  try {
    const result = await getBorrowRanking(filters)
    list.value = result.list
  } catch { list.value = [] } finally { loading.value = false }
}

fetchData()
</script>
