import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('pdf-lib')) return 'pdf-lib';
          if (id.includes('mermaid')) return 'mermaid';
          if (id.includes('@codemirror') || id.includes('@uiw/react-codemirror')) return 'codemirror';
        },
      },
    },
  },
})
