import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CheckoutForm } from "@/components/payments/checkout-form";
import { requireRole } from "@/modules/auth/session";
import { getCheckoutProgram } from "@/modules/payments/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function CheckoutPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { programId } = await params;
  const checkout = await getCheckoutProgram(programId, session.user.id);
  if (!checkout) notFound();
  if (checkout.enrollment) redirect(`/dashboard/programs/${programId}`);
  const cohort = checkout.program.cohorts.find(
    (item) => !item.capacity || item._count.enrollments < item.capacity,
  );
  if (!cohort) notFound();

  return (
    <div className="min-h-screen bg-workspace px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/programs/${checkout.program.slug}`}
          className="text-sm font-semibold text-yaye-blue"
        >
          ← Program details
        </Link>
        <header className="mt-6 border-b-2 border-ink pb-8">
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Chapa hosted checkout
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Review your enrollment
          </h1>
        </header>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <section className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
            <h2 className="text-2xl font-semibold text-ink">
              {checkout.program.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {checkout.program.shortDescription}
            </p>
            <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              <div className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="auth-label mb-0">Batch</dt>
                <dd className="text-sm font-semibold">{cohort.name}</dd>
              </div>
              <div className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="auth-label mb-0">Starts</dt>
                <dd className="text-sm font-semibold">
                  {dateFormatter.format(cohort.startDate)}
                </dd>
              </div>
              <div className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr]">
                <dt className="auth-label mb-0">Learner</dt>
                <dd className="text-sm font-semibold">{session.user.email}</dd>
              </div>
            </dl>
          </section>
          <aside className="border-t-2 border-yaye-blue bg-white px-5 py-6">
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
              Total
            </p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {checkout.program.price?.toFixed(2)} {checkout.program.currency}
            </p>
            <div className="mt-7">
              <CheckoutForm programId={programId} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
