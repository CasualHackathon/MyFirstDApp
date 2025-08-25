import { web3Service } from '../utils/web3Service';
import type { CreateTaskParams } from '../types/task';

// 使用示例
export class TaskFlowExample {
  
  // 连接钱包
  async connectWallet() {
    try {
      await web3Service.connect();
      const address = await web3Service.getAddress();
      console.log('钱包连接成功，地址:', address);
      return true;
    } catch (error) {
      console.error('连接钱包失败:', error);
      return false;
    }
  }

  // 创建任务
  async createNewTask() {
    try {
      const taskParams: CreateTaskParams = {
        amount: '0.01', // 0.01 ETH
        deadline: '2024-12-31', // 截止日期
        title: '开发一个Vue.js组件',
        description: '需要开发一个可复用的Vue.js组件，包含表单验证功能'
      };

      const tx = await web3Service.createTask(taskParams);
      console.log('任务创建成功，交易哈希:', tx.hash);
      return tx;
    } catch (error) {
      console.error('创建任务失败:', error);
      throw error;
    }
  }

  // 获取所有任务
  async getAllTasks() {
    try {
      const tasks = await web3Service.getTasks();
      console.log('获取到', tasks.length, '个任务:');
      
      tasks.forEach((task, index) => {
        console.log(`任务 ${index + 1}:`);
        console.log(`  ID: ${task.id}`);
        console.log(`  标题: ${task.title}`);
        console.log(`  描述: ${task.description}`);
        console.log(`  金额: ${task.amount} ETH`);
        console.log(`  截止时间: ${task.deadline}`);
        console.log(`  发布者: ${task.user}`);
        console.log(`  接受者数量: ${task.acceptedBy.length}`);
        console.log('---');
      });

      return tasks;
    } catch (error) {
      console.error('获取任务失败:', error);
      throw error;
    }
  }

  // 接受任务
  async acceptTask(taskId: number) {
    try {
      const tx = await web3Service.acceptTask(taskId);
      console.log('任务接受成功，交易哈希:', tx.hash);
      return tx;
    } catch (error) {
      console.error('接受任务失败:', error);
      throw error;
    }
  }

  // 获取任务的接受者列表
  async getTaskAccepters(taskId: number) {
    try {
      const accepters = await web3Service.getAcceptedBy(taskId);
      console.log(`任务 ${taskId} 的接受者:`, accepters);
      return accepters;
    } catch (error) {
      console.error('获取任务接受者失败:', error);
      throw error;
    }
  }

  // 获取当前用户地址
  async getCurrentUserAddress() {
    try {
      const address = await web3Service.getAddress();
      console.log('当前用户地址:', address);
      return address;
    } catch (error) {
      console.error('获取用户地址失败:', error);
      throw error;
    }
  }

  // 断开钱包连接
  async disconnectWallet() {
    try {
      await web3Service.disconnect();
      console.log('钱包已断开连接');
      return true;
    } catch (error) {
      console.error('断开钱包连接失败:', error);
      return false;
    }
  }
}

// 使用示例
export async function runExample() {
  const example = new TaskFlowExample();
  
  try {
    // 1. 连接钱包
    const connected = await example.connectWallet();
    if (!connected) {
      console.log('无法连接钱包，退出示例');
      return;
    }

    // 2. 获取当前用户地址
    await example.getCurrentUserAddress();

    // 3. 获取所有任务
    await example.getAllTasks();

    // 4. 创建新任务（可选）
    // await example.createNewTask();

    // 5. 接受任务（可选，需要有效的任务ID）
    // await example.acceptTask(1);

    // 6. 获取任务接受者（可选）
    // await example.getTaskAccepters(1);

  } catch (error) {
    console.error('示例运行失败:', error);
  } finally {
    // 7. 断开钱包连接
    await example.disconnectWallet();
  }
}
