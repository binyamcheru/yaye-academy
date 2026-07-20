import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/modules/auth/schemas";

describe("authentication input", () => {
  it("normalizes login email addresses", () => {
    const result = loginSchema.parse({
      email: "  Learner@Example.com ",
      password: "Learner1234!",
    });

    expect(result.email).toBe("learner@example.com");
  });

  it("requires a strong matching registration password", () => {
    const result = registerSchema.safeParse({
      name: "New Learner",
      email: "new@example.com",
      password: "short",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
      expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
    }
  });
});
