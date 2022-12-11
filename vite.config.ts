/// <reference types="vitest" />
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Torrefy",
      fileName: "index",
    },
    emptyOutDir: false,
  },
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
