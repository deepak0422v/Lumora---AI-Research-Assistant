import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    TanStackRouterVite(),

    react(),

    tanstackStart(),
  ],

  resolve: {
    alias: {
      "@": "./src",
    },
  },
});