<template>
  <div class="page-container">
    <div class="page-header"><h3>图书编辑</h3></div>
    <div class="table-container" v-loading="loading">
      <BookForm v-if="!loading" mode="edit" v-model="formData" :loading="submitting" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getById, update } from '@/utils/api/book'
import BookForm from '@/components/books/BookForm.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const formData = reactive<Record<string, unknown>>({})

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const book = await getById(id)
    Object.assign(formData, book)
  } catch { router.push('/admin/books') } finally { loading.value = false }
})

async function handleSubmit() {
  submitting.value = true
  try {
    await update(Number(route.params.id), formData)
    ElMessage.success('更新成功'); router.push('/admin/books')
  } catch { /* handled */ } finally { submitting.value = false }
}
</script>
