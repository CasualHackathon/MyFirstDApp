<template>
  <div class="login-container">
    <el-card title="用户登录">
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="账号密码登录" name="username">
          <el-form ref="loginForm" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="form.password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loginByUsername">登录</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="MetaMask登录" name="metamask">
          <div class="metamask-login">
            <el-button type="primary" icon="el-icon-link" @click="loginByMetaMask">
              连接MetaMask登录
            </el-button>
            <p style="margin-top: 20px; color: #666;">
              请确保您已使用该钱包地址注册过账号
            </p>
          </div>
        </el-tab-pane>
      </el-tabs>
      <el-link type="primary" href="/register" style="margin-top: 15px; display: block;">
        没有账号？注册
      </el-link>
    </el-card>
  </div>
</template>

<script>
import contractService from '../services/contract'

export default {
  data() {
    return {
      activeTab: 'username',
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm() {
      this.$refs.loginForm.resetFields()
    },
    async loginByUsername() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          const initialized = await contractService.init()
          if (!initialized) {
            this.$message.error('请安装MetaMask钱包')
            return
          }

          const user = await contractService.loginByUsername(
            this.form.username, 
            this.form.password
          )
          
          if (user) {
            // 获取当前地址
            const address = await contractService.signer.getAddress()
            this.$store.commit('setUser', {
              username: user[0],
              image: user[2],
              address: user[4]
            })
            this.$message.success('登录成功')
            this.$router.push('/')
          } else {
            this.$message.error('登录失败，用户名或密码错误')
          }
        }
      })
    },
    async loginByMetaMask() {
      const initialized = await contractService.init()
      if (!initialized) {
        this.$message.error('请安装MetaMask钱包')
        return
      }

      const address = await contractService.signer.getAddress()
      const user = await contractService.loginByMetaMask(address)
      
      if (user) {
        this.$store.commit('setUser', {
              username: user[0],
              image: user[2],
              address: user[4]
        })
        this.$message.success('登录成功')
        this.$router.push('/')
      } else {
        this.$message.error('登录失败，该地址未注册')
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  max-width: 500px;
  margin: 50px auto;
}
.metamask-login {
  text-align: center;
  padding: 20px 0;
}
</style>