import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => {
  return {
    plugins: [react(),tailwindcss()],
    // If we are building for GitHub, use the repo name. 
    // If we are running local dev, use the normal root path!
    base: command === 'build' ? '/Nuero-Stack/' : '/',
  }
})
