<template>
  <div class="task-card" @click="goToDetail">
    <!-- 顶部金额 + deadline -->
    <div class="top-row">
      <div class="amount">
        <el-image src="/images/icons-usdt.png" style="width: 40px; height: 40px;" />
        <div style="margin-left: 10px; padding-top: 8px;">{{ task.amount }} U</div>
      </div>
      <div class="deadline">{{ task.deadline }}</div>
    </div>

    <!-- 头像 + 昵称 -->
    <div class="user-row">
      <el-avatar :size="40" :src="task.user.avatar" :icon="User" />
      <span class="nickname">{{ task.user.nickname }}</span>
    </div>

    <!-- 任务标题 -->
    <div class="title">{{ task.title }}</div>

    <!-- 任务详情 -->
    <div class="description">{{ task.description }}</div>

    <!-- 接任务 -->
    <div class="receive">
        <el-button type="warning" round @click.stop="handleAccept">接受</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { web3Service } from '../utils/web3Service'
import { eventBus } from '../utils/eventBus'

// 定义 Task 数据结构
interface UserInfo {
  avatar: string
  nickname: string
}

interface Task {
  id: number
  amount: number
  deadline: string
  user: UserInfo
  title: string
  description: string
  userId?: string
}

// 定义 props
const props = defineProps<{ task: Task }>()
const { task } = props

const router = useRouter()

// 点击跳转详情
const goToDetail = () => {
  // 使用路由状态传递任务数据，不会暴露在URL中
  router.push({ 
    name: 'TaskDetail',
    state: { 
      taskData: {
        id: task.id,
        amount: task.amount,
        deadline: task.deadline,
        user: {
          avatar: task.user.avatar,
          nickname: task.user.nickname
        },
        title: task.title,
        description: task.description,
        userId: task.userId
      }
    }
  })
}

// 点击"接受"按钮
const handleAccept = async () => {
  try {
    // 检查钱包连接
    // if (!web3Service.isConnected()) {
    //   ElMessage.warning('请先连接MetaMask钱包');
    //   return;
    // }

    await ElMessageBox.confirm(
      '确认要接受这个任务吗？',
      '提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 确认接受，调用智能合约
    ElMessage.info('正在接受任务...');
    
    const tx = await web3Service.acceptTask(task.id);
    
    ElMessage.success('任务接受成功！');
    
    // 通过事件总线通知父组件刷新任务列表
    eventBus.emitTaskAccepted(task.id);
    
  } catch (error: any) {
    if (error === 'cancel') {
      // 用户取消操作
      ElMessage.info('已取消操作');
    } else {
      // 检查是否是"已接受任务"的错误
      const errorMessage = error.message || error.toString();
      if (errorMessage.includes('You already accepted this task') || 
          errorMessage.includes('already accepted')) {
        ElMessage.warning('您已经接受过这个任务了');
      } else {
        // 其他错误
        console.error('接受任务失败:', error);
        ElMessage.error(`接受任务失败: ${errorMessage}`);
      }
    }
  }
}
</script>

<style scoped>
.task-card {
  width: 60%;
  min-height: 220px; /* 最小高度 */
  max-height: 350px; /* 最大高度 */
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 28px 28px 5px 25px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 12px;
}

.amount {
  display: flex;
  justify-content: flex-start;
  color: #409EFF;
}

.deadline {
  color: #999;
  font-size: 14px;
}

.user-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.nickname {
  margin-left: 8px;
  font-weight: 500;
  color: #333;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-top: 25px;
  margin-bottom: 8px;
  color: #333;
}

/* ✅ description 超过就隐藏 */
.description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  overflow: hidden;        /* 超出隐藏 */
  text-overflow: ellipsis; /* 省略号 */
  display: -webkit-box;    
  -webkit-line-clamp: 4;   /* 限制显示行数，可调 */
  -webkit-box-orient: vertical;
}

.receive {
    display: flex;
    justify-content: flex-end;
    padding-top: 10px;
    padding-right: 30px;
    padding-bottom: 10px;
    margin-top: 10px;
}
</style>
