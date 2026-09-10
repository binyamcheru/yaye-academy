"use client";

import { useActionState } from "react";

import { FieldError, FormFeedback } from "@/components/admin/form-feedback";
import { FormSubmit } from "@/components/ui/form-submit";
import {
  createInstructorAnswerAction,
  createLearnerAnswerAction,
  type QnaActionState,
} from "@/modules/qna/actions";

export function AnswerForm({
  questionId,
  actor,
}: Readonly<{
  questionId: string;
  actor: "learner" | "instructor";
}>) {
  const [state, formAction] = useActionState(
    actor === "learner"
      ? createLearnerAnswerAction
      : createInstructorAnswerAction,
    {} as QnaActionState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="questionId" value={questionId} />
      <FormFeedback state={state} />
      <label className="block">
        <span className="auth-label">Your answer</span>
        <textarea className="auth-input min-h-28" name="body" required />
        <FieldError errors={state.errors?.body} />
      </label>
      <FormSubmit>Publish answer</FormSubmit>
    </form>
  );
}
