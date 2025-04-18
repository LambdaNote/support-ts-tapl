import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "tiny-ts-parser.ts",
  ],
  splitting: true,
  sourcemap: true,
  dts: true,
  format: ["cjs", "esm"],
});
