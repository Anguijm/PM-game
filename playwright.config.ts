import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    testIdAttribute: "data-tutorial",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
