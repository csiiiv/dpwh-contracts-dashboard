import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    base: '/',
      resolve: {
        alias: [
          { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
          { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
          { find: 'styled-components', replacement: path.resolve(__dirname, 'node_modules/styled-components/dist/styled-components.esm.js') },
          { find: '@', replacement: path.resolve(__dirname, 'src') },
        ],
      },
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-${Date.now()}.js`,
          assetFileNames: `assets/[name]-${Date.now()}.[ext]`
        }
      }
    },
    server: {
      host: env.VITE_HOST || '0.0.0.0',
      port: parseInt(env.VITE_PORT || '3000'),
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/admin': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
