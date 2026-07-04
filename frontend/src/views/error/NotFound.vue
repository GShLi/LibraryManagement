<template>
  <div style="display:flex;justify-content:center;align-items:center;height:100vh">
    <el-result icon="warning" title="404" sub-title="页面未找到">
      <template #extra><el-button type="primary" @click="$router.push('/')">返回首页</el-button></template>
    </el-result>
  </div>
</template>
