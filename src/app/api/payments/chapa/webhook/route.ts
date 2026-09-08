import {
  PaymentError,
  processPaymentWebhook,
} from "@/modules/payments/service";
import { PaymentProviderError } from "@/modules/payments/providers/types";

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    await processPaymentWebhook(rawBody, request.headers);
    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof PaymentProviderError && error.definitive) {
      return Response.json({ received: false }, { status: 401 });
    }
    if (
      error instanceof PaymentError &&
      error.message === "Payment not found."
    ) {
      return Response.json({ received: true });
    }
    return Response.json({ received: false }, { status: 503 });
  }
}
