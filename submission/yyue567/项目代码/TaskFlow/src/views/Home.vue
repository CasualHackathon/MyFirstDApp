<template>
  <div class="content">
    <!-- 发布按钮 -->
    <div class="pushlishContent">
      <el-button type="primary" round @click="openDialog">发布</el-button>
    </div>


    <div class="task-list" >
        <TaskCard  class="taskcard" style="width: 70%;"
        v-for="(task, index) in tasks" 
        :key="index" 
        :task="task" 
        />
    </div>

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="发布任务"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title" :rules="[{ required: true, message: '请输入标题', trigger: 'blur' }]">
          <el-input v-model="form.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description" :rules="[{ required: true, message: '请输入描述', trigger: 'blur' }]">
          <el-input
            type="textarea"
            v-model="form.description"
            placeholder="请输入描述"
            rows="3"
          ></el-input>
        </el-form-item>
        <el-form-item label="金额" prop="amount" :rules="[{ required: true, message: '请输入金额', trigger: 'blur' }]">
          <el-input-number v-model="form.amount" :min="0" placeholder="请输入"></el-input-number>
          <span style="margin-left: 5px;">U</span>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline" :rules="[{ required: true, message: '请选择截止时间', trigger: 'change' }]">
          <el-date-picker
            v-model="form.deadline"
            type="datetime"
            placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
            :disabled-time="disabledTime"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { User } from '@element-plus/icons-vue'
import { ElMessage, ElDialog } from 'element-plus'
import { ethers } from 'ethers'
import TaskCard from '../components/TaskCard.vue'
import { web3Service } from '../utils/web3Service'
import { eventBus } from '../utils/eventBus'

const info = ref({
  avatar: '', 
  nickname: 'Lucas'
})


const tasks = ref<any[]>([])

// 加载任务列表
const loadTasks = async () => {
  try {
      console.log('开始加载任务列表...');
      const allTasks = await web3Service.getTasks();
      console.log('从合约获取到的原始任务数据:', allTasks);
      
      tasks.value = allTasks.map((task: any) => ({
        id: task.id,
        amount: task.amount,
        deadline: new Date(Number(task.deadline) * 1000).toLocaleDateString(),
        user: { avatar: '', nickname: `User_${task.user.slice(0, 6)}` },
        title: task.title,
        description: task.description,
        status: 'open',
        publisher: task.user,
        worker: task.acceptedBy
      }));
      
      console.log('处理后的任务列表:', tasks.value);
  } catch (error) {
    console.error('加载任务失败:', error);
    // 如果合约未部署，使用模拟数据
    tasks.value = []
    // tasks.value = [
    // {
    //     id: 1,
    //     publisher:'0xBdCe3b372764561a1620115377D88729E5A58c98',
	  //     status:'open',
    //     amount: 100,
    //     deadline: '2025-08-30',
    //     title: '完成智能合约开发',
    //     description: '实现去中心化赏金平台智能合约，包括发布、领取和结算功能。',
    //     user: { avatar: '', nickname: 'Lucas' },
    //   },
    //  {
    //     id: 2,
    //     publisher:'0xBdCe3b372764561a1620115377D88729E5A58c98',
	  //     status:'open',
    //     amount: 100,
    //     deadline: '2025-08-30',
    //     title: '帮我吃饭',
    //     description: '帮我去吃一顿火锅。',
    //     user: { avatar: '', nickname: 'Lucas' },
    //   },
    // ]

  }
}

// 弹窗控制
const dialogVisible = ref(false)
const openDialog = () => {
    
  dialogVisible.value = true
}

// 表单
const formRef = ref()
const form = ref({
  title: '',
  description: '',
  amount: null,
  deadline: ''
})

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 禁用过去的时间（如果选择今天）
const disabledTime = (date: Date) => {
  if (date && date.toDateString() === new Date().toDateString()) {
    const now = new Date()
    return {
      disabledHours: () => Array.from({ length: now.getHours() }, (_, i) => i),
      disabledMinutes: (hour: number) => {
        if (hour === now.getHours()) {
          return Array.from({ length: now.getMinutes() }, (_, i) => i)
        }
        return []
      }
    }
  }
  return {}
}

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      // 打印表单内容
      console.log('表单内容:', {
        title: form.value.title,
        description: form.value.description,
        amount: form.value.amount,
        deadline: form.value.deadline
      });
      
      try {
        // 检查钱包连接
        // if (!web3Service.isConnected()) {
        //   ElMessage.warning('请先连接MetaMask钱包');
        //   return;
        // }

        // 将截止时间转换为时间戳
        // const deadlineTimestamp = Math.floor(new Date(form.value.deadline).getTime() / 1000);
        
        // 检查用户是否已注册
        // try {
        //   await web3Service.getUser();
        // } catch (error) {
        //   // 用户未注册，先注册
        //   ElMessage.info('正在注册用户...');
        //   await web3Service.registerUser();
        //   ElMessage.success('用户注册成功！');
        // }

        dialogVisible.value = false;
        // 发布任务
        ElMessage.info('正在发布任务到区块链...');
        const tx = await web3Service.createTask({
          title: form.value.title,
          description: form.value.description,
          amount: (form.value.amount || 0).toString(),
          deadline: form.value.deadline.toString(),
        });

        ElMessage.success('任务发布成功！');
        
        resetForm();
        
        // 刷新任务列表 - 添加延迟确保区块链数据已更新
        setTimeout(async () => {
          await loadTasks();
        }, 2000);
        
      } catch (error: any) {
        console.error('发布任务失败:', error);
        ElMessage.error(`发布失败: ${error.message || '未知错误'}`);
      }
    } else {
      ElMessage.error('请完善表单信息');
      return false;
    }
  });
}

// 重置表单
const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    amount: null,
    deadline: ''
  }
}

// 监听钱包连接事件
watch(() => eventBus.walletConnected.value, async (newVal) => {
  if (newVal) {
    console.log('检测到钱包连接，自动加载任务列表')
    await loadTasks()
  }
})

// 监听钱包断开事件
watch(() => eventBus.walletDisconnected.value, async (newVal) => {
  if (newVal) {
    console.log('检测到钱包断开，清空任务列表')
    tasks.value = []
  }
})

// 监听任务接受事件
watch(() => eventBus.taskAccepted.value, async (newVal) => {
  if (newVal) {
    console.log('检测到任务被接受，刷新任务列表')
    // 添加延迟确保区块链数据已更新
    setTimeout(async () => {
      await loadTasks()
    }, 2000)
  }
})

// 设置合约事件监听
const setupEventListeners = () => {
  // 监听任务创建事件
  web3Service.onTaskCreated((taskId, title, creator) => {
    console.log('检测到新任务创建:', taskId, title);
    // 延迟刷新确保数据已更新
    setTimeout(async () => {
      await loadTasks();
    }, 2000);
  });

  // 监听任务接受事件
  web3Service.onTaskAccepted((taskId, worker) => {
    console.log('检测到任务被接受:', taskId, worker);
    // 延迟刷新确保数据已更新
    setTimeout(async () => {
      await loadTasks();
    }, 2000);
  });
};

// 组件挂载时加载任务
onMounted(async () => {
  await loadTasks();
  setupEventListeners();
});
</script>

<style scoped>
.content {
  width: 100%;
  height: 100%;
}
.header-bar {
  display: flex;
  justify-content: flex-end; 
  align-items: center;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}
.right-section {
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-right: 20px;
}
.nickname {
  margin-left: 10px;
  font-weight: 500;
  font-size: 28px;
  color: #333;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pushlishContent {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px;
}
.task-list {
    display: flex;
    flex-direction: column; /* 多个 TaskCard 垂直排列 */
    align-items: center;    /* 水平居中 */
    gap: 20px;              /* 每个卡片之间的间距 */
    padding: 20px;
}
</style>
