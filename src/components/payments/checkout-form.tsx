"use client";

import { useActionState } from "react";

import { FormSubmit } from "@/components/ui/form-submit";
import {
  type CheckoutActionState,
  startCheckoutAction,
} from "@/modules/payments/actions";

export function CheckoutForm({ programId }: Readonly<{ programId: string }>) {
  const [state, formAction] = useActionState(
    startCheckoutAction,
    {} as CheckoutActionState,
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="programId" value={programId} />
      {state.message && (
        <p
          className="mb-4 border-l-2 border-danger bg-danger/7 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.message}
        </p>
      )}
      <FormSubmit>Continue to secure payment</FormSubmit>
      <p className="mt-3 text-xs leading-5 text-muted">
        Payment is completed on Chapa. Yaye Academy never receives your card or
        wallet credentials.
      </p>
    </form>
  );
}
