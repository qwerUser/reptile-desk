<!--
 * @Description: 
 * @Date: 2025-04-27 15:54:11
 * @LastEditTime: 2025-04-28 10:05:58
-->
<template>
  <div class="flex app-container" style="width: 100%;height: 100%;">
    <div style="width: 200px;height: 100%;overflow-y: auto;border-right: 1px solid #dcdfe6;">
      <el-menu :router="true" :default-active="activeMenu" class="el-menu-demo" @select="handleSelect">
        <el-menu-item v-for="(item, index) in menuList" :key="index" :index="item.index">{{ item.title }}</el-menu-item>
      </el-menu>
    </div>
    <div class="flex-1" style="overflow: auto;padding: 20px;">
      <RouterView />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
console.log(route.path)

const activeMenu = ref('/')
const menuList = ref([
  { index: '/', title: '首页' },
  { index: '/taskDataList', title: '数据列表' },
  // { index: '/curriculumVitae', title: '简历工具' },
  // { index: '/other', title: '其他' }
])

watch(() => route.path, (newVal) => {
  if (newVal) {
    activeMenu.value = newVal;
  }
})
const handleSelect = (key: string) => {
  activeMenu.value = key
}
</script>

<style scoped>
::v-deep .el-menu{
  border-right: none;
}
</style>