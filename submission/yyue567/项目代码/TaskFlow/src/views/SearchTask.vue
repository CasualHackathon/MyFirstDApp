<template>
  <div class="search-task-page">
    <!-- Header -->
    <div class="header">
      <div class="header-left" @click="goBack">
        <el-icon class="menu-icon"><Menu /></el-icon>
        <span class="title">Task</span>
      </div>
      
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索任务..."
          class="search-input"
          :prefix-icon="Search"
          clearable
        />
      </div>
      
      <div class="header-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="date-picker"
          :prefix-icon="Calendar"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- Task Sections -->
    <div class="task-sections">
      <!-- Success Section -->
      <div class="task-section success-section">
        <div class="section-header">
          <el-icon class="status-icon success"><CircleCheck /></el-icon>
          <span class="section-title">Success</span>
        </div>
        <div class="task-list">
          <div class="task-item" v-for="task in successTasks" :key="task.id">
            <div class="task-info">
              <span class="task-name">{{ task.name }}</span>
              <div class="task-rewards">
                <div class="reward-item">
                  <el-icon class="reward-icon"><Money /></el-icon>
                  <span class="reward-value">{{ task.money }}U</span>
                </div>
                <div class="reward-item">
                  <el-icon class="reward-icon"><Reading /></el-icon>
                  <span class="reward-value">{{ task.xp }} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Failed Section -->
      <div class="task-section failed-section">
        <div class="section-header">
          <el-icon class="status-icon failed"><CircleClose /></el-icon>
          <span class="section-title">Failed</span>
        </div>
        <div class="task-list">
          <div class="task-item" v-for="task in failedTasks" :key="task.id">
            <div class="task-info">
              <span class="task-name">{{ task.name }}</span>
              <div class="task-rewards">
                <div class="reward-item penalty">
                  <el-icon class="reward-icon"><Money /></el-icon>
                  <span class="reward-value">{{ task.money }}U</span>
                </div>
                <div class="reward-item penalty">
                  <el-icon class="reward-icon"><Reading /></el-icon>
                  <span class="reward-value">{{ task.xp }} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing Section -->
      <div class="task-section processing-section">
        <div class="section-header">
          <el-icon class="status-icon processing"><VideoPlay /></el-icon>
          <span class="section-title">Processing</span>
        </div>
        <div class="task-list">
          <div class="task-item" v-for="task in processingTasks" :key="task.id">
            <div class="task-info">
              <span class="task-name">{{ task.name }}</span>
              <el-button type="success" size="small" class="detail-btn" @click="viewDetails(task)">
                查看详情
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Statistics -->
    <div class="footer-stats">
      <div class="stat-item">
        <span class="stat-text">总计{{ totalTasks }}个任务, {{ totalXp }} xp</span>
      </div>
      <div class="stat-item">
        <span class="stat-text">总计{{ totalTasks }}个任务, {{ totalMoney }}U</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Menu, 
  Search, 
  Calendar, 
  CircleCheck, 
  CircleClose, 
  VideoPlay, 
  Money, 
  Reading 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('NFT')

// 成功任务数据
const successTasks = ref([
  {
    id: 1,
    name: '老虎形象的NFT',
    money: 50,
    xp: 50
  },
  {
    id: 2,
    name: '猫形象的NFT',
    money: 50,
    xp: 50
  }
])

// 失败任务数据
const failedTasks = ref([
  {
    id: 3,
    name: 'NFT推广',
    money: -1,
    xp: -50
  },
  {
    id: 4,
    name: 'NFT合约',
    money: -1,
    xp: -50
  }
])

// 进行中任务数据
const processingTasks = ref([
  {
    id: 5,
    name: 'NFT的bug修正',
    status: 'processing'
  },
  {
    id: 6,
    name: 'NFT铸造',
    status: 'processing'
  }
])

// 日期范围
const dateRange = ref([null, null])

// 处理日期变化
const handleDateChange = (val: any) => {
  console.log('Selected date range:', val)
  if (val && val.length === 2) {
    // 根据日期范围过滤任务
    filterTasksByDate(val[0], val[1])
  } else {
    // 清除过滤，显示所有任务
    showAllTasks()
  }
}

// 根据日期范围过滤任务
const filterTasksByDate = (startDate: string, endDate: string) => {
  // 这里可以根据实际需求实现过滤逻辑
  // 例如：根据任务的创建日期或完成日期进行过滤
  ElMessage.success(`已筛选 ${startDate} 至 ${endDate} 的任务`)
}

// 显示所有任务
const showAllTasks = () => {
  ElMessage.info('显示所有任务')
}

// 计算统计数据
const totalTasks = computed(() => {
  return successTasks.value.length + failedTasks.value.length + processingTasks.value.length
})

const totalXp = computed(() => {
  const successXp = successTasks.value.reduce((sum, task) => sum + task.xp, 0)
  const failedXp = failedTasks.value.reduce((sum, task) => sum + task.xp, 0)
  return successXp + failedXp
})

const totalMoney = computed(() => {
  const successMoney = successTasks.value.reduce((sum, task) => sum + task.money, 0)
  const failedMoney = failedTasks.value.reduce((sum, task) => sum + task.money, 0)
  return successMoney + failedMoney
})

// 查看详情
const viewDetails = (task: any) => {
  ElMessage.info(`查看任务详情: ${task.name}`)
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.search-task-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  padding: 16px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.header-left:hover {
  background-color: #f5f7fa;
  transform: translateY(-1px);
}

.header-left:active {
  transform: translateY(0);
}

.menu-icon {
  font-size: 20px;
  color: #666;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.search-container {
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.search-input {
  width: 100%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-picker {
  width: 240px;
  height: 40px;
}

.date-picker :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  transition: all 0.2s ease;
}

.date-picker :deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.date-picker :deep(.el-input__prefix) {
  left: 12px;
  color: #666;
}

/* Task Sections */
.task-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.task-section {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.status-icon {
  font-size: 20px;
}

.status-icon.success {
  color: #67C23A;
}

.status-icon.failed {
  color: #F56C6C;
}

.status-icon.processing {
  color: #409EFF;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.task-item:hover {
  background-color: #f0f2f5;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.task-rewards {
  display: flex;
  gap: 16px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.reward-item.penalty .reward-value {
  color: #F56C6C;
}

.reward-icon {
  font-size: 16px;
  color: #666;
}

.reward-value {
  font-size: 14px;
  font-weight: 600;
  color: #67C23A;
}

.detail-btn {
  background-color: #67C23A;
  border-color: #67C23A;
  color: white;
  font-size: 12px;
  padding: 6px 12px;
}

.detail-btn:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

/* Footer Statistics */
.footer-stats {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  margin-bottom: 8px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-container {
    margin: 0;
    max-width: 100%;
  }
  
  .task-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .task-rewards {
    gap: 12px;
  }
}
</style>
