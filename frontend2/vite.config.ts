import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    react(),
    tanstackStart({
      customViteReactPlugin: true,
      server: {
        entry: "./src/server.ts",
      },
    }),
  ],
});