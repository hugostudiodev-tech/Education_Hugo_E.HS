import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

const PACKAGE_VERSION = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
const REVISION = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "";
const APP_VERSION = REVISION ? `${PACKAGE_VERSION}+${REVISION.slice(0, 7)}` : PACKAGE_VERSION;
// Dev mặc định nói chuyện với backend Education cục bộ; muốn chạy với production:
// VITE_DEV_BACKEND_URL=https://education-hugo-api.onrender.com npm run dev
const DEV_BACKEND = process.env.VITE_DEV_BACKEND_URL || "http://localhost:8100";

export default defineConfig({
  define: {
    "import.meta.env.VITE_BUILD_TARGET": JSON.stringify("web"),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(APP_VERSION),
  },
  // Bộ icon động (components/icons/animated) viết theo `motion/react` — cùng API với framer-motion.
  resolve: { alias: [{ find: /^motion\/react$/, replacement: "framer-motion" }] },
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      // Manifest là public/edu.webmanifest (index.html trỏ thẳng tới), không để plugin sinh.
      manifest: false,
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
        importScripts: ["/push-sw.js"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//, /^\/ws/],
        // Chỉ app shell được precache; route/lesson chunks vào runtime cache khi thật sự mở.
        globPatterns: ["**/*.{html,svg,png,woff2}", "assets/index-*.{js,css}"],
        globIgnores: ["**/image/**", "**/edu/video/**", "**/edu/mail/**"],
        runtimeCaching: [
          { urlPattern: /\/api(?:\/|$)/, handler: "NetworkOnly" },
          { urlPattern: /\/assets\/.*\.(js|css)$/, handler: "StaleWhileRevalidate", options: { cacheName: "edu-assets", expiration: { maxEntries: 120, maxAgeSeconds: 30 * 86400 } } },
        ],
      },
    }),
  ],
  server: {
    port: 3002,
    host: true,
    proxy: {
      "/ws": { target: DEV_BACKEND.replace(/^http/, "ws"), ws: true, changeOrigin: true, secure: false },
      "/api": { target: DEV_BACKEND, changeOrigin: true, secure: false },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("i18next")) return "i18n";
          if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) return "vendor";
        },
      },
    },
  },
});
