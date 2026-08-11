import Link from "next/link";
import { notFound } from "next/navigation";

import { ProgressMeter } from "@/components/learner/progress-meter";
import { requireRole } from "@/modules/auth/session";
import { getLearnerProgram } from "@/modules/enrollments/service";

export default async function LearnerCurriculumPage({
  params,
}: Readonly<{ params: Promise<{ programId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { programId } = await params;
  const enrollment = await getLearnerProgram(session.user.id, programId);
  if (!enrollment) notFound();
  const program = enrollment.cohort.program;

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href={`/dashboard/programs/${program.id}`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← Program overview
      </Link>
      <header className="mt-6 grid gap-7 border-b-2 border-ink pb-8 sm:grid-cols-[1fr_18rem] sm:items-end">
        <div>
          <p className="font-mono text-[0.64rem] tracking-[0.12em] text-yaye-blue uppercase">
            Learning path
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            {program.title}
          </h1>
        </div>
        <ProgressMeter percentage={enrollment.progress.percentage} />
      </header>

      <div className="mt-8 space-y-6">
        {program.modules.map((moduleRecord) => (
          <section
            key={moduleRecord.id}
            className="border-t-2 border-ink bg-white"
          >
            <div className="grid gap-3 border-b border-ink/10 px-5 py-5 sm:grid-cols-[3rem_1fr_auto] sm:px-6">
              <span className="font-mono text-xs text-yaye-teal">
                {String(moduleRecord.order).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  {moduleRecord.title}
                </h2>
                {moduleRecord.description && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {moduleRecord.description}
                  </p>
                )}
              </div>
              <span className="font-mono text-[0.58rem] text-muted uppercase">
                {moduleRecord.lessons.length} lessons
              </span>
            </div>
            <div className="divide-y divide-ink/10 px-5 sm:px-6">
              {moduleRecord.lessons.map((lesson) => {
                const completed = enrollment.completedLessonIds.has(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/programs/${program.id}/lessons/${lesson.id}`}
                    className="grid gap-3 py-4 hover:text-yaye-blue sm:grid-cols-[3rem_1fr_auto] sm:items-center"
                  >
                    <span className="font-mono text-[0.62rem] text-muted">
                      {String(lesson.order).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold">
                      {lesson.title}
                    </span>
                    <span
                      className={`font-mono text-[0.58rem] tracking-[0.08em] uppercase ${
                        completed ? "text-yaye-teal" : "text-muted"
                      }`}
                    >
                      {completed ? "Complete ✓" : "Open →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
