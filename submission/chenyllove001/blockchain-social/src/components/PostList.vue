<template>
  <div class="post-list-container">
    <!-- 发布新帖区域 -->
    <PostForm 
      :is-reply="false" 
      @postSuccess="refreshPosts"
      class="post-form"
    />

    <!-- 帖子列表筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="selectedType" placeholder="选择帖子类型" @change="handleTypeChange">
            <el-option label="全部" value="all"></el-option>
            <el-option label="技术" value="tech"></el-option>
            <el-option label="生活" value="life"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索标题" 
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="handleSearch"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8" class="text-right">
          <el-button type="primary" icon="el-icon-refresh" @click="refreshPosts">
            刷新列表
          </el-button>

          <el-button type="primary" icon="el-icon-refresh" @click="getNft">
            获取nft
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 帖子列表 -->
    <el-card class="posts-card" v-if="posts.length > 0">
      <div slot="header">
        <span>帖子列表</span>
        <span class="count-badge">{{ posts.length }} 篇帖子</span>
      </div>
      <el-list>
        <el-list-item 
          v-for="post in filteredPosts" 
          :key="post.id"
          class="post-item"
        >
          <el-card :body-style="{ padding: '15px' }">
            <div class="post-header">
              <el-avatar :src="getUserAvatar(post.username)" class="post-avatar"></el-avatar>
              <div class="post-meta">
                <div class="post-author">{{ post.username }}</div>
                <div class="post-time">{{ formatTime(post.time) }}</div>
              </div>
              <el-tag :type="getTagType(post.lx)">{{ getTypeName(post.lx) }}</el-tag>
            </div>
            <div class="post-title">
              <router-link :to="`/post/${post.id}`">{{ post.title }}</router-link>
            </div>
            <div class="post-content">{{ truncateContent(post.content) }}</div>
            <div class="post-actions">
              <!-- <el-button 
                type="text" 
                icon="el-icon-chat-round"
                @click="$router.push(`/post/${post.id}`)"
              >
                查看跟帖 ({{ post.replyCount || 0 }})
              </el-button> -->
              <el-button type="text" icon="el-icon-thumb" @click="dianzan(post.id)">
                点赞 ({{ post.voteCount }})
              </el-button>
              <el-button type="text" icon="el-icon-money" @click="showRewardDialog(post.id)">
                打赏 ({{ post.dashang }})
              </el-button>
            </div>
          </el-card>
        </el-list-item>
      </el-list>
    </el-card>

    <!-- 空状态 -->
    <el-empty 
      description="暂无帖子，快来发布第一篇帖子吧！"
      v-if="posts.length === 0 && !loading"
    ></el-empty>

    <!-- 加载状态 -->
    <el-loading 
      v-if="loading"
      text="加载中..."
      fullscreen
    ></el-loading>

    <!-- 打赏对话框 -->
    <el-dialog title="打赏" v-model="rewardDialogVisible" width="30%">
      <el-form>
        <el-form-item label="打赏金额">
          <el-input 
            v-model.number="rewardAmount" 
            type="number" 
            step="0.01"
            placeholder="请输入打赏金额"
            :min="0.01"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rewardDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleReward">打 赏</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import PostForm from './PostForm.vue'
import contractService from '../services/contract'
import { ethers } from 'ethers'
import { useStore } from 'vuex'
import { computed, onMounted, ref, watch } from 'vue'

export default {
  components: {
    PostForm
  },
  data() {
    return {
      posts: [],
      loading: false,
      selectedType: 'all',
      searchKeyword: '',
      // 添加打赏相关数据
      rewardDialogVisible: false,
      rewardAmount: 0,
      currentPostId: null
    }
  },
  setup() {
    const store = useStore()
    
    // 创建计算属性来访问 store state
    const currentUser = computed(() => store.state.currentUser)
    
    return {
      currentUser
    }
  },
  computed: {
    filteredPosts() {
      return this.posts.filter(post => {
        // 类型筛选
        const typeMatch = this.selectedType === 'all' || post.lx === this.selectedType
        // 关键词筛选
        const keywordMatch = !this.searchKeyword || 
          post.title.includes(this.searchKeyword) || 
          post.content.includes(this.searchKeyword)
        return typeMatch && keywordMatch
      })
    }
  },
  created() {
    this.initContract()
    this.refreshPosts()
  },
  methods: {
    async initContract() {
      await contractService.init()
    },
async refreshPosts(lx = '', title = '') {
  this.loading = true
      try {
        const result = await contractService.queryList(lx, title)
        console.log("---------"+result)
        const posts = []
        // 校验返回结果是否有效
    if (!result || !Array.isArray(result)) {
      console.error('queryList返回结果格式错误:', result)
      this.$message.warning('未获取到帖子数据')
      this.posts = []
      return
    }
    
    // 遍历结果，按元组索引解析字段（与合约TieziVo结构体字段顺序对应）
    for (let i = 0; i < result.length; i++) {
      const postTuple = result[i]
      // 跳过无效的元组（确保元组长度正确）
      if (!postTuple || postTuple.length !== 11) {
        console.warn(`跳过无效帖子数据: ${JSON.stringify(postTuple)}`)
        continue
      }
      
      // 解析元组字段（按合约结构体顺序：id, parentid, title, content, lx, time, status, username, voteCount）
      const parsedPost = {
        id: postTuple[0]?.toNumber(), // 安全访问，避免undefined
        parentid: postTuple[1]?.toNumber(),
        title: postTuple[2] || '',
        content: postTuple[3] || '',
        lx: postTuple[4] || '',
        time: postTuple[5]?.toNumber(),
        status: postTuple[6]?.toNumber(),
        username: postTuple[7] || '',
        voteCount: postTuple[8]?.toNumber() || 0,
        dashang: ethers.utils.formatEther(postTuple[9] || 0), 
        owner: postTuple[10] || ''
      }
      
      posts.push(parsedPost)
    }
    
    // 按时间排序（最新在前）
    this.posts = posts.sort((a, b) => b.time - a.time)
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    this.$message.error('获取帖子列表失败')
  } finally {
    this.loading = false
  }
    },
    getUserAvatar(username) {
      return localStorage.getItem(`avatar_${username}`) || ''
    },
    formatTime(timestamp) {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString()
    },
    truncateContent(content) {
      if (content.length > 100) {
        return content.substring(0, 100) + '...'
      }
      return content
    },
    getTypeName(type) {
      const typeMap = {
        'tech': '技术',
        'life': '生活',
        'other': '其他'
      }
      return typeMap[type] || type
    },
    getTagType(type) {
      const typeMap = {
        'tech': 'success',
        'life': 'warning',
        'other': 'info'
      }
      return typeMap[type] || 'primary'
    },
    handleTypeChange() {
      const lx = this.selectedType === 'all' ? '' : this.selectedType;
      this.refreshPosts(lx, this.searchKeyword);
    },
    handleSearch() {
     // 搜索时调用查询方法，传入搜索参数
      const lx = this.selectedType === 'all' ? '' : this.selectedType;
      this.refreshPosts(lx, this.searchKeyword);
    },
    async dianzan(_id) {
     // 搜索时调用查询方法，传入搜索参数
      const result = await contractService.dianzan(_id)
      if(result){
        const lx = this.selectedType === 'all' ? '' : this.selectedType;
        this.refreshPosts(lx, this.searchKeyword);
      }
    },
    async getNft() {
     // 搜索时调用查询方法，传入搜索参数
      const result = await contractService.getNft(this.currentUser)
      if(result){
        ElMessage.success('NFT获取成功!')
       }
    },
    // 添加显示打赏对话框的方法
    showRewardDialog(postId) {
      console.log('showRewardDialog called with postId:', postId); // 添加调试日志
      this.currentPostId = postId;
      this.rewardAmount = 0;
      this.rewardDialogVisible = true;
      console.log('rewardDialogVisible set to:', this.rewardDialogVisible); // 添加调试日志
    },
    // 添加处理打赏的方法
    async handleReward() {
      if (!this.rewardAmount || this.rewardAmount <= 0) {
        this.$message.warning('请输入有效的打赏金额');
        return;
      }
      
      if (!this.currentPostId) {
        this.$message.error('未选择帖子');
        return;
      }
      
      try {
        this.loading = true;
        // 调用合约的打赏方法
        const result = await contractService.dashang(this.currentPostId, this.rewardAmount);
        if (result) {
          this.$message.success('打赏成功');
          this.rewardDialogVisible = false;
          // 刷新帖子列表
          const lx = this.selectedType === 'all' ? '' : this.selectedType;
          this.refreshPosts(lx, this.searchKeyword);
        }
      } catch (error) {
        console.error('打赏失败:', error);
        this.$message.error('打赏失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.post-list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.post-form {
  margin-bottom: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.count-badge {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.post-item {
  margin-bottom: 15px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: space-between;
}

.post-avatar {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.post-meta {
  flex: 1;
}

.post-author {
  font-weight: 500;
}

.post-time {
  font-size: 12px;
  color: #666;
}

.post-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.post-title a {
  color: #333;
  text-decoration: none;
}

.post-title a:hover {
  color: #409eff;
}

.post-content {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.post-actions {
  display: flex;
  justify-content: flex-start;
  gap: 20px;
}
</style>