import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
    // 添加代理配置解决跨域问题
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:10086',
        changeOrigin: true,
        secure: false
      }
    }
  }
})