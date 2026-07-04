<template>
  <div class="app-header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <span class="title">图书管理系统</span>
    </div>
    <div class="header-right">
      <el-dropdown trigger="click">
        <span class="user-info">
          <el-icon><UserFilled /></el-icon>
          {{ authStore.currentUser?.username }} ({{ roleLabel }})
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/admin/profile')">
              <el-icon><User /></el-icon> 个人中心
            </el-dropdown-item>
            <el-dropdown-item @click="showChangePwdDialog = true">
              <el-icon><Lock /></el-icon> 修改密码
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
              <el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-dialog v-model="showChangePwdDialog" title="修改密码" width="400px" @close="resetPwdForm">
      <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showChangePwdDialog = false">取消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="handleChangePwd">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { formatRole } from '@/utils/format'
import { changePassword } from '@/utils/api/user'
import { getUser } from '@/utils/auth'
import { Fold, Expand, UserFilled, ArrowDown, User, Lock, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

const roleLabel = computed(() => formatRole(authStore.currentUser?.role || ''))

const showChangePwdDialog = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref<FormInstance>()

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度 8-32 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

function resetPwdForm() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdFormRef.value?.resetFields()
}

async function handleChangePwd() {
  const valid = await pwdFormRef.value?.validate().catch(() => false)
  if (!valid) return
  
  pwdLoading.value = true
  try {
    const user = getUser()
    if (user) {
      await changePassword(user.id, pwdForm.oldPassword, pwdForm.newPassword)
      ElMessage.success('密码修改成功')
      showChangePwdDialog.value = false
    }
  } catch {
    // error handled by interceptor
  } finally {
    pwdLoading.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: #409eff;
  }
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  .user-info {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    color: #606266;
    font-size: 14px;
  }
}
</style>
