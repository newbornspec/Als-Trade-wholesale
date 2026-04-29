import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api requests to Express
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Forward all /uploads requests to Express so images load correctly
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
