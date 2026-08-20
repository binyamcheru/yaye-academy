import { EnrollmentCard } from "@/components/learner/enrollment-card";
import { requireRole } from "@/modules/auth/session";
import { listLearnerEnrollments } from "@/modules/enrollments/service";

export default async function MyLearningPage() {
  const session = await requireRole("LEARNER");
  const enrollments = await listLearnerEnrollments(session.user.id);
  const active = enrollments.filter((item) => item.status === "ACTIVE");
  const completed = enrollments.filter((item) => item.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-6xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
          Learning record
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
          My learning
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Active and completed programs, organized by your delivery batch.
        </p>
      </header>

      <section className="mt-9">
        <h2 className="text-xl font-semibold text-ink">Active</h2>
        {active.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {active.map((enrollment) => (
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
          <p className="mt-4 border border-dashed border-ink/25 bg-white px-5 py-8 text-sm text-muted">
            No active programs.
          </p>
        )}
      </section>

      <section className="mt-10 border-t border-ink/15 pt-8">
        <h2 className="text-xl font-semibold text-ink">Completed</h2>
        {completed.length ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {completed.map((enrollment) => (
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
          <p className="mt-4 border border-dashed border-ink/25 bg-white px-5 py-8 text-sm text-muted">
            Completed programs will appear here.
          </p>
        )}
      </section>
    </div>
  );
}
