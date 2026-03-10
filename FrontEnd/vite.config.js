import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true, // Important for Docker
    proxy: {
      '/api': {
        target: process.env.USE_DOCKER === 'true' 
          ? 'http://spring-backend:8080'  // Docker service name
          : 'http://localhost:8080',       // Local development
        changeOrigin: true,
        secure: false,
      }
    }
  }
})