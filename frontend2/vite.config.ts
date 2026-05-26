import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    tsr: {
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    },

    server: {
      entry: "./src/server.ts",
    },
  },
});