<template>
  <div class="page-container">
    <div class="page-header"><h3>图书入库</h3></div>
    <div class="table-container">
      <BookForm mode="create" v-model="formData" :loading="submitting" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { create } from '@/utils/api/book'
import BookForm from '@/components/books/BookForm.vue'
import type { BookFormData } from '@/types'

const router = useRouter()
const submitting = ref(false)
const formData = reactive<Record<string, unknown>>({
  isbn: '', title: '', author: '', publisher: '', publishDate: '',
  categoryCode: '', price: 0, copyCount: 1, location: '', description: ''
})

async function handleSubmit() {
  submitting.value = true
  try {
    const result = await create(formData as unknown as BookFormData)
    ElMessage.success(`入库成功！生成 ${result.barcodes.length} 个副本`)
    router.push('/admin/books')
  } catch { /* handled */ } finally { submitting.value = false }
}
</script>
