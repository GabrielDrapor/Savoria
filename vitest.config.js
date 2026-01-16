import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.{test,spec}.{js,ts,vue}'],
    exclude: ['tests/e2e/**/*'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/workspace/src'
    }
  }
})
