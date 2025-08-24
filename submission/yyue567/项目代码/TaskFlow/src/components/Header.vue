<template>
    <div>
        <div class="header-bar">
            <div class="left-section">
              <!-- 头像 -->
              <span class="avatar-container" @click="goToUserInfo">
                  <el-avatar :size="50" :src="info.avatar" :icon="User" />
              </span>
              <!-- 用户信息 -->
              <div class="user-info">
                <!-- 昵称 -->
                <span class="nickname">{{ info.nickname }}</span>
                <!-- 等级和经验值 -->
                <div class="level-exp-info">
                  <span class="level">等级：{{ info.level }}级</span>
                  <span class="exp" v-if="showExp">经验：{{ info.currentExp }}/{{ info.maxExp }}</span>
                </div>
              </div>
            </div>
            
            <!-- 居中的TaskFlow标题 -->
            <div class="center-section">
              <h1 class="taskflow-title" @click="goToHome">
                <span class="title-text">Task</span>
                <span class="title-accent">Flow</span>
              </h1>
            </div>
            
            <div class="right-section">
              <!-- 钱包按钮 -->
              <el-button 
                v-if="!walletAddress" 
                type="primary" 
                :icon="Wallet" 
                @click="connectWallet"
                :loading="isConnecting"
                :disabled="isConnecting"
              >
                {{ isConnecting ? '连接中...' : '连接钱包' }}
              </el-button>
              
              <!-- 已连接钱包状态 -->
              <div v-else class="wallet-connected">
                <div class="wallet-address">
                  {{ formatAddress(walletAddress) }}
                </div>
                <el-button 
                  type="text" 
                  size="small" 
                  @click="disconnectWallet"
                  class="disconnect-btn"
                >
                  断开
                </el-button>
              </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, Wallet } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { web3Service } from '../utils/web3Service'
import { eventBus } from '../utils/eventBus'

const router = useRouter()
const route = useRoute()

const info = ref({
  avatar: '', 
  nickname: 'Lucas',
  level: 15,
  currentExp: 750,
  maxExp: 1100
})

const walletAddress = ref('')
const isConnecting = ref(false)

// 判断是否显示经验值（在UserInfo页面显示）
const showExp = computed(() => {
  return route.name === 'UserInfo'
})

// 跳转到用户信息页面
const goToUserInfo = () => {
  router.push({ name: 'UserInfo' })
}

// 跳转到首页
const goToHome = () => {
  router.push({ name: 'Home' })
}

// 连接钱包
const connectWallet = async () => {
  if (isConnecting.value) return
  
  try {
    isConnecting.value = true
    
    await web3Service.connect()
    
    const address = await web3Service.getAddress()
    walletAddress.value = address
    ElMessage.success('钱包连接成功！')
    
    // 触发钱包连接事件，通知其他组件
    eventBus.emitWalletConnected()
  } catch (error: any) {
    console.error('连接钱包失败:', error)
    ElMessage.error(error.message || '连接钱包失败，请确保已安装MetaMask')
  } finally {
    isConnecting.value = false
  }
}

// 断开钱包连接
const disconnectWallet = async () => {
  try {
    await web3Service.disconnect()
    walletAddress.value = ''
    ElMessage.info('已断开钱包连接')
    
    // 触发钱包断开事件，通知其他组件
    eventBus.emitWalletDisconnected()
  } catch (error: any) {
    console.error('断开钱包连接失败:', error)
    // 即使断开失败，也要清空本地状态
    walletAddress.value = ''
    ElMessage.info('已断开钱包连接')
    
    // 触发钱包断开事件，通知其他组件
    eventBus.emitWalletDisconnected()
  }
}

// 格式化钱包地址显示
const formatAddress = (address: string) => {
  if (address.length > 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  return address
}

// 检查钱包连接状态
const checkWalletConnection = async () => {
  try {
    if (web3Service.isConnected()) {
      const address = await web3Service.getAddress()
      walletAddress.value = address
    }
  } catch (error) {
    // 钱包未连接，这是正常的
    console.log('钱包未连接')
  }
}

// 组件挂载时检查钱包连接状态
onMounted(() => {
  checkWalletConnection()
})
</script>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between; 
  align-items: center;
  height: 80px;
  padding: 0 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fff;
  width: 100%;
  box-sizing: border-box;
}

.left-section {
  display: flex;
  align-items: center;
}

.avatar-container {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.user-info {
  margin-left: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.nickname {
  font-weight: 600;
  font-size: 20px;
  color: #333;
  margin-bottom: 4px;
}

.level-exp-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level {
  font-size: 14px;
  color: #666;
  background-color: #f0f9ff;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #e0f2fe;
}

.exp {
  font-size: 14px;
  color: #666;
  background-color: #f0f9ff;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #e0f2fe;
}

.center-section {
  flex-grow: 1;
  text-align: center;
}

.taskflow-title {
  cursor: pointer;
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  padding: 12px 24px;
  display: inline-block;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(45deg, #409eff, #67c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.taskflow-title:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 
    0 0 20px rgba(64, 158, 255, 0.6),
    0 0 40px rgba(103, 194, 58, 0.4),
    0 8px 25px rgba(0, 0, 0, 0.2);
  border: 2px solid #409eff;
}

.title-text {
  color: #409eff;
  font-weight: 800;
  text-shadow: 0 0 15px rgba(64, 158, 255, 0.8);
}

.title-accent {
  color: #67c23a;
  font-weight: 800;
  text-shadow: 0 0 15px rgba(103, 194, 58, 0.8);
}

.title-accent::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #67c23a, #e6a23c);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.taskflow-title:hover .title-accent::after {
  transform: scaleX(1);
}

.right-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.wallet-address {
  font-size: 12px;
  color: #666;
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.wallet-connected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.disconnect-btn {
  font-size: 10px;
  color: #999;
  padding: 2px 4px;
}

.disconnect-btn:hover {
  color: #f56c6c;
}
</style>