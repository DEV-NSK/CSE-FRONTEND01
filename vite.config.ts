import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor'
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) return 'router'
          if (id.includes('node_modules/@tanstack/react-query')) return 'query'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/recharts')) return 'charts'
          if (id.includes('node_modules/@radix-ui')) return 'radix'
          if (id.includes('node_modules/lucide-react')) return 'icons'
        },
      },
    },
  },
})