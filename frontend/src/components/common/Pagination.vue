<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :total="total"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  total: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
}>(), {
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [size: number]
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

function handlePageChange(page: number) {
  emit('update:page', page)
}

function handleSizeChange(size: number) {
  emit('update:pageSize', size)
}
</script>

<style scoped lang="scss">
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
