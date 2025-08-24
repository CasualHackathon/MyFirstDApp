import { ref } from 'vue'

// 创建事件总线
export const eventBus = {
  // 钱包连接状态变化事件
  walletConnected: ref(false),
  walletDisconnected: ref(false),
  
  // 任务相关事件
  taskAccepted: ref(false),
  taskAcceptedId: ref<number | null>(null),
  
  // 触发钱包连接事件
  emitWalletConnected() {
    this.walletConnected.value = true
    // 重置标志，避免重复触发
    setTimeout(() => {
      this.walletConnected.value = false
    }, 100)
  },
  
  // 触发钱包断开事件
  emitWalletDisconnected() {
    this.walletDisconnected.value = true
    // 重置标志，避免重复触发
    setTimeout(() => {
      this.walletDisconnected.value = false
    }, 100)
  },
  
  // 触发任务接受事件
  emitTaskAccepted(taskId: number) {
    this.taskAcceptedId.value = taskId
    this.taskAccepted.value = true
    // 重置标志，避免重复触发
    setTimeout(() => {
      this.taskAccepted.value = false
      this.taskAcceptedId.value = null
    }, 100)
  }
}
