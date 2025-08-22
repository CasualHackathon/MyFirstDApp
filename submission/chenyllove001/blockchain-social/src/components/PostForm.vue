<template>
  <el-card :title="isReply ? '发布跟帖' : '发布新帖'">
    <el-form ref="postForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title" v-if="!isReply">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <el-input
          type="textarea"
          v-model="form.content"
          :rows="5"
        ></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="lx" v-if="!isReply">
        <el-select v-model="form.lx" placeholder="请选择类型">
          <el-option label="技术" value="tech"></el-option>
          <el-option label="生活" value="life"></el-option>
          <el-option label="其他" value="other"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitPost">发布</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import contractService from '../services/contract'

export default {
  props: {
    isReply: {
      type: Boolean,
      default: false
    },
    parentId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      form: {
        title: '',
        content: '',
        lx: 'tech',
        username: this.$store.state.currentUser,
        parentid: this.parentId,
        id: 0,
        time: 0,
        status: 1,
        voteCount: 0
      },
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入内容', trigger: 'blur' }
        ],
        lx: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    async submitPost() {
      this.$refs.postForm.validate(async (valid) => {
        if (valid) {
          const success = await contractService.publishPost(this.form)
          if (success) {
            this.$message.success('发布成功')
            this.$emit('postSuccess')
            this.cancel()
          } else {
            this.$message.error('发布失败')
          }
        }
      })
    },
    cancel() {
      this.$refs.postForm.resetFields()
      this.$emit('cancel')
    }
  }
}
</script>