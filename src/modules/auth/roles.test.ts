import { describe, expect, it } from "vitest";

import { isAppRole, roleHomePath } from "@/modules/auth/roles";

describe("academy roles", () => {
  it.each([
    ["ADMIN", "/admin"],
    ["INSTRUCTOR", "/instructor"],
    ["LEARNER", "/dashboard"],
  ] as const)("maps %s to its workspace", (role, path) => {
    expect(isAppRole(role)).toBe(true);
    expect(roleHomePath(role)).toBe(path);
  });

  it("rejects unknown roles", () => {
    expect(isAppRole("OWNER")).toBe(false);
    expect(isAppRole(undefined)).toBe(false);
  });
});
