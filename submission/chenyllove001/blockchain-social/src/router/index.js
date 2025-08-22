import { createRouter, createWebHistory } from 'vue-router'
import Register from '../components/Register.vue'
import Login from '../components/Login.vue'
import PostList from '../components/PostList.vue'
import PostDetail from '../components/PostDetail.vue'

const routes = [
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/', component: PostList, meta: { requiresAuth: true } },
  { path: '/post/:id', component: PostDetail, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!localStorage.getItem('isLoggedIn')) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
