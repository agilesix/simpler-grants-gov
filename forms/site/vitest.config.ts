import { defineConfig } from "vitest/config";

import { sggFrontend } from "./src/vendor/sgg/vitePlugin.mjs";

export default defineConfig({
  plugins: [sggFrontend()],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
