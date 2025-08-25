<template>
  <div class="task-manager">
    <!-- 钱包连接状态 -->
    <div class="wallet-status">
      <div v-if="!isConnected" class="connect-wallet">
        <button @click="connectWallet" class="btn btn-primary">
          连接MetaMask钱包
        </button>
      </div>
      <div v-else class="wallet-info">
        <p>已连接: {{ shortAddress }}</p>
        <button @click="disconnectWallet" class="btn btn-secondary">断开连接</button>
      </div>
    </div>

    <!-- 创建任务表单 -->
    <div v-if="isConnected" class="create-task-section">
      <h3>创建新任务</h3>
      <form @submit.prevent="createTask" class="task-form">
        <div class="form-group">
          <label for="title">任务标题</label>
          <input 
            id="title"
            v-model="newTask.title" 
            type="text" 
            required 
            placeholder="输入任务标题"
          />
        </div>
        <div class="form-group">
          <label for="description">任务描述</label>
          <textarea 
            id="description"
            v-model="newTask.description" 
            required 
            placeholder="输入任务描述"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="reward">奖励金额 (ETH)</label>
          <input 
            id="reward"
            v-model="newTask.reward" 
            type="number" 
            step="0.001" 
            min="0" 
            required 
            placeholder="0.001"
          />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{ isLoading ? '创建中...' : '创建任务' }}
        </button>
      </form>
    </div>

    <!-- 任务列表 -->
    <div v-if="isConnected" class="tasks-section">
      <h3>任务列表</h3>
      <div class="tasks-grid">
        <div 
          v-for="task in tasks" 
          :key="task.id" 
          class="task-card"
          :class="{ 'completed': task.completed }"
        >
          <div class="task-header">
            <h4>{{ task.title }}</h4>
            <span class="reward">{{ formatEther(task.reward) }} ETH</span>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-meta">
            <span class="creator">创建者: {{ shortAddress(task.creator) }}</span>
            <span class="status" :class="task.completed ? 'completed' : 'pending'">
              {{ task.completed ? '已完成' : '待完成' }}
            </span>
          </div>
          <div class="task-actions">
            <button 
              v-if="!task.completed && task.creator !== userAddress"
              @click="completeTask(task.id)"
              class="btn btn-success"
              :disabled="isLoading"
            >
              完成任务
            </button>
            <button 
              v-if="task.completed && !task.rewardClaimed && task.creator === userAddress"
              @click="claimReward(task.id)"
              class="btn btn-warning"
              :disabled="isLoading"
            >
              领取奖励
            </button>
            <button 
              v-if="task.creator === userAddress && !task.completed"
              @click="deleteTask(task.id)"
              class="btn btn-danger"
              :disabled="isLoading"
            >
              删除任务
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户资料 -->
    <div v-if="isConnected" class="profile-section">
      <h3>用户资料</h3>
      <div class="profile-info">
        <p><strong>地址:</strong> {{ userAddress }}</p>
        <p><strong>已完成任务:</strong> {{ completedTasksCount }}</p>
        <p><strong>总奖励:</strong> {{ totalRewards }} ETH</p>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { web3Service } from '../utils/web3Service';
import { ethers } from 'ethers';

// 响应式数据
const isConnected = ref(false);
const userAddress = ref('');
const isLoading = ref(false);
const message = ref('');
const messageType = ref('info');
const tasks = ref<any[]>([]);
const completedTasksCount = ref(0);
const totalRewards = ref('0');

// 新任务表单
const newTask = ref({
  title: '',
  description: '',
  reward: ''
});

// 计算属性
const shortAddress = computed(() => {
  return (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
});

// 连接钱包
const connectWallet = async () => {
  try {
    isLoading.value = true;
    await web3Service.connect();
    userAddress.value = await web3Service.getAddress();
    isConnected.value = true;
    showMessage('钱包连接成功！', 'success');
    await loadTasks();
    await loadUserProfile();
  } catch (error: any) {
    showMessage(`连接失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 断开钱包连接
const disconnectWallet = () => {
  isConnected.value = false;
  userAddress.value = '';
  tasks.value = [];
  showMessage('已断开钱包连接', 'info');
};

// 创建任务
const createTask = async () => {
  try {
    isLoading.value = true;
    const tx = await web3Service.createTask(
      newTask.value.title,
      newTask.value.description,
      newTask.value.reward
    );
    
    showMessage('任务创建成功！', 'success');
    newTask.value = { title: '', description: '', reward: '' };
    await loadTasks();
  } catch (error: any) {
    showMessage(`创建任务失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 完成任务
const completeTask = async (taskId: number) => {
  try {
    isLoading.value = true;
    const tx = await web3Service.completeTask(taskId);
    showMessage('任务完成！', 'success');
    await loadTasks();
  } catch (error: any) {
    showMessage(`完成任务失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 领取奖励
const claimReward = async (taskId: number) => {
  try {
    isLoading.value = true;
    const tx = await web3Service.claimReward(taskId);
    showMessage('奖励领取成功！', 'success');
    await loadTasks();
    await loadUserProfile();
  } catch (error: any) {
    showMessage(`领取奖励失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 删除任务
const deleteTask = async (taskId: number) => {
  if (!confirm('确定要删除这个任务吗？')) return;
  
  try {
    isLoading.value = true;
    const tx = await web3Service.deleteTask(taskId);
    showMessage('任务删除成功！', 'success');
    await loadTasks();
  } catch (error: any) {
    showMessage(`删除任务失败: ${error.message}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 加载任务列表
const loadTasks = async () => {
  try {
    const allTasks = await web3Service.getAllTasks();
    tasks.value = allTasks.map((task: any, index: number) => ({
      id: index,
      ...task,
      reward: task.reward.toString()
    }));
  } catch (error: any) {
    showMessage(`加载任务失败: ${error.message}`, 'error');
  }
};

// 加载用户资料
const loadUserProfile = async () => {
  try {
    const profile = await web3Service.getUserProfile();
    const completedTasks = await web3Service.getUserCompletedTasks();
    
    completedTasksCount.value = completedTasks.length;
    // 这里可以计算总奖励，需要根据您的合约逻辑调整
    totalRewards.value = '0'; // 临时设置
  } catch (error: any) {
    console.error('加载用户资料失败:', error);
  }
};

// 格式化以太币显示
const formatEther = (wei: string) => {
  try {
    return ethers.formatEther(wei);
  } catch {
    return '0';
  }
};

// 显示消息
const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

// 监听合约事件
const setupEventListeners = () => {
  web3Service.onTaskCreated((taskId, title, creator) => {
    showMessage(`新任务创建: ${title}`, 'success');
    loadTasks();
  });

  web3Service.onTaskCompleted((taskId, completer) => {
    showMessage(`任务 ${taskId} 已完成！`, 'success');
    loadTasks();
  });

  web3Service.onRewardClaimed((taskId, claimer, amount) => {
    showMessage(`奖励领取: ${amount} ETH`, 'success');
    loadTasks();
    loadUserProfile();
  });
};

// 组件挂载
onMounted(() => {
  setupEventListeners();
});
</script>

<style scoped>
.task-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.wallet-status {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.wallet-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-task-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.task-form {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.tasks-section {
  margin-bottom: 30px;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.task-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  border-left: 4px solid #007bff;
}

.task-card.completed {
  border-left-color: #28a745;
  opacity: 0.8;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-header h4 {
  margin: 0;
  color: #333;
}

.reward {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.task-description {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.creator {
  color: #666;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.task-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.profile-info p {
  margin: 10px 0;
  color: #333;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #1e7e34;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.message.success {
  background: #28a745;
}

.message.error {
  background: #dc3545;
}

.message.info {
  background: #17a2b8;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }
  
  .wallet-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .task-actions {
    flex-direction: column;
  }
}
</style>
