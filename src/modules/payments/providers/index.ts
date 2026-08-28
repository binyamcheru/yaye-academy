import "server-only";

import { env } from "@/lib/env";
import { ChapaPaymentProvider } from "@/modules/payments/providers/chapa";
import { TestPaymentProvider } from "@/modules/payments/providers/test-provider";

export function getPaymentProvider() {
  if (env.PAYMENT_TEST_ADAPTER) {
    if (env.NODE_ENV === "production") {
      throw new Error("The payment test adapter cannot run in production.");
    }
    return new TestPaymentProvider();
  }
  return new ChapaPaymentProvider(
    env.CHAPA_SECRET_KEY,
    env.CHAPA_WEBHOOK_SECRET,
  );
}
