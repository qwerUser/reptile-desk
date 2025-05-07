<!--
 * @Description: 
 * @Date: 2025-04-28 08:16:08
 * @LastEditTime: 2025-05-06 15:30:18
-->
<template>
  <div class="create-task">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
    >
      <el-form-item label="任务名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入任务名称"
        />
      </el-form-item>
      <el-form-item label="Code" prop="code">
        <el-input
          v-model="formData.code"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item label="任务操作" prop="taskJson">
        <div class="action-list">
          <div
            class="action-item flex align-items-center"
            v-for="(item, index) in formData.taskJson"
            :key="index"
          >
            <div class="step-index">{{ index+1 }}</div>
            <el-select
              v-model="formData.taskJson[index].type"
              placeholder="操作类型"
              style="width: 160px"
            >
              <el-option
                v-for="item in typeEnum"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- 页面跳转展示 -->
            <el-input
              v-if="formData.taskJson[index].type === '1'"
              v-model="formData.taskJson[index].pageUrl"
              placeholder="请输入页面地址"
              style="width: 240px;"
            />
            <!-- 点击和输入展示 -->
            <el-input
              v-if="['2', '3', '6'].includes(formData.taskJson[index].type)"
              v-model="formData.taskJson[index].selector"
              placeholder="请输入元素选择器"
              style="width: 240px;"
            />
            <!-- 输入展示 -->
            <el-input
              v-if="['3'].includes(formData.taskJson[index].type)"
              v-model="formData.taskJson[index].inputVal"
              placeholder="请填写输入框内容"
              style="width: 240px;"
            />
            <!-- 接口拦截 -->
            <el-input
              v-if="['4'].includes(formData.taskJson[index].type)"
              v-model="formData.taskJson[index].apiUrl"
              placeholder="请输入接口地址"
              style="width: 240px;"
            />
            <el-input
              v-if="['5'].includes(formData.taskJson[index].type)"
              v-model="formData.taskJson[index].funName"
              placeholder="请输入自定义方法名,自定义方法需要自己在代码中实现"
              style="width: 240px;"
            />
            <!-- 点击和输入展示 -->
            <el-input
              v-if="['6'].includes(formData.taskJson[index].type)"
              v-model="formData.taskJson[index].imgSelector"
              placeholder="请输入图片验证码选择器"
              style="width: 240px;"
            />
            <el-input
              v-if="['6'].includes(formData.taskJson[index].type)"
              v-model="formData.taskJson[index].codeLength"
              placeholder="请输入验证码位数"
              style="width: 80px;"
            />
            <div class="plus-icon" @click="addTaskAction(index+1)"><Plus :size="12" /></div>
            <div class="minus-icon" @click="deleteTaskAction(index)"><Minus /></div>
          </div>
          <div>
            <el-button type="primary" @click="addTaskAction()">添加操作</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label=" ">
        <el-button @click="goBack()">返回</el-button>
        <el-button type="primary" @click="saveTaskAction()">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { createTaskCode, setTaskData, getTaskDataById, updateTaskData } from '@/ipc/index';
import { typeEnum } from './constant';
import { cloneDeep } from 'lodash-es';
import { Plus, Minus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

const actionBaseData = {
  type: '', // 类型
  pageUrl: '', // 跳转页面地址
  selector: '', // 元素选择器
  inputVal: '', // 输入框输入的值
  apiUrl: '', // 接口地址
  funName: '', // 自定义方法名
  imgSelector: '', // 图片验证码选择器
  codeLength: '', // 验证码位数
}
const formData = ref({
  name: '',
  code: '',
  taskJson: []
})
const rules = ref({
  name: [
    { required: true, message: '请输入任务名称', trigger: ['blur', 'change'] }
  ]
})

const addTaskAction = (index) => {
  console.log(index);
  if(index === undefined) {
    formData.value.taskJson.push(cloneDeep(actionBaseData));
    return;
  }
  formData.value.taskJson.splice(index, 0, cloneDeep(actionBaseData));
}

const deleteTaskAction = (index) => {
  formData.value.taskJson.splice(index, 1);
}


const checkJson = (rule, value, callback) => {
  
}


const editId = ref('');
onMounted(async () => {
  const code = await createTaskCode();
  formData.value.code = code;
  console.log(route.query)
  editId.value = route.query.id ?? '';
  console.log('editId:', editId.value);
  if(editId.value) {
    getTaskDataById(editId.value).then(res => {
      console.log(res);
      if(res && res.length > 0) {
        const resData = res[0];
        formData.value = {
          name: resData.name,
          code: resData.code,
          taskJson: JSON.parse(resData.taskJson)
        }
      }
    }).catch(e => {
      console.log(e);
    })
  } else {
    addTaskAction();
  }
})

const goBack = () => {
  router.back();
}

const formRef = ref();
const saveTaskAction = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      const { taskJson } = formData.value;
      for(let i = 0; i < taskJson.length; i++) {
        if(!taskJson[i].type) {
          ElMessage.error('请选择操作类型');
          return;
        }
        if(taskJson[i].type === '1') {
          if(!taskJson[i].pageUrl) {
            ElMessage.error('请输入页面地址');
            return;
          }
        }
        if(taskJson[i].type === '2') {
          if(!taskJson[i].selector) {
            ElMessage.error('请输入元素选择器');
            return;
          }
        }
        if(taskJson[i].type === '3') {
          if(!taskJson[i].selector) {
            ElMessage.error('请输入元素选择器');
            return;
          }
          if(!taskJson[i].inputVal) {
            ElMessage.error('请填写输入框内容');
            return;
          }
        }
        if(taskJson[i].type === '4') {
          if(!taskJson[i].apiUrl) {
            ElMessage.error('请输入接口地址');
            return;
          }
        }
        if(taskJson[i].type === '5') {
          if(!taskJson[i].funName) {
            ElMessage.error('请输入自定义方法名');
            return;
          }
        }
        
      }
      console.log(formData.value)
      const params = {
        ...formData.value,
        taskJson: JSON.stringify(taskJson)
      }
      if(editId.value) {
        updateTaskData(params, editId.value).then(res => {
          console.log(res)
          ElMessage.success('编辑成功');
          goBack();
        }).catch(e => {
          console.log(res)
        })
      } else {
        setTaskData(params).then(res => {
          console.log(res)
          ElMessage.success('创建成功');
          goBack();
        }).catch(e => {
          console.log(res)
        })
      }
      
    } else {
      console.log('error submit!')
    }
  })
  
}
</script>

<style scoped>
.step-index {
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  /* border-radius: 12px;
  border: 2px solid #409EFF;
  color: #409EFF; */
  margin-right: 5px;
}
.action-list {
  width: 100%;
}
.action-item {
  width: 100%;
  margin-bottom: 5px;
}
.plus-icon,
.minus-icon {
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 20px;
  margin-left: 5px;
  cursor: pointer;
}
.plus-icon {
  border: 2px solid #409EFF;
  color: #409EFF;
}
.minus-icon {
  border: 2px solid #F56C6C;
  color: #F56C6C;
  font-weight: bold;
}

</style>