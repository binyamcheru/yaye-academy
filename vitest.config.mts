import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
    env: {
      DATABASE_URL:
        "postgresql://yaye_academy:yaye_academy@localhost:5432/yaye_academy?schema=public",
      BETTER_AUTH_SECRET: "yaye-academy-test-secret-at-least-32-characters",
      BETTER_AUTH_URL: "http://localhost:3000",
      CHAPA_SECRET_KEY: "CHASECK_TEST-example-secret-key",
      CHAPA_WEBHOOK_SECRET: "webhook-secret-at-least-32-characters",
      CHAPA_MODE: "test",
    },
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
