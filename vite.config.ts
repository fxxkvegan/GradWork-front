import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // APIリクエストをバックエンドサーバーにプロキシ
      '/api': {
        target: 'http://localhost:8080', // バックエンドサーバーのURL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
