import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const PREVIEW = !!process.env.VITE_PREVIEW;
const root = fileURLToPath(new URL(".", import.meta.url));

// For the one-file preview: put the theme script inline and drop the external favicon.
const inlineForPreview = {
  name: "winpac-preview-html",
  transformIndexHtml(html) {
    const theme = readFileSync(root + "public/theme-init.js", "utf8");
    return html.replace('<script src="/theme-init.js"></script>', `<script>${theme}</script>`).replace('<link rel="icon" href="/favicon.png">', "");
  }
};

export default defineConfig(async () => {
  const plugins = [vue()];
  if (PREVIEW) { const { viteSingleFile } = await import("vite-plugin-singlefile"); plugins.push(inlineForPreview, viteSingleFile()); }
  return {
    root,
    plugins,
    publicDir: PREVIEW ? false : "public",
    build: { outDir: PREVIEW ? "dist-preview" : "dist", emptyOutDir: true, assetsInlineLimit: PREVIEW ? 100000000 : 0 },
    server: { port: 5173, proxy: { "/api": "http://localhost:8080", "/uploads": "http://localhost:8080" } }
  };
});
