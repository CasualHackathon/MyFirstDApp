<template>
  <div class="register-container">
    <el-card title="用户注册">
      <el-form ref="registerForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="form.confirmPassword"></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            action=""
            :auto-upload="false"
            :on-change="handleImageChange"
            accept="image/*">
            <el-button type="primary">选择图片</el-button>
          </el-upload>
          <el-image 
            v-if="imageUrl" 
            :src="imageUrl" 
            style="width: 100px; height: 100px; margin-top: 10px"
          ></el-image>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">注册</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-link type="primary" href="/login">已有账号？登录</el-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import contractService from '../services/contract'
import ipfsService from '../services/ipfs'

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.checkPassword, trigger: 'blur' }
        ]
      },
      imageUrl: '',
      selectedFile: null
    }
  },
  methods: {
    checkPassword(rule, value, callback) {
      if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },
    handleImageChange(file) {
      this.selectedFile = file.raw
      this.imageUrl = URL.createObjectURL(file.raw)
    },
    async submitForm() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          // 初始化合约
          const initialized = await contractService.init()
          if (!initialized) {
            this.$message.error('请安装MetaMask钱包')
            return
          }

          // 上传图片（如果有）
          let imageUrl = "";
          let jsonUrl = "";
          if (this.selectedFile) {
            imageUrl = await ipfsService.upload(this.selectedFile)
            if (imageUrl && imageUrl.length > 0) {
              var jsonData = {
                "description": "个人信息",
                "external_url": "https://openseacreatures.io/3",
                "image": imageUrl,
                "name": this.form.username,
                "attributes": [{
                  "trait_type": "来源",
                  "value": "fastDapp"
                }]
              };
              //上传json
              const jsonfile = {
                content: JSON.stringify(jsonData),
                path: 'data.json'
              };
              console.log("jsonfile", jsonfile)
              jsonUrl = await ipfsService.upload(jsonfile)
            }
          }
          console.log(jsonUrl+"====imageUrl==="+imageUrl)

          // 调用注册合约
          const success = await contractService.register(this.form.username, this.form.password,imageUrl,jsonUrl)
          console.log(success)
          if (success) {
            this.$message.success('注册成功，请登录')
            this.$router.push('/login')
          } else {
            this.$message.error('注册失败，可能用户名已存在')
          }
        }
      })
    },
    resetForm() {
      this.$refs.registerForm.resetFields()
      this.imageUrl = ''
      this.selectedFile = null
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 500px;
  margin: 50px auto;
}
</style>