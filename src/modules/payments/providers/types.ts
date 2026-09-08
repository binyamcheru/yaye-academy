export type CheckoutInput = Readonly<{
  amount: string;
  currency: string;
  email: string;
  name: string;
  merchantReference: string;
  callbackUrl: string;
  returnUrl: string;
  title: string;
  description: string;
}>;

export type CheckoutResult = Readonly<{
  checkoutUrl: string;
}>;

export type VerifiedPayment = Readonly<{
  merchantReference: string;
  providerReference: string;
  amount: string;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded" | "reversed";
  mode: "test" | "live";
  paymentMethod?: string;
  failureReason?: string;
}>;

export type VerifiedWebhook = Readonly<{
  eventType: string;
  merchantReference: string;
  eventKey: string;
  payload: Record<string, unknown>;
}>;

export interface PaymentProvider {
  readonly name: "CHAPA";
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyPayment(merchantReference: string): Promise<VerifiedPayment>;
  verifyWebhook(rawBody: string, headers: Headers): VerifiedWebhook;
}

export class PaymentProviderError extends Error {
  constructor(
    message: string,
    readonly definitive = false,
  ) {
    super(message);
  }
}
