import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { reconcilePayment } from "@/modules/payments/service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference =
    url.searchParams.get("tx_ref") ?? url.searchParams.get("trx_ref");
  if (!reference) {
    return NextResponse.redirect(
      new URL("/payment/failed", env.NEXT_PUBLIC_APP_URL),
    );
  }
  try {
    const payment = await reconcilePayment(reference);
    const destination = new URL("/payment/success", env.NEXT_PUBLIC_APP_URL);
    destination.searchParams.set("payment", payment.id);
    return NextResponse.redirect(destination);
  } catch {
    const destination = new URL("/payment/failed", env.NEXT_PUBLIC_APP_URL);
    destination.searchParams.set("reference", reference);
    return NextResponse.redirect(destination);
  }
}
