import Link from "next/link";

import { requireRole } from "@/modules/auth/session";
import { listAdminPayments } from "@/modules/payments/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function AdminPaymentsPage() {
  await requireRole("ADMIN");
  const payments = await listAdminPayments();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Payment operations
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Payments</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Chapa checkout records and their server-verified enrollment state.
        </p>
      </header>
      <section className="mt-8 overflow-x-auto bg-white">
        <div className="grid min-w-[60rem] grid-cols-[1fr_1fr_9rem_8rem_8rem] border-b-2 border-ink px-5 py-4 font-mono text-[0.6rem] tracking-[0.1em] text-muted uppercase">
          <span>Learner</span>
          <span>Program</span>
          <span>Amount</span>
          <span>Created</span>
          <span>Status</span>
        </div>
        <div className="min-w-[60rem] divide-y divide-ink/10">
          {payments.map((payment) => (
            <Link
              key={payment.id}
              href={`/admin/payments/${payment.id}`}
              className="grid grid-cols-[1fr_1fr_9rem_8rem_8rem] items-center px-5 py-5 text-sm hover:bg-yaye-pale/40"
            >
              <div>
                <p className="font-semibold text-ink">{payment.user.name}</p>
                <p className="mt-1 text-xs text-muted">{payment.user.email}</p>
              </div>
              <div>
                <p className="font-semibold text-ink">
                  {payment.program.title}
                </p>
                <p className="mt-1 text-xs text-muted">{payment.cohort.name}</p>
              </div>
              <span className="font-semibold">
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
        </div>
      </section>
    </div>
  );
}
