import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

import type {
  CheckoutInput,
  CheckoutResult,
  PaymentProvider,
  VerifiedPayment,
  VerifiedWebhook,
} from "@/modules/payments/providers/types";
import { PaymentProviderError } from "@/modules/payments/providers/types";

const chapaApiUrl = "https://api.chapa.co/v1";
const chapaCheckoutHost = "checkout.chapa.co";

const initializeResponseSchema = z.object({
  status: z.string(),
  data: z.object({ checkout_url: z.string().url() }),
});

const verifyResponseSchema = z.object({
  status: z.string(),
  data: z.object({
    status: z.string(),
    tx_ref: z.string().min(1),
    reference: z.string().min(1),
    amount: z.union([z.string(), z.number()]).transform(String),
    currency: z.string().min(1),
    mode: z.enum(["test", "live"]),
    method: z.string().optional(),
    payment_method: z.string().optional(),
    failure_reason: z.string().optional(),
  }),
});

const webhookSchema = z
  .object({
    event: z.string().min(1),
    tx_ref: z.string().min(1),
    reference: z.string().optional(),
    status: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();

function safeHexEqual(actual: string | null, expected: string) {
  if (!actual || !/^[a-f0-9]+$/i.test(actual)) return false;
  const actualBuffer = Buffer.from(actual, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function mapStatus(status: string): VerifiedPayment["status"] {
  switch (status.toLowerCase()) {
    case "success":
      return "success";
    case "failed":
    case "cancelled":
    case "failed/cancelled":
      return "failed";
    case "refunded":
      return "refunded";
    case "reversed":
      return "reversed";
    default:
      return "pending";
  }
}

export class ChapaPaymentProvider implements PaymentProvider {
  readonly name = "CHAPA" as const;

  constructor(
    private readonly secretKey: string,
    private readonly webhookSecret: string,
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  private async request(
    url: string,
    init?: RequestInit,
    pendingWhenNotFound = false,
  ) {
    let response: Response;
    try {
      response = await this.fetcher(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
          ...init?.headers,
        },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new PaymentProviderError(
        "Chapa could not be reached. The payment remains pending.",
      );
    }

    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new PaymentProviderError(
        pendingWhenNotFound && response.status === 404
          ? "Chapa has not confirmed this payment yet."
          : response.status >= 500
            ? "Chapa is temporarily unavailable. The payment remains pending."
            : "Chapa rejected the payment request.",
        response.status >= 400 &&
          response.status < 500 &&
          !(pendingWhenNotFound && response.status === 404),
      );
    }
    return body;
  }

  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const names = input.name.trim().split(/\s+/);
    const body = await this.request(`${chapaApiUrl}/transaction/initialize`, {
      method: "POST",
      body: JSON.stringify({
        amount: input.amount,
        currency: input.currency,
        email: input.email,
        first_name: names[0] ?? input.name,
        last_name: names.slice(1).join(" ") || undefined,
        tx_ref: input.merchantReference,
        callback_url: input.callbackUrl,
        return_url: input.returnUrl,
        customization: {
          title: input.title,
          description: input.description,
        },
        meta: { payment_reason: input.description },
      }),
    });
    const parsed = initializeResponseSchema.safeParse(body);
    if (!parsed.success || parsed.data.status.toLowerCase() !== "success") {
      throw new PaymentProviderError(
        "Chapa returned an invalid checkout response.",
      );
    }
    const checkoutUrl = new URL(parsed.data.data.checkout_url);
    if (
      checkoutUrl.protocol !== "https:" ||
      checkoutUrl.hostname !== chapaCheckoutHost
    ) {
      throw new PaymentProviderError(
        "Chapa returned an untrusted checkout URL.",
      );
    }
    return { checkoutUrl: checkoutUrl.toString() };
  }

  async verifyPayment(merchantReference: string): Promise<VerifiedPayment> {
    const body = await this.request(
      `${chapaApiUrl}/transaction/verify/${encodeURIComponent(merchantReference)}`,
      undefined,
      true,
    );
    const parsed = verifyResponseSchema.safeParse(body);
    if (!parsed.success) {
      throw new PaymentProviderError(
        "Chapa returned an invalid verification response.",
      );
    }
    const data = parsed.data.data;
    return {
      merchantReference: data.tx_ref,
      providerReference: data.reference,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      status: mapStatus(data.status),
      mode: data.mode,
      paymentMethod: data.payment_method ?? data.method,
      failureReason: data.failure_reason,
    };
  }

  verifyWebhook(rawBody: string, headers: Headers): VerifiedWebhook {
    const payloadSignature = createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");
    const secretSignature = createHmac("sha256", this.webhookSecret)
      .update(this.webhookSecret)
      .digest("hex");
    const valid =
      safeHexEqual(headers.get("x-chapa-signature"), payloadSignature) ||
      safeHexEqual(headers.get("chapa-signature"), secretSignature);
    if (!valid) {
      throw new PaymentProviderError("Invalid Chapa webhook signature.", true);
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      throw new PaymentProviderError("Invalid Chapa webhook payload.", true);
    }
    const parsed = webhookSchema.safeParse(json);
    if (!parsed.success || !parsed.data.event.startsWith("charge.")) {
      throw new PaymentProviderError("Unsupported Chapa webhook event.", true);
    }
    const stableEvent = [
      parsed.data.event,
      parsed.data.tx_ref,
      parsed.data.reference ?? "",
      parsed.data.status ?? "",
      parsed.data.updated_at ?? "",
    ].join(":");
    return {
      eventType: parsed.data.event,
      merchantReference: parsed.data.tx_ref,
      eventKey: createHash("sha256").update(stableEvent).digest("hex"),
      payload: parsed.data,
    };
  }
}
