import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { TestPaymentProvider } from "@/modules/payments/providers/test-provider";
import { reconcilePayment } from "@/modules/payments/service";

export async function GET(request: Request) {
  if (!env.PAYMENT_TEST_ADAPTER || env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  const url = new URL(request.url);
  const reference = url.searchParams.get("reference");
  const outcome = url.searchParams.get("outcome");
  if (!reference) return new Response("Missing reference", { status: 400 });

  if (!outcome) {
    return new Response(
      `<!doctype html><html><body><main><h1>Chapa test checkout</h1><a href="?reference=${encodeURIComponent(reference)}&outcome=success">Complete payment</a><a href="?reference=${encodeURIComponent(reference)}&outcome=failed">Fail payment</a></main></body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
  const status = outcome === "success" ? "success" : "failed";
  const payment = await reconcilePayment(
    reference,
    new TestPaymentProvider(status),
  );
  const destination = new URL(
    status === "success" ? "/payment/success" : "/payment/failed",
    env.NEXT_PUBLIC_APP_URL,
  );
  destination.searchParams.set("payment", payment.id);
  return NextResponse.redirect(destination);
}
