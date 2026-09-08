import "server-only";

import { createHash } from "node:crypto";

import type {
  CheckoutInput,
  PaymentProvider,
  VerifiedPayment,
} from "@/modules/payments/providers/types";
import { PaymentProviderError } from "@/modules/payments/providers/types";

export class TestPaymentProvider implements PaymentProvider {
  readonly name = "CHAPA" as const;

  constructor(
    private readonly outcome: VerifiedPayment["status"] = "success",
  ) {}

  async createCheckout(input: CheckoutInput) {
    return {
      checkoutUrl: `${input.returnUrl.split("/payment/success")[0]}/api/payments/test-checkout?reference=${encodeURIComponent(input.merchantReference)}`,
    };
  }

  async verifyPayment(merchantReference: string): Promise<VerifiedPayment> {
    const { prisma } = await import("@/lib/db");
    const payment = await prisma.payment.findUniqueOrThrow({
      where: { merchantReference },
    });
    return {
      merchantReference,
      providerReference: `test_${merchantReference}`,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      status: this.outcome,
      mode: "test",
      paymentMethod: "test",
      failureReason:
        this.outcome === "failed" ? "Simulated payment failure." : undefined,
    };
  }

  verifyWebhook(rawBody: string, headers: Headers) {
    if (headers.get("x-yaye-test-signature") !== "valid") {
      throw new PaymentProviderError("Invalid test webhook signature.", true);
    }
    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    if (typeof payload.tx_ref !== "string") {
      throw new PaymentProviderError("Invalid test webhook payload.", true);
    }
    return {
      eventType: "charge.success",
      merchantReference: payload.tx_ref,
      eventKey: createHash("sha256").update(rawBody).digest("hex"),
      payload,
    };
  }
}
