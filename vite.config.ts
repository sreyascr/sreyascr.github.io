import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// The site is served from the root of shreycr.github.io, so base stays "/".
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  // react-dom, motion and the router make up most of the first bundle (about 180 kB gzipped)
  build: { chunkSizeWarningLimit: 600 },
})
