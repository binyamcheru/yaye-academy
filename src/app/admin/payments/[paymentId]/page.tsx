import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/modules/auth/session";
import { getAdminPayment } from "@/modules/payments/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Addis_Ababa",
});

export default async function AdminPaymentPage({
  params,
}: Readonly<{ params: Promise<{ paymentId: string }> }>) {
  await requireRole("ADMIN");
  const { paymentId } = await params;
  const payment = await getAdminPayment(paymentId);
  if (!payment) notFound();
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/payments"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Payments
      </Link>
      <header className="mt-6 border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          {payment.status} · {payment.providerMode}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">
          {payment.program.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {payment.user.name} · {payment.user.email}
        </p>
      </header>
      <dl className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white px-5 sm:px-6">
        {[
          ["Amount", `${payment.amount.toFixed(2)} ${payment.currency}`],
          ["Batch", payment.cohort.name],
          ["Merchant reference", payment.merchantReference],
          ["Chapa reference", payment.providerReference ?? "Not verified"],
          ["Created", dateFormatter.format(payment.createdAt)],
          [
            "Verified paid",
            payment.paidAt ? dateFormatter.format(payment.paidAt) : "—",
          ],
          ["Failure", payment.failureReason ?? "—"],
        ].map(([term, value]) => (
          <div key={term} className="grid gap-2 py-5 sm:grid-cols-[12rem_1fr]">
            <dt className="font-mono text-[0.62rem] tracking-[0.1em] text-muted uppercase">
              {term}
            </dt>
            <dd className="text-sm font-semibold break-all text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink">Provider events</h2>
        <div className="mt-4 divide-y divide-ink/10 bg-white px-5">
          {payment.events.map((event) => (
            <div
              key={event.id}
              className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_10rem]"
            >
              <span className="font-semibold">{event.eventType}</span>
              <span className="text-xs text-muted">
                {event.processedAt ? "Processed" : "Pending"}
              </span>
            </div>
          ))}
          {!payment.events.length && (
            <p className="py-6 text-sm text-muted">
              No webhook events recorded.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
