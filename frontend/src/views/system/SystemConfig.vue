<template>
  <div class="page-container">
    <div class="page-header"><h3>系统配置</h3></div>
    <el-card header="借阅规则" style="margin-bottom:20px">
      <el-form :model="form" label-width="200px">
        <el-form-item label="学生最大借阅册数">
          <el-input-number v-model="form.max_borrow_count_student" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="教师最大借阅册数">
          <el-input-number v-model="form.max_borrow_count_teacher" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="借阅天数">
          <el-input-number v-model="form.borrow_duration_days" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="续借天数">
          <el-input-number v-model="form.renew_duration_days" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="最大续借次数">
          <el-input-number v-model="form.max_renew_count" :min="1" :max="10" />
        </el-form-item>
      </el-form>
    </el-card>
    <div class="actions">
      <el-button type="primary" :loading="saving" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getConfigs, updateConfigs } from '@/utils/api/system'
import type { ConfigItem } from '@/types'

const saving = ref(false)
const form = reactive<Record<string, number>>({
  max_borrow_count_student: 5,
  max_borrow_count_teacher: 10,
  borrow_duration_days: 30,
  renew_duration_days: 30,
  max_renew_count: 1
})

onMounted(async () => {
  try {
    const result = await getConfigs()
    const configs: ConfigItem[] = result.list || []
    for (const item of configs) {
      if (item.configKey in form) {
        form[item.configKey] = Number(item.configValue)
      }
    }
  } catch { /* ignore */ }
})

async function handleSave() {
  saving.value = true
  try {
    const configs = Object.entries(form).map(([key, value]) => ({ configKey: key, configValue: String(value) }))
    await updateConfigs({ configs })
    ElMessage.success('配置保存成功')
  } catch { /* handled */ } finally { saving.value = false }
}
</script>
