import { defineConfig } from "vite";

import path from "path";

import react from "@vitejs/plugin-react";
import viteCompression from "vite-plugin-compression";
//import { VitePWA } from "vite-plugin-pwa";
import { createHtmlPlugin as html } from "vite-plugin-html";
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({}),
    svgr({}),
    html({ minify: true }),
    viteCompression({ algorithm: "gzip" }),
    viteCompression({ algorithm: "brotliCompress" }),
    //VitePWA({
    //  devOptions: { enabled: false },
    //  minify: true,
    //  registerType: "prompt",
    //  injectRegister: "inline",
    //  workbox: {
    //    globPatterns: ["**/*.{html,css,js,ico,json,png,svg,webp,woff2}"],
    //  },
    //  base: "/",
    //  manifest: {
    //    name: "Lords and Lands",
    //    short_name: "Lords and Lands",
    //    description: "Lords and Lands",
    //    categories: [],
    //    start_url: "/",
    //    display: "standalone",
    //    orientation: "any",
    //    theme_color: "#1A1B1E",
    //    background_color: "#1A1B1E",
    //    icons: [],
    //  },
    //}),
  ],
  server: {
    watch: { usePolling: true },
    host: true,
    port: 8008,
    strictPort: true,
    proxy: {
      "/api": {
        target: "ws://0.0.0.0:8009",
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "../core/src"),
      "@api": path.resolve(__dirname, "../api/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    reportCompressedSize: false,
  },
  base: process.env.NODE_ENV === "production" ? "https://cdn.dorkodu.com/lordsandlands/" : "",
});
