import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  use: {
    baseURL: "https://api.openweathermap.org",
  },
  reporter: "list",
});
