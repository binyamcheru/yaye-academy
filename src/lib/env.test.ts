import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/lib/env";

describe("parseServerEnv", () => {
  it("applies Yaye Academy defaults", () => {
    const env = parseServerEnv({
      DATABASE_URL: "postgresql://user:password@localhost:5432/yaye",
      BETTER_AUTH_SECRET: "a-test-secret-that-is-at-least-32-characters",
      CHAPA_SECRET_KEY: "CHASECK_TEST-example-secret-key",
      CHAPA_WEBHOOK_SECRET: "webhook-secret-at-least-32-characters",
    });

    expect(env.APP_NAME).toBe("Yaye Academy");
    expect(env.DEFAULT_CURRENCY).toBe("ETB");
    expect(env.DEFAULT_TIMEZONE).toBe("Africa/Addis_Ababa");
  });

  it("rejects a non-PostgreSQL database URL", () => {
    expect(() =>
      parseServerEnv({
        DATABASE_URL: "mysql://localhost/yaye",
        CHAPA_SECRET_KEY: "CHASECK_TEST-example-secret-key",
        CHAPA_WEBHOOK_SECRET: "webhook-secret-at-least-32-characters",
      }),
    ).toThrow("DATABASE_URL must be a PostgreSQL connection string");
  });
});
