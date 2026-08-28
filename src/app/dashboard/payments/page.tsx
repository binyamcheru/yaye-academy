import Link from "next/link";

import { requireRole } from "@/modules/auth/session";
import { listLearnerPayments } from "@/modules/payments/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function LearnerPaymentsPage() {
  const session = await requireRole("LEARNER");
  const payments = await listLearnerPayments(session.user.id);
  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Financial record
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">My payments</h1>
      </header>
      <section className="mt-8 divide-y divide-ink/10 border-t-2 border-ink bg-white">
        {payments.map((payment) => (
          <Link
            key={payment.id}
            href={`/payment/success?payment=${payment.id}`}
            className="grid gap-3 px-5 py-5 hover:bg-yaye-pale/40 sm:grid-cols-[1fr_9rem_8rem_8rem] sm:items-center"
          >
            <div>
              <p className="font-semibold text-ink">{payment.program.title}</p>
              <p className="mt-1 text-xs text-muted">{payment.cohort.name}</p>
            </div>
            <span className="text-sm font-semibold">
              {payment.amount.toFixed(2)} {payment.currency}
            </span>
            <span className="text-xs text-muted">
              {dateFormatter.format(payment.createdAt)}
            </span>
            <span className="font-mono text-[0.62rem] font-semibold text-yaye-blue">
              {payment.status}
            </span>
          </Link>
        ))}
        {!payments.length && (
          <p className="px-5 py-10 text-sm text-muted">
            No payment records yet.
          </p>
        )}
      </section>
    </div>
  );
}
