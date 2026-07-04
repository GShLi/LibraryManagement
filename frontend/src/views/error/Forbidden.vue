<template>
  <div style="display:flex;justify-content:center;align-items:center;height:100vh">
    <el-result icon="warning" title="403" sub-title="无权限访问此页面">
      <template #extra><el-button type="primary" @click="$router.push('/')">返回首页</el-button></template>
    </el-result>
  </div>
</template>
