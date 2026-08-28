import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

import { ChapaPaymentProvider } from "@/modules/payments/providers/chapa";
import { PaymentProviderError } from "@/modules/payments/providers/types";

vi.mock("server-only", () => ({}));

function response(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("Chapa payment provider", () => {
  it("creates a server-authorized hosted checkout", async () => {
    let capturedInit: RequestInit | undefined;
    const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      capturedInit = init;
      return response({
        status: "success",
        data: {
          checkout_url: "https://checkout.chapa.co/checkout/payment/test-token",
        },
      });
    });
    const provider = new ChapaPaymentProvider(
      "CHASECK_TEST-secret",
      "webhook-secret-at-least-32-characters",
      fetcher as unknown as typeof fetch,
    );
    await expect(
      provider.createCheckout({
        amount: "2500.00",
        currency: "ETB",
        email: "sara@example.com",
        name: "Sara Learner",
        merchantReference: "yaye_reference",
        callbackUrl: "https://academy.example/api/payments/chapa/callback",
        returnUrl: "https://academy.example/payment/success",
        title: "Yaye Academy",
        description: "Backend Development Bootcamp",
      }),
    ).resolves.toEqual({
      checkoutUrl: "https://checkout.chapa.co/checkout/payment/test-token",
    });
    expect(capturedInit?.headers).toMatchObject({
      Authorization: "Bearer CHASECK_TEST-secret",
    });
    expect(JSON.parse(String(capturedInit?.body))).toMatchObject({
      amount: "2500.00",
      currency: "ETB",
      tx_ref: "yaye_reference",
    });
  });

  it("rejects an untrusted checkout host", async () => {
    const provider = new ChapaPaymentProvider(
      "secret",
      "webhook-secret-at-least-32-characters",
      (() =>
        response({
          status: "success",
          data: { checkout_url: "https://evil.example/checkout" },
        })) as typeof fetch,
    );
    await expect(
      provider.createCheckout({
        amount: "10.00",
        currency: "ETB",
        email: "sara@example.com",
        name: "Sara Learner",
        merchantReference: "reference",
        callbackUrl: "https://academy.example/callback",
        returnUrl: "https://academy.example/return",
        title: "Yaye Academy",
        description: "Program",
      }),
    ).rejects.toThrow("untrusted checkout URL");
  });

  it("normalizes verified Chapa payment details", async () => {
    const provider = new ChapaPaymentProvider(
      "secret",
      "webhook-secret-at-least-32-characters",
      (() =>
        response({
          status: "success",
          data: {
            status: "success",
            tx_ref: "yaye_reference",
            reference: "AP-test-reference",
            amount: 2500,
            currency: "ETB",
            mode: "test",
            method: "telebirr",
          },
        })) as typeof fetch,
    );
    await expect(provider.verifyPayment("yaye_reference")).resolves.toEqual({
      merchantReference: "yaye_reference",
      providerReference: "AP-test-reference",
      amount: "2500",
      currency: "ETB",
      status: "success",
      mode: "test",
      paymentMethod: "telebirr",
      failureReason: undefined,
    });
  });

  it("keeps an unconfirmed verification response pending", async () => {
    const provider = new ChapaPaymentProvider(
      "secret",
      "webhook-secret-at-least-32-characters",
      (() => response({ status: "failed", data: null }, 404)) as typeof fetch,
    );
    const error = await provider
      .verifyPayment("yaye_reference")
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(PaymentProviderError);
    expect((error as PaymentProviderError).definitive).toBe(false);
    expect((error as Error).message).toMatch(/not confirmed/i);
  });

  it("verifies signed webhook payloads and rejects tampering", () => {
    const secret = "webhook-secret-at-least-32-characters";
    const provider = new ChapaPaymentProvider("secret", secret);
    const rawBody = JSON.stringify({
      event: "charge.success",
      tx_ref: "yaye_reference",
      reference: "AP-reference",
      status: "success",
      updated_at: "2026-08-28T12:00:00Z",
    });
    const signature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    const headers = new Headers({ "x-chapa-signature": signature });
    expect(provider.verifyWebhook(rawBody, headers)).toMatchObject({
      eventType: "charge.success",
      merchantReference: "yaye_reference",
    });
    expect(() => provider.verifyWebhook(`${rawBody} `, headers)).toThrow(
      "Invalid Chapa webhook signature",
    );
  });
});
