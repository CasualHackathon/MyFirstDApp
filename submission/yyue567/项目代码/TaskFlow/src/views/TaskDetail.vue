<template>
  <div class="task-detail">
    <div class="detail-container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button @click="goBack" :icon="ArrowLeft" circle size="large"></el-button>
      </div>

      <!-- 任务详情卡片 -->
      <div class="task-card" v-if="taskData">
        <!-- 顶部金额 + deadline -->
        <div class="top-row">
          <div class="amount">
            <el-image src="/images/icons-usdt.png" style="width: 40px; height: 40px;" />
            <div style="margin-left: 10px; padding-top: 8px;">{{ taskData.amount }} U</div>
          </div>
          <div class="deadline">截止时间: {{ taskData.deadline }}</div>
        </div>

        <!-- 发布者信息 -->
        <div class="user-row">
          <el-avatar :size="50" :src="taskData.user.avatar" :icon="User" />
          <div class="user-info">
            <span class="nickname">{{ taskData.user.nickname }}</span>
            <span class="publisher-label">发布者</span>
          </div>
        </div>

        <!-- 任务标题 -->
        <div class="title">{{ taskData.title }}</div>

        <!-- 任务详情 -->
        <div class="description">
          <h3>任务描述</h3>
          <p>{{ taskData.description }}</p>
        </div>

        <!-- 任务状态 -->
        <div class="task-status">
          <h3>任务状态</h3>
          <el-tag type="warning">进行中</el-tag>
          <p>最多3人同时进行，当前已有 0 人接受</p>
        </div>

        <!-- 操作按钮 -->
        <div class="actions">
          <el-button type="primary" size="large" @click="handleAccept">接受任务</el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading">
        <el-empty description="任务信息加载中..." />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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
}

const router = useRouter()
const route = useRoute()

// 任务数据
const taskData = ref<Task | null>(null)

// 获取任务数据
const getTaskData = () => {
  try {
    // 从路由状态获取任务数据
    const state = history.state
    if (state && state.taskData) {
      taskData.value = state.taskData
    } else {
      ElMessage.error('任务数据不存在，请返回重新选择任务')
    }
  } catch (error) {
    console.error('获取任务数据失败:', error)
    ElMessage.error('任务数据加载失败')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 接受任务
const handleAccept = () => {
  ElMessageBox.confirm(
    '确认要接受这个任务吗？接受后需要在截止时间前完成并提交。',
    '确认接受任务',
    {
      confirmButtonText: '确认接受',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '已成功接受任务！请在截止时间前完成并提交。',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消操作',
      })
    })
}

// 组件挂载时获取数据
onMounted(() => {
  getTaskData()
})
</script>

<style scoped>
.task-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.detail-container {
  max-width: 800px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.task-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.amount {
  display: flex;
  justify-content: flex-start;
  color: #409EFF;
  font-size: 20px;
}

.deadline {
  color: #999;
  font-size: 14px;
}

.user-row {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.user-info {
  margin-left: 15px;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.publisher-label {
  font-size: 12px;
  color: #666;
  background-color: #e6f7ff;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #333;
  line-height: 1.4;
}

.description {
  margin-bottom: 25px;
}

.description h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.description p {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap;
}

.task-status {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.task-status h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
}

.task-status p {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
