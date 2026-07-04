<template>
  <div class="page-container">
    <div class="page-header"><h3>仪表盘</h3></div>
    <div class="dashboard-cards" v-loading="loading">
      <el-card class="stat-card" v-for="card in statCards" :key="card.label">
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getOverview } from '@/utils/api/stats'
import type { OverviewStats } from '@/types'

const loading = ref(false)
const statCards = reactive([
  { label: '馆藏图书', value: 0 }, { label: '馆藏副本', value: 0 },
  { label: '当前借出', value: 0 }, { label: '逾期未还', value: 0 },
  { label: '注册读者', value: 0 }, { label: '未缴罚款', value: 0 },
  { label: '今日借出', value: 0 }, { label: '今日归还', value: 0 }
])

onMounted(async () => {
  loading.value = true
  try {
    const data: OverviewStats = await getOverview()
    statCards[0].value = data.totalBooks; statCards[1].value = data.totalCopies
    statCards[2].value = data.totalBorrowed; statCards[3].value = data.totalOverdue
    statCards[4].value = data.totalReaders; statCards[5].value = data.totalFinesUnpaid
    statCards[6].value = data.todayBorrows; statCards[7].value = data.todayReturns
  } catch { /* ignore */ } finally { loading.value = false }
})
</script>
