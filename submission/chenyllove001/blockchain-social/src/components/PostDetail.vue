<template>
  <div class="post-detail-container">
    <!-- 返回按钮 -->
    <el-button 
      icon="el-icon-arrow-left" 
      @click="$router.push('/')"
      class="back-button"
    >
      返回列表
    </el-button>

    <!-- 帖子详情卡片 -->
    <el-card class="post-card">
      <div slot="header">
        <el-tag :type="getTagType(post.lx)">{{ getTypeName(post.lx) }}</el-tag>
      </div>
      
      <div class="post-header">
        <el-avatar :src="getUserAvatar(post.username)" class="post-avatar"></el-avatar>
        <div class="post-meta">
          <div class="post-author">{{ post.username }}</div>
          <div class="post-time">{{ formatTime(post.time) }}</div>
        </div>
      </div>
      
      <div class="post-title">{{ post.title }}</div>
      <div class="post-content">{{ post.content }}</div>
      
      <div class="post-actions">
        <el-button type="text" icon="el-icon-thumb">
          点赞 ({{ post.voteCount }})
        </el-button>
      </div>
    </el-card>

    <!-- 发布跟帖区域 -->
    <PostForm 
      :is-reply="true" 
      :parent-id="postId"
      @postSuccess="refreshReplies"
      class="reply-form"
    />

    <!-- 跟帖列表 -->
    <el-card class="replies-card">
      <div slot="header">
        <span>跟帖列表</span>
        <span class="count-badge">{{ replies.length }} 条跟帖</span>
      </div>
      
      <el-list v-if="replies.length > 0">
        <el-list-item 
          v-for="reply in replies" 
          :key="reply.id"
          class="reply-item"
        >
          <el-avatar :src="getUserAvatar(reply.username)" class="reply-avatar"></el-avatar>
          <div class="reply-content">
            <div class="reply-meta">
              <span class="reply-author">{{ reply.username }}</span>
              <span class="reply-time">{{ formatTime(reply.time) }}</span>
            </div>
            <div class="reply-text">{{ reply.content }}</div>
            <div class="reply-actions">
              <el-button type="text" icon="el-icon-thumb" size="small">
                点赞 ({{ reply.voteCount }})
              </el-button>
            </div>
          </div>
        </el-list-item>
      </el-list>
      
      <el-empty 
        description="暂无跟帖，快来发表你的观点吧！"
        v-if="replies.length === 0 && !loadingReplies"
      ></el-empty>
    </el-card>

    <!-- 加载状态 -->
    <el-loading 
      v-if="loading"
      text="加载中..."
      fullscreen
    ></el-loading>
  </div>
</template>

<script>
import PostForm from './PostForm.vue'
import contractService from '../services/contract'

export default {
  components: {
    PostForm
  },
  data() {
    return {
      postId: 0,
      post: {},
      replies: [],
      loading: false,
      loadingReplies: false
    }
  },
  created() {
    // 从路由参数获取帖子ID
    this.postId = parseInt(this.$route.params.id)
    this.initContract()
    this.loadPostDetail()
  },
  methods: {
    async initContract() {
      await contractService.init()
    },
    async loadPostDetail() {
      this.loading = true
      try {
        // 获取帖子详情
        const post = await contractService.getPost(this.postId)
        if (post && post.status === 1) {
          this.post = {
            id: post.id.toNumber(),
            title: post.title,
            content: post.content,
            lx: post.lx,
            time: post.time.toNumber(),
            username: post.username,
            voteCount: post.voteCount.toNumber(),
            parentid: post.parentid.toNumber()
          }
          
          // 加载跟帖
          this.refreshReplies()
        } else {
          this.$message.error('帖子不存在或已被删除')
          this.$router.push('/')
        }
      } catch (error) {
        console.error('获取帖子详情失败:', error)
        this.$message.error('获取帖子详情失败')
      } finally {
        this.loading = false
      }
    },
    async refreshReplies() {
      this.loadingReplies = true
      try {
        // 获取跟帖ID列表
        const replyIds = await contractService.getReplies(this.postId)
        const replies = []
        
        // 获取每条跟帖的详情
        for (const id of replyIds) {
          const reply = await contractService.getPost(id.toNumber())
          if (reply && reply.status === 1) {
            replies.push({
              id: reply.id.toNumber(),
              content: reply.content,
              time: reply.time.toNumber(),
              username: reply.username,
              voteCount: reply.voteCount.toNumber()
            })
          }
        }
        
        // 按时间排序，最新的在后
        this.replies = replies.sort((a, b) => a.time - b.time)
      } catch (error) {
        console.error('获取跟帖失败:', error)
        this.$message.error('获取跟帖失败')
      } finally {
        this.loadingReplies = false
      }
    },
    getUserAvatar(username) {
      return localStorage.getItem(`avatar_${username}`) || ''
    },
    formatTime(timestamp) {
      const date = new Date(timestamp * 1000)
      return date.toLocaleString()
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
    }
  }
}
</script>

<style scoped>
.post-detail-container {
  max-width: 1000px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.post-card {
  margin-bottom: 30px;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.post-avatar {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

.post-meta {
  flex: 1;
}

.post-author {
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 5px;
}

.post-time {
  font-size: 12px;
  color: #666;
}

.post-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.post-content {
  line-height: 1.8;
  font-size: 16px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.reply-form {
  margin-bottom: 30px;
}

.replies-card {
  margin-bottom: 30px;
}

.count-badge {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.reply-item {
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.reply-avatar {
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.reply-content {
  flex: 1;
}

.reply-meta {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

.reply-author {
  font-weight: 500;
}

.reply-time {
  font-size: 12px;
  color: #666;
}

.reply-text {
  line-height: 1.6;
  margin-bottom: 5px;
}
</style>
