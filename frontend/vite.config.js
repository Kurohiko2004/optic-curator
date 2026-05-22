import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép truy cập từ Docker
    watch: {
      usePolling: true, // QUAN TRỌNG: Buộc Vite phải quét file để nhận thay đổi từ Volume
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8082', // Sửa lại target thành localhost cho chạy trên local
        changeOrigin: true,
      },
    },
  },
})
