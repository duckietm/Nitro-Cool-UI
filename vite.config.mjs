// vite.config.js
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "~": resolve(__dirname, "node_modules"),
      submodules: resolve(__dirname, "submodules"),
    },
  },
  build: {
    assetsInlineLimit: 102400,
    rollupOptions: {
      output: {
        assetFileNames: "src/assets/[name].[ext]",
        manualChunks: (id) => {
          if (id.includes("submodules")) {
            return "nitro-renderer";
          }

          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
