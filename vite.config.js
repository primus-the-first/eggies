import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',       // simulates a browser
    setupFiles: './src/test/setup.js',
    globals: true,              // no need to import describe/it/expect in every file
  },
})
