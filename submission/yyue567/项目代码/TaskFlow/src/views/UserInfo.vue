<template>
  <div class="user-info-page">
    <!-- Search Bar -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索任务..."
        class="search-input"
        :prefix-icon="Search"
        readonly
        @click="goToSearch"
      />
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <el-button 
        :type="publishedActive ? 'warning' : 'info'" 
        size="large" 
        class="action-btn" 
        @click="switchToPublished"
      >
        已发布任务
      </el-button>
      <el-button 
        :type="acceptedActive ? 'warning' : 'info'" 
        size="large" 
        class="action-btn" 
        @click="switchToAccepted"
      >
        已接取任务
      </el-button>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-tabs">
      <el-tabs v-model="activeTab" class="task-tabs">
        <el-tab-pane label="已完成" name="completed">
          <div class="tab-content">
            <el-collapse v-model="completedActiveNames" accordion>
              <el-collapse-item 
                v-for="task in completedTasks" 
                :key="task.id" 
                :name="task.id"
              >
                <template #title>
                  <div class="collapse-title">
                    <el-icon class="task-icon completed"><CircleCheck /></el-icon>
                    <span class="task-title">{{ task.title }}</span>
                  </div>
                </template>
                <div class="task-detail-card completed-task">
                  <div class="task-description">
                    {{ task.description }}
                  </div>
                  <div class="task-info">
                    <div class="left-info">
                      <div class="bounty-info">
                        <span class="label">赏金:</span>
                        <span class="value">{{ task.bounty }}</span>
                      </div>
                      <div class="deadline-info">
                        <span class="label">截止日期:</span>
                        <span class="value">{{ task.deadline }}</span>
                      </div>
                      <div class="exp-info">
                        <span class="label">经验:</span>
                        <span class="value">{{ task.exp }}</span>
                      </div>
                    </div>
                    <div class="right-info">
                      <div class="submission-info">
                        <span class="label">提交时间:</span>
                        <span class="value">{{ task.submissionTime }}</span>
                      </div>
                      <el-button type="success" class="claim-btn" @click="claimReward">
                        领取赏金
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="未完成" name="uncompleted">
          <div class="tab-content">
            <el-collapse v-model="uncompletedActiveNames" accordion>
              <el-collapse-item 
                v-for="task in uncompletedTasks" 
                :key="task.id" 
                :name="task.id"
              >
                <template #title>
                  <div class="collapse-title">
                    <el-icon class="task-icon"><VideoPlay /></el-icon>
                    <span class="task-title">{{ task.title }}</span>
                  </div>
                </template>
                <div class="task-detail-card">
                  <div class="task-description">
                    {{ task.description }}
                  </div>
                  
                  <div class="task-info">
                    <div class="bounty-info">
                      <span class="label">赏金:</span>
                      <span class="value">{{ task.bounty }}</span>
                    </div>
                    <div class="deadline-info">
                      <span class="label">截止日期:</span>
                      <span class="value">{{ task.deadline }}</span>
                    </div>
                    <div class="exp-info">
                      <span class="label">经验:</span>
                      <span class="value">{{ task.exp }}</span>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="失败" name="failed">
          <div class="tab-content">
            <el-collapse v-model="failedActiveNames" accordion>
              <el-collapse-item 
                v-for="task in failedTasks" 
                :key="task.id" 
                :name="task.id"
              >
                <template #title>
                  <div class="collapse-title">
                    <el-icon class="task-icon failed"><CircleClose /></el-icon>
                    <span class="task-title">{{ task.title }}</span>
                  </div>
                </template>
                <div class="task-detail-card failed-task">
                  <div class="task-description">
                    {{ task.description }}
                  </div>
                  
                  <div class="task-info">
                    <div class="left-info">
                      <div class="bounty-info">
                        <span class="label">赏金:</span>
                        <span class="value">{{ task.bounty }}</span>
                      </div>
                      <div class="deadline-info">
                        <span class="label">截止日期:</span>
                        <span class="value">{{ task.deadline }}</span>
                      </div>
                      <div class="exp-info">
                        <span class="label">经验:</span>
                        <span class="value">{{ task.exp }}</span>
                      </div>
                    </div>
                    <div class="right-info">
                      <div class="fail-info">
                        <span class="label">失败原因:</span>
                        <span class="value fail-reason">{{ task.failReason }}</span>
                      </div>
                      <div class="fail-time-info">
                        <span class="label">失败时间:</span>
                        <span class="value">{{ task.failTime }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>

        <el-tab-pane label="总览" name="overview">
          <div class="tab-content">
            <el-collapse v-model="overviewActiveNames" accordion>
              <el-collapse-item 
                v-for="task in overviewTasks" 
                :key="task.id" 
                :name="task.id"
              >
                <template #title>
                  <div class="collapse-title">
                    <el-icon 
                      class="task-icon" 
                      :class="{
                        'completed': task.status === 'completed',
                        'failed': task.status === 'failed'
                      }"
                    >
                      <CircleCheck v-if="task.status === 'completed'" />
                      <CircleClose v-else-if="task.status === 'failed'" />
                      <VideoPlay v-else />
                    </el-icon>
                    <span class="task-title">{{ task.title }}</span>
                  </div>
                </template>
                <div class="task-detail-card">
                  <div class="task-description">
                    {{ task.description }}
                  </div>
                  
                  <div class="task-info">
                    <div class="bounty-info">
                      <span class="label">赏金:</span>
                      <span class="value">{{ task.bounty }}</span>
                    </div>
                    <div class="deadline-info">
                      <span class="label">截止日期:</span>
                      <span class="value">{{ task.deadline }}</span>
                    </div>
                    <div class="exp-info">
                      <span class="label">经验:</span>
                      <span class="value">{{ task.exp }}</span>
                    </div>
                  </div>
                  
                  <div class="accepted-by">
                    <div 
                      v-for="accepted in task.acceptedBy" 
                      :key="accepted.name + accepted.acceptTime"
                      class="accepted-item"
                    >
                      <span class="label">接取人:</span>
                      <span class="value">{{ accepted.name }}</span>
                      <span class="label">接取时间:</span>
                      <span class="value">{{ accepted.acceptTime }}</span>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  VideoPlay, 
  CircleCheck, 
  CircleClose,
  ArrowDown,
  Search
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 假数据 - 已完成任务
const completedTasks = ref([
  {
    id: 'completed-1',
    title: '制作一个老虎NFT',
    description: '制作一个老虎NFT,名字就叫做老虎NFT,需要使用sol链来铸造，要求设计精美，具有收藏价值。',
    bounty: '100U',
    deadline: '2025年08月30日14:00',
    exp: '170 xp',
    submissionTime: '2025年08月29日15:00',
    status: 'completed'
  },
  {
    id: 'completed-2',
    title: '设计一个Logo',
    description: '为公司设计一个现代化的Logo，需要包含品牌元素和创意设计，适合各种场景使用。',
    bounty: '80U',
    deadline: '2025年08月25日18:00',
    exp: '120 xp',
    submissionTime: '2025年08月24日16:30',
    status: 'completed'
  },

])

// 假数据 - 未完成任务
const uncompletedTasks = ref([
  {
    id: 'uncompleted-1',
    title: '制作一个章鱼NFT',
    description: '制作一个蓝色章鱼NFT,名字就叫做章鱼哥NFT,需要使用sol链来铸造，要求形象可爱，适合收藏。',
    bounty: '150U',
    deadline: '2025年09月20日12:00',
    exp: '200 xp',
    status: 'progress'
  },
  {
    id: 'uncompleted-2',
    title: '开发一个Web应用',
    description: '开发一个任务管理系统的Web应用，使用Vue.js和Element Plus，包含完整的CRUD功能。',
    bounty: '500U',
    deadline: '2025年10月01日00:00',
    exp: '400 xp',
    status: 'progress'
  },
  {
    id: 'uncompleted-3',
    title: '设计一个移动应用界面',
    description: '设计一个现代化的移动应用界面，包含用户界面和交互设计，需要提供完整的UI/UX方案。',
    bounty: '200U',
    deadline: '2025年09月15日16:00',
    exp: '150 xp',
    status: 'progress'
  }
])

// 假数据 - 总览任务（已发布的任务）
const overviewTasks = ref([
  {
    id: 'overview-1',
    title: '制作一个章鱼NFT',
    description: '制作一个蓝色章鱼NFT,名字就叫做章鱼哥NFT,需要使用sol链来铸造，要求形象可爱，适合收藏。',
    bounty: '100U',
    deadline: '2025年08月30日14:00',
    exp: '150 xp',
    acceptedBy: [
      { name: 'xxx', acceptTime: '2025年08月20日' },
      { name: 'xxx', acceptTime: '2025年08月18日' },
      { name: 'xxx', acceptTime: '2025年08月22日' }
    ],
    status: 'published'
  },
  {
    id: 'overview-2',
    title: '设计一个移动应用',
    description: '设计一个现代化的移动应用界面，包含用户界面和交互设计，需要提供完整的UI/UX方案。',
    bounty: '300U',
    deadline: '2025年09月25日20:00',
    exp: '250 xp',
    acceptedBy: [
      { name: '设计师小王', acceptTime: '2025年08月25日' }
    ],
    status: 'progress'
  },
  {
    id: 'overview-3',
    title: '开发一个区块链应用',
    description: '开发一个基于以太坊的DeFi应用，包含流动性挖矿、代币交换等功能，需要智能合约开发经验。',
    bounty: '800U',
    deadline: '2025年10月15日00:00',
    exp: '600 xp',
    acceptedBy: [
      { name: '区块链开发者', acceptTime: '2025年09月01日' },
      { name: '智能合约专家', acceptTime: '2025年09月03日' }
    ],
    status: 'published'
  },
  {
    id: 'failed-3',
    title: '设计一个电商网站',
    description: '设计一个完整的电商网站界面，包含首页、商品列表、购物车、支付页面等，使用响应式设计。',
    bounty: '250U',
    deadline: '2025年08月25日16:00',
    exp: '200 xp',
    failReason: '功能不完整',
    failTime: '2025年08月24日10:15',
    status: 'failed'
  },
  {
    id: 'overview-4',
    title: '制作一个老虎NFT',
    description: '制作一个老虎NFT,名字就叫做老虎NFT,需要使用sol链来铸造，要求设计精美，具有收藏价值。',
    bounty: '100U',
    deadline: '2025年08月30日14:00',
    exp: '170 xp',
    acceptedBy: [
      { name: 'NFT艺术家', acceptTime: '2025年08月25日' }
    ],
    status: 'completed'
  }
])

// 假数据 - 失败任务
const failedTasks = ref([
  {
    id: 'failed-1',
    title: '开发一个游戏应用',
    description: '开发一个2D平台跳跃游戏，使用Unity引擎，包含角色控制、关卡设计、音效系统等功能。',
    bounty: '400U',
    deadline: '2025年08月15日20:00',
    exp: '300 xp',
    failReason: '超时未完成',
    failTime: '2025年08月15日20:00',
    status: 'failed'
  },
  {
    id: 'failed-2',
    title: '制作一个音乐NFT',
    description: '创作一首原创音乐并制作成NFT，要求时长3-5分钟，风格现代，适合收藏。',
    bounty: '120U',
    deadline: '2025年08月20日18:00',
    exp: '180 xp',
    failReason: '质量不符合要求',
    failTime: '2025年08月19日14:30',
    status: 'failed'
  },
  {
    id: 'failed-3',
    title: '设计一个电商网站',
    description: '设计一个完整的电商网站界面，包含首页、商品列表、购物车、支付页面等，使用响应式设计。',
    bounty: '250U',
    deadline: '2025年08月25日16:00',
    exp: '200 xp',
    failReason: '功能不完整',
    failTime: '2025年08月24日10:15',
    status: 'failed'
  }
])

// 当前激活的标签页
const activeTab = ref('completed')

// 按钮激活状态
const publishedActive = ref(true)
const acceptedActive = ref(false)

// 折叠面板激活状态
const completedActiveNames = ref(['completed-1'])
const uncompletedActiveNames = ref(['uncompleted-1'])
const overviewActiveNames = ref(['overview-1'])
const failedActiveNames = ref(['failed-1'])

// 搜索关键词
const searchKeyword = ref('')

// 跳转到搜索任务页面
const goToSearch = () => {
  router.push({ name: 'SearchTask' })
}

// 切换到已发布任务标签页
const switchToPublished = () => {
  activeTab.value = 'completed'
  publishedActive.value = true
  acceptedActive.value = false
}

// 切换到已接取任务标签页
const switchToAccepted = () => {
  activeTab.value = 'completed'
  publishedActive.value = false
  acceptedActive.value = true
}

// 领取赏金
const claimReward = () => {
  ElMessage.success('赏金领取成功！')
}
</script>

<style scoped>
.user-info-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.username {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-icon {
  color: #409EFF;
  font-size: 16px;
}

.level-text {
  font-size: 14px;
  color: #666;
  background-color: #f0f9ff;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.exp-text {
  font-size: 14px;
  color: #666;
}

.right-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.globe-icon {
  font-size: 24px;
  color: #409EFF;
}

.wallet-text {
  font-size: 14px;
  color: #666;
}

/* Search Bar */
.search-bar {
    display: flex;
    justify-content: center;
  margin-bottom: 20px;
}

.search-input {
  width: 50%;
  height: 50px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
  cursor: pointer;
}

.search-input:hover {
  border-color: #c0c4cc;
}

.search-input:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px #409EFF;
}

.search-input .el-input__prefix {
  left: 15px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.action-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
}

/* Navigation Tabs */
.nav-tabs {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-tabs {
  width: 100%;
}

.tab-content {
  padding: 20px 0;
}

/* Task Detail Card */
.task-detail-card {
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.task-icon {
  color: #67C23A;
  font-size: 20px;
}

.task-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.task-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.task-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.left-info, .right-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bounty-info, .deadline-info, .exp-info, .submission-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.claim-btn {
  margin-top: 8px;
  width: 120px;
}

.completed-task .task-icon.completed {
  color: #67C23A;
}

.task-icon.failed {
  color: #F56C6C !important;
}

.fail-reason {
  color: #F56C6C !important;
  font-weight: 600;
}

.fail-info, .fail-time-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.completed-sub-tasks .sub-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
}

.expand-icon {
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.expand-icon:hover {
  transform: scale(1.1);
}

.label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.accepted-by {
  margin-bottom: 20px;
}

.accepted-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.accepted-item:last-child {
  border-bottom: none;
}

.sub-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-task {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.sub-task.completed {
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
}

.sub-task.incomplete {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
}

.status-icon {
  font-size: 18px;
}

.sub-task.completed .status-icon {
  color: #67C23A;
}

.sub-task.incomplete .status-icon {
  color: #F56C6C;
}

.task-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* Element Plus Tabs 样式覆盖 */
:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: #666;
}

:deep(.el-tabs__item.is-active) {
  color: #E6A23C;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #E6A23C;
}

/* 折叠面板样式 */
.collapse-title {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 80px);
  padding-right: 40px;
}

.task-status {
  margin-left: auto;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.task-status.completed {
  background-color: #f0f9ff;
  color: #67C23A;
  border: 1px solid #e0f2fe;
}

.task-status.pending {
  background-color: #fff7ed;
  color: #E6A23C;
  border: 1px solid #fed7aa;
}

.task-status.overview {
  background-color: #f0f9ff;
  color: #409EFF;
  border: 1px solid #e0f2fe;
}

/* Element Plus Collapse 样式覆盖 */
:deep(.el-collapse-item__header) {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 8px;
  padding: 16px 60px 16px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

:deep(.el-collapse-item__header:hover) {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

:deep(.el-collapse-item__header.is-active) {
  background-color: #fff;
  border-color: #409EFF;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  width: 95%;
}

:deep(.el-collapse-item__content) {
  padding: 0;
  background-color: transparent;
}

:deep(.el-collapse-item__wrap) {
  border: none;
  background-color: transparent;
}

/* 展开/收起箭头样式 */
:deep(.el-collapse-item__arrow) {
  color: #409EFF !important;
  font-size: 16px;
  font-weight: bold;
  transition: transform 0.3s ease;
  position: absolute;
  right: 20px;
}

:deep(.el-collapse-item__arrow.is-active) {
  transform: rotate(90deg);
}
</style>
