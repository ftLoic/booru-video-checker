import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    base: '/booru-video-checker/',
    plugins: [
      vue(),
      viteStaticCopy({
        targets: [
          {
            src: "MediaInfoModule.wasm",
            dest: '',
          }
        ]
      })
    ]
  },
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: path.join(__dirname, 'node_modules', 'mediainfo.js', 'dist', 'MediaInfoModule.wasm').replace(/\\/g, '/'),
          dest: '',
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
