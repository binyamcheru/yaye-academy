import Link from "next/link";

import { AnswerForm } from "@/components/qna/answer-form";
import { LocalDateTime } from "@/components/shared/local-date-time";
import { requireRole } from "@/modules/auth/session";
import { acceptAnswerAction } from "@/modules/qna/actions";
import { listInstructorQuestions } from "@/modules/qna/service";

type InstructorQuestion = Awaited<
  ReturnType<typeof listInstructorQuestions>
>[number];

function QuestionPanel({
  question,
}: Readonly<{ question: InstructorQuestion }>) {
  const hasInstructorAnswer = question.answers.some(
    (answer) => answer.author.role === "INSTRUCTOR",
  );

  return (
    <article className="border-t-2 border-ink bg-white px-5 py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6rem] tracking-[0.1em] text-yaye-blue uppercase">
            {question.lesson.module.program.title} · {question.cohort.name}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-ink">
            {question.title}
          </h3>
        </div>
        <span
          className={`font-mono text-[0.6rem] font-semibold tracking-[0.1em] uppercase ${
            hasInstructorAnswer ? "text-muted" : "text-yaye-blue"
          }`}
        >
          {hasInstructorAnswer ? "Responded" : "Needs instructor"}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        {question.lesson.title} · Asked by {question.author.name} ·{" "}
        <LocalDateTime value={question.createdAt} />
      </p>
      <p className="mt-5 text-sm leading-6 whitespace-pre-wrap text-ink">
        {question.body}
      </p>

      <div className="mt-6 space-y-3 border-t border-ink/10 pt-5">
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            className={`px-4 py-4 ${
              answer.isAccepted
                ? "border-l-4 border-yaye-teal bg-yaye-pale/40"
                : "border-l-4 border-ink/10 bg-workspace"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {answer.author.name}
                  {answer.author.role === "INSTRUCTOR" ? " · Instructor" : ""}
                </p>
                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-ink">
                  {answer.body}
                </p>
              </div>
              {answer.isAccepted ? (
                <span className="status-label border-yaye-teal/40 text-yaye-teal">
                  Accepted answer
                </span>
              ) : (
                <form action={acceptAnswerAction}>
                  <input type="hidden" name="questionId" value={question.id} />
                  <input type="hidden" name="answerId" value={answer.id} />
                  <button
                    type="submit"
                    className="text-xs font-semibold text-yaye-blue underline"
                  >
                    Accept answer
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
        {!question.answers.length && (
          <p className="text-sm text-muted">No answers have been added yet.</p>
        )}
      </div>

      <details className="mt-6 border border-ink/20 px-4 py-4">
        <summary className="cursor-pointer text-sm font-semibold text-yaye-blue">
          Add instructor answer
        </summary>
        <div className="mt-5">
          <AnswerForm questionId={question.id} actor="instructor" />
        </div>
      </details>
    </article>
  );
}

export default async function InstructorQuestionsPage() {
  const session = await requireRole("INSTRUCTOR");
  const questions = await listInstructorQuestions(session.user.id);
  const unanswered = questions.filter(
    (question) =>
      !question.answers.some((answer) => answer.author.role === "INSTRUCTOR"),
  );
  const responded = questions.filter(
    (question) => !unanswered.includes(question),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b-2 border-ink pb-8">
        <div>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-yaye-blue uppercase">
            Instructor office hours
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-ink">
            Lesson questions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Questions are limited to learners and instructors in the same
            assigned batch.
          </p>
        </div>
        <Link
          href="/instructor/programs"
          className="text-sm font-semibold text-yaye-blue underline"
        >
          Assigned programs
        </Link>
      </header>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-ink">
          Unanswered queue · {unanswered.length}
        </h2>
        <div className="mt-5 space-y-5">
          {unanswered.map((question) => (
            <QuestionPanel key={question.id} question={question} />
          ))}
          {!unanswered.length && (
            <p className="border border-dashed border-ink/25 bg-white px-5 py-10 text-sm text-muted">
              No learner questions are waiting for an instructor response.
            </p>
          )}
        </div>
      </section>

      {responded.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-ink">Responded</h2>
          <div className="mt-5 space-y-5">
            {responded.map((question) => (
              <QuestionPanel key={question.id} question={question} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
