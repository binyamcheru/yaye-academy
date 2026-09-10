import Link from "next/link";
import { notFound } from "next/navigation";

import { AnswerForm } from "@/components/qna/answer-form";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import { getLearnerQuestion } from "@/modules/qna/service";

export default async function LearnerQuestionPage({
  params,
}: Readonly<{ params: Promise<{ questionId: string }> }>) {
  const session = await requireRole("LEARNER");
  const { questionId } = await params;
  const question = await getLearnerQuestion(session.user.id, questionId);
  if (!question) notFound();
  const program = question.lesson.module.program;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/dashboard/programs/${program.id}/lessons/${question.lesson.id}`}
        className="text-sm font-semibold text-yaye-blue"
      >
        ← {question.lesson.title}
      </Link>
      <article className="mt-6 border-t-2 border-ink bg-white px-5 py-7 sm:px-7">
        <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
          {program.title} · {question.cohort.name}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-ink">
          {question.title}
        </h1>
        <p className="mt-3 text-xs text-muted">
          Asked by {question.author.name} ·{" "}
          <LocalDateTime value={question.createdAt} />
        </p>
        <p className="mt-6 text-base leading-7 whitespace-pre-wrap text-ink">
          {question.body}
        </p>
      </article>

      <section className="mt-9">
        <p className="font-mono text-[0.62rem] tracking-[0.12em] text-yaye-blue uppercase">
          Batch discussion
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ink">
          {question.answers.length} answer
          {question.answers.length === 1 ? "" : "s"}
        </h2>
        <div className="mt-5 space-y-4">
          {question.answers.map((answer) => (
            <article
              key={answer.id}
              className={`bg-white px-5 py-6 sm:px-6 ${
                answer.isAccepted
                  ? "border-l-4 border-yaye-teal"
                  : "border-l-4 border-transparent"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink">
                  {answer.author.name}
                  {answer.author.role === "INSTRUCTOR" && (
                    <span className="ml-2 font-mono text-[0.58rem] tracking-[0.1em] text-yaye-blue uppercase">
                      Instructor
                    </span>
                  )}
                </p>
                {answer.isAccepted && (
                  <span className="status-label border-yaye-teal/40 text-yaye-teal">
                    Accepted answer
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 whitespace-pre-wrap text-ink">
                {answer.body}
              </p>
              <p className="mt-3 text-xs text-muted">
                <LocalDateTime value={answer.createdAt} />
              </p>
            </article>
          ))}
          {!question.answers.length && (
            <p className="border border-dashed border-ink/25 bg-white px-5 py-10 text-sm text-muted">
              No answers yet. Your instructor and enrolled batch members can
              respond here.
            </p>
          )}
        </div>
      </section>

      <section className="mt-9 border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
        <h2 className="text-xl font-semibold text-ink">Add an answer</h2>
        <p className="mt-2 text-sm text-muted">
          Share a clear explanation or the steps that helped you.
        </p>
        <div className="mt-5">
          <AnswerForm questionId={question.id} actor="learner" />
        </div>
      </section>
    </div>
  );
}
