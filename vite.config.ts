import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://hackatum25.sixt.io',
        changeOrigin: true,
        secure: true,
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/preferences': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/questions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tasks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/track-protection-plan': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/agentic-selector': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/protection-package': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

