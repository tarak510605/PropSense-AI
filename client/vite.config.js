import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // ✅ This ensures all paths (CSS, JS, routes) resolve correctly in production
  base: '/',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // ✅ Optional: ensure build output goes into 'dist' (default)
  build: {
    outDir: 'dist',
  },
})
