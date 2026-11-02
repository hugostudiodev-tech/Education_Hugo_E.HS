// Build thư viện đối tác: npm run build:sdk → sdk/dist (ESM + style.css) → npm pack.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = (id) => /^(react|react-dom|react\/jsx-runtime)$/.test(id);

export default defineConfig({
  root,
  // Ảnh/âm thanh của khoá học tải từ trang Education Hugo, không nhét vào gói.
  publicDir: false,
  css: { postcss: root },
  resolve: {
    alias: [
      { find: /^react-i18next$/, replacement: `${root}src/sdk/i18nShim.js` },
      { find: /^motion\/react$/, replacement: "framer-motion" },
    ],
  },
  define: { "import.meta.env.VITE_API_URL": JSON.stringify("https://education.hugowishpax.studio/api") },
  plugins: [react()],
  build: {
    outDir: `${root}sdk/dist`,
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: { entry: `${root}src/sdk/index.js`, formats: ["es"], fileName: () => "index.js" },
    rollupOptions: { external: pkg, output: { assetFileNames: (a) => (a.name?.endsWith(".css") ? "style.css" : "assets/[name][extname]") } },
  },
});
