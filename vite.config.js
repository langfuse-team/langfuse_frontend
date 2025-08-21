import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',   // 또는 '0.0.0.0' (회사망/보안툴 따라 둘 다 시도)
    port: 6006,          // 프론트 전용 포트 (3000과 별개)
    strictPort: false,   // 막히면 자동으로 6007, 6008 …로 올라감
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Langfuse 백엔드
        changeOrigin: true,
        ws: true,
        // 백엔드 라우트가 /api 프리픽스가 없다면 주석 해제:
        // rewrite: p => p.replace(/^\/api/, ''),
      }
    }
  }
})
