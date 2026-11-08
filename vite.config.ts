import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static build, no backend. Output goes to dist/.
// base "./" makes asset URLs relative, so the build works at a domain root (Vercel)
// and under a sub-path (for example GitHub Pages). Routing is hash-based, so no server rewrites.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
