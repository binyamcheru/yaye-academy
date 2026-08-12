import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonCompletionForm } from "@/components/learner/lesson-completion-form";
import { ProgressMeter } from "@/components/learner/progress-meter";
import { requireRole } from "@/modules/auth/session";
import { getLearnerLesson } from "@/modules/enrollments/service";

export default async function LearnerLessonPage({
  params,
}: Readonly<{ params: Promise<{ programId: string; lessonId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { programId, lessonId } = await params;
  const workspace = await getLearnerLesson(session.user.id, lessonId);
  if (!workspace || workspace.cohort.program.id !== programId) notFound();
  const program = workspace.cohort.program;
  const lesson = workspace.lesson;
  const moduleRecord = program.modules.find(
    (item) => item.id === lesson.moduleId,
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Link
            href={`/dashboard/programs/${program.id}/learn`}
            className="text-sm font-semibold text-yaye-blue"
          >
            ← Curriculum
          </Link>
          <div className="mt-6 border-t-2 border-ink bg-white px-4 py-5">
            <p className="font-mono text-[0.58rem] tracking-[0.1em] text-yaye-blue uppercase">
              {program.title}
            </p>
            <div className="mt-5">
              <ProgressMeter percentage={workspace.progress.percentage} />
            </div>
            <nav className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
              {workspace.lessons.map((item, index) => {
                const completed = workspace.completedLessonIds.has(item.id);
                return (
                  <Link
                    key={item.id}
                    href={`/dashboard/programs/${program.id}/lessons/${item.id}`}
                    aria-current={item.id === lesson.id ? "page" : undefined}
                    className={`grid grid-cols-[1.7rem_1fr] gap-2 py-3 text-xs leading-5 ${
                      item.id === lesson.id
                        ? "font-semibold text-yaye-blue"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    <span className="font-mono text-[0.55rem]">
                      {completed ? "✓" : String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <article className="border-t-2 border-ink bg-white px-5 py-8 sm:px-8 sm:py-10">
          <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
            {moduleRecord?.title ?? "Program lesson"} · Lesson {lesson.order}
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-[-0.035em] text-ink">
            {lesson.title}
          </h1>
          <div className="mt-8 border-t border-ink/15 pt-8 text-base leading-8 whitespace-pre-line text-ink">
            {lesson.content}
          </div>

          {lesson.videoUrl && (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block border border-yaye-blue/30 bg-yaye-pale px-4 py-3 text-sm font-semibold text-yaye-blue"
            >
              Open lesson video ↗
            </a>
          )}

          <div className="mt-12 border-y border-ink/15 py-6">
            <LessonCompletionForm
              programId={program.id}
              lessonId={lesson.id}
              completed={workspace.isCompleted}
            />
          </div>

          <nav className="mt-8 grid gap-4 sm:grid-cols-2">
            {workspace.previousLesson ? (
              <Link
                href={`/dashboard/programs/${program.id}/lessons/${workspace.previousLesson.id}`}
                className="border border-ink/20 px-4 py-4 text-sm font-semibold text-ink hover:bg-yaye-pale"
              >
                ← {workspace.previousLesson.title}
              </Link>
            ) : (
              <span />
            )}
            {workspace.nextLesson && (
              <Link
                href={`/dashboard/programs/${program.id}/lessons/${workspace.nextLesson.id}`}
                className="border border-ink/20 px-4 py-4 text-right text-sm font-semibold text-ink hover:bg-yaye-pale"
              >
                {workspace.nextLesson.title} →
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
