import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { resolve } from 'path'
import { dirname } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "@dfinity/identity/lib/cjs/identity/partial": resolve(dirname(fileURLToPath(import.meta.url)), "node_modules/@dfinity/identity/lib/cjs/identity/partial.js"),
    },
  },
  optimizeDeps: {
    include: [
      'scheduler',
      'emailjs-com',
      '@emailjs/browser',
      'sonner',
      'react-hot-toast',
      'framer-motion',
      'react',
      'react-dom',
      'lucide-react',
      'react/jsx-runtime'
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
    outDir: '../mentalverse/waitlist_dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'waitlist.html'),
        waitlist: path.resolve(__dirname, 'src/waitlist-main.tsx')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/waitlist.[ext]',
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('@emailjs/browser') || id.includes('emailjs-com')) {
              return 'emailjs';
            }
            if (id.includes('framer-motion') || id.includes('sonner') || id.includes('react-hot-toast') || id.includes('lucide-react')) {
              return 'ui';
            }
            return 'vendor';
          }
        },
      },
      external: []
    }
  },
  base: './',
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.VITE_WAITLIST_CANISTER_ID': JSON.stringify(process.env.VITE_WAITLIST_CANISTER_ID || 'mooh3-raaaa-aaaac-a4k4q-cai'),
    'process.env.DFX_NETWORK': JSON.stringify(process.env.VITE_DFX_NETWORK || 'local'),
  },
  server: {
    port: 5174
  }
});