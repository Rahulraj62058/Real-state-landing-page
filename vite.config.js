import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base is set to the GitHub Pages sub-path; Vite in middleware mode ignores it at runtime.
export default defineConfig({
  plugins: [react()],
  base: '/Real-state-landing-page/',
});
