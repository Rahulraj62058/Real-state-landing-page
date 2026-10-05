import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite runs inside the Express server (middleware mode), so no proxy or second port is needed.
export default defineConfig({ plugins: [react()] });
