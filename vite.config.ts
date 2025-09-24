import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Frontend-data-profiling-portail/', 
  plugins: [react()],
})
