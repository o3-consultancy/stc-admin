import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Adjust base if serving under a sub-path (e.g., /admin/)
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
    base,
    plugins: [vue()],
    server: {
        port: 5173,
        host: true
    }
})
