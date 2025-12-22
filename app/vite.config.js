import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  define: {
    // Polyfills pour PixiJS v3 qui utilise des variables globales Node.js
    global: "globalThis",
    "process.env": {},
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  server: {
    port: 8000,
    open: true,
    host: "0.0.0.0",
    allowedHosts: ["supersprint.persistor.ovh"],
  },
  resolve: {
    alias: {
      // Box2D doit être accessible
      "@": resolve(__dirname, "js"),
    },
  },
  optimizeDeps: {
    // Force l'inclusion de Box2D et PixiJS pour éviter les problèmes de pré-bundling
    include: ["pixi.js"],
  },
});
