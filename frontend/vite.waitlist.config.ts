import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../mentalverse/waitlist_dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'waitlist.html')
      },
      output: {
        entryFileNames: 'assets/waitlist.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/waitlist.[ext]'
      }
    }
  },
  server: {
    port: 5174
  }
});