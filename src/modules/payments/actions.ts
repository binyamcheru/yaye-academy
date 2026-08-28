"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/modules/auth/session";
import { createPaidCheckout, PaymentError } from "@/modules/payments/service";
import { PaymentProviderError } from "@/modules/payments/providers/types";

export type CheckoutActionState = Readonly<{ message?: string }>;

export async function startCheckoutAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const session = await requireRole("LEARNER");
  const programId = z.string().min(1).safeParse(formData.get("programId"));
  if (!programId.success) return { message: "Program not found." };

  let checkoutUrl: string;
  try {
    const payment = await createPaidCheckout(session.user, programId.data);
    if (!payment.checkoutUrl) {
      return { message: "Checkout is still being prepared. Please try again." };
    }
    checkoutUrl = payment.checkoutUrl;
  } catch (error) {
    return {
      message:
        error instanceof PaymentError || error instanceof PaymentProviderError
          ? error.message
          : "Checkout could not be started.",
    };
  }
  redirect(checkoutUrl);
}
