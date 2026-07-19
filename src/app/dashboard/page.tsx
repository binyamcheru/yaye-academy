import Link from "next/link";

import { EnrollmentCard } from "@/components/learner/enrollment-card";
import { requireRole } from "@/modules/auth/session";
import { listLearnerEnrollments } from "@/modules/enrollments/service";

export default async function LearnerDashboardPage() {
  const session = await requireRole("LEARNER");
  const enrollments = await listLearnerEnrollments(session.user.id);
  const activeCount = enrollments.filter(
    (item) => item.status === "ACTIVE",
  ).length;
  const completedCount = enrollments.filter(
    (item) => item.status === "COMPLETED",
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <header className="grid gap-8 border-b-2 border-ink pb-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Learner overview
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
            Welcome back, {session.user.name.split(" ")[0]}.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            Continue from your current lesson and keep every completed step
            visible.
          </p>
        </div>
        <Link
          href="/programs"
          className="bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
        >
          Browse programs ↗
        </Link>
      </header>

      <dl className="mt-7 grid border-y border-ink/15 bg-white sm:grid-cols-3">
        {[
          ["Active programs", String(activeCount)],
          ["Completed", String(completedCount)],
          ["Learning record", `${enrollments.length} total`],
        ].map(([term, value]) => (
          <div
            key={term}
            className="border-ink/15 px-5 py-5 sm:border-r sm:last:border-r-0"
          >
            <dt className="font-mono text-[0.6rem] tracking-[0.1em] text-muted uppercase">
              {term}
            </dt>
            <dd className="mt-2 text-xl font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
              Continue learning
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              My programs
            </h2>
          </div>
          {enrollments.length > 0 && (
            <Link
              href="/dashboard/my-learning"
              className="text-sm font-semibold text-yaye-blue underline"
            >
              View all
            </Link>
          )}
        </div>

        {enrollments.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {enrollments.slice(0, 2).map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                program={enrollment.cohort.program}
                batchName={enrollment.cohort.name}
                status={enrollment.status}
                progress={enrollment.progress}
              />
            ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-ink/25 bg-white px-5 py-12 text-center">
            <h2 className="text-xl font-semibold text-ink">
              No active learning yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              Start with a published free program from the academy catalog.
            </p>
            <Link
              href="/programs"
              className="mt-5 inline-block bg-ink px-5 py-3 text-sm font-semibold text-white"
            >
              Find a program
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
