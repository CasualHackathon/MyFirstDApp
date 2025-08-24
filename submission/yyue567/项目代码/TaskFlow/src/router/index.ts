// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import TaskDetail from '../views/TaskDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/task',   // 任务
    name: 'TaskDetail',
    component: () => import('../views/TaskDetail.vue')
  },
  {
    path: '/user-info',//个人信息
    name: 'UserInfo',
    component: () => import('../views/UserInfo.vue')
  },
  {
    path: '/searchTask',//个人信息
    name: 'SearchTask',
    component: () => import('../views/SearchTask.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
