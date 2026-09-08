import { describe, expect, it } from "vitest";

import { nextPaymentStatus } from "@/modules/payments/lifecycle";

describe("payment lifecycle", () => {
  it("moves pending payments to verified terminal states", () => {
    expect(nextPaymentStatus("PENDING", "success")).toBe("SUCCESS");
    expect(nextPaymentStatus("PENDING", "failed")).toBe("FAILED");
    expect(nextPaymentStatus("PENDING", "pending")).toBe("PENDING");
  });

  it("does not downgrade successful or refunded payments", () => {
    expect(nextPaymentStatus("SUCCESS", "failed")).toBe("SUCCESS");
    expect(nextPaymentStatus("REFUNDED", "success")).toBe("REFUNDED");
  });

  it("records refunds and reversals without deleting history", () => {
    expect(nextPaymentStatus("SUCCESS", "refunded")).toBe("REFUNDED");
    expect(nextPaymentStatus("SUCCESS", "reversed")).toBe("REFUNDED");
  });
});
