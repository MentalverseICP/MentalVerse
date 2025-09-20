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
    outDir: '../mentalverse/frontend_dist',
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
    'process.env.CANISTER_ID_MENTALVERSE_BACKEND': JSON.stringify(process.env.VITE_CANISTER_ID_BACKEND || 'rrkah-fqaaa-aaaaa-aaaaq-cai'),
    'process.env.CANISTER_ID_MVT_TOKEN': JSON.stringify(process.env.VITE_CANISTER_ID_TOKEN || 'ryjl3-tyaaa-aaaaa-aaaba-cai'),
    'process.env.CANISTER_ID_SECURE_MESSAGING': JSON.stringify(process.env.VITE_CANISTER_ID_MESSAGING || 'rdmx6-jaaaa-aaaaa-aaadq-cai'),
    'process.env.DFX_NETWORK': JSON.stringify(process.env.VITE_DFX_NETWORK || 'local'),
  },
})
