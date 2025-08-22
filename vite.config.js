import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  server: {
    host: '0.0.0.0',     // 팀원들 간 네트워크 접근 가능
    port: 6006,          // 팀원이 변경한 포트 유지
    strictPort: false,   // 포트가 막히면 자동으로 6007, 6008로 증가
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Langfuse 백엔드
        changeOrigin: true,
        ws: true,
        // 필요시 주석 해제:
        // rewrite: p => p.replace(/^\/api/, ''),
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
      '@/components': path.resolve('./src/components'),
      '@/lib': path.resolve('./src/lib'),
      '@/pages': path.resolve('./src/pages'),
      '@/api': path.resolve('./src/api'),
    },
    extensions: ['.js', '.jsx']
  }
})