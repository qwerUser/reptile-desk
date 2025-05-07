<!--
 * @Description: 
 * @Date: 2025-04-28 08:16:08
 * @LastEditTime: 2025-05-07 16:57:52
-->
<template>
  <div class="task-list">
    <div style="margin: 10px 0;">
      <el-button type="primary" @click="createTask">新增任务</el-button>
    </div>
    <el-table
      :data="tableData"
      border
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="name" label="Name" />
      <el-table-column prop="code" label="Code" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="preview(scope.row)">查看</el-button>
          <el-button link type="primary" size="small" @click="handleTask(scope.row)">执行任务</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" title="验证码" width="500" center>
      <div class="code-container flex align-items-center">
        <el-input
          v-model="code"
          placeholder="请输入验证码"
          style="width: 240px;"
        />
        <img :src="codeImg" alt="">
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCode">
            提交
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTaskList, runTaskById } from '@/ipc/index';
import { ElLoading, ElMessage } from 'element-plus'

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

const preview = (data) => {
  console.log('preview', data);
  router.push({
    path: '/createTask',
    query: {
      id: data.id
    }
  })
}

const loading = ref();

const codeImg = ref('');
const dialogVisible = ref(false);
const code = ref('');
const randomCode = ref('');
const taskId = ref('');
const startIndex = ref(0);
const resetTaskData = () => {
  codeImg.value = '';
  code.value = false;
  randomCode.value = '';
  taskId.value = '';
  startIndex.value = 0;
}
// 提交验证码
const confirmCode = () => {
  loading.value = ElLoading.service();
  dialogVisible.value = false;
  runTaskById(taskId.value, { randomCode: randomCode.value, startIndex: startIndex.value, code: code.value }).then(res => {
    console.log(res);
    if(res.type === 'waitCode') {
      codeImg.value = res.imgData;
      randomCode.value = res.randomStr;
      startIndex.value = res.startIndex;
      dialogVisible.value = true;
    } else {
      ElMessage.success('执行成功');
      resetTaskData();
    }

    loading.value.close();
  }).catch(e => {
    console.log(e);
    ElMessage.error('执行失败');
    loading.value.close();
  });
}
const handleTask = (data) => {
  
  ElMessage.success('开始执行');
  loading.value = ElLoading.service();
  runTaskById(data.id).then(res => {
    console.log(res);
    if(res.type === 'waitCode') {
      taskId.value = data.id;
      codeImg.value = res.imgData;
      randomCode.value = res.randomStr;
      startIndex.value = res.startIndex;
      dialogVisible.value = true;
    } else {
      ElMessage.success('执行成功');
      resetTaskData();
    }

    loading.value.close();
  }).catch(e => {
    console.log(e);
    ElMessage.error('执行失败');
    loading.value.close();
  });
}

const createTask = () => {
  router.push({
    path: '/createTask'
  })
}

onMounted(() => {
  getTaskList().then(res => {
    console.log(res);
    tableData.value = (res || []).map(item => {
      return item;
    });
  }).catch(e => {
    console.log(e)
  })
})
</script>

<style scoped>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}
.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
.code-container {
  
}
</style>