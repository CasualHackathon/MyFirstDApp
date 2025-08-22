<template>
  <div id="app">
    <!-- 导航栏 -->
    <el-header class="app-header">
      <div class="logo">区块链社交</div>
      <el-menu :default-active="activePath" mode="horizontal" @select="handleMenuSelect">
        <el-menu-item index="/" v-if="isLoggedIn">首页</el-menu-item>
        <el-menu-item index="/login" v-if="!isLoggedIn">登录</el-menu-item>
        <el-menu-item index="/register" v-if="!isLoggedIn">注册</el-menu-item>
        <el-menu-item index="/logout" v-if="isLoggedIn">退出登录</el-menu-item>
      </el-menu>
      <div class="user-info" v-if="isLoggedIn">
        <el-avatar :src="userAvatar" class="avatar"></el-avatar>
        <span class="username">{{ currentUser }}</span>
        <span class="address">{{ shortenAddress(currentAddress) }}</span>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <el-main class="app-main">
      <router-view />
    </el-main>

    <!-- 页脚 -->
    <el-footer class="app-footer">
      区块链社交应用 &copy; {{ new Date().getFullYear() }}
    </el-footer>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const store = useStore()
    
    // 响应式数据
    const activePath = ref(router.currentRoute.value.path)
    const userAvatar = ref('')
    
    // 计算属性
    const isLoggedIn = computed(() => store.state.isLoggedIn)
    const currentUser = computed(() => store.state.currentUser)
    const currentAddress = computed(() => store.state.currentAddress)
    
    // 方法
    const handleMenuSelect = (index) => {
      if (index === '/logout') {
        store.commit('logout')
        router.push('/login')
      } else {
        router.push(index)
      }
    }
    
    const shortenAddress = (address) => {
      if (!address) return ''
      return address.slice(0, 6) + '...' + address.slice(-4)
    }
    
    onMounted(() => {
  // 监听路由变化更新菜单激活状态
  router.beforeEach((to) => {
    activePath.value = to.path
  })
})

// 监听用户登录状态变化
watch(isLoggedIn, (newVal) => {
  console.log('用户登录状态已改变:', newVal)
  if (newVal && currentUser.value) {
    console.log('用户已登录:', currentUser.value)
    
    // 获取用户头像
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser)
        console.log('完整用户信息:', userObj)
        
        // 从用户信息中获取头像 IPFS 地址
        if (userObj.image) {
          userAvatar.value = userObj.image
          console.log('======照片', userAvatar.value)
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
  }
}, { immediate: true })
    
    return {
      activePath,
      isLoggedIn,
      currentUser,
      currentAddress,
      userAvatar,
      handleMenuSelect,
      shortenAddress
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
}

.username {
  font-weight: 500;
}

.address {
  font-size: 12px;
  color: #666;
}

.app-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.app-footer {
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid #e5e7eb;
}
</style>
