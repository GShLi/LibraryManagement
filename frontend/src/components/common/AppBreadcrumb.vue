<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path" :to="index < breadcrumbs.length - 1 ? item.path : undefined">
        {{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  return route.matched
    .filter(item => item.meta?.title)
    .map(item => ({
      path: item.path,
      title: item.meta.title as string
    }))
})
</script>

<style scoped lang="scss">
.app-breadcrumb {
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}
</style>
