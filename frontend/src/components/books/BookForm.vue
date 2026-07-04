<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="ISBN" prop="isbn" required>
      <el-input v-model="form.isbn" :disabled="mode === 'edit'" placeholder="请输入ISBN" />
    </el-form-item>
    <el-form-item label="书名" prop="title" required>
      <el-input v-model="form.title" placeholder="请输入书名" />
    </el-form-item>
    <el-form-item label="作者" prop="author" required>
      <el-input v-model="form.author" placeholder="请输入作者" />
    </el-form-item>
    <el-form-item label="出版社" prop="publisher" required>
      <el-input v-model="form.publisher" placeholder="请输入出版社" />
    </el-form-item>
    <el-form-item label="出版日期" prop="publishDate" required>
      <el-date-picker v-model="form.publishDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" />
    </el-form-item>
    <el-form-item label="分类号" prop="categoryCode" required>
      <el-input v-model="form.categoryCode" placeholder="请输入中图法分类号" />
    </el-form-item>
    <el-form-item label="定价" prop="price" required>
      <el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" />
    </el-form-item>
    <el-form-item label="页数">
      <el-input-number v-model="form.pages" :min="0" style="width:100%" />
    </el-form-item>
    <el-form-item label="语种">
      <el-input v-model="form.language" placeholder="默认：中文" />
    </el-form-item>
    <el-form-item label="版次">
      <el-input v-model="form.edition" placeholder="如：第4版" />
    </el-form-item>
    <el-form-item label="入库数量" v-if="mode === 'create'">
      <el-input-number v-model="form.copyCount" :min="1" :max="100" style="width:100%" />
    </el-form-item>
    <el-form-item label="馆藏位置">
      <el-input v-model="form.location" placeholder="如：A区-3排-5层" />
    </el-form-item>
    <el-form-item label="内容简介">
      <el-input v-model="form.description" type="textarea" :rows="3" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
      <el-button @click="router.back()">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { type FormInstance, type FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: Record<string, unknown>
  mode: 'create' | 'edit'
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  submit: []
}>()

const router = useRouter()
const formRef = ref<FormInstance>()

const form = reactive({
  isbn: props.modelValue.isbn || '',
  title: props.modelValue.title || '',
  author: props.modelValue.author || '',
  publisher: props.modelValue.publisher || '',
  publishDate: props.modelValue.publishDate || '',
  categoryCode: props.modelValue.categoryCode || '',
  price: props.modelValue.price || 0,
  pages: props.modelValue.pages || undefined,
  language: props.modelValue.language || '中文',
  edition: props.modelValue.edition || '',
  copyCount: props.modelValue.copyCount || 1,
  location: props.modelValue.location || '',
  description: props.modelValue.description || ''
})

const rules: FormRules = {
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  title: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  publishDate: [{ required: true, message: '请选择出版日期', trigger: 'change' }],
  categoryCode: [{ required: true, message: '请输入分类号', trigger: 'blur' }],
  price: [{ required: true, message: '请输入定价', trigger: 'blur' }]
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('update:modelValue', { ...form })
  emit('submit')
}
</script>
