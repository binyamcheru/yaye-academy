import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import {
  getLearnerPayment,
  reconcilePayment,
} from "@/modules/payments/service";

export default async function PaymentSuccessPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ payment?: string }> }>) {
  const session = await requireRole("LEARNER");
  const { payment: paymentId } = await searchParams;
  if (!paymentId) notFound();
  let payment = await getLearnerPayment(session.user.id, paymentId);
  if (!payment) notFound();
  if (payment.status === "PENDING") {
    try {
      await reconcilePayment(payment.merchantReference);
    } catch {
      // The stored server state remains authoritative when Chapa is unavailable.
    }
    payment = await getLearnerPayment(session.user.id, paymentId);
    if (!payment) notFound();
  }

  const successful = payment.status === "SUCCESS";
  return (
    <div className="min-h-screen bg-workspace px-5 py-14 sm:px-8">
      <main className="mx-auto max-w-2xl border-t-2 border-ink bg-white px-5 py-8 sm:px-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Payment status
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">
          {successful
            ? "Payment verified"
            : payment.status === "FAILED"
              ? "Payment failed"
              : "Verification pending"}
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          {successful
            ? `Your enrollment in ${payment.program.title} is active.`
            : payment.status === "FAILED"
              ? "Chapa did not verify this payment, so no enrollment was created."
              : "We have not yet received trusted confirmation from Chapa. No enrollment will be created until verification succeeds."}
        </p>
        <dl className="mt-7 divide-y divide-ink/10 border-y border-ink/10">
          <div className="flex justify-between gap-5 py-4 text-sm">
            <dt className="text-muted">Amount</dt>
            <dd className="font-semibold">
              {payment.amount.toFixed(2)} {payment.currency}
            </dd>
          </div>
          <div className="flex justify-between gap-5 py-4 text-sm">
            <dt className="text-muted">Reference</dt>
            <dd className="font-mono text-xs">{payment.merchantReference}</dd>
          </div>
          <div className="flex justify-between gap-5 py-4 text-sm">
            <dt className="text-muted">Status</dt>
            <dd className="font-semibold text-yaye-blue">{payment.status}</dd>
          </div>
        </dl>
        <div className="mt-7 flex flex-wrap gap-3">
          {successful ? (
            <Link
              href={`/dashboard/programs/${payment.programId}`}
              className="bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Open program ↗
            </Link>
          ) : (
            <Link
              href={`/checkout/${payment.programId}`}
              className="bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Return to checkout
            </Link>
          )}
          <Link
            href="/dashboard/payments"
            className="border border-ink/20 px-5 py-3 text-sm font-semibold text-ink"
          >
            Payment history
          </Link>
        </div>
      </main>
    </div>
  );
}
