import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@theme': path.resolve(__dirname, './src/theme'),
    },
  },
  build: {
    // Optimize production build
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // MUI components
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            // State management
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'vendor-redux';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Forms & Utilities
            if (id.includes('date-fns') || id.includes('axios') || id.includes('notistack')) {
              return 'vendor-utils';
            }
            // Other vendor code
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit (we know about vendor chunks)
    chunkSizeWarningLimit: 1000,
    // Use esbuild for faster minification
    minify: 'esbuild',
    // Source maps for debugging (disable in production)
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
