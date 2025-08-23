// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    // 2) copy the wasm from node_modules to a URL you control (/spark/)
    viteStaticCopy({
      targets: [{ src: 'node_modules/@sparkjsdev/spark/dist/*.wasm', dest: 'spark' }],
    }),
  ],
  optimizeDeps: {
    include: ['three'],
    exclude: ['@sparkjsdev/spark'], // keep Spark unbundled → preserves import.meta.url
  },
  assetsInclude: ['**/*.wasm', '**/*.spz', '**/*.ply'],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
})
