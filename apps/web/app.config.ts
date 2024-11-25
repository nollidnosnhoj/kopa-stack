// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    preset: "node-server",
  },
  vite: {
    plugins: [
      tsconfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
