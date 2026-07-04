<template>
  <div class="borrow-scanner">
    <el-input v-model="barcodeInput" placeholder="扫描/输入图书条码" @keyup.enter="handleAdd" clearable>
      <template #append>
        <el-button @click="handleAdd">添加</el-button>
      </template>
    </el-input>
    <el-table :data="books" style="width: 100%" max-height="300">
      <el-table-column prop="barcode" label="条码" width="180" />
      <el-table-column prop="title" label="书名" />
      <el-table-column label="操作" width="80">
        <template #default="{ $index }">
          <el-button type="danger" size="small" @click="handleRemove($index)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BorrowItem {
  barcode: string
  title: string
}

const props = defineProps<{
  books: BorrowItem[]
}>()

const emit = defineEmits<{
  add: [barcode: string]
  remove: [index: number]
}>()

const barcodeInput = ref('')

function handleAdd() {
  const barcode = barcodeInput.value.trim()
  if (!barcode) return
  emit('add', barcode)
  barcodeInput.value = ''
}

function handleRemove(index: number) {
  emit('remove', index)
}
</script>
