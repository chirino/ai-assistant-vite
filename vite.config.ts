import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {TanStackRouterVite} from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react()
  ],
  resolve: {
    alias: {
      '@src/': '/src/',
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
