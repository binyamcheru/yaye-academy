import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgressMeter } from "@/components/learner/progress-meter";
import { requireRole } from "@/modules/auth/session";
import { getLearnerProgram } from "@/modules/enrollments/service";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Addis_Ababa",
});

export default async function LearnerProgramPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { programId } = await params;
  const enrollment = await getLearnerProgram(session.user.id, programId);
  if (!enrollment) notFound();
  const program = enrollment.cohort.program;
  const nextLesson =
    enrollment.lessons.find(
      (lesson) => !enrollment.completedLessonIds.has(lesson.id),
    ) ?? enrollment.lessons.at(-1);

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/dashboard/my-learning"
        className="text-sm font-semibold text-yaye-blue"
      >
        ← My learning
      </Link>
      <header className="mt-6 grid gap-8 border-b-2 border-ink pb-9 lg:grid-cols-[1fr_20rem] lg:items-end">
        <div>
          <p className="font-mono text-[0.64rem] tracking-[0.12em] text-yaye-blue uppercase">
            {enrollment.cohort.name}
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.035em] text-ink sm:text-5xl">
            {program.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            {program.shortDescription}
          </p>
        </div>
        <ProgressMeter percentage={enrollment.progress.percentage} />
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
          <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
            Continue
          </p>
          {nextLesson ? (
            <>
              <h2 className="mt-3 text-2xl font-semibold text-ink">
                {nextLesson.title}
              </h2>
              <p className="mt-3 text-sm text-muted">
                {enrollment.progress.completedLessons} of{" "}
                {enrollment.progress.totalLessons} published lessons complete.
              </p>
              <Link
                href={`/dashboard/programs/${program.id}/lessons/${nextLesson.id}`}
                className="mt-6 inline-block bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-yaye-blue"
              >
                Open lesson ↗
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">No published lessons yet.</p>
          )}
        </div>
        <dl className="divide-y divide-ink/10 bg-white px-5 py-2">
          {[
            ["Instructor", enrollment.cohort.instructor?.name ?? "Unassigned"],
            ["Batch starts", dateFormatter.format(enrollment.cohort.startDate)],
            ["Batch ends", dateFormatter.format(enrollment.cohort.endDate)],
            ["Status", enrollment.status],
          ].map(([term, value]) => (
            <div key={term} className="py-4">
              <dt className="font-mono text-[0.58rem] tracking-[0.1em] text-muted uppercase">
                {term}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-5 border-b border-ink/15 pb-5">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
              Curriculum
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              {program.modules.length} modules
            </h2>
          </div>
          <Link
            href={`/dashboard/programs/${program.id}/learn`}
            className="text-sm font-semibold text-yaye-blue underline"
          >
            Open curriculum
          </Link>
        </div>
        <div className="divide-y divide-ink/10 bg-white px-5 sm:px-6">
          {program.modules.map((moduleRecord) => {
            const completed = moduleRecord.lessons.filter((lesson) =>
              enrollment.completedLessonIds.has(lesson.id),
            ).length;
            return (
              <div
                key={moduleRecord.id}
                className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center"
              >
                <span className="font-mono text-xs text-yaye-teal">
                  {String(moduleRecord.order).padStart(2, "0")}
                </span>
                <span className="font-semibold text-ink">
                  {moduleRecord.title}
                </span>
                <span className="text-xs text-muted">
                  {completed}/{moduleRecord.lessons.length} complete
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
