import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'app',
  base: './',
  define: {
    // Polyfills pour PixiJS v3 qui utilise des variables globales Node.js
    'global': 'globalThis',
    'process.env': {}
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'app/index.html')
      }
    }
  },
  server: {
    port: 8000,
    open: true
  },
  resolve: {
    alias: {
      // Box2D doit être accessible
      '@': resolve(__dirname, 'app/js')
    }
  },
  optimizeDeps: {
    // Force l'inclusion de Box2D et PixiJS pour éviter les problèmes de pré-bundling
    include: ['pixi.js']
  }
});
