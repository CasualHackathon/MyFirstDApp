import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { ethers } from 'ethers'

// 全局注入ethers
const app = createApp(App)
app.config.globalProperties.$ethers = ethers
app.use(ElementPlus).use(router).use(store).mount('#app')
