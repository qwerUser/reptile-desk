<!--
 * @Description: 
 * @Date: 2025-04-28 08:16:08
 * @LastEditTime: 2025-04-30 11:18:33
-->
<template>
  <div class="task-list">
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="taskCode" label="taskCode" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="preview(scope.row)">查看</el-button>
          <el-button link type="danger" size="small" @click="deleteData(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="接口数据" width="800">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="(item, index) in previewData.keys"
          :title="item"
          :key="index"
          :name="`${index+1}`"
        >
          <pre>{{JSON.stringify(JSON.parse(previewData.jsonData[item]), null, 2)}}</pre>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTaskDataList, deleteTaskData } from '@/ipc/index';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const tableData = ref([]);

const tableRowClassName = ({
  row,
  rowIndex,
}) => {
  if (rowIndex % 2 === 0) {
    return 'warning-row'
  } else if (rowIndex % 2 === 1) {
    return 'success-row'
  }
  return ''
}

const previewData = ref({});
const dialogVisible = ref(false);
const preview = (data) => {
  console.log('preview', data);
  previewData.value = data;
  dialogVisible.value = true;
}
const getList = () => {
  getTaskDataList().then(res => {
    console.log(res);
    tableData.value = (res || []).map(item => {
      const jsonData = item.json ? JSON.parse(item.json) : {};
      const keys = Object.keys(jsonData);
      return {
        ...item,
        jsonData,
        keys
      }
    });
  }).catch(e => {
    console.log(e)
  })
}

const deleteData = (data) => {
  ElMessageBox.confirm(
    '确定删除本条数据?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    }
  )
  .then(() => {
    deleteTaskData(data.id).then(res => {
      ElMessage.success('删除成功');
      getList();
    }).catch(e => {
      ElMessage.error('删除失败');
    })
  })
  .catch(() => {})
  
}

onMounted(() => {
  getList();
})
</script>

<style scoped>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
pre {
  margin: 0;
}
</style>