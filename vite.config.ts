import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Set to "/<repo-name>/" when building for a GitHub Pages project site.
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
})
