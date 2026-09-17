import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The 3D scene chunk is large (three.js) but is lazy-loaded on demand.
    chunkSizeWarningLimit: 1300,
  },
})