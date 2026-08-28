import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-workspace px-5 py-14 sm:px-8">
      <main className="mx-auto max-w-2xl border-t-2 border-danger bg-white px-5 py-8 sm:px-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-danger uppercase">
          Payment incomplete
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-ink">
          Enrollment was not activated
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Yaye Academy did not receive trusted confirmation of a successful
          payment. You have not been charged by this page, and no enrollment was
          created.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/programs"
            className="bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Return to programs
          </Link>
          <Link
            href="/dashboard/payments"
            className="border border-ink/20 px-5 py-3 text-sm font-semibold text-ink"
          >
            Check payment history
          </Link>
        </div>
      </main>
    </div>
  );
}
