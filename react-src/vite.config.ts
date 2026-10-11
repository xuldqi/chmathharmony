/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: './',
  build: {
    sourcemap: false,
    target: 'es2017',
    minify: 'terser',
    // 当前构建策略为单文件 app.js（兼容 legacy WebView），提高阈值避免无意义告警
    chunkSizeWarningLimit: 2500,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
        passes: 2,
        toplevel: true,
      },
      format: {
        comments: false,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        format: 'iife',
        // 强制所有内容打包到一个文件中
        manualChunks: undefined,
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/app.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/app.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  },
  plugins: [
    react({
      babel: command === 'serve'
        ? {
            plugins: ['react-dev-locator'],
          }
        : undefined,
    }),
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
}))
