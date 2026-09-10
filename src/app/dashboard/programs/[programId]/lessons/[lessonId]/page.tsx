import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonCompletionForm } from "@/components/learner/lesson-completion-form";
import { ProgressMeter } from "@/components/learner/progress-meter";
import { QuestionForm } from "@/components/learner/question-form";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import { getLearnerLesson } from "@/modules/enrollments/service";
import { listLessonQuestionsForLearner } from "@/modules/qna/service";

export default async function LearnerLessonPage({
  params,
}: Readonly<{ params: Promise<{ programId: string; lessonId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { programId, lessonId } = await params;
  const workspace = await getLearnerLesson(session.user.id, lessonId);
  if (!workspace || workspace.cohort.program.id !== programId) notFound();
  const discussion = await listLessonQuestionsForLearner(
    session.user.id,
    lessonId,
  );
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

          <section className="mt-12 border-t-2 border-ink pt-8">
            <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
              Instructor office hours
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">
              Lesson questions
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Ask about this lesson or contribute an answer to a question from
              your batch.
            </p>
            <details className="mt-6 border border-ink/20 bg-yaye-pale/40 px-5 py-5">
              <summary className="cursor-pointer font-semibold text-yaye-blue">
                Ask a question
              </summary>
              <QuestionForm lessonId={lesson.id} />
            </details>
            <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {discussion?.questions.map((question) => {
                const accepted = question.answers.some(
                  (answer) => answer.isAccepted,
                );
                return (
                  <Link
                    key={question.id}
                    href={`/dashboard/questions/${question.id}`}
                    className="block py-5 hover:text-yaye-blue"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-semibold text-ink">
                        {question.title}
                      </h3>
                      {accepted && (
                        <span className="font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-yaye-teal uppercase">
                          Answer accepted
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {question.author.name} · {question.answers.length} answer
                      {question.answers.length === 1 ? "" : "s"} ·{" "}
                      <LocalDateTime value={question.createdAt} />
                    </p>
                  </Link>
                );
              })}
              {!discussion?.questions.length && (
                <p className="py-8 text-sm text-muted">
                  No questions yet. Start the lesson conversation when you need
                  clarification.
                </p>
              )}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
