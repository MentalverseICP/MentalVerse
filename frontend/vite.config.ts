import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { dirname } from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
      "@dfinity/identity/lib/cjs/identity/partial": resolve(dirname(fileURLToPath(import.meta.url)), "node_modules/@dfinity/identity/lib/cjs/identity/partial.js"),
    },
  },
  optimizeDeps: {
    include: [
      'scheduler'
    ],
    exclude: [
      '@slide-computer/signer-transport-stoic',
      '@slide-computer/signer-agent',
      '@slide-computer/signer-storage',
      '@nfid/identitykit',
      '@nfid/identitykit/react'
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  base: './',
  define: {
    global: 'globalThis',
  },
})
