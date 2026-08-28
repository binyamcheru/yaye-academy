export type PaymentLifecycleStatus =
  "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export function nextPaymentStatus(
  current: PaymentLifecycleStatus,
  verified: "pending" | "success" | "failed" | "refunded" | "reversed",
): PaymentLifecycleStatus {
  if (current === "REFUNDED") return "REFUNDED";
  if (current === "SUCCESS") {
    return verified === "refunded" || verified === "reversed"
      ? "REFUNDED"
      : "SUCCESS";
  }
  if (current === "FAILED") return "FAILED";
  switch (verified) {
    case "success":
      return "SUCCESS";
    case "failed":
      return "FAILED";
    case "refunded":
    case "reversed":
      return "REFUNDED";
    default:
      return "PENDING";
  }
}
